import type { EvaluationResult } from "../../core/contracts";
import type { ChartDatum, ProcessStep } from "../../design-system";

// Synthetic Studio fixture. No processing, benchmark, or external service runs here.
const baseline = 2400;
const output = 168;
const reduction = Math.round((1 - output / baseline) * 100);
const originalSize = `${baseline / 1000} MB`;
const outputSize = `${output} KB`;

export const syntheticAnalysis = {
	originalSize,
	outputSize,
	output,
	reduction,
	series: [
		{ label: "Source", value: baseline },
		{ label: "Pass 1", value: 1080 },
		{ label: "Pass 2", value: 420 },
		{ label: "Final", value: output },
	] satisfies ChartDatum[],
	metrics: [
		{ metric: "Original", value: baseline / 1000, unit: "MB" },
		{ metric: "Output", value: output, unit: "KB" },
		{
			metric: "Reduction",
			value: reduction,
			unit: "%",
		},
	] satisfies EvaluationResult[],
	steps: [
		{
			id: "read",
			label: "Read source",
			detail: "Record the baseline size.",
			status: "completed",
		},
		{
			id: "compare",
			label: "Compare passes",
			detail: "Track size after each pass.",
			status: "completed",
		},
		{
			id: "review",
			label: "Review output",
			detail: "Check the final size against the target.",
			status: "completed",
		},
	] satisfies ProcessStep[],
	evidence: `Sample log • Final pass retained ${outputSize} from a ${baseline.toLocaleString("en")} KB source. The recorded reduction is ${reduction}%.`,
	evidenceKey: outputSize,
};
