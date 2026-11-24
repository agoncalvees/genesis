import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

/*
 * Gate 02 (docs/ROADMAP.md:9, doc-audit.md:71): a closed list of semantic
 * token pairs measured with the WCAG relative-luminance formula. The source
 * of truth is the single theme file; no color library is needed.
 */
const THEME_PATH = "src/design-system/themes/product.css";
const THEMES = ["light", "dark"] as const;

type ThemeName = (typeof THEMES)[number];
type Tokens = Record<string, string>;

interface Measurement {
	theme: ThemeName;
	pair: string;
	ratio: number;
	minimum: number | null;
}

interface Row {
	theme: ThemeName;
	pair: string;
	foreground: string;
	"fg value": string;
	background: string;
	"bg value": string;
	ratio: string;
	minimum: string;
	"AA pass": string;
}

const NAMED_COLORS: Record<string, [number, number, number]> = {
	black: [0, 0, 0],
	white: [255, 255, 255],
};

/** Reads `--token: value;` declarations from the two theme rule blocks. */
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

/** Supports the literals used in product.css plus rgb()/rgba() for future edits. */
function parseColor(value: string): [number, number, number] {
	const literal = value.trim().toLowerCase();
	if (literal in NAMED_COLORS) return NAMED_COLORS[literal];

	const hex = /^#([0-9a-f]{3,8})$/.exec(literal);
	if (hex) {
		let digits = hex[1];
		if (digits.length <= 4) {
			digits = [...digits].map((digit) => digit + digit).join("");
		}
		return [0, 2, 4].map((offset) =>
			Number.parseInt(digits.slice(offset, offset + 2), 16),
		) as [number, number, number];
	}

	const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(literal);
	if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

	throw new Error(`Unsupported color literal in ${THEME_PATH}: "${value}"`);
}

function relativeLuminance(color: string): number {
	const [red, green, blue] = parseColor(color).map((channel) => {
		const value = channel / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
	const first = relativeLuminance(foreground);
	const second = relativeLuminance(background);
	return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// WCAG 2.2 AA: normal text >= 4.5:1, large text and UI controls >= 3:1.
const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
	["foreground", "background"],
	["foreground", "surface"],
	["foreground", "surface-raised"],
	["muted", "background"],
	["muted", "surface"],
	["on-primary", "primary"],
	["on-accent", "accent"],
	["on-success", "success"],
	["on-warning", "warning"],
	["on-danger", "danger"],
	["on-info", "info"],
];
const NON_TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
	["focus", "background"],
	["focus", "surface"],
];
// Informational only: decorative borders are not a WCAG text/control pair.
const INFORMATIONAL_PAIRS: ReadonlyArray<readonly [string, string]> = [
	["border", "background"],
];

const BLOCKS = parseThemeBlocks(readFileSync(THEME_PATH, "utf8"));

for (const theme of THEMES) {
	test(`${theme}: closed list of semantic token pairs meets WCAG 2.2 AA`, () => {
		const tokens = BLOCKS[theme];
		const measurements: Measurement[] = [];
		const rows: Row[] = [];

		function measure(
			foreground: string,
			background: string,
			minimum: number | "info",
		): void {
			const fgValue = tokens[foreground];
			const bgValue = tokens[background];
			expect(
				fgValue,
				`${theme}: token --${foreground} is missing`,
			).toBeDefined();
			expect(
				bgValue,
				`${theme}: token --${background} is missing`,
			).toBeDefined();

			const ratio = contrastRatio(fgValue, bgValue);
			const threshold = minimum === "info" ? null : minimum;
			measurements.push({
				theme,
				pair: `${foreground}/${background}`,
				ratio,
				minimum: threshold,
			});
			rows.push({
				theme,
				pair: `${foreground}/${background}`,
				foreground,
				"fg value": fgValue,
				background,
				"bg value": bgValue,
				ratio: `${ratio.toFixed(2)}:1`,
				minimum: minimum === "info" ? "informational" : `${minimum}:1`,
				"AA pass": minimum === "info" ? "n/a" : ratio >= minimum ? "yes" : "NO",
			});
		}

		for (const [foreground, background] of TEXT_PAIRS) {
			measure(foreground, background, 4.5);
		}
		for (const [foreground, background] of NON_TEXT_PAIRS) {
			measure(foreground, background, 3);
		}
		for (const [foreground, background] of INFORMATIONAL_PAIRS) {
			measure(foreground, background, "info");
		}

		// Evidence: the complete measured table is printed for both themes.
		console.table(rows);

		expect(measurements).toHaveLength(
			TEXT_PAIRS.length + NON_TEXT_PAIRS.length + INFORMATIONAL_PAIRS.length,
		);
		for (const { theme: name, pair, ratio, minimum } of measurements) {
			if (minimum === null) continue;
			expect(
				ratio,
				`${name}: ${pair} measured ${ratio.toFixed(2)}:1, minimum ${minimum}:1`,
			).toBeGreaterThanOrEqual(minimum);
		}
	});
}
