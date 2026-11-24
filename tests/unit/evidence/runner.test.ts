import { describe, expect, test } from "vitest";
import type { EvaluationResult } from "../../../src/core/contracts";
import { toJson } from "../../../src/evidence/export";
import {
	BenchmarkDefinitionError,
	defineBenchmark,
	detectCodeDirty,
	detectCodeVersion,
	type GitResult,
	type GitRunner,
	redactSecrets,
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
		expect(record.errors).toHaveLength(1);
		expect(record.errors[0]).toMatchObject({
			caseName: "flaky",
			phase: "measured",
			repetition: 1,
			name: "Error",
		});
		expect(record.errors[0].correlationId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
		expect(record.errors[0]).not.toHaveProperty("message");
		expect(toJson([record])).not.toContain("boom");
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
			caseName: "always-fails",
			phase: "warmup",
			repetition: 1,
		});
		expect(record.errors[0]).not.toHaveProperty("message");
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
		expect(typeof record.codeDirty).toBe("boolean");
		expect(record.codeDirty).toBe(detectCodeDirty());
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
		expect(invalid({ includeErrorMessages: "yes" })).toThrow(
			/includeErrorMessages must be a boolean/,
		);
	});

	test("does not export raw messages by default even when they contain secrets", () => {
		const secret = "sk-or-v1-abcdefghijklmnopqrstuvwxyz";
		const record = run(
			defineBenchmark({
				...BASE,
				cases: [
					{
						name: "leaky",
						run: () => {
							throw new Error(`prompt with ${secret}`);
						},
					},
				],
				warmup: 0,
				repetitions: 1,
			}),
		)[0];

		expect(record.errors[0]).not.toHaveProperty("message");
		const output = toJson([record]);
		expect(output).not.toContain(secret);
		expect(output).not.toContain("prompt with");
		expect(record.errors[0].correlationId).not.toBe(record.errors[0].caseName);
	});

	test("opt-in messages are redacted for keys, bearer tokens, emails and long tokens", () => {
		const message = [
			"key sk-or-v1-abcdefghijklmnopqrstuvwxyz",
			"auth Bearer eyJhbGciOiJIUzI1NiJ9.payload.signature1234",
			"mail analyst@example.com",
			"hex aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			"b64 QWxhZGRpbjpPcGVuU2VzYW1lMTIzNDU2Nzg5",
			"harmless context",
		].join(" | ");
		const record = run(
			defineBenchmark({
				...BASE,
				cases: [
					{
						name: "leaky",
						run: () => {
							throw new Error(message);
						},
					},
				],
				warmup: 1,
				repetitions: 1,
				includeErrorMessages: true,
			}),
		)[0];

		expect(record.errors).toHaveLength(2);
		for (const error of record.errors) {
			expect(error.message).toBeDefined();
			expect(error.message).toContain("[REDACTED]");
			expect(error.message).toContain("harmless context");
			for (const secret of [
				"sk-or-v1-abcdefghijklmnopqrstuvwxyz",
				"eyJhbGciOiJIUzI1NiJ9.payload.signature1234",
				"analyst@example.com",
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
				"QWxhZGRpbjpPcGVuU2VzYW1lMTIzNDU2Nzg5",
			]) {
				expect(error.message).not.toContain(secret);
			}
		}
		const output = toJson([record]);
		for (const secret of [
			"analyst@example.com",
			"sk-or-v1-abcdefghijklmnopqrstuvwxyz",
		]) {
			expect(output).not.toContain(secret);
		}
	});

	test("redactSecrets is reusable and removes each documented pattern", () => {
		expect(redactSecrets("plain text")).toBe("plain text");
		expect(redactSecrets("sk-proj-1234567890abcdef")).toBe("[REDACTED]");
		expect(redactSecrets("Authorization: Bearer abcdefghijklmnop")).toContain(
			"[REDACTED]",
		);
		expect(redactSecrets("to a@b.co now")).toBe("to [REDACTED] now");
		expect(redactSecrets("0123456789abcdef0123456789abcdef")).toBe(
			"[REDACTED]",
		);
	});

	test("correlation ids are unique per recorded error", () => {
		const record = run(
			defineBenchmark({
				...BASE,
				cases: [
					{
						name: "always-fails",
						run: () => {
							throw new Error("x");
						},
					},
				],
				warmup: 0,
				repetitions: 3,
			}),
		)[0];
		const ids = record.errors.map((error) => error.correlationId);
		expect(new Set(ids).size).toBe(3);
	});
});

describe("git detection with an injected runner", () => {
	function fakeRunner(...results: GitResult[]): GitRunner {
		const queue = [...results];
		return (args) => {
			const next = queue.shift();
			if (!next) throw new Error(`unexpected git call: ${args.join(" ")}`);
			return next;
		};
	}

	const ok = (stdout: unknown): GitResult => ({ exitCode: 0, stdout });

	test("detects a short commit and a clean tree", () => {
		const calls: string[][] = [];
		const runner: GitRunner = (args) => {
			calls.push([...args]);
			return args[3] === "HEAD" ? ok("abc1234\n") : ok("\n");
		};
		expect(detectCodeVersion(runner)).toBe("abc1234");
		expect(detectCodeDirty(runner)).toBe(false);
		expect(calls).toEqual([
			["git", "rev-parse", "--short", "HEAD"],
			["git", "status", "--porcelain"],
		]);
	});

	test("detects a dirty tree from non-empty porcelain output", () => {
		expect(
			detectCodeDirty(
				fakeRunner(ok(" M src/evidence/runner.ts\n?? new-file.ts\n")),
			),
		).toBe(true);
		expect(
			detectCodeDirty(fakeRunner(ok(new TextEncoder().encode("?? x\n")))),
		).toBe(true);
	});

	test("failed or missing git commands do not invent state", () => {
		expect(detectCodeVersion(fakeRunner({ exitCode: 128, stdout: "" }))).toBe(
			"unknown",
		);
		expect(detectCodeDirty(fakeRunner({ exitCode: 128, stdout: "?? x" }))).toBe(
			false,
		);
		expect(detectCodeVersion(fakeRunner(ok("  \n")))).toBe("unknown");
		expect(detectCodeDirty(fakeRunner(ok(null)))).toBe(false);
		const throwing: GitRunner = () => {
			throw new Error("no git");
		};
		expect(detectCodeVersion(throwing)).toBe("unknown");
		expect(detectCodeDirty(throwing)).toBe(false);
	});

	test("falls back to status when exitCode is absent", () => {
		expect(
			detectCodeVersion(fakeRunner({ status: 0, stdout: "deadbeef" })),
		).toBe("deadbeef");
		expect(detectCodeDirty(fakeRunner({ status: 1, stdout: "?? x" }))).toBe(
			false,
		);
	});
});
