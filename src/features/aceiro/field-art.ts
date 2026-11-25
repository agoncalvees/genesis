import { type Fire, HEIGHT, SCAR, type Weather, WIDTH } from "./model";

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

export function drawScar(
	context: CanvasRenderingContext2D,
	fire: Fire | undefined,
	ink: Ink,
) {
	context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
	if (!fire?.total) return;
	context.fillStyle = ink.ash;
	for (let row = 0; row < HEIGHT; row++) {
		const start = row * WIDTH;
		const end = start + WIDTH;
		let cell = start;
		while (cell < end) {
			if (fire.cells[cell] !== SCAR) {
				cell++;
				continue;
			}
			const first = cell++;
			while (cell < end && fire.cells[cell] === SCAR) cell++;
			context.fillRect(
				(first - start) * SCALE,
				row * SCALE,
				(cell - first) * SCALE,
				SCALE,
			);
		}
	}
	context.globalCompositeOperation = "source-atop";
	context.strokeStyle = ink.hatch;
	context.beginPath();
	for (let x = 0; x < FIELD_WIDTH + FIELD_HEIGHT; x += 5) {
		context.moveTo(x, 0);
		context.lineTo(x - FIELD_HEIGHT, FIELD_HEIGHT);
	}
	context.stroke();
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

export function drawMarks(
	context: CanvasRenderingContext2D,
	breaks: ReadonlySet<number>,
	foci: readonly number[],
	fire: Fire | undefined,
	time: number,
	ink: Ink,
) {
	context.fillStyle = ink.chalk;
	for (const cell of breaks) {
		const x = (cell % WIDTH) * SCALE,
			y = Math.floor(cell / WIDTH) * SCALE;
		context.globalAlpha = 0.74 + (cell % 7) / 29;
		context.fillRect(x + (cell % 2) * 0.7, y + (cell % 3) * 0.3, SCALE, SCALE);
	}
	context.globalAlpha = 1;
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
	if (!fire?.active.length) return;

	context.globalCompositeOperation = "lighter";
	for (const cell of fire.active) {
		const x = (cell % WIDTH) * SCALE,
			y = Math.floor(cell / WIDTH) * SCALE;
		const flicker = 0.5 + Math.sin(time * 0.023 + cell * 7.73) * 0.35;
		context.globalAlpha = 0.24;
		context.fillStyle = ink.ember;
		context.fillRect(x - 3, y - 3, 10, 10);
		context.globalAlpha = flicker;
		context.fillRect(x - 1, y - 1, 6, 6);
		context.fillStyle = ink.hot;
		context.fillRect(x + 1, y + 1, 2, 2 + flicker * 3);
		if (cell % 9 === 0)
			context.fillRect(x + flicker * 5, y - flicker * 10, 1.5, 2);
	}
	context.globalAlpha = 1;
	context.globalCompositeOperation = "source-over";
}
