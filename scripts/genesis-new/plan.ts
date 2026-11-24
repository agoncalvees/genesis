import { basename, isAbsolute, relative, sep } from "node:path";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseArgs(args: readonly string[]) {
	const values = new Map<string, string>();
	const flags = new Set<string>();
	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (arg === "--dry-run" || arg === "--e2e") {
			if (flags.has(arg)) throw new Error(`Opção duplicada: ${arg}`);
			flags.add(arg);
			continue;
		}
		if (!["--name", "--slug", "--world", "--dir"].includes(arg)) {
			throw new Error(`Opção desconhecida: ${arg}`);
		}
		const value = args[++index];
		if (values.has(arg) || !value || value.startsWith("--")) {
			throw new Error(`Informe um valor único para ${arg}.`);
		}
		values.set(arg, value);
	}

	const name = values.get("--name")?.trim();
	const slug = values.get("--slug");
	const world = values.get("--world");
	const dir = values.get("--dir");
	if (!name || /[\r\n\u2028\u2029]/u.test(name)) {
		throw new Error("Informe --name em uma única linha.");
	}
	if (!slug || slug.length > 214 || !slugPattern.test(slug)) {
		throw new Error("Informe --slug em kebab-case (até 214 caracteres).");
	}
	if (!world || !slugPattern.test(world)) {
		throw new Error("Informe --world com um identificador em kebab-case.");
	}
	if (!dir || !isAbsolute(dir)) throw new Error("--dir deve ser absoluto.");
	return {
		name,
		slug,
		world,
		dir,
		dryRun: flags.has("--dry-run"),
		e2e: flags.has("--e2e"),
	};
}

export function isLocalArtifact(path: string) {
	const parts = path.split("/");
	const name = basename(path);
	return (
		(name !== ".env.example" &&
			(name === ".env" || name.startsWith(".env."))) ||
		parts.some((part) =>
			[".vercel", "node_modules", "test-results"].includes(part),
		) ||
		/(^|\/)benchmarks\/results(?:\/|$)/.test(path)
	);
}

const removedPrefixes = [
	"public/projects/",
	"src/projects/",
	"src/features/route-opt/",
	"src/features/doc-evidence/",
	"src/studio/",
	"src/routes/demos/",
	"src/routes/studio/",
];

const removedFiles = new Set([
	"scripts/dev-projects.ts",
	"src/routes/projetos.tsx",
	"tests/e2e/projects.spec.ts",
	"tests/e2e/a11y.spec.ts",
	"tests/e2e/demos.spec.ts",
	"tests/e2e/doc-evidence.spec.ts",
	"tests/e2e/motion.spec.ts",
	"tests/e2e/route-opt.spec.ts",
	"tests/e2e/studio.spec.ts",
	"tests/unit/doc-evidence.test.ts",
	"tests/unit/route-opt.test.ts",
]);

export const productDocs = [
	"BRAND-BRIEF.md",
	"CHALLENGE.md",
	"DEMO-SCRIPT.md",
	"MVP-SCOPE.md",
	"PRODUCT-BRIEF.md",
];

/**
 * E2E specs that navigate to Studio or demo routes cannot run in a product
 * (those routes are removed). Detected by content so new specs are covered.
 */
export function isStudioDependentSpec(path: string, content: string) {
	return (
		/^tests\/e2e\/.+\.spec\.ts$/.test(path) &&
		path !== "tests/e2e/production.spec.ts" &&
		/["'`]\/(studio|demos)(?=[/"'`?#$]|\b)/.test(content)
	);
}

export function createPlan(input: {
	worktrees: readonly string[];
	target: string;
	targetEmpty: boolean;
	dirty: boolean;
	tracked: readonly string[];
	world: string;
	hasDesignApply: boolean;
	/** Contents of tracked e2e specs, used to drop Studio/demo-dependent ones. */
	specContents?: Readonly<Record<string, string>>;
}) {
	if (input.dirty)
		throw new Error("A árvore de trabalho do Genesis deve estar limpa.");
	for (const root of input.worktrees) {
		const path = relative(root, input.target);
		if (
			!path ||
			(path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path))
		) {
			throw new Error("O destino deve ficar fora dos worktrees do Genesis.");
		}
	}
	if (!input.targetEmpty)
		throw new Error("O destino deve estar ausente ou vazio.");
	if (input.tracked.some(isLocalArtifact)) {
		throw new Error("O commit de origem contém artefatos locais versionados.");
	}

	const applyDesign =
		input.world !== "neutral" &&
		input.hasDesignApply &&
		input.tracked.includes(`design/worlds/${input.world}/DESIGN.md`);

	return {
		applyDesign,
		designResult: applyDesign
			? `Aplicação via design:apply ${input.world}`
			: input.world === "neutral"
				? "Design de origem preservado por escolha neutra."
				: "Design de origem preservado. Mundo ou design:apply indisponível no commit.",
		remove: input.tracked.filter(
			(path) =>
				removedFiles.has(path) ||
				removedPrefixes.some(
					(prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix),
				) ||
				/^src\/routes\/(demos|studio)(?:\.[^/]+)?\.tsx$/.test(path) ||
				isStudioDependentSpec(path, input.specContents?.[path] ?? ""),
		),
		modify: [
			".env.example",
			".github/workflows/ci.yml",
			"PROVENANCE.md",
			"README.md",
			"docs/STATUS.md",
			...productDocs.map((file) => `docs/product/${file}`),
			"package.json",
			"src/core/app-config.ts",
			"src/routes/index.tsx",
			"src/routeTree.gen.ts",
			"tests/e2e/production.spec.ts",
			...(applyDesign
				? [
						"design/DESIGN.md",
						"src/design-system/themes/generated/product.css",
						"src/design-system/themes/generated/worlds.css",
					]
				: []),
		],
	};
}
