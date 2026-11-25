export const WIDTH = 160;
export const HEIGHT = 120;
export const HECTARES_PER_CELL = 0.25;
export const SEED = 428591;
export const STEPS_PER_SECOND = 12;

export const terrain = [
	{ name: "Vereda", fuel: 0.06, duration: 1 },
	{ name: "Cerrado arbustivo", fuel: 0.45, duration: 4 },
	{ name: "Campo seco", fuel: 0.9, duration: 5 },
	{ name: "Rocha ou estrada", fuel: 0, duration: 0 },
] as const;
export const WATER = 0,
	SCRUB = 1,
	GRASS = 2,
	BARE = 3;

export type Weather = { angle: number; speed: number; humidity: number };
export const DEFAULT_WEATHER = { angle: 45, speed: 15, humidity: 30 };

export function classifyColor(red: number, green: number, blue: number) {
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const range = max - min;
	const lightness = (max + min) / 510;
	const saturation =
		range === 0 ? 0 : range / (255 * (1 - Math.abs(2 * lightness - 1)));
	let hue = 0;
	if (range && max === red) hue = (60 * (green - blue)) / range;
	else if (range && max === green) hue = 60 * (2 + (blue - red) / range);
	else if (range) hue = 60 * (4 + (red - green) / range);
	if (hue < 0) hue += 360;
	if (hue >= 77 && hue <= 225 && lightness < 0.57) return WATER;
	if (saturation < 0.24 || (lightness > 0.7 && saturation < 0.53)) return BARE;
	if (hue > 43 || lightness < 0.39 || saturation < 0.42) return SCRUB;
	return GRASS;
}

export function classifyGrid(
	pixels: Uint8ClampedArray,
	width: number,
	height: number,
) {
	const raw = new Uint8Array(width * height);
	const result = new Uint8Array(raw.length);
	for (let index = 0; index < raw.length; index++) {
		const offset = index * 4;
		raw[index] = classifyColor(
			pixels[offset],
			pixels[offset + 1],
			pixels[offset + 2],
		);
	}
	const counts = new Uint8Array(terrain.length);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			counts.fill(0);
			const index = y * width + x;
			let mode = raw[index];
			for (
				let row = Math.max(0, y - 1);
				row <= Math.min(height - 1, y + 1);
				row++
			) {
				for (
					let col = Math.max(0, x - 1);
					col <= Math.min(width - 1, x + 1);
					col++
				) {
					counts[raw[row * width + col]]++;
				}
			}
			for (let kind = 0; kind < counts.length; kind++) {
				if (counts[kind] > counts[mode]) mode = kind;
			}
			result[index] = mode;
		}
	}
	return result;
}

const directions = [
	[0, -1],
	[1, -1],
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1],
] as const;

export function ignitionChance(
	fuel: number,
	weather: Weather,
	offset = 0,
	diagonal = false,
) {
	return Math.min(
		0.97,
		fuel *
			(1 - weather.humidity * 0.011) *
			(0.65 + Math.cos(offset) * weather.speed * 0.013) *
			(diagonal ? 0.56 : 1),
	);
}

function random(seed: number, step: number, cell: number, direction: number) {
	// Key each draw to the same event in both scenarios.
	let hash =
		seed ^
		Math.imul(step + 1, 0x9e3779b9) ^
		Math.imul(cell * 8 + direction, 0x85ebca6b);
	hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
	hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);
	return ((hash ^ (hash >>> 15)) >>> 0) / 4294967296;
}

export type Fire = {
	width: number;
	height: number;
	classes: Uint8Array;
	breaks: ReadonlySet<number>;
	seed: number;
	cells: Uint8Array;
	active: number[];
	step: number;
	total: number;
};

export const SCAR = 255;

export function createFire(
	classes: Uint8Array,
	width: number,
	height: number,
	breaks: ReadonlySet<number>,
	foci: Iterable<number>,
	seed = SEED,
): Fire {
	const cells = new Uint8Array(classes.length);
	const active: number[] = [];
	for (const cell of foci) {
		const kind = terrain[classes[cell]];
		if (!kind?.fuel || breaks.has(cell) || cells[cell]) continue;
		cells[cell] = kind.duration;
		active.push(cell);
	}
	return {
		width,
		height,
		classes,
		breaks,
		seed,
		cells,
		active,
		step: 0,
		total: active.length,
	};
}

export function advanceFire(fire: Fire, weather: Weather) {
	if (!fire.active.length) return;
	const { width, height, cells, classes, breaks, seed, step } = fire;
	const next: number[] = [];
	const chances = directions.map((_, index) =>
		terrain.map(({ fuel }) =>
			ignitionChance(
				fuel,
				weather,
				((index * 45 - weather.angle) * Math.PI) / 180,
				index % 2 === 1,
			),
		),
	);
	for (const cell of fire.active) {
		const x = cell % width;
		const y = Math.floor(cell / width);
		for (let direction = 0; direction < directions.length; direction++) {
			const [dx, dy] = directions[direction];
			const nx = x + dx,
				ny = y + dy;
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
			const neighbor = ny * width + nx;
			if (cells[neighbor] || breaks.has(neighbor)) continue;
			if (
				random(seed, step, cell, direction) >=
				chances[direction][classes[neighbor]]
			)
				continue;
			cells[neighbor] = terrain[classes[neighbor]].duration;
			fire.total++;
			next.push(neighbor);
		}
		cells[cell] = cells[cell] === 1 ? SCAR : cells[cell] - 1;
		if (cells[cell] !== SCAR) next.push(cell);
	}
	fire.active = next;
	fire.step++;
}

export function finishFire(
	fire: Fire,
	weather: Weather,
	history: readonly Weather[] = [],
) {
	while (fire.active.length) advanceFire(fire, history[fire.step] ?? weather);
	return fire;
}

export function traceCells(from: number, to: number) {
	const ax = from % WIDTH,
		ay = Math.floor(from / WIDTH);
	const dx = (to % WIDTH) - ax,
		dy = Math.floor(to / WIDTH) - ay;
	const steps = Math.max(Math.abs(dx), Math.abs(dy));
	return Array.from({ length: steps + 1 }, (_, step) => {
		const part = steps ? step / steps : 0;
		return Math.round(ay + dy * part) * WIDTH + Math.round(ax + dx * part);
	});
}
