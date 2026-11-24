import { type ReactNode, useId } from "react";

export type LayoutProps = {
	header?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
};

export function useMainContentId() {
	return `main-${useId()}`;
}

export function SkipLink({ target }: { target: string }) {
	return (
		<a
			href={`#${target}`}
			className="sr-only z-50 rounded-md bg-surface-raised px-4 py-3 font-medium text-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
		>
			Skip to main content
		</a>
	);
}
