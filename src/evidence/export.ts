/**
 * Deterministic JSON/CSV serialization of evidence records.
 *
 * Both formats expose the same fields in the same stable order. Nested values
 * (config, stats, metricStats, rawResults, errors, limitations, runtime) are
 * serialized with object keys sorted recursively; array order is preserved.
 * Non-finite numbers become `null` (JSON) or an empty cell (CSV), documenting
 * an absence instead of inventing a measurement. Strings are UTF-8; every CSV
 * cell is quoted and internal quotes are doubled; line endings are LF.
 *
 * JSON uses tabs for indentation and Biome's JSON layout: short arrays stay on
 * one line, longer arrays are expanded, and objects are written one key per
 * line. Generated artifacts therefore pass `biome check` without reformatting.
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
	"metricStats",
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
	"metricStats",
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

/** Per-metric stats with sorted metric names and canonical numeric values. */
function canonicalMetricStats(
	metricStats: Record<string, BenchmarkStats> | undefined,
): CanonicalValue {
	const source = metricStats ?? {};
	const result: Record<string, CanonicalValue> = {};
	for (const name of Object.keys(source).sort()) {
		result[name] = canonicalStats(source[name]);
	}
	return result;
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
		metricStats: canonicalMetricStats(record.metricStats),
		rawResults: sortDeep(record.rawResults),
		errors: sortDeep(record.errors),
		durationMs: finiteOrNull(record.durationMs),
		procedure: record.procedure,
		limitations: sortDeep(record.limitations),
		runtime: sortDeep(record.runtime),
		date: record.date,
	};
}

/** Biome's default JSON line width, counting each tab as two columns. */
const JSON_LINE_WIDTH = 80;
const JSON_TAB_COLUMNS = 2;

function isJsonObject(
	value: CanonicalValue,
): value is { [key: string]: CanonicalValue } {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Single-line rendering with Biome's inline spacing. */
function inlineJson(value: CanonicalValue): string {
	if (value === null) return "null";
	if (typeof value === "string") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) return `[${value.map(inlineJson).join(", ")}]`;
	const entries = Object.entries(value);
	return entries.length === 0
		? "{}"
		: `{ ${entries.map(([name, item]) => `${JSON.stringify(name)}: ${inlineJson(item)}`).join(", ")} }`;
}

/**
 * Biome-compatible JSON layout. Arrays are inlined when the whole value fits
 * on one line and expanded otherwise; objects always use one key per line
 * (Biome preserves that layout when it already fits).
 */
function formatJson(
	value: CanonicalValue,
	indent: number,
	prefix = "",
): string {
	const inline = inlineJson(value);
	if (Array.isArray(value)) {
		if (value.length === 0) return "[]";
		const fits =
			indent * JSON_TAB_COLUMNS + prefix.length + inline.length <=
			JSON_LINE_WIDTH;
		if (fits) return inline;
		const childIndent = "\t".repeat(indent + 1);
		const body = value
			.map((item) => `${childIndent}${formatJson(item, indent + 1)}`)
			.join(",\n");
		return `[\n${body}\n${"\t".repeat(indent)}]`;
	}
	if (isJsonObject(value)) {
		const entries = Object.entries(value);
		if (entries.length === 0) return "{}";
		const childIndent = "\t".repeat(indent + 1);
		const body = entries
			.map(([name, item]) => {
				const key = JSON.stringify(name);
				return `${childIndent}${key}: ${formatJson(item, indent + 1, `${key}: `)}`;
			})
			.join(",\n");
		return `{\n${body}\n${"\t".repeat(indent)}}`;
	}
	return inline;
}

export function toJson(records: readonly BenchmarkRecord[]): string {
	return `${formatJson(records.map(toCanonicalRecord), 0)}\n`;
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
