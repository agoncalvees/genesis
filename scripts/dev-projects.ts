import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { projects } from "../src/projects/catalog";

const root = resolve(import.meta.dirname, "..");
const locations = {
	isoterma: {
		cwd: resolve(
			root,
			process.env.GENESIS_ISOTERMA_DIR ||
				"../../experiments/isoterma/version-c/app",
		),
		override: "GENESIS_ISOTERMA_DIR",
	},
	entrelacos: {
		cwd: resolve(
			root,
			process.env.GENESIS_ENTRELACOS_DIR || "../../experiments/entrelacos",
		),
		override: "GENESIS_ENTRELACOS_DIR",
	},
};
const vite = "node_modules/vite/bin/vite.js";

async function run() {
	const port = Number(process.env.PORT || 3000);
	if (
		!Number.isInteger(port) ||
		port < 1 ||
		port > 65535 ||
		projects.some((project) => project.port === port)
	) {
		throw new Error(
			"Escolha uma porta PORT válida para o Genesis, diferente de 3213 e 3214.",
		);
	}

	const genesis = { name: "Genesis", cwd: root, port, override: null };
	const experiments = projects.map((project) => ({
		...project,
		...locations[project.id],
	}));
	for (const app of [genesis, ...experiments]) {
		if (!existsSync(resolve(app.cwd, vite))) {
			const hint = app.override ? ` ou ajuste ${app.override}` : "";
			throw new Error(
				`${app.name}: rode bun install --frozen-lockfile em ${app.cwd}${hint}.`,
			);
		}
	}

	const children: ChildProcess[] = [];
	const controller = new AbortController();
	function stop(code: number) {
		if (controller.signal.aborted) return;
		controller.abort();
		process.exitCode = code;
		for (const child of children) child.kill();
	}

	process.once("SIGINT", () => stop(130));
	process.once("SIGTERM", () => stop(143));

	function start(
		app: { name: string; cwd: string; port: number },
		launcher = false,
	) {
		const child = spawn("node", [vite, "dev"], {
			cwd: app.cwd,
			env: {
				PATH: process.env.PATH,
				HOME: process.env.HOME,
				USERPROFILE: process.env.USERPROFILE,
				SystemRoot: process.env.SystemRoot,
				TMPDIR: process.env.TMPDIR,
				TMP: process.env.TMP,
				TEMP: process.env.TEMP,
				LANG: process.env.LANG,
				TERM: process.env.TERM,
				PORT: String(app.port),
				AI_ENDPOINTS_ENABLED: "0",
				VITE_GENESIS_LOCAL_PROJECTS: launcher ? "1" : "0",
			},
			stdio: "inherit",
		});
		children.push(child);
		child.once("error", (error) => {
			console.error(`${app.name}: ${error.message}`);
			stop(1);
		});
		child.once("exit", (code, signal) => {
			if (controller.signal.aborted) return;
			console.error(`${app.name} encerrou (${signal ?? code}).`);
			stop(code || 1);
		});
	}

	async function waitUntilReady(
		app: { name: string; port: number },
		path = "/",
	) {
		const signal = AbortSignal.any([
			controller.signal,
			AbortSignal.timeout(45_000),
		]);
		while (!signal.aborted) {
			try {
				const response = await fetch(`http://127.0.0.1:${app.port}${path}`, {
					signal,
					redirect: "manual",
				});
				await response.body?.cancel();
				if (response.ok) return;
			} catch {
				// Vite may still be binding or compiling its first route.
			}
			await delay(250, undefined, { signal }).catch(() => {});
		}
		throw new Error(`${app.name} não ficou disponível na porta ${app.port}.`);
	}

	try {
		console.log("Iniciando ISOTERMA e Entrelaços…");
		for (const experiment of experiments) start(experiment);
		await Promise.all(
			experiments.map((experiment) => waitUntilReady(experiment)),
		);
		controller.signal.throwIfAborted();
		start(genesis, true);
		await waitUntilReady(genesis, "/projetos");
		controller.signal.throwIfAborted();
		console.log(`Seletor de projetos: http://127.0.0.1:${port}/projetos`);
	} catch (error) {
		if (controller.signal.aborted) return;
		stop(1);
		throw error;
	}
}

try {
	await run();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}
