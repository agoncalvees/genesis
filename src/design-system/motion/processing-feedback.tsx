import { type ChartDatum, Sparkline } from "../dataviz";
import {
	type ProcessStep,
	ProcessTimeline,
} from "../patterns/process-timeline";
import { Progress } from "../primitives/feedback";

export function ProcessingFeedback({
	steps,
	label = "Processing",
	progress,
	throughput,
	locale = "en",
}: {
	/** Steps may carry `durationMs` to show per-step timing. */
	steps: readonly ProcessStep[];
	label?: string;
	progress?: number | null;
	/** Optional throughput samples drawn as a sparkline. */
	throughput?: { title: string; data: readonly ChartDatum[]; unit?: string };
	locale?: string;
}) {
	return (
		<div className="grid min-w-0 gap-4">
			<Progress label={label} value={progress} />
			{throughput && throughput.data.length > 0 && (
				<Sparkline
					title={throughput.title}
					data={throughput.data}
					unit={throughput.unit}
				/>
			)}
			<ProcessTimeline steps={steps} locale={locale} />
		</div>
	);
}
