/**
 * Small, deterministic evidence runner.
 *
 * It measures pure functions with `performance.now()`, records every measured
 * iteration (including failures), derives statistics only from successful raw
 * values and never invents a missing result. No IO and no optional features:
 * this module only imports a shared type from `core/`.
 */

import type { EvaluationResult } from "../core/contracts";

export type BenchmarkCase = {
	/** Stable identifier of the implementation being measured. */
	name: string;
	/** The operation to time. It must close over its own input. */
	run: () => unknown;
};

export type BenchmarkDefinition = {
	name: string;
	dataset: string;
	datasetSource: string;
	datasetVersion: string;
	cases: readonly BenchmarkCase[];
	/** Executions discarded before measuring (never recorded). */
	warmup: number;
	/** Recorded executions per case. */
	repetitions: number;
	metric: string;
	unit: string;
	/** Declared numeric reference, or null when no reference was measured. */
	baseline?: number | null;
	/** Extra execution parameters (input size, seed, baseline implementation...). */
	config?: Record<string, unknown>;
	/** Extra notes appended to the default limitations. */
	limitations?: readonly string[];
	/** "n/a" for deterministic benchmarks; provider/model version when applicable. */
	modelVersion?: string;
};

export type BenchmarkStats = {
	/** Number of successful raw values used for the statistics. */
	n: number;
	mean: number;
	median: number;
	/** Linear interpolation at rank (n - 1) * 0.95 over sorted values. */
	p95: number;
	min: number;
	max: number;
	/** Sample standard deviation (denominator n - 1); 0 when n === 1. */
	stddev: number;
};

export type MeasurementPhase = "warmup" | "measured";

export type RawMeasurement = {
	case: string;
	phase: "measured";
	iteration: number;
	duration: number;
	ok: boolean;
};

export type MeasurementError = {
	case: string;
	phase: MeasurementPhase;
	iteration: number;
	name: string;
	message: string;
};

/**
 * One record per benchmark case. It is structurally compatible with
 * `EvaluationResult` (`metric`, `value`, `unit`, `sampleSize`, `baseline`)
 * and adds the evidence fields required by EVIDENCE.md / test-strategy §4.
 */
export type BenchmarkRecord = EvaluationResult & {
	benchmark: string;
	caseName: string;
	dataset: string;
	datasetSource: string;
	datasetVersion: string;
	codeVersion: string;
	modelVersion: string;
	config: Record<string, unknown>;
	baselineJustification: string;
	unit: string;
	sampleSize: number;
	stats: BenchmarkStats;
	rawResults: RawMeasurement[];
	errors: MeasurementError[];
	durationMs: number;
	procedure: string;
	limitations: string[];
	runtime: Record<string, string>;
	date: string;
};

export class BenchmarkDefinitionError extends Error {
	override readonly name = "BenchmarkDefinitionError";
}

const DEFAULT_LIMITATIONS: readonly string[] = [
	"Amostra pequena e execução local; não extrapolável para produção ou outros ambientes.",
	"Temporização com performance.now() no mesmo processo; ruído de runtime e do sistema não controlado.",
	"Resultados dependem da fixture e da configuração declaradas; não comparar tarefas diferentes sob a mesma métrica.",
];

type BunLike = {
	version?: string;
	spawnSync?: (...args: readonly unknown[]) => {
		exitCode?: number | null;
		status?: number | null;
		stdout?: unknown;
	};
};

function getBun(): BunLike | undefined {
	return (globalThis as { Bun?: BunLike }).Bun;
}

/** Short git commit when available through Bun; otherwise an explicit unknown. */
export function detectCodeVersion(): string {
	const bun = getBun();
	if (!bun?.spawnSync) return "unknown";
	try {
		const result = bun.spawnSync(["git", "rev-parse", "--short", "HEAD"]);
		const exitCode = result.exitCode ?? result.status;
		if (exitCode !== 0) return "unknown";
		const stdout = result.stdout;
		const sha =
			typeof stdout === "string"
				? stdout.trim()
				: stdout instanceof Uint8Array
					? new TextDecoder().decode(stdout).trim()
					: "";
		return sha || "unknown";
	} catch {
		return "unknown";
	}
}

/** Runtime versions actually available in the process (no guessed versions). */
export function detectRuntime(): Record<string, string> {
	const bun = getBun();
	const nodeVersion =
		typeof process !== "undefined"
			? (process.versions?.node ?? "unknown")
			: "unknown";
	return {
		...(bun?.version ? { bun: bun.version } : {}),
		node: nodeVersion,
	};
}

function errorInfo(error: unknown): { name: string; message: string } {
	try {
		if (error instanceof Error) {
			return { name: error.name || "Error", message: error.message };
		}
		return { name: "NonError", message: String(error) };
	} catch {
		return { name: "UnknownError", message: "unserializable thrown value" };
	}
}

/**
 * Statistics calculated ONLY from the given numeric values.
 * An empty sample yields NaN aggregates (an explicit absence, never a zero).
 */
export function computeStats(values: readonly number[]): BenchmarkStats {
	const n = values.length;
	if (n === 0) {
		return {
			n: 0,
			mean: Number.NaN,
			median: Number.NaN,
			p95: Number.NaN,
			min: Number.NaN,
			max: Number.NaN,
			stddev: Number.NaN,
		};
	}

	const sorted = [...values].sort((a, b) => a - b);
	const sum = values.reduce((acc, value) => acc + value, 0);
	const mean = sum / n;
	const middle = Math.floor(n / 2);
	const median =
		n % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;

	const rank = (n - 1) * 0.95;
	const lower = Math.floor(rank);
	const upper = Math.ceil(rank);
	const p95 =
		lower === upper
			? sorted[lower]
			: sorted[lower] + (sorted[upper] - sorted[lower]) * (rank - lower);

	const variance =
		n === 1
			? 0
			: values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (n - 1);

	return {
		n,
		mean,
		median,
		p95,
		min: sorted[0],
		max: sorted[n - 1],
		stddev: Math.sqrt(variance),
	};
}

function requireText(value: string, field: string): void {
	if (typeof value !== "string" || value.trim() === "") {
		throw new BenchmarkDefinitionError(`${field} must be a non-empty string`);
	}
}

/** Validate and freeze the declaration before any measurement takes place. */
export function defineBenchmark(
	definition: BenchmarkDefinition,
): BenchmarkDefinition {
	requireText(definition.name, "name");
	requireText(definition.dataset, "dataset");
	requireText(definition.datasetSource, "datasetSource");
	requireText(definition.datasetVersion, "datasetVersion");
	requireText(definition.metric, "metric");
	requireText(definition.unit, "unit");
	if (!Number.isInteger(definition.warmup) || definition.warmup < 0) {
		throw new BenchmarkDefinitionError("warmup must be a non-negative integer");
	}
	if (!Number.isInteger(definition.repetitions) || definition.repetitions < 1) {
		throw new BenchmarkDefinitionError(
			"repetitions must be a positive integer",
		);
	}
	if (!Array.isArray(definition.cases) || definition.cases.length === 0) {
		throw new BenchmarkDefinitionError("cases must contain at least one case");
	}

	const seen = new Set<string>();
	for (const benchmarkCase of definition.cases) {
		requireText(benchmarkCase.name, "case name");
		if (seen.has(benchmarkCase.name)) {
			throw new BenchmarkDefinitionError(
				`duplicate case name: ${benchmarkCase.name}`,
			);
		}
		seen.add(benchmarkCase.name);
		if (typeof benchmarkCase.run !== "function") {
			throw new BenchmarkDefinitionError(
				`case ${benchmarkCase.name} has no run function`,
			);
		}
	}
	if (
		definition.baseline !== undefined &&
		definition.baseline !== null &&
		!Number.isFinite(definition.baseline)
	) {
		throw new BenchmarkDefinitionError(
			"baseline must be a finite number or null",
		);
	}
	return definition;
}

function buildProcedure(definition: BenchmarkDefinition): string {
	return [
		`Benchmark "${definition.name}" sobre ${definition.dataset} (${definition.datasetSource}, v${definition.datasetVersion}).`,
		`Warm-up: ${definition.warmup} execução(ões) por caso, não registradas.`,
		`Medição: ${definition.repetitions} repetições por caso, temporizadas com performance.now() no mesmo processo.`,
		"Cada medição bruta é registrada em rawResults, inclusive as que falharam; falhas também aparecem em errors.",
		"Estatísticas (n, mean, median, p95, min, max, stddev) usam apenas valores brutos bem-sucedidos; p95 por interpolação linear e stddev amostral (n-1).",
		"Nenhum valor ausente é preenchido; não comparar tarefas ou configurações diferentes sem normalização.",
	].join(" ");
}

/**
 * Execute the declared benchmark. Warm-up is never recorded; every measured
 * iteration is recorded, and thrown values become `errors` instead of being
 * silently dropped. Returns one `EvaluationResult`-compatible record per case.
 */
export function run(definition: BenchmarkDefinition): BenchmarkRecord[] {
	const codeVersion = detectCodeVersion();
	const runtime = detectRuntime();
	const date = new Date().toISOString();
	const config: Record<string, unknown> = {
		warmup: definition.warmup,
		repetitions: definition.repetitions,
		cases: definition.cases.map((benchmarkCase) => benchmarkCase.name),
		...(definition.config ?? {}),
	};
	const procedure = buildProcedure(definition);
	const limitations = [
		...DEFAULT_LIMITATIONS,
		...(definition.limitations ?? []),
	];
	const hasBaseline =
		definition.baseline !== undefined && definition.baseline !== null;
	const baselineJustification = hasBaseline
		? "Baseline numérico declarado na definição do benchmark."
		: "Nenhum valor de referência medido previamente; baseline numérico não inventado. Implementação de referência declarada em config.baselineImplementation.";

	const records: BenchmarkRecord[] = [];

	for (const benchmarkCase of definition.cases) {
		const caseStartedAt = performance.now();
		const rawResults: RawMeasurement[] = [];
		const errors: MeasurementError[] = [];

		for (let iteration = 1; iteration <= definition.warmup; iteration++) {
			try {
				benchmarkCase.run();
			} catch (error) {
				errors.push({
					case: benchmarkCase.name,
					phase: "warmup",
					iteration,
					...errorInfo(error),
				});
			}
		}

		for (let iteration = 1; iteration <= definition.repetitions; iteration++) {
			const startedAt = performance.now();
			let ok = true;
			try {
				benchmarkCase.run();
			} catch (error) {
				ok = false;
				errors.push({
					case: benchmarkCase.name,
					phase: "measured",
					iteration,
					...errorInfo(error),
				});
			}
			const duration = performance.now() - startedAt;
			rawResults.push({
				case: benchmarkCase.name,
				phase: "measured",
				iteration,
				duration,
				ok,
			});
		}

		const successful = rawResults
			.filter((measurement) => measurement.ok)
			.map((measurement) => measurement.duration);
		const stats = computeStats(successful);

		records.push({
			metric: definition.metric,
			value: stats.median,
			unit: definition.unit,
			sampleSize: stats.n,
			...(hasBaseline ? { baseline: definition.baseline as number } : {}),
			benchmark: definition.name,
			caseName: benchmarkCase.name,
			dataset: definition.dataset,
			datasetSource: definition.datasetSource,
			datasetVersion: definition.datasetVersion,
			codeVersion,
			modelVersion: definition.modelVersion ?? "n/a",
			config,
			baselineJustification,
			stats,
			rawResults,
			errors,
			durationMs: performance.now() - caseStartedAt,
			procedure,
			limitations,
			runtime,
			date,
		});
	}

	return records;
}
