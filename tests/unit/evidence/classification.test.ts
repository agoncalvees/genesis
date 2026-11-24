import { describe, expect, test } from "vitest";
import { scoreClassification } from "../../../src/evidence/classification";

type Item = { id: string };

const items = (...ids: string[]): Item[] => ids.map((id) => ({ id }));
const byId = (item: Item): string => item.id;

describe("scoreClassification on known inputs", () => {
	test("perfect match scores one", () => {
		expect(
			scoreClassification({
				expected: items("a", "b", "c"),
				actual: items("c", "a", "b"),
				key: byId,
			}),
		).toEqual({
			tp: 3,
			fp: 0,
			fn: 0,
			precision: 1,
			recall: 1,
			f1: 1,
		});
	});

	test("partial overlap counts fp and fn", () => {
		const score = scoreClassification({
			expected: items("a", "b", "c"),
			actual: items("a", "c", "d"),
			key: byId,
		});
		expect(score.tp).toBe(2);
		expect(score.fp).toBe(1);
		expect(score.fn).toBe(1);
		expect(score.precision).toBeCloseTo(2 / 3, 12);
		expect(score.recall).toBeCloseTo(2 / 3, 12);
		expect(score.f1).toBeCloseTo(2 / 3, 12);
	});

	test("no overlap yields zero ratios but exact counts", () => {
		expect(
			scoreClassification({
				expected: items("a"),
				actual: items("b"),
				key: byId,
			}),
		).toEqual({
			tp: 0,
			fp: 1,
			fn: 1,
			precision: 0,
			recall: 0,
			f1: 0,
		});
	});

	test("duplicate keys are counted with multiplicity", () => {
		const score = scoreClassification({
			expected: items("a", "a", "b"),
			actual: items("a", "b", "b"),
			key: byId,
		});
		expect(score.tp).toBe(2);
		expect(score.fp).toBe(1);
		expect(score.fn).toBe(1);
		expect(score.precision).toBeCloseTo(2 / 3, 12);
	});

	test("zero denominators return zero, never NaN", () => {
		const emptyVsEmpty = scoreClassification({
			expected: [],
			actual: [],
			key: byId,
		});
		expect(emptyVsEmpty).toEqual({
			tp: 0,
			fp: 0,
			fn: 0,
			precision: 0,
			recall: 0,
			f1: 0,
		});

		const noPrediction = scoreClassification({
			expected: items("a"),
			actual: [],
			key: byId,
		});
		expect(noPrediction).toEqual({
			tp: 0,
			fp: 0,
			fn: 1,
			precision: 0,
			recall: 0,
			f1: 0,
		});

		const noExpectation = scoreClassification({
			expected: [],
			actual: items("a"),
			key: byId,
		});
		expect(noExpectation).toEqual({
			tp: 0,
			fp: 1,
			fn: 0,
			precision: 0,
			recall: 0,
			f1: 0,
		});

		for (const score of [emptyVsEmpty, noPrediction, noExpectation]) {
			for (const value of [score.precision, score.recall, score.f1]) {
				expect(Number.isNaN(value)).toBe(false);
			}
		}
	});

	test("composite keys work and inputs are unchanged", () => {
		const expected = items("a", "b");
		const actual = items("b", "a");
		const score = scoreClassification({
			expected,
			actual,
			key: (item) => `id:${item.id}`,
		});
		expect(score.tp).toBe(2);
		expect(expected.map((item) => item.id)).toEqual(["a", "b"]);
		expect(actual.map((item) => item.id)).toEqual(["b", "a"]);
	});
});
