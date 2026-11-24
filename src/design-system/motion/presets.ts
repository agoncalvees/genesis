export const durations = {
	instant: "--duration-instant",
	fast: "--duration-fast",
	normal: "--duration-normal",
	slow: "--duration-slow",
	showcase: "--duration-showcase",
} as const;

export const easings = {
	standard: "--ease-standard",
	enter: "--ease-enter",
	exit: "--ease-exit",
} as const;

export type MotionDuration = keyof typeof durations;

export function readMotionTiming(
	element: Element,
	duration: MotionDuration,
	easing: keyof typeof easings = "standard",
) {
	const styles = getComputedStyle(element);
	const time = styles.getPropertyValue(durations[duration]).trim();
	const curve = styles.getPropertyValue(easings[easing]);
	const points = curve
		.match(/cubic-bezier\(([^)]+)\)/)?.[1]
		?.split(",")
		.map(Number);
	const ease =
		points?.length === 4 && points.every(Number.isFinite)
			? ([points[0], points[1], points[2], points[3]] as [
					number,
					number,
					number,
					number,
				])
			: ("linear" as const);

	return {
		duration: (Number.parseFloat(time) || 0) / (time.endsWith("ms") ? 1000 : 1),
		ease,
	};
}
