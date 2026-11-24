import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const headingStyles = {
	1: "text-3xl sm:text-4xl",
	2: "text-xl sm:text-2xl",
	3: "text-lg",
	4: "text-base",
	5: "text-sm",
	6: "text-sm",
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
				"font-display font-semibold tracking-tight text-foreground",
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
				"font-body text-sm leading-relaxed",
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
				"rounded-sm bg-surface px-1.5 py-0.5 font-mono text-sm wrap-break-word text-foreground",
				className,
			)}
		/>
	);
}
