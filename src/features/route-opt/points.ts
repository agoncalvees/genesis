import type { Point } from "./optimizer";

export const FIXTURE_SEED = 20261124;
export const FIXTURE_SIZE = 18;
const MAX_POINTS = 80;
const COORDINATE_LIMIT = 1000;

export function syntheticPoints(): Point[] {
	let state = FIXTURE_SEED;
	const nextCoordinate = () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return Math.floor((state / 2 ** 32) * 100);
	};
	return Array.from({ length: FIXTURE_SIZE }, () => ({
		x: nextCoordinate(),
		y: nextCoordinate(),
	}));
}

export function formatPoints(points: readonly Point[]): string {
	return points.map(({ x, y }) => `${x}, ${y}`).join("\n");
}

export function parsePoints(
	source: string,
): { points: Point[] } | { error: string } {
	const rows = source.trim().split(/\r?\n/);
	if (rows.length < 2 || rows.length > MAX_POINTS) {
		return { error: "Enter 2–80 points." };
	}
	const points: Point[] = [];
	for (const [index, row] of rows.entries()) {
		const fields = row.split(",").map((field) => field.trim());
		const [x, y] = fields.map(Number);
		if (
			fields.length !== 2 ||
			fields.some((field) => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(field)) ||
			Math.abs(x) > COORDINATE_LIMIT ||
			Math.abs(y) > COORDINATE_LIMIT
		) {
			return {
				error: `Line ${index + 1} needs two numbers between −1000 and 1000, separated by a comma.`,
			};
		}
		points.push({ x, y });
	}
	return { points };
}
