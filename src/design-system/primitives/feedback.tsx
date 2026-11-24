import { Progress as BaseProgress } from "@base-ui/react/progress";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";

const badgeStyles = {
	neutral: "bg-surface text-foreground",
	success: "bg-success text-on-success",
	warning: "bg-warning text-on-warning",
	danger: "bg-danger text-on-danger",
	info: "bg-info text-on-info",
};

export function Badge({
	tone = "neutral",
	className,
	...props
}: ComponentProps<"span"> & { tone?: keyof typeof badgeStyles }) {
	return (
		<span
			{...props}
			className={cn(
				"inline-flex w-fit items-center rounded-sm px-2 py-0.5 font-body text-xs font-medium",
				badgeStyles[tone],
				className,
			)}
		/>
	);
}

export function SpinnerMark() {
	return (
		<span
			aria-hidden="true"
			className="size-4 shrink-0 rounded-full border-2 border-current border-e-transparent motion-safe:animate-spin motion-safe:[animation-duration:var(--duration-showcase)]"
		/>
	);
}

export function Spinner({
	label,
	className,
	...props
}: Omit<ComponentProps<"span">, "children"> & { label: string }) {
	return (
		<span
			{...props}
			role="status"
			className={cn("inline-flex items-center", className)}
		>
			<SpinnerMark />
			<span className="sr-only">{label}</span>
		</span>
	);
}

export function Skeleton({
	className,
	...props
}: Omit<ComponentProps<"div">, "children">) {
	return (
		<div
			{...props}
			aria-hidden="true"
			className={cn("h-4 rounded-sm bg-border", className)}
		/>
	);
}

export function Progress({
	label,
	value = null,
	className,
	...props
}: Omit<
	ComponentProps<typeof BaseProgress.Root>,
	"className" | "children" | "value"
> & {
	label: ReactNode;
	value?: number | null;
	className?: string;
}) {
	const labelId = useId();
	return (
		<BaseProgress.Root
			aria-labelledby={props["aria-label"] ? undefined : labelId}
			{...props}
			value={value}
			className={cn("grid gap-2 text-sm", className)}
		>
			<div className="flex justify-between gap-3">
				<BaseProgress.Label id={labelId} className="font-medium">
					{label}
				</BaseProgress.Label>
				{value !== null && (
					<BaseProgress.Value className="text-muted tabular-nums" />
				)}
			</div>
			<BaseProgress.Track className="h-2 overflow-hidden rounded-full bg-surface ring-1 ring-muted">
				<BaseProgress.Indicator className="h-full rounded-full bg-primary data-indeterminate:mx-auto data-indeterminate:w-1/3 data-indeterminate:border-x-4 data-indeterminate:border-dotted data-indeterminate:border-on-primary" />
			</BaseProgress.Track>
		</BaseProgress.Root>
	);
}
