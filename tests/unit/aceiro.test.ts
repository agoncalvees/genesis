import { describe, expect, it } from "vitest";
import {
	BARE,
	classifyColor,
	classifyGrid,
	createFire,
	DEFAULT_WEATHER,
	finishFire,
	GRASS,
	SCRUB,
	WATER,
} from "../../src/features/aceiro/model";

describe("combustível do terreno", () => {
	it("distingue vereda, cerrado, campo e rocha", () => {
		expect(classifyColor(46, 79, 72)).toBe(WATER);
		expect(classifyColor(114, 107, 56)).toBe(SCRUB);
		expect(classifyColor(201, 143, 58)).toBe(GRASS);
		expect(classifyColor(158, 150, 142)).toBe(BARE);
		expect(classifyColor(225, 201, 160)).toBe(BARE);
	});

	it("suaviza uma célula isolada pela moda local", () => {
		const pixels = new Uint8ClampedArray(36);
		for (let pixel = 0; pixel < 9; pixel++) {
			pixels.set(
				pixel === 4 ? [46, 79, 72, 255] : [201, 143, 58, 255],
				pixel * 4,
			);
		}
		expect([...classifyGrid(pixels, 3, 3)]).toEqual(Array(9).fill(GRASS));
	});
});

describe("autômato de fogo", () => {
	const classes = new Uint8Array(225).fill(GRASS);

	it("reproduz a mesma cicatriz com a mesma semente", () => {
		const run = (seed: number) =>
			finishFire(createFire(classes, 15, 15, new Set(), [151], seed), {
				...DEFAULT_WEATHER,
				humidity: 65,
			});
		expect(run(1024).cells).toEqual(run(1024).cells);
		expect(run(1024).cells).not.toEqual(run(2024).cells);
	});

	it("impede a passagem do fogo por uma faixa contínua de aceiro", () => {
		const breaks = new Set(
			Array.from({ length: 15 }, (_, row) => row * 15 + 7),
		);
		const actual = finishFire(
			createFire(classes, 15, 15, breaks, [106]),
			DEFAULT_WEATHER,
		);
		const baseline = finishFire(
			createFire(classes, 15, 15, new Set(), [106]),
			DEFAULT_WEATHER,
		);
		expect(baseline.total).toBeGreaterThan(actual.total);
		expect(actual.total).toBeGreaterThan(1);
		expect(actual.cells[113]).toBe(0);
		expect(
			actual.cells.every((state, cell) => cell % 15 < 7 || state === 0),
		).toBe(true);
	});
});
