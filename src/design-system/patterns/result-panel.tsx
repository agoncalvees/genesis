import { type ReactNode, useId } from "react";
import { type AppError, toUiState } from "../../core/contracts";
import { EmptyState, ErrorState } from "../components/states";
import { FadeIn } from "../motion/entrances";
import { Badge } from "../primitives/feedback";
import { Heading, Text } from "../primitives/typography";

type ResultPanelProps<T> = {
	title: string;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	// Shared fields let callers pass a status variable and its possible payloads together.
	data?: T | null;
	error?: AppError;
	feedback?: ReactNode;
	onRetry?: () => void;
	renderResult?: (data: T) => ReactNode;
	isEmpty?: (data: T) => boolean;
} & (
	| { status: "idle" | "running" | "cancelled" }
	| {
			status: "completed";
			data: T | null | undefined;
			renderResult: (data: T) => ReactNode;
	  }
	| { status: "completed"; data: null | undefined }
	| { status: "failed"; error: AppError }
);

const states = {
	idle: { label: "Idle", tone: "neutral" },
	loading: { label: "Loading", tone: "info" },
	empty: { label: "Empty", tone: "neutral" },
	error: { label: "Error", tone: "danger" },
	success: { label: "Success", tone: "success" },
	cancelled: { label: "Cancelled", tone: "warning" },
} as const;

export function ResultPanel<T>(props: ResultPanelProps<T>) {
	const { title, headingLevel = 2, status } = props;
	const titleId = useId();
	const data = status === "completed" ? props.data : undefined;
	const hasData = data != null && !props.isEmpty?.(data);
	const state = toUiState(status, hasData);
	const { label, tone } = states[state];
	const subheading = Math.min(headingLevel + 1, 6) as typeof headingLevel;
	let content: ReactNode;

	switch (status) {
		case "idle":
			content = <Text muted>Ready to run.</Text>;
			break;
		case "running":
			content = props.feedback ?? <Text muted>Execution is in progress.</Text>;
			break;
		case "completed":
			content = hasData ? (
				props.renderResult?.(data)
			) : (
				<EmptyState
					title="No results"
					headingLevel={subheading}
					description="Execution finished without returning any data."
				/>
			);
			break;
		case "failed": {
			const retry = props.onRetry
				? { onRetry: props.onRetry, retryLabel: "Retry execution" }
				: { onRetry: undefined };
			content = (
				<ErrorState
					title="Execution failed"
					headingLevel={subheading}
					error={props.error}
					{...retry}
				/>
			);
			break;
		}
		case "cancelled":
			content = <Text muted>Execution was cancelled.</Text>;
			break;
	}

	return (
		<section
			aria-labelledby={titleId}
			data-state={state}
			className="grid min-w-0 gap-4 rounded-lg border border-border bg-surface-raised p-4 sm:p-5"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Heading id={titleId} level={headingLevel}>
					{title}
				</Heading>
				<div role="status" aria-atomic="true">
					<Badge tone={tone}>{label}</Badge>
				</div>
			</div>
			<FadeIn key={state} className="min-w-0 wrap-anywhere">
				{content}
			</FadeIn>
		</section>
	);
}
