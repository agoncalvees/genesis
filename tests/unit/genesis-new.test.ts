import { describe, expect, test } from "vitest";
import {
	createPlan,
	isLocalArtifact,
	isStudioDependentSpec,
	parseArgs,
} from "../../scripts/genesis-new/plan";

const input = {
	worktrees: ["/workspace/genesis", "/workspace/worker"],
	target: "/workspace/genesis-product",
	targetEmpty: true,
	dirty: false,
	world: "civic",
	hasDesignApply: true,
	tracked: [
		".env.example",
		"design/worlds/civic/DESIGN.md",
		"src/design-system/token.css",
		"src/routes/demos.tsx",
		"src/routes/demos.doc-evidence.tsx",
		"src/routes/studio/worlds.tsx",
		"src/routes/studio.layouts.$name.tsx",
		"src/routes/studio-guide.tsx",
		"src/studio/catalog.tsx",
		"src/features/route-opt/optimizer.ts",
		"src/features/doc-evidence/index.ts",
		"src/features/another/feature.ts",
		"tests/e2e/a11y.spec.ts",
		"tests/e2e/smoke.spec.ts",
	],
};

describe("genesis:new", () => {
	test.each([
		".env",
		".env.local",
		".vercel/project.json",
		"node_modules/lib/package.json",
		"benchmarks/results/run.json",
		"test-results/report.txt",
	])("rejects tracked local artifact %s", (path) => {
		expect(isLocalArtifact(path)).toBe(true);
		expect(() => createPlan({ ...input, tracked: [path] })).toThrow(
			/artefatos locais/,
		);
	});

	test("allows the environment template and source fixtures", () => {
		expect(isLocalArtifact(".env.example")).toBe(false);
		expect(isLocalArtifact("benchmarks/fixtures/integers.ts")).toBe(false);
	});

	test.each([
		"/workspace/genesis",
		"/workspace/genesis/product",
		"/workspace/worker/product",
	])("refuses target %s inside any source worktree", (target) => {
		expect(() => createPlan({ ...input, target })).toThrow(
			/fora dos worktrees/,
		);
	});

	test("refuses a dirty source and a nonempty destination", () => {
		expect(() => createPlan({ ...input, dirty: true })).toThrow(/limpa/);
		expect(() => createPlan({ ...input, targetEmpty: false })).toThrow(
			/ausente ou vazio/,
		);
	});

	test("plans the product files and only removes demo and Studio files", () => {
		const plan = createPlan(input);
		expect(plan.applyDesign).toBe(true);
		expect(plan.remove).toEqual([
			"src/routes/demos.tsx",
			"src/routes/demos.doc-evidence.tsx",
			"src/routes/studio/worlds.tsx",
			"src/routes/studio.layouts.$name.tsx",
			"src/studio/catalog.tsx",
			"src/features/route-opt/optimizer.ts",
			"src/features/doc-evidence/index.ts",
			"tests/e2e/a11y.spec.ts",
		]);
		expect(plan.modify).toEqual(
			expect.arrayContaining([
				"PROVENANCE.md",
				"package.json",
				"src/core/app-config.ts",
				"src/routeTree.gen.ts",
				"docs/STATUS.md",
				"docs/product/CHALLENGE.md",
				"docs/product/PRODUCT-BRIEF.md",
				"docs/product/MVP-SCOPE.md",
				"docs/product/DEMO-SCRIPT.md",
				"docs/product/BRAND-BRIEF.md",
				"design/DESIGN.md",
				"src/design-system/themes/generated/product.css",
			]),
		);
	});

	test("excludes the project selector and local launcher from new products", () => {
		const paths = [
			"src/routes/projetos.tsx",
			"src/projects/catalog.ts",
			"public/projects/isoterma.jpg",
			"scripts/dev-projects.ts",
			"tests/e2e/projects.spec.ts",
		];
		expect(
			createPlan({
				...input,
				tracked: [...paths, "src/design-system/index.ts"],
			}).remove,
		).toEqual(paths);
	});

	test("retains the existing design for neutral, missing worlds and missing engine", () => {
		for (const overrides of [
			{ world: "neutral" },
			{ world: "unknown" },
			{ hasDesignApply: false },
		]) {
			const plan = createPlan({ ...input, ...overrides });
			expect(plan.applyDesign).toBe(false);
			expect(plan.modify).not.toContain("design/DESIGN.md");
		}
	});

	test("parses product identity and options without altering spaces in paths", () => {
		expect(
			parseArgs([
				"--name",
				"Produto de teste",
				"--slug",
				"produto-teste",
				"--dir",
				"/tmp/product test",
				"--world",
				"neutral",
				"--dry-run",
				"--e2e",
			]),
		).toEqual({
			name: "Produto de teste",
			slug: "produto-teste",
			dir: "/tmp/product test",
			world: "neutral",
			dryRun: true,
			e2e: true,
		});
	});
});

describe("studio-dependent e2e specs", () => {
	test("drops specs that navigate to Studio or demo routes", () => {
		expect(
			isStudioDependentSpec(
				"tests/e2e/x.spec.ts",
				'await page.goto("/studio/worlds")',
			),
		).toBe(true);
		expect(
			isStudioDependentSpec("tests/e2e/y.spec.ts", "page.goto(`/demos`)"),
		).toBe(true);
	});

	test("keeps product specs and the production template", () => {
		expect(
			isStudioDependentSpec("tests/e2e/smoke.spec.ts", 'page.goto("/smoke")'),
		).toBe(false);
		expect(
			isStudioDependentSpec("tests/e2e/production.spec.ts", '"/studio"'),
		).toBe(false);
		expect(
			isStudioDependentSpec("tests/e2e/z.spec.ts", 'text("studio apartment")'),
		).toBe(false);
	});
});
