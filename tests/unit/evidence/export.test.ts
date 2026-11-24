import { describe, expect, test } from "vitest";
import {
	parseCsv,
	RECORD_FIELDS,
	toCanonicalRecord,
	toCsv,
	toJson,
} from "../../../src/evidence/export";
import type { BenchmarkRecord } from "../../../src/evidence/runner";

function fixtureRecord(
	overrides: Partial<BenchmarkRecord> = {},
): BenchmarkRecord {
	return {
		metric: "elapsed",
		value: 1.25,
		unit: "ms",
		sampleSize: 3,
		baseline: 2,
		benchmark: "unit-benchmark",
		caseName: "flaky",
		dataset: "unit-synthetic",
		datasetSource: "fixture sintética — rotulada",
		datasetVersion: "1.0.0",
		codeVersion: "abc1234",
		codeDirty: true,
		modelVersion: "n/a",
		config: { zeta: 1, alpha: { y: 2, x: 3 } },
		baselineJustification: "baseline declarado",
		stats: {
			n: 3,
			mean: 1.2,
			median: 1.25,
			p95: 1.4,
			min: 1,
			max: 1.5,
			stddev: 0.25,
		},
		rawResults: [
			{ case: "flaky", phase: "measured", iteration: 1, duration: 1, ok: true },
		],
		errors: [],
		durationMs: 5,
		procedure: 'comma, "quote" and café\nsecond line',
		limitations: ["amostra pequena"],
		runtime: { node: "24.22.3", bun: "1.4.5" },
		date: "2026-11-24T00:00:00.000Z",
		...overrides,
	};
}

describe("evidence export", () => {
	test("JSON uses the documented stable field order and sorted nested keys", () => {
		const parsed = JSON.parse(toJson([fixtureRecord()])) as Record<
			string,
			unknown
		>[];
		expect(Object.keys(parsed[0])).toEqual([...RECORD_FIELDS]);
		const config = parsed[0].config as Record<string, unknown>;
		expect(Object.keys(config)).toEqual(["alpha", "zeta"]);
		expect(Object.keys(config.alpha as Record<string, unknown>)).toEqual([
			"x",
			"y",
		]);
	});

	test("codeDirty sits next to codeVersion and round-trips as a boolean", () => {
		const fields = [...RECORD_FIELDS];
		expect(fields[fields.indexOf("codeVersion") + 1]).toBe("codeDirty");

		for (const codeDirty of [true, false]) {
			const record = fixtureRecord({ codeDirty });
			expect(toCanonicalRecord(record).codeDirty).toBe(codeDirty);
			const json = JSON.parse(toJson([record])) as Record<string, unknown>[];
			expect(json[0].codeDirty).toBe(codeDirty);
			expect(parseCsv(toCsv([record]))[0].codeDirty).toBe(codeDirty);
		}
	});

	test("JSON and CSV expose the same fields with the same values", () => {
		const records = [
			fixtureRecord(),
			fixtureRecord({
				caseName: "second",
				baseline: undefined,
				codeDirty: false,
			}),
		];
		const json = JSON.parse(toJson(records)) as Record<string, unknown>[];
		const csv = toCsv(records);
		const header = csv.split("\n")[0];
		expect(header).toBe(RECORD_FIELDS.join(","));

		const parsedCsv = parseCsv(csv);
		expect(parsedCsv).toHaveLength(records.length);
		for (const row of parsedCsv) {
			expect(Object.keys(row)).toEqual([...RECORD_FIELDS]);
		}
		expect(parsedCsv).toEqual(json);
	});

	test("serialization is deterministic for repeated calls and reordered config keys", () => {
		const record = fixtureRecord();
		expect(toJson([record])).toBe(toJson([record]));
		expect(toCsv([record])).toBe(toCsv([record]));
		const reordered = fixtureRecord({
			config: { alpha: { x: 3, y: 2 }, zeta: 1 },
		});
		expect(toJson([reordered])).toBe(toJson([record]));
		expect(toCsv([reordered])).toBe(toCsv([record]));
	});

	test("absent and non-finite numbers serialize as null (empty CSV cell)", () => {
		const record = fixtureRecord({
			baseline: undefined,
			value: Number.NaN,
			stats: { ...fixtureRecord().stats, mean: Number.NaN },
		});
		const canonical = toCanonicalRecord(record);
		expect(canonical.baseline).toBeNull();
		expect(canonical.value).toBeNull();
		expect((canonical.stats as Record<string, unknown>).mean).toBeNull();

		const json = JSON.parse(toJson([record])) as Record<string, unknown>[];
		expect(json[0].baseline).toBeNull();
		expect(json[0].value).toBeNull();
		const parsedCsv = parseCsv(toCsv([record]));
		expect(parsedCsv[0].baseline).toBeNull();
		expect(parsedCsv[0].value).toBeNull();
	});

	test("keeps UTF-8 text intact in both formats", () => {
		const output = toJson([fixtureRecord()]) + toCsv([fixtureRecord()]);
		expect(output).toContain("café");
		expect(output).toContain("rotulada");
	});

	test("an empty record list still yields the header and an empty JSON array", () => {
		expect(toCsv([])).toBe(`${RECORD_FIELDS.join(",")}\n`);
		expect(toJson([])).toBe("[]\n");
		expect(parseCsv(toCsv([]))).toEqual([]);
	});
});
