import type { ReactNode } from "react";
import type { AppError } from "../../core/contracts";
import { Button } from "../primitives/button";
import { Heading, Text } from "../primitives/typography";

type StateProps = {
	title: ReactNode;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
};

export function EmptyState({
	title,
	headingLevel,
	description,
	action,
}: StateProps & {
	description?: ReactNode;
	action?: ReactNode;
}) {
	return (
		<div className="grid justify-items-start gap-2 rounded-ds-lg panel border-dashed border-muted bg-panel-surface shadow-panel-flat p-4">
			<Heading level={headingLevel}>{title}</Heading>
			{description && <Text muted>{description}</Text>}
			{action}
		</div>
	);
}

type RetryProps =
	| { onRetry: () => void; retryLabel: string }
	| { onRetry?: undefined; retryLabel?: never };

export function ErrorState({
	title,
	headingLevel,
	error,
	onRetry,
	retryLabel,
}: StateProps & RetryProps & { error: AppError }) {
	return (
		<div className="grid justify-items-start gap-3 rounded-ds-lg panel border-danger bg-panel-surface shadow-panel-flat p-4">
			<div role="alert" className="grid gap-1">
				<Heading level={headingLevel}>{title}</Heading>
				<Text>{error.message}</Text>
			</div>
			{error.retryable && onRetry && (
				<Button variant="secondary" size="sm" onClick={onRetry}>
					{retryLabel}
				</Button>
			)}
		</div>
	);
}
