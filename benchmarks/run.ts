/**
 * Neutral benchmark: two deterministic implementations over the SYNTHETIC
 * seeded fixture. No numbers are hardcoded; every value in the output comes
 * from `performance.now()` during this execution.
 *
 * Run with `bun run bench`. Results go to `benchmarks/results/` (gitignored).
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { toCsv, toJson } from "../src/evidence/export";
import { defineBenchmark, run } from "../src/evidence/runner";
import {
	DEFAULT_SEED,
	FIXTURE_NAME,
	FIXTURE_SOURCE,
	FIXTURE_VERSION,
	makeFixture,
} from "./fixtures/integers";

const ARRAY_COUNT = 128;
const ARRAY_LENGTH = 32;
const REPETITIONS = 15;
const WARMUP = 3;
const BASELINE_IMPLEMENTATION = "builtin-sort";

/** Reference implementation: platform sort on a copy (does not mutate input). */
function builtinSort(values: readonly number[]): number[] {
	return [...values].sort((a, b) => a - b);
}

/**
 * Quality metric (not latency): adjacent pairs still out of order in the
 * returned array. Both implementations must report 0 on every repetition;
 * the runner records the raw value and derives n/mean/median/p95/min/max/
 * stddev for it alongside the timing statistics.
 */
function unsortedAdjacentPairs(values: readonly number[]): number {
	let count = 0;
	for (let index = 1; index < values.length; index++) {
		if (values[index - 1] > values[index]) count++;
	}
	return count;
}

function withQuality(sorted: readonly number[]): {
	metrics: Record<string, number>;
} {
	return { metrics: { unsortedAdjacentPairs: unsortedAdjacentPairs(sorted) } };
}

/** Comparison implementation: insertion sort on a copy, for small arrays only. */
function insertionSort(values: readonly number[]): number[] {
	const sorted = [...values];
	for (let index = 1; index < sorted.length; index++) {
		const key = sorted[index];
		let position = index - 1;
		while (position >= 0 && sorted[position] > key) {
			sorted[position + 1] = sorted[position];
			position--;
		}
		sorted[position + 1] = key;
	}
	return sorted;
}

const fixture = makeFixture({
	count: ARRAY_COUNT,
	length: ARRAY_LENGTH,
	seed: DEFAULT_SEED,
});

// Fairness check before timing: both implementations must produce equal output.
for (const values of fixture) {
	const expected = builtinSort(values);
	const actual = insertionSort(values);
	if (expected.some((value, index) => value !== actual[index])) {
		throw new Error("benchmark implementations disagree on fixture output");
	}
}

const definition = defineBenchmark({
	name: "neutral-sort-benchmark",
	dataset: FIXTURE_NAME,
	datasetSource: FIXTURE_SOURCE,
	datasetVersion: FIXTURE_VERSION,
	cases: [
		{
			name: BASELINE_IMPLEMENTATION,
			run: () => {
				let sample: readonly number[] = [];
				for (const values of fixture) sample = builtinSort(values);
				return withQuality(sample);
			},
		},
		{
			name: "insertion-sort",
			run: () => {
				let sample: readonly number[] = [];
				for (const values of fixture) sample = insertionSort(values);
				return withQuality(sample);
			},
		},
	],
	warmup: WARMUP,
	repetitions: REPETITIONS,
	metric: "elapsed time sorting the full synthetic fixture",
	unit: "ms",
	// No numeric reference was measured beforehand: declare the baseline
	// implementation and leave the baseline value explicitly null.
	baseline: null,
	// Evidence must not carry raw error messages by default. Opt in only for
	// local debugging via `includeErrorMessages: true`; the runner redacts
	// credentials and PII even then.
	includeErrorMessages: false,
	config: {
		seed: DEFAULT_SEED,
		arrayCount: ARRAY_COUNT,
		arrayLength: ARRAY_LENGTH,
		baselineImplementation: BASELINE_IMPLEMENTATION,
		datasetLabel: "SYNTHETIC — not real data",
	},
	limitations: [
		"Insertion sort is O(n^2); this compares small synthetic arrays only and is not a general recommendation.",
		"Both cases run in one process, sequentially; cross-process noise is not controlled.",
	],
});

const records = run(definition);
const outputDirectory = fileURLToPath(new URL("./results/", import.meta.url));
mkdirSync(outputDirectory, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
let suffix = "";
let counter = 0;
while (existsSync(join(outputDirectory, `${stamp}${suffix}.json`))) {
	suffix = `-${++counter}`;
}

const jsonPath = join(outputDirectory, `${stamp}${suffix}.json`);
const csvPath = join(outputDirectory, `${stamp}${suffix}.csv`);
writeFileSync(jsonPath, toJson(records), "utf8");
writeFileSync(csvPath, toCsv(records), "utf8");

console.log(
	`synthetic fixture: ${FIXTURE_NAME} v${FIXTURE_VERSION} (seed ${DEFAULT_SEED})`,
);
for (const record of records) {
	console.log(
		`${record.caseName}: median=${record.value} ${record.unit} n=${record.sampleSize} errors=${record.errors.length}`,
	);
}
console.log(`json: ${jsonPath}`);
console.log(`csv: ${csvPath}`);
