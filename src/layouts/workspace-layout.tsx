import type { ReactNode } from "react";
import { type LayoutProps, SkipLink, useMainContentId } from "./layout-parts";

export function WorkspaceLayout({
	header,
	tools,
	children,
	inspector,
	footer,
}: LayoutProps & { tools?: ReactNode; inspector?: ReactNode }) {
	const mainId = useMainContentId();
	return (
		<div className="flex min-h-dvh min-w-0 flex-col bg-background wrap-anywhere">
			<SkipLink target={mainId} />
			{header && (
				<header className="border-b-(length:--panel-border-width) border-panel-divider bg-panel-slot shadow-panel-flat px-4 py-3">
					{header}
				</header>
			)}
			<div className="flex min-w-0 flex-1 flex-col md:flex-row">
				{tools && (
					<aside
						aria-label="Workspace tools"
						className="min-w-0 border-b-(length:--panel-border-width) border-panel-divider bg-panel-surface shadow-panel-flat p-4 md:w-40 md:shrink-0 md:border-e-(length:--panel-border-width) md:border-b-0"
					>
						{tools}
					</aside>
				)}
				<main
					id={mainId}
					tabIndex={-1}
					className="grid min-w-0 flex-1 place-items-center p-4 sm:p-6"
				>
					{children}
				</main>
				{inspector && (
					<aside
						aria-label="Workspace inspector"
						className="min-w-0 border-t-(length:--panel-border-width) border-panel-divider bg-panel-surface shadow-panel-flat p-4 md:w-48 md:shrink-0 md:border-s-(length:--panel-border-width) md:border-t-0 lg:w-64"
					>
						{inspector}
					</aside>
				)}
			</div>
			{footer && (
				<footer className="border-t-(length:--panel-border-width) border-panel-divider bg-panel-slot shadow-panel-flat px-4 py-3">
					{footer}
				</footer>
			)}
		</div>
	);
}
