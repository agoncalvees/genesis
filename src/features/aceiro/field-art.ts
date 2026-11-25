import type { ChalkStroke } from "./chalk";
import { type Fire, HEIGHT, SCAR, terrain, type Weather, WIDTH } from "./model";

export type Ink = {
	ash: string;
	hatch: string;
	chalk: string;
	ember: string;
	hot: string;
};

const SCALE = 4;
export const FIELD_WIDTH = WIDTH * SCALE;
export const FIELD_HEIGHT = HEIGHT * SCALE;
const sparks = Array.from({ length: 74 }, (_, index) => ({
	x: (Math.sin(index * 11.31) * 293.61) % 1,
	y: (Math.cos(index * 23.79) * 423.47) % 1,
	phase: (index % 7) / 7,
}));

export function readInk(): Ink {
	const style = getComputedStyle(document.documentElement);
	return {
		ash: style.getPropertyValue("--ash"),
		hatch: style.getPropertyValue("--hatch"),
		chalk: style.getPropertyValue("--chalk"),
		ember: style.getPropertyValue("--ember"),
		hot: style.getPropertyValue("--ember-hot"),
	};
}

const gridLayers = new WeakMap<
	CanvasRenderingContext2D,
	CanvasRenderingContext2D
>();
const scarMasks = new WeakMap<CanvasRenderingContext2D, ImageData>();

function gridLayer(context: CanvasRenderingContext2D) {
	const existing = gridLayers.get(context);
	if (existing) return existing;
	const canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	const grid = canvas.getContext("2d");
	if (!grid) return null;
	gridLayers.set(context, grid);
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	return grid;
}

function grain(seed: number) {
	const hash = Math.imul(seed ^ (seed >>> 7), 0x45d9f3b);
	return ((hash ^ (hash >>> 13)) & 255) / 255;
}

function enlarge(
	context: CanvasRenderingContext2D,
	grid: CanvasRenderingContext2D,
) {
	context.drawImage(grid.canvas, 0, 0, FIELD_WIDTH, FIELD_HEIGHT);
}

function appendContourSquare(
	contour: Path2D,
	cells: Uint8Array,
	x: number,
	y: number,
) {
	const i = y * WIDTH + x;
	const nw = cells[i] === SCAR;
	const ne = cells[i + 1] === SCAR;
	const se = cells[i + 1 + WIDTH] === SCAR;
	const sw = cells[i + WIDTH] === SCAR;
	if (nw === ne && ne === se && se === sw) return;

	const edge: [number, number][] = [];
	const left = (x + 0.5) * SCALE;
	const top = (y + 0.5) * SCALE;
	const cross = (key: number) => (0.5 + (grain(key) - 0.5) * 0.32) * SCALE;
	if (nw !== ne) edge.push([left + cross(i * 2), top]);
	if (ne !== se) edge.push([left + SCALE, top + cross((i + 1) * 2 + 1)]);
	if (se !== sw) edge.push([left + cross((i + WIDTH) * 2), top + SCALE]);
	if (sw !== nw) edge.push([left, top + cross(i * 2 + 1)]);
	const offset = edge.length === 4 && nw ? 1 : 0;
	for (let corner = 0; corner < edge.length; corner += 2) {
		contour.moveTo(...edge[corner + offset]);
		contour.lineTo(...edge[(corner + offset + 1) % edge.length]);
	}
}

function stoppedContour(cells: Uint8Array) {
	const contour = new Path2D();
	for (let y = 0; y < HEIGHT - 1; y++) {
		for (let x = 0; x < WIDTH - 1; x++) {
			appendContourSquare(contour, cells, x, y);
		}
	}
	return contour;
}

function activeContour(fire: Fire) {
	const contour = new Path2D();
	const candidates = new Set<number>();
	for (const cell of fire.active) {
		const x = cell % WIDTH;
		const y = Math.floor(cell / WIDTH);
		for (let row = Math.max(0, y - 1); row <= Math.min(HEIGHT - 2, y); row++) {
			for (
				let column = Math.max(0, x - 1);
				column <= Math.min(WIDTH - 2, x);
				column++
			) {
				candidates.add(row * WIDTH + column);
			}
		}
	}
	for (const cell of candidates) {
		appendContourSquare(
			contour,
			fire.cells,
			cell % WIDTH,
			Math.floor(cell / WIDTH),
		);
	}
	return contour;
}

export function drawScar(
	context: CanvasRenderingContext2D,
	fire: Fire | undefined,
	ink: Ink,
) {
	context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
	if (!fire?.total) return;
	const grid = gridLayer(context);
	if (!grid) return;
	let mask = scarMasks.get(grid);
	if (!mask) {
		mask = grid.createImageData(WIDTH, HEIGHT);
		scarMasks.set(grid, mask);
	}
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			const cell = y * WIDTH + x;
			const alpha = cell * 4 + 3;
			if (fire.cells[cell] !== SCAR) {
				mask.data[alpha] = 0;
				continue;
			}
			const edge =
				(x > 0 && fire.cells[cell - 1] !== SCAR) ||
				(x + 1 < WIDTH && fire.cells[cell + 1] !== SCAR) ||
				(y > 0 && fire.cells[cell - WIDTH] !== SCAR) ||
				(y + 1 < HEIGHT && fire.cells[cell + WIDTH] !== SCAR);
			mask.data[alpha] = edge ? 150 + grain(cell) * 105 : 255;
		}
	}
	grid.putImageData(mask, 0, 0);
	grid.globalCompositeOperation = "source-in";
	grid.fillStyle = ink.ash;
	grid.fillRect(0, 0, WIDTH, HEIGHT);
	grid.globalCompositeOperation = "source-over";
	enlarge(context, grid);
	context.globalCompositeOperation = "source-atop";
	context.strokeStyle = ink.hatch;
	context.lineWidth = 0.8;
	context.beginPath();
	for (let x = 0; x < FIELD_WIDTH + FIELD_HEIGHT; x += 5) {
		context.moveTo(x, 0);
		context.lineTo(x - FIELD_HEIGHT, FIELD_HEIGHT);
	}
	context.stroke();
	context.globalCompositeOperation = "source-over";
	if (!fire.active.length) {
		context.strokeStyle = ink.hot;
		context.lineWidth = 0.86;
		context.lineCap = "round";
		context.globalAlpha = 0.37;
		context.stroke(stoppedContour(fire.cells));
		context.globalAlpha = 1;
	}
}

const fireContours = new WeakMap<Fire, { step: number; path: Path2D }>();

export function drawFire(
	context: CanvasRenderingContext2D,
	glow: CanvasRenderingContext2D,
	fire: Fire | undefined,
	time: number,
	ink: Ink,
) {
	context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
	if (!fire?.active.length) {
		glow.clearRect(0, 0, WIDTH, HEIGHT);
		return;
	}
	const grid = gridLayer(context);
	if (!grid) return;
	grid.clearRect(0, 0, WIDTH, HEIGHT);
	const wave = time * 0.019;
	grid.fillStyle = ink.ember;
	for (const cell of fire.active) {
		const flicker = 0.5 + Math.sin(wave + cell * 7.73) * 0.5;
		const age = fire.cells[cell] / terrain[fire.classes[cell]].duration;
		grid.globalAlpha = (0.23 + flicker * 0.5) * (0.32 + age * 0.68);
		grid.fillRect(cell % WIDTH, Math.floor(cell / WIDTH), 1, 1);
	}
	grid.fillStyle = ink.hot;
	for (const cell of fire.active) {
		if (fire.cells[cell] < 2) continue;
		const gleam = 0.5 + Math.cos(wave * 1.7 + cell * 4.37) * 0.5;
		grid.globalAlpha = gleam * 0.54 * grain(cell);
		grid.fillRect(cell % WIDTH, Math.floor(cell / WIDTH), 1, 1);
	}
	grid.globalAlpha = 1;

	enlarge(context, grid);

	let contour = fireContours.get(fire);
	if (contour?.step !== fire.step || time === 0) {
		contour = { step: fire.step, path: activeContour(fire) };
		fireContours.set(fire, contour);
		glow.clearRect(0, 0, WIDTH, HEIGHT);
		glow.drawImage(grid.canvas, 0, 0);
	}
	context.globalCompositeOperation = "lighter";
	context.lineCap = "round";
	context.strokeStyle = ink.ember;
	context.lineWidth = 2.25;
	context.globalAlpha = 0.58;
	context.stroke(contour.path);
	context.strokeStyle = ink.hot;
	context.lineWidth = 0.7;
	context.globalAlpha = 0.46 + Math.sin(wave) * 0.11;
	context.stroke(contour.path);

	// Fine, warmer threads lift off the soft front in the shape of paint strokes.
	context.strokeStyle = ink.hot;
	context.lineCap = "round";
	context.lineWidth = 0.7;
	context.globalAlpha = 0.66;
	context.beginPath();
	for (const cell of fire.active) {
		const flicker = 0.5 + Math.sin(wave + cell * 7.73) * 0.5;
		if (grain(cell) < 0.65 || fire.cells[cell] < 2) continue;
		const x = ((cell % WIDTH) + 0.5) * SCALE;
		const y = (Math.floor(cell / WIDTH) + 0.5) * SCALE;
		const lean = (grain(cell + 11) - 0.45) * 6;
		context.moveTo(x, y);
		context.quadraticCurveTo(
			x - lean / 2,
			y - 3,
			x + lean,
			y - 2 - flicker * 6,
		);
	}
	context.stroke();
	context.globalAlpha = 1;
	context.globalCompositeOperation = "source-over";
}

export function drawWind(
	context: CanvasRenderingContext2D,
	time: number,
	weather: Weather,
	reduced: boolean,
	ink: Ink,
) {
	if (weather.speed === 0) return;
	const radians = (weather.angle * Math.PI) / 180;
	const dx = Math.sin(radians),
		dy = -Math.cos(radians);
	const travel = reduced ? 0 : time * weather.speed * 0.0024;
	context.strokeStyle = ink.chalk;
	context.lineWidth = 0.65;
	context.beginPath();
	for (const { x, y, phase } of sparks) {
		if (reduced && phase > 0.29) continue;
		const px =
			(((x * FIELD_WIDTH + dx * travel) % FIELD_WIDTH) + FIELD_WIDTH) %
			FIELD_WIDTH;
		const py =
			(((y * FIELD_HEIGHT + dy * travel) % FIELD_HEIGHT) + FIELD_HEIGHT) %
			FIELD_HEIGHT;
		const tail = reduced ? 11 : 5 + phase * 13;
		context.moveTo(px - dx * tail, py - dy * tail);
		context.lineTo(px, py);
		if (reduced) {
			context.lineTo(px - dx * 4 - dy * 2, py - dy * 4 + dx * 2);
			context.moveTo(px, py);
			context.lineTo(px - dx * 4 + dy * 2, py - dy * 4 - dx * 2);
		}
	}
	context.globalAlpha = reduced ? 0.49 : 0.44;
	context.stroke();
	context.globalAlpha = 1;
}

export function drawChalk(
	context: CanvasRenderingContext2D,
	strokes: readonly ChalkStroke[],
	ink: Ink,
) {
	context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
	const trace = new Path2D();
	const core = new Path2D();
	const dust = new Path2D();
	for (const stroke of strokes) {
		const points = stroke.map((point, index) => ({
			x: point.x * SCALE + (grain(point.cell + index) - 0.5) * 0.8,
			y: point.y * SCALE + (grain(point.cell + index + WIDTH) - 0.5) * 0.8,
		}));
		const first = points[0];
		const last = points.at(-1);
		if (!first || !last) continue;
		trace.moveTo(first.x, first.y);
		core.moveTo(first.x, first.y);
		for (let index = 1; index < points.length - 1; index++) {
			const point = points[index];
			const next = points[index + 1];
			const x = (point.x + next.x) / 2;
			const y = (point.y + next.y) / 2;
			trace.quadraticCurveTo(point.x, point.y, x, y);
			core.quadraticCurveTo(point.x + 0.4, point.y - 0.3, x, y);
		}
		trace.lineTo(last.x + 0.03, last.y);
		core.lineTo(last.x + 0.03, last.y);
		for (let index = 1; index < points.length; index++) {
			const previous = points[index - 1];
			const current = points[index];
			const count = Math.ceil(
				Math.hypot(current.x - previous.x, current.y - previous.y),
			);
			for (let particle = 1; particle < count; particle++) {
				const seed = stroke[index].cell * 7 + particle;
				const scatter = grain(seed);
				const x =
					previous.x +
					((current.x - previous.x) * particle) / count +
					(grain(seed + 61) - 0.5) * 5;
				const y =
					previous.y +
					((current.y - previous.y) * particle) / count +
					(grain(seed + 89) - 0.5) * 5;
				dust.rect(x, y, 0.35 + scatter * 0.7, 0.45 + scatter * 0.6);
			}
		}
	}
	context.strokeStyle = ink.chalk;
	context.fillStyle = ink.chalk;
	context.lineCap = "round";
	context.lineJoin = "round";
	context.globalAlpha = 0.43;
	context.lineWidth = 3.9;
	context.stroke(trace);
	context.globalAlpha = 0.52;
	context.lineWidth = 1.6;
	context.stroke(core);
	context.globalAlpha = 0.38;
	context.fill(dust);
	context.globalAlpha = 1;
}

export function drawFoci(
	context: CanvasRenderingContext2D,
	foci: readonly number[],
	ink: Ink,
) {
	for (const cell of foci) {
		const x = ((cell % WIDTH) + 0.5) * SCALE,
			y = (Math.floor(cell / WIDTH) + 0.5) * SCALE;
		context.strokeStyle = ink.chalk;
		context.lineWidth = 1.2;
		context.beginPath();
		context.arc(x, y, 9, 0, Math.PI * 2);
		context.moveTo(x - 13, y);
		context.lineTo(x + 13, y);
		context.moveTo(x, y - 13);
		context.lineTo(x, y + 13);
		context.stroke();
		context.fillStyle = ink.ember;
		context.fillRect(x - 2, y - 2, 4, 4);
	}
}
