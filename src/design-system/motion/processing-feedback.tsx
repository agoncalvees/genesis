import {
	type ProcessStep,
	ProcessTimeline,
} from "../patterns/process-timeline";
import { Progress } from "../primitives/feedback";

export function ProcessingFeedback({
	steps,
	label = "Processing",
	progress,
}: {
	steps: readonly ProcessStep[];
	label?: string;
	progress?: number | null;
}) {
	return (
		<div className="grid min-w-0 gap-4">
			<Progress label={label} value={progress} />
			<ProcessTimeline steps={steps} />
		</div>
	);
}
