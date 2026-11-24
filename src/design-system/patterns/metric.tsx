import type { EvaluationResult } from "../../core/contracts";

export function Metric({
	result,
	locale,
	format,
}: {
	result: EvaluationResult;
	locale?: string;
	format?: Intl.NumberFormatOptions;
}) {
	const { metric, value, unit, baseline, sampleSize } = result;
	const formatter = new Intl.NumberFormat(locale, format);
	const deltaFormatter = new Intl.NumberFormat(locale, {
		...format,
		signDisplay: "exceptZero",
	});
	const delta = baseline === undefined ? undefined : value - baseline;
	return (
		<dl className="grid min-w-0 gap-1 wrap-anywhere">
			<dt className="text-ds-sm font-medium text-muted">{metric}</dt>
			<dd className="font-metric text-ds-2xl font-ds-heading tabular-nums">
				<span className="align-baseline">{formatter.format(value)}</span>
				{unit && (
					<span className="ms-1 align-baseline font-body text-ds-sm font-medium normal-case [font-variant-caps:normal]">
						{unit}
					</span>
				)}
			</dd>
			{delta !== undefined && (
				<div className="flex flex-wrap gap-x-2 text-ds-sm text-muted">
					<dt>Change from baseline</dt>
					<dd className="tabular-nums">
						{deltaFormatter.format(delta)}
						{unit ? ` ${unit}` : ""}
					</dd>
				</div>
			)}
			{sampleSize !== undefined && (
				<div className="flex flex-wrap gap-x-2 text-ds-sm text-muted">
					<dt>Sample size</dt>
					<dd className="tabular-nums">
						{new Intl.NumberFormat(locale).format(sampleSize)}
					</dd>
				</div>
			)}
		</dl>
	);
}
