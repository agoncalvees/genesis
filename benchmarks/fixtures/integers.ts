/**
 * SYNTHETIC fixture — SEEDED, DETERMINISTIC, NOT REAL DATA.
 *
 * Integers produced by mulberry32 (a small public-domain PRNG) from a fixed
 * seed. Used only to compare two deterministic implementations; no value here
 * comes from a real dataset, user, service or measurement.
 */

export const FIXTURE_NAME = "synthetic-seeded-integers";
export const FIXTURE_SOURCE =
	"fixture sintética — rotulada (PRNG mulberry32 determinístico, sem dados reais)";
export const FIXTURE_VERSION = "1.0.0";
export const DEFAULT_SEED = 20261124;

/** Public-domain mulberry32: returns a deterministic float in [0, 1). */
export function mulberry32(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function requirePositiveInteger(value: number, field: string): void {
	if (!Number.isInteger(value) || value < 1) {
		throw new RangeError(`${field} must be a positive integer`);
	}
}

/** Deterministic integers in [0, 1_000_000) from the given seed. */
export function seededIntegers(length: number, seed = DEFAULT_SEED): number[] {
	requirePositiveInteger(length, "length");
	if (!Number.isInteger(seed)) throw new RangeError("seed must be an integer");
	const next = mulberry32(seed);
	return Array.from({ length }, () => Math.floor(next() * 1_000_000));
}

/** A deterministic batch of arrays used as neutral benchmark input. */
export function makeFixture(options: {
	count: number;
	length: number;
	seed?: number;
}): number[][] {
	requirePositiveInteger(options.count, "count");
	const seed = options.seed ?? DEFAULT_SEED;
	return Array.from({ length: options.count }, (_, index) =>
		seededIntegers(options.length, seed + index),
	);
}
