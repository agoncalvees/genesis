import { type LayoutProps, SkipLink, useMainContentId } from "./layout-parts";

export function PresentationLayout({ header, children, footer }: LayoutProps) {
	const mainId = useMainContentId();
	return (
		<div className="flex min-h-svh min-w-0 flex-col bg-background wrap-anywhere">
			<SkipLink target={mainId} />
			{header && (
				<header className="border-b border-border px-5 py-4 sm:px-10">
					{header}
				</header>
			)}
			<main
				id={mainId}
				tabIndex={-1}
				className="mx-auto grid w-full max-w-(--content-max) flex-1 content-center px-5 py-16 sm:px-10 sm:py-24"
			>
				{children}
			</main>
			{footer && (
				<footer className="border-t border-border px-5 py-4 sm:px-10">
					{footer}
				</footer>
			)}
		</div>
	);
}
