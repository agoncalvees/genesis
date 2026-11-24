/**
 * Small, deterministic evidence runner.
 *
 * It measures pure functions with `performance.now()`, records every measured
 * iteration (including failures), derives statistics only from successful raw
 * values and never invents a missing result. A case may also return
 * `{ metrics: Record<string, number> }`: those numeric values are recorded per
 * repetition and summarised with the same statistics as duration, so quality
 * and latency can be compared in the same evidence record. No IO and no
 * optional features: this module only imports a shared type from `core/`.
 */

import type { EvaluationResult } from "../core/contracts";

export type BenchmarkCase = {
	/** Stable identifier of the implementation being measured. */
	name: string;
	/**
	 * The operation to time. It must close over its own input. It may return
	 * `{ metrics: Record<string, number> }` to record per-repetition quality
	 * values; any other return shape is ignored (only duration is measured).
	 */
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
	/**
	 * Opt-in for error messages in exported evidence. Off by default: messages
	 * may contain prompts, keys or PII. When enabled they are redacted, but the
	 * raw text is still never written to the artifact.
	 */
	includeErrorMessages?: boolean;
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
	/**
	 * Finite numeric values returned by `run()` for this repetition. Present
	 * only when the call succeeded and actually returned usable metrics.
	 */
	metrics?: Record<string, number>;
};

/**
 * Only the error class and a correlation handle are exported by default. A
 * redacted `message` exists only when the definition opts in explicitly.
 */
export type MeasurementError = {
	caseName: string;
	phase: MeasurementPhase;
	repetition: number;
	name: string;
	correlationId: string;
	message?: string;
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
	/** True when git reported uncommitted changes at measurement time. */
	codeDirty: boolean;
	modelVersion: string;
	config: Record<string, unknown>;
	baselineJustification: string;
	unit: string;
	sampleSize: number;
	stats: BenchmarkStats;
	/**
	 * Per-metric statistics, keyed by metric name and computed from the raw
	 * values of successful repetitions that reported that metric. Names are
	 * sorted; an empty object means no case returned usable metrics.
	 */
	metricStats?: Record<string, BenchmarkStats>;
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

export type GitResult = {
	exitCode?: number | null;
	status?: number | null;
	stdout?: unknown;
};

/** Injectable git runner: tests pass a fake instead of spawning a process. */
export type GitRunner = (args: readonly string[]) => GitResult;

type BunLike = {
	version?: string;
	spawnSync?: (...args: readonly unknown[]) => GitResult;
};

function getBun(): BunLike | undefined {
	return (globalThis as { Bun?: BunLike }).Bun;
}

function defaultGitRunner(args: readonly string[]): GitResult {
	const bun = getBun();
	if (!bun?.spawnSync) throw new Error("Bun.spawnSync unavailable");
	return bun.spawnSync(args);
}

/** Decode stdout only for successful (exit code 0) git commands. */
function gitOutput(result: GitResult): string {
	if ((result.exitCode ?? result.status) !== 0) return "";
	const stdout = result.stdout;
	if (typeof stdout === "string") return stdout.trim();
	if (stdout instanceof Uint8Array)
		return new TextDecoder().decode(stdout).trim();
	return "";
}

/** Short git commit when available through Bun; otherwise an explicit unknown. */
export function detectCodeVersion(
	runner: GitRunner = defaultGitRunner,
): string {
	try {
		return (
			gitOutput(runner(["git", "rev-parse", "--short", "HEAD"])) || "unknown"
		);
	} catch {
		return "unknown";
	}
}

/**
 * Whether git reported uncommitted changes at measurement time. A failed
 * command is not evidence of dirtiness and resolves to false (unknown).
 */
export function detectCodeDirty(runner: GitRunner = defaultGitRunner): boolean {
	try {
		return gitOutput(runner(["git", "status", "--porcelain"])).length > 0;
	} catch {
		return false;
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

const REDACTED = "[REDACTED]";

/**
 * Conservative patterns for credentials and PII. Redaction is destructive by
 * design: a false positive hides harmless text, a false negative leaks a
 * secret. Order matters so structured credentials are handled before the
 * generic long-token patterns.
 */
const SECRET_PATTERNS: readonly RegExp[] = [
	/\bsk-[A-Za-z0-9_-]{8,}/g,
	/\b[Bb]earer\s+[A-Za-z0-9._~+/=-]{8,}/g,
	/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
	/\b[0-9a-fA-F]{32,}\b/g,
	/\b[A-Za-z0-9+/]{24,}={0,2}/g,
];

/** Replace every known secret shape in a message with an explicit marker. */
export function redactSecrets(message: string): string {
	return SECRET_PATTERNS.reduce(
		(text, pattern) => text.replace(pattern, REDACTED),
		message,
	);
}

function randomCorrelationId(): string {
	const crypto = (globalThis as { crypto?: { randomUUID?: () => string } })
		.crypto;
	try {
		return crypto?.randomUUID?.() ?? "unknown";
	} catch {
		return "unknown";
	}
}

/** Build the minimal, non-sensitive error record written to evidence. */
function errorInfo(
	error: unknown,
	context: {
		caseName: string;
		phase: MeasurementPhase;
		repetition: number;
		includeMessage: boolean;
	},
): MeasurementError {
	let name = "UnknownError";
	let rawMessage = "unserializable thrown value";
	try {
		if (error instanceof Error) {
			const className = error.name;
			name =
				typeof className === "string" &&
				/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(className)
					? className
					: "Error";
			rawMessage = error.message;
		} else {
			name = "NonError";
			rawMessage = String(error);
		}
	} catch {
		// Keep the safe defaults above.
	}
	const info: MeasurementError = {
		caseName: context.caseName,
		phase: context.phase,
		repetition: context.repetition,
		name,
		correlationId: randomCorrelationId(),
	};
	if (context.includeMessage) info.message = redactSecrets(rawMessage);
	return info;
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

/**
 * Recognise the documented `{ metrics: Record<string, number> }` return shape.
 * Only finite numbers are kept; non-numeric or non-finite entries and a
 * malformed/empty `metrics` value are treated as "no metrics" rather than a
 * fabricated zero. Any other return value is ignored.
 */
export function extractMetrics(
	value: unknown,
): Record<string, number> | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return undefined;
	}
	const metrics = (value as { metrics?: unknown }).metrics;
	if (
		typeof metrics !== "object" ||
		metrics === null ||
		Array.isArray(metrics)
	) {
		return undefined;
	}
	const result: Record<string, number> = {};
	for (const [name, rawValue] of Object.entries(metrics)) {
		if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
			result[name] = rawValue;
		}
	}
	return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Compute the same statistics as `computeStats` for every metric name present
 * in the successful measurements. Names are sorted for a stable export; a
 * metric with no finite values is omitted instead of getting invented zeros.
 */
export function computeMetricStats(
	rawResults: readonly RawMeasurement[],
): Record<string, BenchmarkStats> {
	const names = new Set<string>();
	for (const measurement of rawResults) {
		if (!measurement.ok || !measurement.metrics) continue;
		for (const name of Object.keys(measurement.metrics)) names.add(name);
	}

	const stats: Record<string, BenchmarkStats> = {};
	for (const name of [...names].sort()) {
		const values: number[] = [];
		for (const measurement of rawResults) {
			const value = measurement.ok ? measurement.metrics?.[name] : undefined;
			if (typeof value === "number" && Number.isFinite(value)) {
				values.push(value);
			}
		}
		if (values.length > 0) stats[name] = computeStats(values);
	}
	return stats;
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
		definition.includeErrorMessages !== undefined &&
		typeof definition.includeErrorMessages !== "boolean"
	) {
		throw new BenchmarkDefinitionError(
			"includeErrorMessages must be a boolean",
		);
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
		"Métricas de qualidade: quando run() retorna { metrics: Record<string, number> }, cada valor finito é registrado em rawResults[].metrics e as mesmas estatísticas são calculadas por métrica em metricStats.",
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
	const codeDirty = detectCodeDirty();
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
				errors.push(
					errorInfo(error, {
						caseName: benchmarkCase.name,
						phase: "warmup",
						repetition: iteration,
						includeMessage: definition.includeErrorMessages === true,
					}),
				);
			}
		}

		for (let iteration = 1; iteration <= definition.repetitions; iteration++) {
			const startedAt = performance.now();
			let ok = true;
			let returned: unknown;
			try {
				returned = benchmarkCase.run();
			} catch (error) {
				ok = false;
				errors.push(
					errorInfo(error, {
						caseName: benchmarkCase.name,
						phase: "measured",
						repetition: iteration,
						includeMessage: definition.includeErrorMessages === true,
					}),
				);
			}
			const duration = performance.now() - startedAt;
			const metrics = ok ? extractMetrics(returned) : undefined;
			rawResults.push({
				case: benchmarkCase.name,
				phase: "measured",
				iteration,
				duration,
				ok,
				...(metrics ? { metrics } : {}),
			});
		}

		const successful = rawResults
			.filter((measurement) => measurement.ok)
			.map((measurement) => measurement.duration);
		const stats = computeStats(successful);
		const metricStats = computeMetricStats(rawResults);

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
			codeDirty,
			modelVersion: definition.modelVersion ?? "n/a",
			config,
			baselineJustification,
			stats,
			metricStats,
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
