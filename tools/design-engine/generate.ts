import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { exportTailwind, parseDesign } from "./adapter";
import { type Identity, normalize, type Tokens } from "./normalize";
import { validate } from "./validate";

export const generatedDirectory = "src/design-system/themes/generated";
export const productPath = "design/DESIGN.md";
export const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const transparentShadow = "0 0 #0000";
const header =
	"/* Gerado por bun run design:build. Edite o DESIGN.md de origem. */\n";

export function loadDesign(source: string) {
	const report = parseDesign(source);
	const identity = validate(normalize(report));
	// Cross-check the standard primary token through Google's Tailwind v4 emitter.
	if (
		!exportTailwind(report).includes(
			`--color-primary: ${identity.light.primary};`,
		)
	) {
		throw new Error(
			"Google css-tailwind primary differs from the normalized primary",
		);
	}
	return { identity, findings: report.findings };
}

function surfaceTokens(tokens: Tokens): Tokens {
	const style = tokens["surface-style"];
	return {
		...tokens,
		"panel-divider": style === "border" ? "var(--border)" : "transparent",
		"panel-border-width": style === "border" ? "var(--border-width)" : "0px",
		"panel-shadow-flat":
			style === "elevation" ? "var(--shadow-md)" : transparentShadow,
		"panel-shadow-sm":
			style === "tint"
				? transparentShadow
				: style === "elevation"
					? "var(--shadow-md)"
					: "var(--shadow-sm)",
		"panel-shadow-md":
			style === "tint" ? transparentShadow : "var(--shadow-md)",
		"panel-shadow-lg":
			style === "tint" ? transparentShadow : "var(--shadow-lg)",
		"panel-tint": style === "tint" ? "var(--surface)" : "initial",
		...Object.fromEntries(
			["thin", "light", "regular", "bold"].map((weight) => [
				`icon-display-${weight}`,
				weight === tokens["icon-weight"] ? "inline-block" : "none",
			]),
		),
	};
}

function block(selector: string, tokens: Tokens, scheme?: "light" | "dark") {
	const declarations = Object.entries(surfaceTokens(tokens))
		.map(([key, value]) => `\t--${key}: ${value};\n`)
		.join("");
	return `${selector} {\n${scheme ? `\tcolor-scheme: ${scheme};\n` : ""}${declarations}}\n`;
}

export function renderProduct(identity: Identity) {
	const outsideWorld = ":not([data-world], [data-world] *)";
	return (
		header +
		block(
			`:root:not([data-world]),\n[data-theme="light"]${outsideWorld}`,
			identity.light,
			"light",
		) +
		"\n" +
		block(
			`[data-theme="dark"]${outsideWorld}`,
			identity.dark ?? identity.light,
			"dark",
		)
	);
}

export function renderWorld(id: string, identity: Identity) {
	if (!safeId.test(id)) throw new Error(`Invalid world id: ${id}`);
	const tokens = Object.fromEntries(
		Object.entries(identity.light).map(([key, light]) => {
			const dark = identity.dark?.[key];
			return [
				key,
				dark && dark !== light ? `light-dark(${light}, ${dark})` : light,
			];
		}),
	);
	return block(`[data-world="${id}"]`, tokens);
}

export function worldPaths() {
	const root = "design/worlds";
	if (!existsSync(root)) return [];
	return readdirSync(root, { withFileTypes: true })
		.filter(
			(entry) =>
				entry.isDirectory() && existsSync(join(root, entry.name, "DESIGN.md")),
		)
		.map(({ name }) => ({ name, path: join(root, name, "DESIGN.md") }))
		.sort((first, second) =>
			first.name < second.name ? -1 : first.name > second.name ? 1 : 0,
		);
}

export function renderFiles(product = readFileSync(productPath, "utf8")) {
	const active = loadDesign(product).identity;
	const worlds = worldPaths().map(({ name, path }) =>
		renderWorld(name, loadDesign(readFileSync(path, "utf8")).identity),
	);
	return {
		[join(generatedDirectory, "product.css")]: renderProduct(active),
		[join(generatedDirectory, "worlds.css")]: header + worlds.join("\n"),
	};
}

export function checkDrift(files: Record<string, string>) {
	for (const [path, expected] of Object.entries(files)) {
		if (!existsSync(path) || readFileSync(path, "utf8") !== expected) {
			throw new Error(
				`CSS desatualizado em ${path}. Rode bun run design:build.`,
			);
		}
	}
}
