export type Point = Readonly<{ x: number; y: number }>;
export type RouteResult = { order: number[]; distance: number };

function distance(a: Point, b: Point): number {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function measure(points: readonly Point[], order: number[]): RouteResult {
	let total = 0;
	for (let index = 1; index < order.length; index++) {
		total += distance(points[order[index - 1]], points[order[index]]);
	}
	return { order, distance: total };
}

export function inputOrder(points: readonly Point[]): RouteResult {
	return measure(
		points,
		points.map((_, index) => index),
	);
}

function nearestNeighbor(points: readonly Point[]): number[] {
	const unvisited = new Set(points.map((_, index) => index));
	unvisited.delete(0);
	const order = [0];
	while (unvisited.size) {
		const current = points[order[order.length - 1]];
		let next = -1;
		let shortest = Infinity;
		for (const index of unvisited) {
			const length = distance(current, points[index]);
			if (length < shortest) {
				next = index;
				shortest = length;
			}
		}
		order.push(next);
		unvisited.delete(next);
	}
	return order;
}

function twoOpt(points: readonly Point[], order: number[]): RouteResult {
	// Bound the synchronous work. Each pass considers every reversal with
	// the first point fixed, including reversals that change the open end.
	for (let pass = 0; pass < 10; pass++) {
		let bestGain = 0;
		let bestStart = 0;
		let bestEnd = 0;
		for (let start = 1; start < order.length - 1; start++) {
			const previous = points[order[start - 1]];
			const first = points[order[start]];
			for (let end = start + 1; end < order.length; end++) {
				const last = points[order[end]];
				const next = points[order[end + 1]];
				const gain =
					distance(previous, first) -
					distance(previous, last) +
					(next ? distance(last, next) - distance(first, next) : 0);
				if (gain > bestGain) {
					bestGain = gain;
					bestStart = start;
					bestEnd = end;
				}
			}
		}
		if (bestGain === 0) break;
		order.splice(
			bestStart,
			bestEnd - bestStart + 1,
			...order.slice(bestStart, bestEnd + 1).reverse(),
		);
	}
	return measure(points, order);
}

/** Open route with a fixed start. Coordinates must be finite and within the input bounds. */
export function optimizeRoute(points: readonly Point[]): RouteResult {
	const baseline = inputOrder(points);
	if (points.length < 3) return baseline;
	const improved = twoOpt(points, nearestNeighbor(points));
	return improved.distance < baseline.distance ? improved : baseline;
}
