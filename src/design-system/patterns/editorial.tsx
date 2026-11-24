import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./patterns.css";

/** Short label above a heading. Render it before the heading it introduces. */
export function Kicker({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			{...props}
			className={cn(
				"font-body text-ds-xs font-medium tracking-wide text-muted uppercase",
				className,
			)}
		/>
	);
}

/** Opening paragraph, limited to the readable `--measure`. */
export function Lede({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			{...props}
			className={cn(
				"max-w-(--measure) font-body text-ds-lg leading-relaxed text-foreground",
				className,
			)}
		/>
	);
}

export function PullQuote({
	children,
	cite,
	className,
}: {
	children: ReactNode;
	/** Attribution shown below the quote. */
	cite?: ReactNode;
	className?: string;
}) {
	return (
		<figure
			className={cn("ds-pull-quote grid max-w-(--measure) gap-3", className)}
		>
			<blockquote className="font-display text-ds-xl leading-snug font-ds-heading text-foreground">
				{children}
			</blockquote>
			{cite && (
				<figcaption className="text-ds-sm text-muted">{cite}</figcaption>
			)}
		</figure>
	);
}

/**
 * Media with caption. `credit` and `licence` record origin; required by the
 * project rule for any non-synthetic asset.
 */
export function Figure({
	children,
	caption,
	credit,
	licence,
	className,
}: {
	children: ReactNode;
	caption: ReactNode;
	credit?: ReactNode;
	licence?: ReactNode;
	className?: string;
}) {
	return (
		<figure className={cn("grid min-w-0 gap-2", className)}>
			<div className="min-w-0 overflow-hidden rounded-ds-md">{children}</div>
			<figcaption className="grid max-w-(--measure) gap-1 text-ds-sm">
				<span className="text-foreground">{caption}</span>
				{(credit || licence) && (
					<small className="text-ds-xs text-muted">
						{credit}
						{credit && licence && " · "}
						{licence}
					</small>
				)}
			</figcaption>
		</figure>
	);
}

/**
 * Inline evidence such as "2.4 MB → 168 KB −93%". Each value stays on one line;
 * the arrow and change remain readable text for assistive technology.
 */
export function EvidenceHeadline({
	before,
	after,
	change,
	className,
}: {
	before: ReactNode;
	after: ReactNode;
	change?: ReactNode;
	className?: string;
}) {
	return (
		<span className={cn("ds-evidence-headline", className)}>
			<span>{before}</span> → <span>{after}</span>
			{change != null && (
				<>
					{" "}
					<span className="ds-evidence-change">{change}</span>
				</>
			)}
		</span>
	);
}
