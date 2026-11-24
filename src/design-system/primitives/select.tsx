import { Select as BaseSelect } from "@base-ui/react/select";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { controlStyles, useFieldAccessibility } from "./field";

type SelectOption = { value: string; label: ReactNode; disabled?: boolean };

export function Select({
	options,
	placeholder,
	triggerProps,
	...props
}: Omit<BaseSelect.Root.Props<string>, "children" | "items" | "multiple"> & {
	options: readonly SelectOption[];
	placeholder?: ReactNode;
	triggerProps?: Omit<
		ComponentProps<typeof BaseSelect.Trigger>,
		"className" | "children" | "render"
	> & { className?: string };
}) {
	const accessibility = useFieldAccessibility(triggerProps);
	return (
		<BaseSelect.Root {...props} items={options}>
			<BaseSelect.Trigger
				{...triggerProps}
				{...accessibility}
				className={cn(
					controlStyles,
					"flex min-w-0 items-center justify-between gap-2 text-start",
					triggerProps?.className,
				)}
			>
				<BaseSelect.Value
					placeholder={placeholder}
					className="min-w-0 truncate data-placeholder:text-muted"
				/>
				<BaseSelect.Icon className="shrink-0">
					<CaretDownIcon size={16} aria-hidden="true" />
				</BaseSelect.Icon>
			</BaseSelect.Trigger>
			<BaseSelect.Portal>
				<BaseSelect.Positioner
					alignItemWithTrigger={false}
					sideOffset={6}
					className="z-50"
				>
					<BaseSelect.Popup className="w-(--anchor-width) max-w-(--available-width) rounded-md border border-border bg-surface-raised p-1 text-sm shadow-md transition-opacity duration-(--duration-fast) ease-standard data-starting-style:opacity-0 data-ending-style:opacity-0">
						<BaseSelect.List className="max-h-(--available-height) overflow-auto p-0.5">
							{options.map(({ value, label, disabled }) => (
								<BaseSelect.Item
									key={value}
									value={value}
									disabled={disabled}
									className="grid min-h-8 cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-sm px-2 py-1 text-foreground data-highlighted:bg-primary data-highlighted:text-on-primary data-disabled:opacity-60"
								>
									<BaseSelect.ItemIndicator className="col-start-1 row-start-1">
										<CheckIcon size={16} aria-hidden="true" />
									</BaseSelect.ItemIndicator>
									<BaseSelect.ItemText className="col-start-2 row-start-1 wrap-break-word">
										{label}
									</BaseSelect.ItemText>
								</BaseSelect.Item>
							))}
						</BaseSelect.List>
					</BaseSelect.Popup>
				</BaseSelect.Positioner>
			</BaseSelect.Portal>
		</BaseSelect.Root>
	);
}
