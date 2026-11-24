import { Children, type ComponentProps, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import { durations, type MotionDuration } from "./presets";
import "./motion.css";

export function FadeIn({
	className,
	duration = "fast",
	style,
	...props
}: ComponentProps<"div"> & { duration?: MotionDuration }) {
	return (
		<div
			{...props}
			className={cn("ds-fade-in", className)}
			style={
				{
					"--enter-duration": `var(${durations[duration]})`,
					...style,
				} as CSSProperties
			}
		/>
	);
}

export function StaggerGroup({
	children,
	className,
	...props
}: ComponentProps<"ul">) {
	return (
		<ul {...props} className={cn("grid gap-2", className)}>
			{Children.map(children, (child, index) =>
				child == null ? null : (
					<li
						className="ds-fade-in"
						style={
							{
								"--enter-delay": `calc(var(--duration-instant) * var(--motion-intensity, 1) * ${Math.min(index, 4) / 2})`,
							} as CSSProperties
						}
					>
						{child}
					</li>
				),
			)}
		</ul>
	);
}
