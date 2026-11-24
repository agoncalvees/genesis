import { describe, expect, test } from "vitest";
import type { EvaluationResult } from "../../../src/core/contracts";
import {
	BenchmarkDefinitionError,
	defineBenchmark,
	run,
} from "../../../src/evidence/runner";

const BASE = {
	name: "unit-benchmark",
	dataset: "unit-synthetic",
	datasetSource: "fixture sintética — rotulada",
	datasetVersion: "1.0.0",
	metric: "elapsed",
	unit: "ms",
};

describe("evidence runner", () => {
	test("warms up without recording, keeps failures and derives stats from successes", () => {
		let calls = 0;
		const definition = defineBenchmark({
			...BASE,
			cases: [
				{
					name: "flaky",
					run: () => {
						calls++;
						if (calls === 3) throw new Error("boom");
					},
				},
			],
			warmup: 2,
			repetitions: 5,
			config: { marker: "unit" },
		});

		const records = run(definition);
		expect(calls).toBe(7); // 2 warm-up + 5 measured
		expect(records).toHaveLength(1);
		const record = records[0];

		expect(record.rawResults).toHaveLength(5);
		expect(record.rawResults.map((item) => item.phase)).toEqual(
			Array(5).fill("measured"),
		);
		expect(record.rawResults[0]).toMatchObject({
			iteration: 1,
			ok: false,
			case: "flaky",
		});
		expect(record.rawResults.filter((item) => item.ok)).toHaveLength(4);
		expect(record.errors).toEqual([
			{
				case: "flaky",
				phase: "measured",
				iteration: 1,
				name: "Error",
				message: "boom",
			},
		]);
		expect(record.stats.n).toBe(4);
		expect(record.sampleSize).toBe(4);
		expect(record.value).toBe(record.stats.median);
		expect(Number.isFinite(record.value)).toBe(true);
	});

	test("records warm-up errors separately without counting them in rawResults", () => {
		let calls = 0;
		const definition = defineBenchmark({
			...BASE,
			cases: [
				{
					name: "always-fails",
					run: () => {
						calls++;
						throw new TypeError("nope");
					},
				},
			],
			warmup: 2,
			repetitions: 3,
		});

		const record = run(definition)[0];
		expect(calls).toBe(5);
		expect(record.errors).toHaveLength(5);
		expect(record.errors.slice(0, 2).map((item) => item.phase)).toEqual([
			"warmup",
			"warmup",
		]);
		expect(record.errors.slice(2).map((item) => item.phase)).toEqual([
			"measured",
			"measured",
			"measured",
		]);
		expect(record.errors[0]).toMatchObject({
			name: "TypeError",
			message: "nope",
		});
		expect(record.rawResults).toHaveLength(3);
		expect(record.rawResults.every((item) => !item.ok)).toBe(true);
		expect(record.stats.n).toBe(0);
		expect(Number.isNaN(record.value)).toBe(true);
	});

	test("exposes EvaluationResult-compatible fields and evidence metadata", () => {
		const definition = defineBenchmark({
			...BASE,
			cases: [{ name: "ok", run: () => 1 }],
			warmup: 1,
			repetitions: 2,
			baseline: 12,
		});
		const record = run(definition)[0];
		const evaluation: EvaluationResult = record;

		expect(evaluation.metric).toBe("elapsed");
		expect(evaluation.unit).toBe("ms");
		expect(evaluation.sampleSize).toBe(2);
		expect(evaluation.baseline).toBe(12);
		expect(record.baselineJustification).toContain("declarado");
		expect(record.dataset).toBe("unit-synthetic");
		expect(record.datasetSource).toContain("sintética");
		expect(record.datasetVersion).toBe("1.0.0");
		expect(record.codeVersion).toMatch(/^(unknown|[0-9a-f]{7,40})$/);
		expect(record.modelVersion).toBe("n/a");
		expect(record.config).toMatchObject({ warmup: 1, repetitions: 2 });
		expect(record.procedure).toContain("Warm-up: 1");
		expect(record.procedure).toContain("2 repetições");
		expect(record.limitations.length).toBeGreaterThanOrEqual(3);
		expect(typeof record.runtime.node).toBe("string");
		expect(record.date).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);
		expect(record.durationMs).toBeGreaterThanOrEqual(0);
	});

	test("omits an undisclosed numeric baseline with an explicit justification", () => {
		const record = run(
			defineBenchmark({
				...BASE,
				cases: [{ name: "ok", run: () => 1 }],
				warmup: 0,
				repetitions: 1,
			}),
		)[0];
		expect(record.baseline).toBeUndefined();
		expect(record.baselineJustification).toContain("não inventado");
	});

	test("rejects invalid definitions before measuring", () => {
		const invalid =
			(overrides: Record<string, unknown>): (() => void) =>
			() =>
				defineBenchmark({
					...BASE,
					cases: [{ name: "ok", run: () => 1 }],
					warmup: 0,
					repetitions: 1,
					...overrides,
				});

		expect(invalid({ name: "" })).toThrow(BenchmarkDefinitionError);
		expect(invalid({ repetitions: 0 })).toThrow(/positive integer/);
		expect(invalid({ warmup: -1 })).toThrow(/non-negative integer/);
		expect(invalid({ cases: [] })).toThrow(/at least one case/);
		expect(
			invalid({
				cases: [
					{ name: "same", run: () => 1 },
					{ name: "same", run: () => 2 },
				],
			}),
		).toThrow(/duplicate case name/);
		expect(invalid({ baseline: Number.NaN })).toThrow(/finite number or null/);
	});
});
