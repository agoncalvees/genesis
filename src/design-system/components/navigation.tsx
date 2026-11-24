import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { ListIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import { cn } from "../lib/cn";
import { useThemePortal } from "../lib/theme-portal";
import { Button, IconButton } from "../primitives/button";
import "../patterns/patterns.css";

export type NavItem = {
	href: string;
	label: string;
	current?: boolean;
	icon?: ReactNode;
};

type LinkRenderer = (
	item: NavItem,
	props: { className: string; onClick?: () => void; "aria-current"?: "page" },
) => ReactNode;

const defaultLink: LinkRenderer = (item, props) => (
	<a href={item.href} {...props}>
		{item.icon && (
			<span aria-hidden="true" className="inline-flex">
				{item.icon}
			</span>
		)}
		{item.label}
	</a>
);

const linkStyles =
	"inline-flex min-h-(--target-min) min-w-0 items-center gap-2 rounded-ds-md px-3 py-2 text-ds-sm text-foreground underline-offset-4 hover:underline aria-[current=page]:font-medium aria-[current=page]:underline";

/**
 * Top bar with inline links from 768 px and a Base UI Drawer below it.
 * Pass `renderLink` to use a router link component.
 */
export function AppNav({
	label,
	brand,
	items,
	actions,
	menuLabel = "Open menu",
	closeLabel = "Close menu",
	renderLink = defaultLink,
}: {
	/** Accessible name for the navigation landmark. */
	label: string;
	brand: ReactNode;
	items: readonly NavItem[];
	actions?: ReactNode;
	menuLabel?: string;
	closeLabel?: string;
	renderLink?: LinkRenderer;
}) {
	const [open, setOpen] = useState(false);
	const portal = useThemePortal();
	const link = (item: NavItem, extra: string, onClick?: () => void) =>
		renderLink(item, {
			className: cn(linkStyles, extra),
			onClick,
			...(item.current ? { "aria-current": "page" as const } : {}),
		});
	return (
		<div className="flex min-w-0 flex-wrap items-center gap-3 border-b-(length:--border-width) border-border bg-surface-raised px-4 py-2">
			<div className="min-w-0 font-display font-ds-heading wrap-anywhere">
				{brand}
			</div>
			<nav aria-label={label} className="ms-auto hidden min-w-0 md:block">
				<ul className="flex flex-wrap items-center gap-1">
					{items.map((item) => (
						<li key={item.href}>{link(item, "")}</li>
					))}
				</ul>
			</nav>
			{actions && (
				<div className="flex items-center gap-2 max-md:ms-auto">{actions}</div>
			)}
			<BaseDrawer.Root open={open} onOpenChange={setOpen} swipeDirection="left">
				<BaseDrawer.Trigger
					ref={portal.anchor}
					render={
						<IconButton
							aria-label={menuLabel}
							className={cn("md:hidden", !actions && "ms-auto")}
						/>
					}
				>
					<ListIcon size={20} weight="bold" />
				</BaseDrawer.Trigger>
				<BaseDrawer.Portal container={portal.container}>
					<BaseDrawer.Backdrop className="fixed inset-0 z-40 bg-dialog-scrim transition-opacity duration-(--duration-fast) ease-standard data-ending-style:opacity-0 data-starting-style:opacity-0" />
					<BaseDrawer.Viewport className="fixed inset-0 z-40 flex">
						<BaseDrawer.Popup className="grid h-full w-[min(20rem,85vw)] content-start gap-4 overflow-y-auto bg-panel-raised p-4 text-foreground shadow-panel-lg transition-transform duration-(--duration-normal) ease-standard data-ending-style:-translate-x-full data-starting-style:-translate-x-full rtl:data-ending-style:translate-x-full rtl:data-starting-style:translate-x-full">
							<div className="flex items-center justify-between gap-2">
								<BaseDrawer.Title className="font-display text-ds-lg font-ds-heading">
									{brand}
								</BaseDrawer.Title>
								<BaseDrawer.Close
									render={<Button variant="secondary" size="sm" />}
								>
									{closeLabel}
								</BaseDrawer.Close>
							</div>
							<nav aria-label={label}>
								<ul className="grid gap-1">
									{items.map((item) => (
										<li key={item.href}>
											{link(item, "w-full min-h-11", () => setOpen(false))}
										</li>
									))}
								</ul>
							</nav>
						</BaseDrawer.Popup>
					</BaseDrawer.Viewport>
				</BaseDrawer.Portal>
			</BaseDrawer.Root>
		</div>
	);
}

/** Bottom tab bar for focused or mobile layouts; place it after the main content. */
export function BottomNav({
	label,
	items,
	renderLink = defaultLink,
	className,
}: {
	label: string;
	items: readonly NavItem[];
	renderLink?: LinkRenderer;
	className?: string;
}) {
	return (
		<nav
			aria-label={label}
			className={cn(
				"sticky bottom-0 z-10 min-w-0 border-t-(length:--border-width) border-border bg-surface-raised pb-[env(safe-area-inset-bottom)]",
				className,
			)}
		>
			<ul
				className="grid min-w-0"
				style={{
					gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
				}}
			>
				{items.map((item) => (
					<li key={item.href} className="min-w-0">
						{renderLink(item, {
							className:
								"flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1 text-center text-ds-xs text-muted wrap-anywhere aria-[current=page]:font-medium aria-[current=page]:text-foreground",
							...(item.current ? { "aria-current": "page" as const } : {}),
						})}
					</li>
				))}
			</ul>
		</nav>
	);
}
