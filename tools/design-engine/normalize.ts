import { z } from "zod";
import type { parseDesign } from "./adapter";

const surfaceStyles = ["border", "elevation", "tint"] as const;
const composition = z.string().regex(/^[a-z][a-z0-9-]*$/);
const weight = z.number().int().min(1).max(1000);
const length = z.string().regex(/^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem))$/);
const tracking = z
	.string()
	.regex(/^(?:0|-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em))$/);
const shadow = z.string().regex(/^(?:none|[\da-zA-Z#(),.% /-]+)$/);
const duration = (maximum: number) => z.number().min(0).max(maximum);
const curve = z.tuple([
	z.number().min(0).max(1),
	z.number(),
	z.number().min(0).max(1),
	z.number(),
]);
const color = z.string();

export const dataKeys = [
	"data-1",
	"data-2",
	"data-3",
	"data-4",
	"data-5",
	"data-6",
] as const;
export const colorKeys = [
	"background",
	"surface",
	"surface-raised",
	"border",
	"control-border",
	"foreground",
	"muted",
	"primary",
	"on-primary",
	"accent",
	"on-accent",
	"focus",
	"success",
	"on-success",
	"warning",
	"on-warning",
	"danger",
	"on-danger",
	"info",
	"on-info",
] as const;

const data = z.object({
	"data-1": color,
	"data-2": color,
	"data-3": color,
	"data-4": color,
	"data-5": color,
	"data-6": color,
	"data-grid": color,
	"data-axis": color,
});

const extension = z.object({
	density: z.number().min(0.75).max(1.25),
	borderWidth: length,
	surfaceStyle: z.enum(surfaceStyles),
	iconWeight: z.enum(["thin", "light", "regular", "bold"]),
	typeScale: z.number().positive(),
	displayWeight: weight,
	displayTracking: tracking,
	metricTypeface: z.enum(["display", "mono"]).optional(),
	composition,
	darkColors: z.record(z.string(), color).optional(),
	data,
	darkData: data.optional(),
	dialogScrim: z.string().regex(/^#[\da-fA-F]{8}$/),
	shadows: z.object({ sm: shadow, md: shadow, lg: shadow }),
	motionProfile: z.object({
		name: z.enum(["still", "calm", "crisp", "lively"]),
		intensity: z.number().min(0).max(1),
		spring: z.object({
			stiffness: z.number().positive(),
			damping: z.number().positive(),
		}),
	}),
});

const motion = z.object({
	durations: z.object({
		instant: duration(400),
		fast: duration(400),
		normal: duration(400),
		slow: duration(400),
		showcase: duration(600),
	}),
	easing: z.object({ standard: curve, enter: curve, exit: curve }),
});

function required<T>(value: T | undefined, path: string): T {
	if (value === undefined || value === "")
		throw new Error(`Missing required token ${path}`);
	return value;
}

function dimension(
	value: { value: number; unit: string } | undefined,
	path: string,
) {
	const { value: number, unit } = required(value, path);
	return length.parse(`${number}${unit}`);
}

export type Tokens = Record<string, string>;

export interface Identity {
	light: Tokens;
	dark?: Tokens;
	families: Record<string, string>;
}

export function normalize(report: ReturnType<typeof parseDesign>): Identity {
	const model = report.designSystem;
	const axes = extension.parse(model.unknownKeyValues?.genesis);
	const timing = motion.parse(model.unknownKeyValues?.motion);
	const families = Object.fromEntries(
		["display", "body", "mono"].map((role) => [
			`typeface-${role}`,
			required(
				model.typography.get(role)?.fontFamily,
				`typography.${role}.fontFamily`,
			),
		]),
	);
	const tokens: Tokens = {
		...families,
		"metric-typeface": `var(--typeface-${axes.metricTypeface ?? "display"})`,
		"display-weight": String(axes.displayWeight),
		"display-tracking": axes.displayTracking,
		"heading-weight": String(
			weight.parse(
				required(
					model.typography.get("headline")?.fontWeight,
					"typography.headline.fontWeight",
				),
			),
		),
		"type-scale": String(axes.typeScale),
		"text-base": dimension(
			model.typography.get("body")?.fontSize,
			"typography.body.fontSize",
		),
		"border-width": axes.borderWidth,
		density: String(axes.density),
		"space-unit": dimension(model.spacing.get("unit"), "spacing.unit"),
		"control-height": dimension(
			model.spacing.get("control"),
			"spacing.control",
		),
		"surface-style": axes.surfaceStyle,
		"icon-weight": axes.iconWeight,
		"dialog-scrim": axes.dialogScrim,
		composition: axes.composition,
		"motion-profile": axes.motionProfile.name,
		"motion-intensity": String(axes.motionProfile.intensity),
		"spring-stiffness": String(axes.motionProfile.spring.stiffness),
		"spring-damping": String(axes.motionProfile.spring.damping),
	};
	for (const role of ["sm", "md", "lg", "control"]) {
		tokens[`radius-${role}`] = dimension(
			model.rounded.get(role),
			`rounded.${role}`,
		);
	}
	for (const [role, value] of Object.entries(axes.shadows))
		tokens[`shadow-${role}`] = value === "none" ? "0 0 #0000" : value;
	for (const [role, value] of Object.entries(timing.durations)) {
		tokens[`duration-${role}`] =
			`${axes.motionProfile.name === "still" ? 0 : value}ms`;
	}
	for (const [role, value] of Object.entries(timing.easing))
		tokens[`ease-${role}`] = `cubic-bezier(${value.join(", ")})`;

	const lightColors = Object.fromEntries(
		colorKeys.map((key) => {
			const value = required(model.colors.get(key), `colors.${key}`);
			if ((value.a ?? 1) !== 1) throw new Error(`colors.${key} must be opaque`);
			return [key, value.hex];
		}),
	);
	if (axes.darkData && !axes.darkColors)
		throw new Error("darkData requires darkColors");
	return {
		light: { ...lightColors, ...axes.data, ...tokens },
		dark: axes.darkColors && {
			...Object.fromEntries(
				colorKeys.map((key) => [
					key,
					required(axes.darkColors?.[key], `genesis.darkColors.${key}`),
				]),
			),
			...(axes.darkData ?? axes.data),
			...tokens,
		},
		families,
	};
}
