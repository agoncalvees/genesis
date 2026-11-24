import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useHydrated } from "../../core/hydration";
import { cn } from "../lib/cn";
import { SpinnerMark } from "./feedback";

const buttonStyles = cva(
	"inline-flex min-w-6 shrink-0 select-none items-center justify-center gap-2 rounded-md border font-body text-sm font-medium transition-[opacity,transform] duration-(--duration-instant) ease-standard active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
	{
		variants: {
			variant: {
				primary:
					"border-transparent bg-primary text-on-primary enabled:hover:opacity-85",
				secondary:
					"border-muted bg-surface-raised text-foreground enabled:hover:bg-surface",
				ghost:
					"border-transparent bg-transparent text-foreground enabled:hover:bg-surface",
				danger:
					"border-transparent bg-danger text-on-danger enabled:hover:opacity-85",
			},
			size: {
				sm: "min-h-8 px-3",
				md: "min-h-(--control-height) px-4",
				lg: "min-h-12 px-5",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	},
);

export type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof buttonStyles> & {
		loading?: boolean;
		requireHydration?: boolean;
	};

export function Button({
	variant,
	size,
	loading = false,
	requireHydration = false,
	disabled,
	type = "button",
	className,
	children,
	"aria-busy": ariaBusy,
	...props
}: ButtonProps) {
	const hydrated = useHydrated();

	return (
		<button
			{...props}
			type={type}
			disabled={disabled || loading || (requireHydration && !hydrated)}
			aria-busy={loading || ariaBusy}
			className={cn(buttonStyles({ variant, size }), className)}
		>
			{loading && <SpinnerMark />}
			{children}
		</button>
	);
}

const iconSizes = {
	sm: "size-8",
	md: "size-(--control-height)",
	lg: "size-12",
};

export function IconButton({
	variant = "ghost",
	size = "md",
	className,
	children,
	loading,
	...props
}: Omit<ButtonProps, "aria-label"> & { "aria-label": string }) {
	return (
		<Button
			{...props}
			variant={variant}
			size={size}
			loading={loading}
			className={cn("px-0", iconSizes[size ?? "md"], className)}
		>
			{!loading && (
				<span
					aria-hidden="true"
					className="inline-flex items-center justify-center"
				>
					{children}
				</span>
			)}
		</Button>
	);
}
