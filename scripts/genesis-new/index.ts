import { spawnSync } from "node:child_process";
import {
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { createPlan, parseArgs, productDocs } from "./plan";

function git(cwd: string, ...args: string[]) {
	const result = spawnSync("git", args, {
		cwd,
		env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
		encoding: "utf8",
		maxBuffer: 16 * 1024 * 1024,
	});
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(result.stderr.trim() || `git ${args[0]} falhou.`);
	return result.stdout;
}

function canonicalTarget(path: string): string {
	if (existsSync(path)) return realpathSync(path);
	const parent = canonicalTarget(dirname(path));
	return join(parent, basename(path));
}

function isEmptyTarget(path: string) {
	try {
		return lstatSync(path).isDirectory() && readdirSync(path).length === 0;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
		throw error;
	}
}

function shellQuote(value: string) {
	return `'${value.replaceAll("'", "'\\''")}'`;
}

function run() {
	const rawArgs = process.argv.slice(2);
	const args = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;
	const options = parseArgs(args);
	const root = realpathSync(
		git(process.cwd(), "rev-parse", "--show-toplevel").trimEnd(),
	);
	const sha = git(root, "rev-parse", "HEAD").trim();
	const sourcePackage = JSON.parse(
		git(root, "show", `${sha}:package.json`),
	) as {
		name: string;
		version?: string;
		scripts?: Record<string, string>;
	};
	const requested = resolve(options.dir);
	const target = canonicalTarget(requested);
	const worktrees = git(root, "worktree", "list", "--porcelain", "-z")
		.split("\0")
		.filter((field) => field.startsWith("worktree "))
		.map((field) => field.slice("worktree ".length))
		.filter(existsSync)
		.map((path) => realpathSync(path));
	const plan = createPlan({
		worktrees,
		target,
		targetEmpty: isEmptyTarget(requested),
		dirty:
			git(root, "status", "--porcelain=v1", "--untracked-files=all") !== "",
		tracked: git(root, "ls-tree", "-r", "--name-only", "-z", sha)
			.split("\0")
			.filter(Boolean),
		world: options.world,
		hasDesignApply: Boolean(sourcePackage.scripts?.["design:apply"]),
		specContents: Object.fromEntries(
			git(root, "ls-tree", "-r", "--name-only", "-z", sha, "tests/e2e")
				.split("\0")
				.filter((path) => path.endsWith(".spec.ts"))
				.map((path) => [path, git(root, "show", `${sha}:${path}`)]),
		),
	});
	const branch = `product/${options.slug}`;
	if (options.dryRun) {
		console.log(
			JSON.stringify({ source: root, sha, target, branch, ...plan }, null, 2),
		);
		return;
	}

	const identity = ["GIT_AUTHOR_IDENT", "GIT_COMMITTER_IDENT"].map((kind) => {
		const match = /^(.+) <([^>]+)> /.exec(git(root, "var", kind));
		if (!match)
			throw new Error(
				"Configure a identidade Git antes de inicializar o produto.",
			);
		return { name: match[1], email: match[2] };
	});
	const date = new Date().toISOString();
	const command = `bun run genesis:new -- ${args.map(shellQuote).join(" ")}`;
	// Clone the objects first, then check out exactly the SHA used by the plan.
	git(root, "clone", "--no-local", "--no-checkout", "--", root, target);
	git(target, "remote", "remove", "origin");
	git(target, "switch", "-c", branch, sha);

	const write = (path: string, content: string) =>
		writeFileSync(join(target, path), content);
	const read = (path: string) => readFileSync(join(target, path), "utf8");
	const template = (path: string) =>
		readFileSync(join(import.meta.dirname, "templates", path), "utf8");
	const results: string[] = [];
	const packageManager = (args: string[]) => {
		const label = `bun ${args.join(" ")}`;
		console.log(`\n> ${label}`);
		const env: NodeJS.ProcessEnv = {
			...process.env,
			GENESIS_REAL_AI: "0",
			AI_ENDPOINTS_ENABLED: "0",
		};
		delete env.GENESIS_E2E_PROD;
		delete env.NITRO_PRESET;
		const result = spawnSync(process.execPath, args, {
			cwd: target,
			stdio: "inherit",
			env,
		});
		if (result.error) console.error(result.error.message);
		results.push(
			`- \`${label}\` — ${result.status ?? result.signal ?? "falha ao iniciar"}`,
		);
		return result.status === 0;
	};
	let designResult = plan.designResult;
	const removed: string[] = [];
	try {
		for (const path of plan.remove) {
			rmSync(join(target, path));
			removed.push(path);
		}
		sourcePackage.name = options.slug;
		write("package.json", `${JSON.stringify(sourcePackage, null, "\t")}\n`);

		const heading = options.name.replace(
			/[&<>\\`*_{}[\]()#!|]/g,
			(char) => `&#${char.charCodeAt(0)};`,
		);
		write(
			"README.md",
			`# ${heading}\n\nDescrição do produto a definir após a confirmação do desafio.\n\n## Desenvolvimento local\n\n- \`bun install --frozen-lockfile\`\n- \`bun run dev\`\n- \`bun run check\`, \`bun run typecheck\`, \`bun run test\` e \`bun run build\`\n\nConsulte [a procedência](PROVENANCE.md) e [o desafio](docs/product/CHALLENGE.md).\n`,
		);
		write(
			"src/core/app-config.ts",
			`export const appConfig = {\n\tname: ${JSON.stringify(options.name)},\n};\n`,
		);
		write("src/routes/index.tsx", template("home.tsx.txt"));
		write("tests/e2e/production.spec.ts", template("production.spec.ts.txt"));
		for (const file of productDocs)
			write(`docs/product/${file}`, template(file));
		write(
			"docs/STATUS.md",
			"# Fase 0 do produto\n\nTema e escopo a definir em `docs/product/`. A validação da inicialização está em `PROVENANCE.md`.\n",
		);
		write(
			".env.example",
			read(".env.example").replace(
				/\n# Flag pública de build[^\n]*\nVITE_STUDIO_DISABLED=\n/,
				"",
			),
		);
		const ciPath = ".github/workflows/ci.yml";
		write(
			ciPath,
			read(ciPath).replace(
				/^.*VITE_STUDIO_DISABLED=1 bun run test:e2e:prod\r?\n/gm,
				"",
			),
		);

		if (!packageManager(["install", "--frozen-lockfile"])) {
			if (plan.applyDesign)
				designResult += " — não executada porque a instalação falhou.";
			throw new Error("A instalação falhou.");
		}
		if (plan.applyDesign) {
			const applied = packageManager(["run", "design:apply", options.world]);
			designResult += applied ? " — concluída." : " — falhou.";
			if (!applied) throw new Error("A aplicação do mundo falhou.");
		}
		// Vite regenerates the checked-in TanStack route tree during build.
		const checks = ["build", "check", "typecheck", "test"];
		if (options.e2e) checks.push("test:e2e");
		const failures = checks.filter(
			(script) => !packageManager(["run", script]),
		);
		if (failures.length)
			throw new Error(`Falhas na validação: ${failures.join(", ")}.`);
	} finally {
		write(
			"PROVENANCE.md",
			[
				"# Procedência",
				"",
				`- Origem local: ${JSON.stringify(root)}`,
				`- Commit do Genesis: \`${sha}\``,
				`- Versão do Genesis: ${sourcePackage.version ?? "sem versão declarada (identificada pelo commit)"}`,
				`- Data (UTC): ${date}`,
				`- Mundo solicitado: \`${options.world}\``,
				`- Design: ${designResult}`,
				"",
				"O reaproveitamento em competições depende do regulamento do evento.",
				"",
				"## Comando",
				"",
				`    ${command}`,
				"",
				"## Caminhos removidos",
				"",
				...(removed.length
					? removed.map((path) => `- \`${path}\``)
					: ["Nenhum."]),
				"",
				"## Validação",
				"",
				...(results.length
					? results
					: ["Nenhum comando de validação executado."]),
				...(!options.e2e ? ["- E2E não solicitado."] : []),
				"",
			].join("\n"),
		);
	}
	git(target, "add", "-A");
	git(
		target,
		"-c",
		"core.hooksPath=/dev/null",
		"-c",
		`user.name=${identity[1].name}`,
		"-c",
		`user.email=${identity[1].email}`,
		"commit",
		"--no-gpg-sign",
		"--author",
		`${identity[0].name} <${identity[0].email}>`,
		"-m",
		`chore: initialize ${options.slug} from Genesis ${sha}`,
	);
	console.log(`Produto inicializado em ${target} (${branch}).`);
}

try {
	run();
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}
