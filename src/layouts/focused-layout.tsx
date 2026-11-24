import { type LayoutProps, SkipLink, useMainContentId } from "./layout-parts";

export function FocusedLayout({ header, children, footer }: LayoutProps) {
	const mainId = useMainContentId();
	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-xl min-w-0 flex-col bg-background px-4 wrap-anywhere sm:px-6">
			<SkipLink target={mainId} />
			{header && (
				<header className="border-b border-border py-4">{header}</header>
			)}
			<main id={mainId} tabIndex={-1} className="min-w-0 flex-1 py-8 sm:py-12">
				{children}
			</main>
			{footer && (
				<footer className="border-t border-border py-4">{footer}</footer>
			)}
		</div>
	);
}
