import type { ReactNode } from "react";
import { cn } from "../design-system/lib/cn";
import { type LayoutProps, SkipLink, useMainContentId } from "./layout-parts";

export function ApplicationLayout({
	header,
	navigation,
	children,
	footer,
}: LayoutProps & { navigation?: ReactNode }) {
	const mainId = useMainContentId();
	return (
		<div className="flex min-h-dvh min-w-0 flex-col bg-background wrap-anywhere">
			<SkipLink target={mainId} />
			{header && (
				<header className="border-b border-border bg-surface px-4 py-3 sm:px-6">
					{header}
				</header>
			)}
			<div
				className={cn(
					"mx-auto grid w-full max-w-(--content-max) flex-1 grid-cols-[minmax(0,1fr)]",
					navigation && "md:grid-cols-[12rem_minmax(0,1fr)]",
				)}
			>
				{navigation && (
					<nav
						aria-label="Application"
						className="min-w-0 border-b border-border bg-surface px-4 py-3 md:border-e md:border-b-0"
					>
						{navigation}
					</nav>
				)}
				<main id={mainId} tabIndex={-1} className="min-w-0 p-4 sm:p-6 lg:p-10">
					{children}
				</main>
			</div>
			{footer && (
				<footer className="border-t border-border px-4 py-3 sm:px-6">
					{footer}
				</footer>
			)}
		</div>
	);
}
