import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { type ReactElement, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/button";

const fade =
	"transition-opacity duration-(--duration-fast) ease-standard data-starting-style:opacity-0 data-ending-style:opacity-0";
const floatingSurface =
	"rounded-lg border border-border bg-surface-raised text-foreground shadow-lg";

type OverlayProps = {
	trigger: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
};

export function Dialog({
	trigger,
	title,
	description,
	children,
	closeLabel,
	...props
}: OverlayProps &
	Omit<BaseDialog.Root.Props, "children"> & { closeLabel: string }) {
	return (
		<BaseDialog.Root {...props}>
			<BaseDialog.Trigger render={trigger} />
			<BaseDialog.Portal>
				<BaseDialog.Backdrop
					className={cn("fixed inset-0 z-40 bg-foreground/45", fade)}
				/>
				<BaseDialog.Viewport className="fixed inset-0 z-40 grid place-items-center overflow-auto overscroll-contain p-4">
					<BaseDialog.Popup
						className={cn(
							floatingSurface,
							fade,
							"grid w-full max-w-md gap-4 p-5",
						)}
					>
						<div className="grid gap-1">
							<BaseDialog.Title className="font-display text-lg font-semibold">
								{title}
							</BaseDialog.Title>
							{description && (
								<BaseDialog.Description className="text-sm text-muted">
									{description}
								</BaseDialog.Description>
							)}
						</div>
						{children}
						<BaseDialog.Close
							render={
								<Button variant="secondary" className="justify-self-end" />
							}
						>
							{closeLabel}
						</BaseDialog.Close>
					</BaseDialog.Popup>
				</BaseDialog.Viewport>
			</BaseDialog.Portal>
		</BaseDialog.Root>
	);
}

export function Popover({
	trigger,
	title,
	description,
	children,
	...props
}: OverlayProps & Omit<BasePopover.Root.Props, "children">) {
	return (
		<BasePopover.Root {...props}>
			<BasePopover.Trigger render={trigger} />
			<BasePopover.Portal>
				<BasePopover.Positioner sideOffset={8} className="z-50">
					<BasePopover.Popup
						className={cn(
							floatingSurface,
							fade,
							"grid w-max max-w-[min(20rem,var(--available-width))] gap-2 p-4",
						)}
					>
						<BasePopover.Title className="font-display text-sm font-semibold">
							{title}
						</BasePopover.Title>
						{description && (
							<BasePopover.Description className="text-sm text-muted">
								{description}
							</BasePopover.Description>
						)}
						{children}
					</BasePopover.Popup>
				</BasePopover.Positioner>
			</BasePopover.Portal>
		</BasePopover.Root>
	);
}

export const TooltipProvider = BaseTooltip.Provider;

export function Tooltip({
	trigger,
	children,
	...props
}: Omit<BaseTooltip.Root.Props, "children"> & {
	trigger: ReactElement<{ "aria-describedby"?: string }>;
	children: ReactNode;
}) {
	const id = useId();
	const description = [trigger.props["aria-describedby"], id]
		.filter(Boolean)
		.join(" ");

	return (
		<BaseTooltip.Root {...props}>
			<BaseTooltip.Trigger render={trigger} aria-describedby={description} />
			<BaseTooltip.Portal keepMounted>
				<BaseTooltip.Positioner sideOffset={8} className="z-50">
					<BaseTooltip.Popup
						id={id}
						role="tooltip"
						className={cn(
							fade,
							"max-w-[min(16rem,var(--available-width))] rounded-md bg-primary px-2.5 py-1.5 text-xs leading-relaxed text-on-primary shadow-md",
						)}
					>
						{children}
					</BaseTooltip.Popup>
				</BaseTooltip.Positioner>
			</BaseTooltip.Portal>
		</BaseTooltip.Root>
	);
}
