/**
 * Deterministic JSON/CSV serialization of evidence records.
 *
 * Both formats expose the same fields in the same stable order. Nested values
 * (config, stats, rawResults, errors, limitations, runtime) are serialized as
 * compact JSON with object keys sorted recursively; array order is preserved.
 * Non-finite numbers become `null` (JSON) or an empty cell (CSV), documenting
 * an absence instead of inventing a measurement. Strings are UTF-8; every CSV
 * cell is quoted and internal quotes are doubled; line endings are LF.
 */

import type { BenchmarkRecord, BenchmarkStats } from "./runner";

export const RECORD_FIELDS = [
	"benchmark",
	"caseName",
	"dataset",
	"datasetSource",
	"datasetVersion",
	"codeVersion",
	"codeDirty",
	"modelVersion",
	"config",
	"baseline",
	"baselineJustification",
	"metric",
	"value",
	"unit",
	"sampleSize",
	"stats",
	"rawResults",
	"errors",
	"durationMs",
	"procedure",
	"limitations",
	"runtime",
	"date",
] as const;

export type ExportField = (typeof RECORD_FIELDS)[number];

export type CanonicalValue =
	| string
	| number
	| boolean
	| null
	| CanonicalValue[]
	| { [key: string]: CanonicalValue };

export type CanonicalRecord = Record<ExportField, CanonicalValue>;

const NESTED_FIELDS = new Set<ExportField>([
	"config",
	"stats",
	"rawResults",
	"errors",
	"limitations",
	"runtime",
]);
const NUMERIC_FIELDS = new Set<ExportField>([
	"baseline",
	"value",
	"sampleSize",
	"durationMs",
]);
const BOOLEAN_FIELDS = new Set<ExportField>(["codeDirty"]);

function finiteOrNull(value: number): number | null {
	return Number.isFinite(value) ? value : null;
}

/** Recursively sort object keys; keep array order; map non-finite numbers to null. */
export function sortDeep(value: unknown): CanonicalValue {
	if (value === null || value === undefined) return null;
	if (typeof value === "string" || typeof value === "boolean") return value;
	if (typeof value === "number") return finiteOrNull(value);
	if (Array.isArray(value)) return value.map((item) => sortDeep(item));
	if (typeof value === "object") {
		const source = value as Record<string, unknown>;
		const sorted: Record<string, CanonicalValue> = {};
		for (const key of Object.keys(source).sort()) {
			sorted[key] = sortDeep(source[key]);
		}
		return sorted;
	}
	return String(value);
}

function canonicalStats(stats: BenchmarkStats): CanonicalValue {
	return {
		n: stats.n,
		mean: finiteOrNull(stats.mean),
		median: finiteOrNull(stats.median),
		p95: finiteOrNull(stats.p95),
		min: finiteOrNull(stats.min),
		max: finiteOrNull(stats.max),
		stddev: finiteOrNull(stats.stddev),
	};
}

/** Project a record into the documented field order with canonical values. */
export function toCanonicalRecord(record: BenchmarkRecord): CanonicalRecord {
	return {
		benchmark: record.benchmark,
		caseName: record.caseName,
		dataset: record.dataset,
		datasetSource: record.datasetSource,
		datasetVersion: record.datasetVersion,
		codeVersion: record.codeVersion,
		codeDirty: record.codeDirty,
		modelVersion: record.modelVersion,
		config: sortDeep(record.config),
		baseline:
			record.baseline === undefined ? null : finiteOrNull(record.baseline),
		baselineJustification: record.baselineJustification,
		metric: record.metric,
		value: finiteOrNull(record.value),
		unit: record.unit,
		sampleSize: record.sampleSize,
		stats: canonicalStats(record.stats),
		rawResults: sortDeep(record.rawResults),
		errors: sortDeep(record.errors),
		durationMs: finiteOrNull(record.durationMs),
		procedure: record.procedure,
		limitations: sortDeep(record.limitations),
		runtime: sortDeep(record.runtime),
		date: record.date,
	};
}

export function toJson(records: readonly BenchmarkRecord[]): string {
	const canonical = records.map(toCanonicalRecord);
	return `${JSON.stringify(canonical, null, 2)}\n`;
}

function encodeCell(value: CanonicalValue): string {
	const text =
		value === null
			? ""
			: typeof value === "string"
				? value
				: typeof value === "number" || typeof value === "boolean"
					? String(value)
					: JSON.stringify(value);
	return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(records: readonly BenchmarkRecord[]): string {
	const header = RECORD_FIELDS.join(",");
	const rows = records.map((record) => {
		const canonical = toCanonicalRecord(record);
		return RECORD_FIELDS.map((field) => encodeCell(canonical[field])).join(",");
	});
	return `${[header, ...rows].join("\n")}\n`;
}

function decodeCell(raw: string, field: ExportField): CanonicalValue {
	if (raw === "") return null;
	if (BOOLEAN_FIELDS.has(field)) {
		return raw === "true" ? true : raw === "false" ? false : null;
	}
	if (NESTED_FIELDS.has(field)) return sortDeep(JSON.parse(raw));
	if (NUMERIC_FIELDS.has(field)) {
		const number = Number(raw);
		return Number.isFinite(number) ? number : null;
	}
	return raw;
}

/**
 * Read back the CSV produced by `toCsv`. Used to verify JSON/CSV field parity.
 * Field names are trusted to be `RECORD_FIELDS`; nested fields are parsed as
 * JSON, other fields stay strings (or numbers for the known numeric fields).
 */
export function parseCsv(text: string): CanonicalRecord[] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let quoted = false;

	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (quoted) {
			if (char === '"') {
				if (text[index + 1] === '"') {
					field += '"';
					index++;
				} else {
					quoted = false;
				}
			} else {
				field += char;
			}
		} else if (char === '"') {
			quoted = true;
		} else if (char === ",") {
			row.push(field);
			field = "";
		} else if (char === "\n") {
			row.push(field);
			field = "";
			rows.push(row);
			row = [];
		} else if (char !== "\r") {
			field += char;
		}
	}
	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	const [header, ...dataRows] = rows;
	if (!header) return [];
	return dataRows.map((cells) => {
		const record = {} as Record<string, CanonicalValue>;
		for (const [index, name] of header.entries()) {
			const fieldName = name as ExportField;
			record[fieldName] = decodeCell(cells[index] ?? "", fieldName);
		}
		return record as CanonicalRecord;
	});
}
