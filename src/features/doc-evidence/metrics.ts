import { scoreClassification } from "../../evidence/classification";
import type { ExtractedItem } from "./extract";
import type { ExpectedItem } from "./fixture";

export function scoreExtraction(
	actual: readonly ExtractedItem[],
	expected: readonly ExpectedItem[],
) {
	const { tp, fp, fn, precision, recall, f1 } = scoreClassification({
		actual,
		expected,
		key: ({ kind, value }) =>
			`${kind}:${value.trim().replace(/\s+/g, " ").toLowerCase()}`,
	});
	return {
		expectedCount: expected.length,
		actualCount: actual.length,
		truePositives: tp,
		falsePositives: fp,
		falseNegatives: fn,
		precision,
		recall,
		f1,
	};
}
