import { describe, expect, test } from "vitest";
import {
	inputOrder,
	optimizeRoute,
} from "../../src/features/route-opt/optimizer";
import {
	formatPoints,
	parsePoints,
	syntheticPoints,
} from "../../src/features/route-opt/points";

describe("open route optimization", () => {
	test("baseline follows input order without returning to the start", () => {
		expect(
			inputOrder([
				{ x: 0, y: 0 },
				{ x: 3, y: 4 },
				{ x: 6, y: 8 },
			]),
		).toEqual({ order: [0, 1, 2], distance: 10 });
	});

	test("2-opt improves a nearest-neighbor route and may change its endpoint", () => {
		const points = Object.freeze(
			[
				{ x: 2, y: 3 },
				{ x: 3, y: 1 },
				{ x: 2, y: 1 },
				{ x: 2, y: 2 },
				{ x: 1, y: 0 },
				{ x: 1, y: 2 },
			].map((point) => Object.freeze(point)),
		);
		const result = optimizeRoute(points);
		expect(result.order).toEqual([0, 3, 5, 4, 2, 1]);
		expect(result.distance).toBeCloseTo(5 + Math.sqrt(2));
	});

	test("keeps input order when the heuristic is longer", () => {
		const points = [
			{ x: 0, y: 1 },
			{ x: 0, y: 2 },
			{ x: 1, y: 3 },
			{ x: 2, y: 3 },
			{ x: 1, y: 2 },
			{ x: 1, y: 1 },
		];
		expect(optimizeRoute(points)).toEqual(inputOrder(points));
	});

	test("preserves duplicates and handles zero or one point", () => {
		expect(optimizeRoute([])).toEqual({ order: [], distance: 0 });
		const points = Array.from({ length: 3 }, () => ({ x: 3, y: 4 }));
		expect(optimizeRoute(points.slice(0, 1))).toEqual({
			order: [0],
			distance: 0,
		});
		expect(optimizeRoute(points)).toEqual({ order: [0, 1, 2], distance: 0 });
	});

	test("repeats the fixture and produces a strictly shorter permutation", () => {
		const points = syntheticPoints();
		const result = optimizeRoute(points);
		expect(points).toHaveLength(18);
		expect(syntheticPoints()).toEqual(points);
		expect(optimizeRoute(syntheticPoints())).toEqual(result);
		expect(result.order[0]).toBe(0);
		expect([...result.order].sort((a, b) => a - b)).toEqual(
			inputOrder(points).order,
		);
		expect(result.distance).toBeLessThan(inputOrder(points).distance);
		expect(
			inputOrder(result.order.map((index) => points[index])).distance,
		).toBe(result.distance);
	});

	test("round-trips the fixture and validates numeric bounds and row counts", () => {
		const points = syntheticPoints();
		expect(parsePoints(formatPoints(points))).toEqual({ points });
		expect(parsePoints("-1.5, .5\r\n1, 2")).toEqual({
			points: [
				{ x: -1.5, y: 0.5 },
				{ x: 1, y: 2 },
			],
		});
		for (const source of [
			"",
			"0, 0",
			"0, 0\n,2",
			"0, 0\nInfinity, 1",
			"0, 0\n1001, 1",
			"0, 0\n1, 2, 3",
			"1, 2\n".repeat(81),
		]) {
			expect(parsePoints(source)).toHaveProperty("error");
		}
	});
});
