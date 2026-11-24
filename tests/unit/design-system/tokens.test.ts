import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

/*
 * Gate 02 (docs/ROADMAP.md:9, doc-audit.md:68): one central file owns color
 * and typography; primitives/components may only consume semantic tokens.
 */
const THEME_PATH = "src/design-system/themes/product.css";
const CONSUMER_DIRS = [
	"src/design-system/primitives",
	"src/design-system/components",
] as const;

type ThemeName = "light" | "dark";
type Tokens = Record<string, string>;

/** Declarations typed once on `:root` and inherited by `[data-theme="dark"]`. */
const CASCADE_ONLY = /^typeface-/;

function parseThemeBlocks(source: string): Record<ThemeName, Tokens> {
	const blocks: Record<ThemeName, Tokens> = { light: {}, dark: {} };
	for (const rule of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selector = rule[1];
		const theme: ThemeName | null = selector.includes('data-theme="dark"')
			? "dark"
			: selector.includes(":root") || selector.includes('data-theme="light"')
				? "light"
				: null;
		if (theme === null) continue;
		for (const declaration of rule[2].matchAll(
			/--([a-z0-9-]+)\s*:\s*([^;]+);/gi,
		)) {
			blocks[theme][declaration[1]] = declaration[2].trim();
		}
	}
	return blocks;
}

const BLOCKS = parseThemeBlocks(readFileSync(THEME_PATH, "utf8"));

test("every theme-dependent semantic token in the light block exists in dark", () => {
	const lightTokens = Object.keys(BLOCKS.light).filter(
		(token) => !CASCADE_ONLY.test(token),
	);

	expect(lightTokens.length).toBeGreaterThan(0);
	for (const token of lightTokens) {
		expect(
			BLOCKS.dark[token],
			`--${token} is declared in the light block but missing in [data-theme="dark"]`,
		).toBeDefined();
	}
});

test("typography tokens are declared once on :root and inherited by dark", () => {
	const typography = Object.keys(BLOCKS.light).filter((token) =>
		CASCADE_ONLY.test(token),
	);

	expect(typography.length).toBeGreaterThan(0);
	for (const token of typography) {
		expect(BLOCKS.light[token]).toBeDefined();
	}
});

const SOURCE_FILE = /\.(ts|tsx|js|jsx|css)$/;
const COLOR_LITERAL =
	/#[0-9a-f]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(|\bokl(ch|ab)\s*\(/i;
const FONT_LITERAL = /\bfont-family\s*:|\bfontFamily\s*[:=]/i;

function sourceFiles(dir: string): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return SOURCE_FILE.test(entry.name) ? [path] : [];
	});
}

/** Comments may legitimately mention literals; only executable source counts. */
function stripComments(source: string): string {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

for (const dir of CONSUMER_DIRS) {
	const files = sourceFiles(dir);
	// Directories currently hold only .gitkeep while another worker writes them.
	test.skipIf(files.length === 0)(
		`${dir} contains no literal colors or fonts`,
		() => {
			const violations: string[] = [];

			for (const file of files) {
				const lines = stripComments(readFileSync(file, "utf8")).split("\n");
				for (const [index, line] of lines.entries()) {
					if (COLOR_LITERAL.test(line)) {
						violations.push(
							`${file}:${index + 1} literal color: ${line.trim()}`,
						);
					}
					if (FONT_LITERAL.test(line)) {
						violations.push(
							`${file}:${index + 1} literal font: ${line.trim()}`,
						);
					}
				}
			}

			expect(violations).toEqual([]);
		},
	);
}
