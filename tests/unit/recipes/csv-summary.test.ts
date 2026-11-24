import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import {
	CsvParseError,
	summarizeCsv,
} from "../../../recipes/csv-summary/summarize";

describe("summarizeCsv", () => {
	test("computes count, min, max and mean per column", () => {
		expect(summarizeCsv("a,b\n1,10\n2,20\n3,30\n")).toEqual({
			columns: [
				{ column: "a", count: 3, min: 1, max: 3, mean: 2 },
				{ column: "b", count: 3, min: 10, max: 30, mean: 20 },
			],
		});
	});

	test("summarizes the labelled synthetic fixture", () => {
		const text = readFileSync(
			resolve("recipes/csv-summary/fixture.csv"),
			"utf8",
		);
		expect(text.split("\n")[0]).toBe("synthetic_a,synthetic_b,synthetic_c");
		expect(summarizeCsv(text)).toEqual({
			columns: [
				{ column: "synthetic_a", count: 4, min: 1, max: 4, mean: 2.5 },
				{ column: "synthetic_b", count: 4, min: 10, max: 40, mean: 25 },
				{ column: "synthetic_c", count: 4, min: 100, max: 400, mean: 250 },
			],
		});
	});

	test.each([
		["empty input", "", /CSV is empty/],
		["header without rows", "a,b\n", /header but no data rows/],
		["empty header name", ",b\n1,2\n", /header contains an empty column name/],
		["duplicate header", "a,a\n1,2\n", /duplicate column name "a"/],
		["wrong field count", "a,b\n1,2,3\n", /row 2: expected 2 fields, got 3/],
		[
			"non-numeric cell",
			"a,b\n1,abc\n",
			/row 2, column "b": "abc" is not a finite number/,
		],
		["empty cell", "a,b\n1,\n", /row 2, column "b": empty value/],
		["empty row", "a,b\n1,2\n\n3,4\n", /row 3: empty row/],
		[
			"quoted field",
			'a,b\n"1",2\n',
			/row 2: quoted CSV fields are not supported/,
		],
	] as const)("rejects %s with an explicit error", (_label, input, message) => {
		expect(() => summarizeCsv(input)).toThrow(CsvParseError);
		expect(() => summarizeCsv(input)).toThrow(message);
	});
});

const IMPORT =
	/(?:import|export)[^"']*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
	});
}

test("recipe is isolated: nothing under src/ imports or mentions csv-summary", () => {
	const files = sourceFiles("src");
	expect(files.length).toBeGreaterThan(0);
	const violations: string[] = [];
	for (const file of files) {
		const text = readFileSync(file, "utf8");
		if (text.includes("csv-summary")) {
			violations.push(`${relative(".", file)} mentions csv-summary`);
		}
		for (const match of text.matchAll(IMPORT)) {
			const spec = match[1] ?? match[2] ?? "";
			if (/recipes|csv-summary/.test(spec)) {
				violations.push(`${relative(".", file)} -> ${spec}`);
			}
		}
	}
	expect(violations).toEqual([]);
});

test("the isolation scan detects a real recipe import (non-vacuous check)", () => {
	const sample =
		'import { summarizeCsv } from "../recipes/csv-summary/summarize";';
	const specs = [...sample.matchAll(IMPORT)].map(
		(match) => match[1] ?? match[2] ?? "",
	);
	expect(specs.some((spec) => /recipes|csv-summary/.test(spec))).toBe(true);
});

test("source files are readable as files (isolation scan setup)", () => {
	const files = sourceFiles("src");
	expect(files.every((file) => statSync(file).isFile())).toBe(true);
});
