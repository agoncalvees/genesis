import { describe, expect, test } from "vitest";
import { computeStats } from "../../../src/evidence/runner";

describe("computeStats on known inputs", () => {
	test("odd-length sample", () => {
		const stats = computeStats([1, 2, 3, 4, 5]);
		expect(stats.n).toBe(5);
		expect(stats.mean).toBe(3);
		expect(stats.median).toBe(3);
		expect(stats.p95).toBeCloseTo(4.8, 12);
		expect(stats.min).toBe(1);
		expect(stats.max).toBe(5);
		expect(stats.stddev).toBeCloseTo(Math.sqrt(2.5), 12);
	});

	test("even-length sample", () => {
		const stats = computeStats([1, 2, 3, 4]);
		expect(stats.n).toBe(4);
		expect(stats.mean).toBe(2.5);
		expect(stats.median).toBe(2.5);
		expect(stats.p95).toBeCloseTo(3.85, 12);
		expect(stats.min).toBe(1);
		expect(stats.max).toBe(4);
		expect(stats.stddev).toBeCloseTo(Math.sqrt(5 / 3), 12);
	});

	test("single value has zero dispersion", () => {
		expect(computeStats([42])).toEqual({
			n: 1,
			mean: 42,
			median: 42,
			p95: 42,
			min: 42,
			max: 42,
			stddev: 0,
		});
	});

	test("empty sample reports NaN aggregates instead of invented zeros", () => {
		const stats = computeStats([]);
		expect(stats.n).toBe(0);
		for (const key of [
			"mean",
			"median",
			"p95",
			"min",
			"max",
			"stddev",
		] as const) {
			expect(Number.isNaN(stats[key])).toBe(true);
		}
	});

	test("does not mutate the input", () => {
		const input = [5, 1, 3];
		computeStats(input);
		expect(input).toEqual([5, 1, 3]);
	});
});
