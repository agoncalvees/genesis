/**
 * Multiset classification scoring for expected/actual item lists.
 *
 * Items are compared by a caller-supplied `key` (for example a stable id or a
 * composite `kind:value`). Duplicates count with multiplicity: a key present
 * twice in `expected` and once in `actual` contributes one true positive and
 * one false negative. Inputs are never mutated.
 *
 * All three ratios are defined when their denominator is zero: they return
 * `0` instead of `NaN`, meaning "no measured hits" rather than an invented
 * score. This is deliberately different from an empty sample statistics
 * (`computeStats` uses NaN in that case): here zero is a complete, verifiable
 * score for an empty side of the comparison.
 */

export type ClassificationScore = {
	/** Matched items, counting duplicates by multiplicity. */
	tp: number;
	/** Items in `actual` with no counterpart in `expected`. */
	fp: number;
	/** Items in `expected` with no counterpart in `actual`. */
	fn: number;
	/** tp / (tp + fp), or 0 when no item was predicted. */
	precision: number;
	/** tp / (tp + fn), or 0 when no item was expected. */
	recall: number;
	/** Harmonic mean of precision and recall, or 0 when both are 0. */
	f1: number;
};

export type ClassificationInput<T> = {
	expected: readonly T[];
	actual: readonly T[];
	key: (item: T) => string;
};

function ratio(numerator: number, denominator: number): number {
	return denominator === 0 ? 0 : numerator / denominator;
}

function countsByKey<T>(
	items: readonly T[],
	key: (item: T) => string,
): Map<string, number> {
	const counts = new Map<string, number>();
	for (const item of items) {
		const name = key(item);
		counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return counts;
}

/**
 * Score `actual` against `expected` by key multiplicity.
 *
 * Zero denominators (empty prediction, empty expectation, or both) yield 0
 * for the affected ratio and for F1; tp/fp/fn are still exact counts.
 */
export function scoreClassification<T>({
	expected,
	actual,
	key,
}: ClassificationInput<T>): ClassificationScore {
	const expectedCounts = countsByKey(expected, key);
	const actualCounts = countsByKey(actual, key);

	let tp = 0;
	for (const [name, count] of expectedCounts) {
		tp += Math.min(count, actualCounts.get(name) ?? 0);
	}
	const fp = actual.length - tp;
	const fn = expected.length - tp;
	const precision = ratio(tp, tp + fp);
	const recall = ratio(tp, tp + fn);
	return {
		tp,
		fp,
		fn,
		precision,
		recall,
		f1: ratio(2 * precision * recall, precision + recall),
	};
}
