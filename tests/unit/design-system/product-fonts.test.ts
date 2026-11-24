import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
	loadDesign,
	renderProductFonts,
} from "../../../tools/design-engine/generate";

const fontsFor = (path: string) =>
	renderProductFonts(loadDesign(readFileSync(path, "utf8")).identity);

describe("product font loading follows the active DESIGN.md", () => {
	test("Genesis Neutral uses system fonts only and loads no font package", () => {
		const output = fontsFor("design/DESIGN.md");
		expect(output).not.toContain("@fontsource");
		expect(output).toContain("export {};");
	});

	test("an applied world loads exactly its licensed font packages", () => {
		const output = fontsFor("design/worlds/precision/DESIGN.md");
		expect(output).toContain('import "@fontsource-variable/ibm-plex-sans";');
		expect(output).toContain('import "@fontsource/ibm-plex-mono/400.css";');
		expect(output).not.toContain("bricolage");
		expect(output).not.toContain("export {};");
	});

	test("every world's fonts resolve to registered packages", () => {
		for (const world of ["precision", "expressive", "cinematic", "civic"]) {
			expect(fontsFor(`design/worlds/${world}/DESIGN.md`)).toMatch(
				/@fontsource/,
			);
		}
	});
});
