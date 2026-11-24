import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const headingStyles = {
	1: "text-ds-3xl sm:text-ds-4xl",
	2: "text-ds-xl sm:text-ds-2xl",
	3: "text-ds-lg",
	4: "text-ds-base",
	5: "text-ds-sm",
	6: "text-ds-sm",
};

export function Heading({
	level = 2,
	className,
	...props
}: ComponentProps<"h2"> & { level?: keyof typeof headingStyles }) {
	const Tag = `h${level}` as const;
	return (
		<Tag
			{...props}
			className={cn(
				"font-display tracking-display text-foreground",
				level === 1 ? "font-ds-display" : "font-ds-heading",
				headingStyles[level],
				className,
			)}
		/>
	);
}

export function Text({
	muted,
	className,
	...props
}: ComponentProps<"p"> & { muted?: boolean }) {
	return (
		<p
			{...props}
			className={cn(
				"font-body text-ds-sm leading-relaxed",
				muted ? "text-muted" : "text-foreground",
				className,
			)}
		/>
	);
}

export function Code({ className, ...props }: ComponentProps<"code">) {
	return (
		<code
			{...props}
			className={cn(
				"rounded-ds-sm bg-surface px-1.5 py-0.5 font-mono text-ds-sm wrap-break-word text-foreground",
				className,
			)}
		/>
	);
}
