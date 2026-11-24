import { CaretDownIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./motion.css";

export function Expandable({
	label,
	children,
	className,
	...props
}: ComponentProps<"details"> & { label: ReactNode }) {
	return (
		<details
			{...props}
			className={cn(
				"ds-expandable group rounded-lg border border-border bg-surface",
				className,
			)}
		>
			<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
				{label}
				<CaretDownIcon
					aria-hidden
					size={16}
					className="shrink-0 group-open:rotate-180 motion-safe:transition-transform motion-safe:[transition-duration:var(--duration-fast)] ease-standard"
				/>
			</summary>
			<div className="border-t border-border px-4 py-3">{children}</div>
		</details>
	);
}
