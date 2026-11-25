export type ChalkPoint = { x: number; y: number; cell: number };
export type ChalkStroke = readonly ChalkPoint[];

export function extendChalk(
	strokes: readonly ChalkStroke[],
	cells: readonly number[],
	from: ChalkPoint,
	to: ChalkPoint,
	join: boolean,
): readonly ChalkStroke[] {
	const last = strokes.at(-1);
	const connected = join && last?.at(-1) === from;
	if (from === to) return [...strokes, [from]];
	const points = cells.slice(1, -1).map((cell, index) => {
		const progress = (index + 1) / (cells.length - 1);
		return {
			x: from.x + (to.x - from.x) * progress,
			y: from.y + (to.y - from.y) * progress,
			cell,
		};
	});
	return connected
		? [...strokes.slice(0, -1), [...last, ...points, to]]
		: [...strokes, [from, ...points, to]];
}

export function eraseChalk(
	strokes: readonly ChalkStroke[],
	erased: ReadonlySet<number>,
) {
	const next: ChalkStroke[] = [];
	for (const stroke of strokes) {
		let start = 0;
		for (let index = 0; index < stroke.length; index++) {
			if (!erased.has(stroke[index].cell)) continue;
			if (index > start) next.push(stroke.slice(start, index));
			start = index + 1;
		}
		if (start < stroke.length)
			next.push(start === 0 ? stroke : stroke.slice(start));
	}
	return next;
}
