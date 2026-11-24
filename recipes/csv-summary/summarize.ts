/**
 * Isolated recipe: summarize numeric columns of a small CSV with plain
 * TypeScript. No dependencies, no network, no credentials, no imports from
 * `src/`. The parser deliberately supports a strict subset (unquoted, numeric,
 * comma-separated cells) and rejects anything else with an explicit error.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export class CsvParseError extends Error {
	override readonly name = "CsvParseError";
}

export type ColumnSummary = {
	column: string;
	count: number;
	min: number;
	max: number;
	mean: number;
};

export type CsvSummary = { columns: ColumnSummary[] };

function parseHeader(line: string): string[] {
	const columns = line.split(",");
	if (columns.some((column) => column.trim() === "")) {
		throw new CsvParseError("row 1: header contains an empty column name");
	}
	const seen = new Set<string>();
	for (const column of columns) {
		if (seen.has(column)) {
			throw new CsvParseError(`row 1: duplicate column name "${column}"`);
		}
		seen.add(column);
	}
	return columns;
}

/** Summarize a numeric CSV; throw `CsvParseError` for every malformed row. */
export function summarizeCsv(input: string): CsvSummary {
	const text = input
		.replace(/^\uFEFF/, "")
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n");
	const lines = text.split("\n");
	if (lines.at(-1) === "") lines.pop();

	if (lines.length === 0) {
		throw new CsvParseError("CSV is empty: a header row is required");
	}

	const header = parseHeader(lines[0]);
	if (lines.length < 2) {
		throw new CsvParseError("CSV has a header but no data rows");
	}

	const values: number[][] = header.map(() => []);
	for (let index = 1; index < lines.length; index++) {
		const lineNumber = index + 1;
		const line = lines[index];
		if (line.trim() === "") {
			throw new CsvParseError(`row ${lineNumber}: empty row`);
		}
		if (line.includes('"')) {
			throw new CsvParseError(
				`row ${lineNumber}: quoted CSV fields are not supported`,
			);
		}
		const cells = line.split(",");
		if (cells.length !== header.length) {
			throw new CsvParseError(
				`row ${lineNumber}: expected ${header.length} fields, got ${cells.length}`,
			);
		}
		for (const [columnIndex, cell] of cells.entries()) {
			const column = header[columnIndex];
			if (cell.trim() === "") {
				throw new CsvParseError(
					`row ${lineNumber}, column "${column}": empty value`,
				);
			}
			const number = Number(cell);
			if (!Number.isFinite(number)) {
				throw new CsvParseError(
					`row ${lineNumber}, column "${column}": "${cell}" is not a finite number`,
				);
			}
			values[columnIndex].push(number);
		}
	}

	const columns = header.map((column, index) => {
		const numbers = values[index];
		const sum = numbers.reduce((acc, value) => acc + value, 0);
		const min = numbers.reduce(
			(acc, value) => Math.min(acc, value),
			numbers[0],
		);
		const max = numbers.reduce(
			(acc, value) => Math.max(acc, value),
			numbers[0],
		);
		return {
			column,
			count: numbers.length,
			min,
			max,
			mean: sum / numbers.length,
		};
	});

	return { columns };
}

function isEntryPoint(): boolean {
	const entry = process.argv[1];
	if (!entry) return false;
	try {
		return resolve(entry) === fileURLToPath(import.meta.url);
	} catch {
		return false;
	}
}

if (isEntryPoint()) {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error("usage: bun recipes/csv-summary/summarize.ts <file.csv>");
		process.exitCode = 2;
	} else {
		try {
			console.log(
				JSON.stringify(summarizeCsv(readFileSync(filePath, "utf8")), null, 2),
			);
		} catch (error) {
			console.error(error instanceof Error ? error.message : String(error));
			process.exitCode = 1;
		}
	}
}
