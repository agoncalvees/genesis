import type { ExecutionStatus } from "../../core/contracts";
import { Badge } from "../primitives/feedback";

export type ProcessStep = {
	id: string;
	label: string;
	status: ExecutionStatus;
	detail?: string;
};

const stepPresentation = {
	idle: { label: "Pending", tone: "neutral" },
	running: { label: "In progress", tone: "info" },
	completed: { label: "Completed", tone: "success" },
	failed: { label: "Failed", tone: "danger" },
	cancelled: { label: "Cancelled", tone: "warning" },
} as const;

export function ProcessTimeline({
	steps,
	label = "Execution steps",
}: {
	steps: readonly ProcessStep[];
	label?: string;
}) {
	return (
		<ol
			aria-label={label}
			className="ms-3 list-decimal space-y-3 border-s border-border ps-5 marker:text-ds-sm marker:text-muted"
		>
			{steps.map((step) => {
				const { label, tone } = stepPresentation[step.status];
				return (
					<li key={step.id} className="min-w-0 ps-1 text-ds-sm wrap-anywhere">
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<span className="font-medium">{step.label}</span>
							<Badge tone={tone}>{label}</Badge>
						</div>
						{step.detail && <p className="mt-1 text-muted">{step.detail}</p>}
					</li>
				);
			})}
		</ol>
	);
}
