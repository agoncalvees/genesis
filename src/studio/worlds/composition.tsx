import { animate } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import {
	AnimatedNumber,
	BarChart,
	BeforeAfter,
	Button,
	EvidenceExcerpt,
	FadeIn,
	Field,
	Input,
	Legend,
	LineChart,
	Metric,
	ProcessTimeline,
	ResultPanel,
	readMotionProfile,
	StaggerGroup,
} from "../../design-system";
import { worldThemes } from "../../design-system/themes/generated/worlds";
import { syntheticAnalysis as fixture } from "./fixture";

export type WorldId = keyof typeof worldThemes;
export const worlds = {
	precision: {
		name: "Precision",
		description: "A compact analysis workspace with a measured grid.",
	},
	expressive: {
		name: "Expressive",
		description: "An editorial sequence with bold type and warm surfaces.",
	},
	cinematic: {
		name: "Cinematic",
		description: "A dark presentation with one focal point per panel.",
	},
	civic: {
		name: "Civic",
		description:
			"A guided reading order with direct labels and large controls.",
	},
} satisfies Record<WorldId, { name: string; description: string }>;

type PreviewState = "ready" | "sample" | "empty" | "failed";

function SampleResult({
	state,
	target,
	reset,
}: {
	state: PreviewState;
	target: number;
	reset: () => void;
}) {
	const shared = { title: "Result preview", headingLevel: 3 as const };
	switch (state) {
		case "ready":
			return <ResultPanel {...shared} status="idle" />;
		case "empty":
			return <ResultPanel {...shared} status="completed" data={null} />;
		case "failed":
			return (
				<ResultPanel
					{...shared}
					status="failed"
					error={{
						code: "UNKNOWN",
						message: "The synthetic result is unavailable.",
						retryable: true,
					}}
					onRetry={reset}
				/>
			);
		case "sample":
			return (
				<ResultPanel
					{...shared}
					status="completed"
					data={fixture.output}
					renderResult={(output) => (
						<p>
							{output} KB output.{" "}
							{output === target ? (
								"Exactly on target."
							) : (
								<>
									<AnimatedNumber
										value={Math.abs(target - output)}
										locale="en"
									/>{" "}
									KB {output < target ? "under" : "over"} the target.
								</>
							)}
						</p>
					)}
				/>
			);
	}
}

export function WorldComposition({
	id,
	preview = false,
}: {
	id: WorldId;
	preview?: boolean;
}) {
	const { composition, hasDark } = worldThemes[id];
	const [theme, setTheme] = useState(hasDark ? "dark" : "light");
	const [sampleState, setSampleState] = useState<PreviewState>("sample");
	const [target, setTarget] = useState(200);
	const [applied, setApplied] = useState(target);
	const [resultState, setResultState] = useState<PreviewState>(sampleState);
	const titleId = useId();
	const hero = useRef<HTMLHeadingElement>(null);
	const evidenceStart = fixture.evidence.indexOf(fixture.evidenceKey);
	const Title = preview ? "h2" : "h1";
	const SectionHeading = preview ? "h3" : "h2";

	useEffect(() => {
		const element = hero.current;
		if (!element || preview) return;
		const { intensity, reveal } = readMotionProfile(element);
		if (!intensity) return;
		const animation = animate(
			element,
			{ y: [reveal.distance, 0] },
			{ ...reveal.transition, delay: reveal.delay },
		);
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		const finish = () => {
			if (preference.matches) animation.complete();
		};
		preference.addEventListener("change", finish);
		return () => {
			animation.stop();
			preference.removeEventListener("change", finish);
		};
	}, [preview]);

	return (
		<article
			aria-labelledby={titleId}
			className="world-composition bg-background text-foreground"
			data-world={id}
			data-theme={theme}
			data-composition={composition}
		>
			<header className="world-toolbar">
				<span className="font-medium">{worlds[id].name}</span>
				<span className="text-ds-sm text-muted">Synthetic dataset</span>
				{hasDark && (
					<Button
						variant="secondary"
						size="sm"
						aria-pressed={theme === "dark"}
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						Dark mode
					</Button>
				)}
			</header>
			<div className="world-grid">
				<section className="world-section world-hero">
					<div className="world-inner">
						<Title ref={hero} id={titleId} className="world-title">
							A smaller output.
							<br />
							<span className="world-evidence-inline">
								<span>{fixture.originalSize}</span> →{" "}
								<span>{fixture.outputSize}</span>
							</span>
						</Title>
						<p className="world-intro">
							A {fixture.reduction}% reduction across three passes in this
							synthetic analysis.
						</p>
					</div>
				</section>

				<section
					aria-label="Key metrics"
					className="world-section world-metrics"
				>
					<div className="world-inner">
						<StaggerGroup className="world-metric-strip">
							{fixture.metrics.map((metric) => (
								<Metric key={metric.metric} result={metric} locale="en" />
							))}
						</StaggerGroup>
					</div>
				</section>

				<section className="world-section world-chart">
					<div className="world-inner">
						<SectionHeading className="world-heading">
							Size by pass
						</SectionHeading>
						{composition === "workspace" || composition === "immersive" ? (
							<>
								<LineChart
									title="Output size by pass"
									data={fixture.series}
									unit="KB"
									area={composition === "immersive"}
									showValues={composition === "workspace"}
								/>
								<Legend items={[{ label: "Output size (KB)", color: 1 }]} />
							</>
						) : (
							<BarChart
								title="Output size by pass"
								data={fixture.series}
								unit="KB"
								highlightLast={composition === "editorial"}
							/>
						)}
					</div>
				</section>

				<section className="world-section world-process">
					<div className="world-inner">
						<SectionHeading className="world-heading">Process</SectionHeading>
						<ProcessTimeline steps={fixture.steps} />
					</div>
				</section>

				<section className="world-section world-review">
					<div className="world-inner">
						<SectionHeading className="world-heading">
							Review the result
						</SectionHeading>
						<form
							className="world-form"
							onSubmit={(event) => {
								event.preventDefault();
								setApplied(target);
								setResultState(sampleState);
							}}
						>
							<Field label="Size target (KB)">
								<Input
									name="target"
									type="number"
									min={1}
									max={100000}
									required
									value={target || ""}
									onChange={(event) =>
										setTarget(event.currentTarget.valueAsNumber)
									}
								/>
							</Field>
							<label className="grid gap-1.5 text-ds-sm font-medium">
								Preview state
								<select
									className="min-h-control w-full rounded-control border border-control-border bg-surface-raised px-3 text-foreground"
									value={sampleState}
									onChange={(event) => {
										const state = event.currentTarget.value;
										if (
											state === "ready" ||
											state === "sample" ||
											state === "empty" ||
											state === "failed"
										)
											setSampleState(state);
									}}
								>
									<option value="sample">Completed</option>
									<option value="ready">Ready</option>
									<option value="empty">Empty</option>
									<option value="failed">Unavailable</option>
								</select>
							</label>
							<Button type="submit">Update preview</Button>
						</form>
						<SampleResult
							state={resultState}
							target={applied}
							reset={() => {
								setSampleState("sample");
								setResultState("sample");
							}}
						/>
					</div>
				</section>

				<section className="world-section world-compare-content">
					<div className="world-inner">
						<SectionHeading className="world-heading">
							Before and after
						</SectionHeading>
						<BeforeAfter
							label="Original and final sizes"
							before={
								<div className="world-slide">
									<strong>{fixture.originalSize}</strong>
									<span>Original size</span>
								</div>
							}
							after={
								<div className="world-slide world-slide-after">
									<strong>{fixture.outputSize}</strong>
									<span>Final size</span>
								</div>
							}
						/>
					</div>
				</section>

				<section className="world-section world-log">
					<div className="world-inner">
						<SectionHeading className="world-heading">
							Source excerpt
						</SectionHeading>
						<FadeIn duration="slow">
							<EvidenceExcerpt
								text={fixture.evidence}
								start={evidenceStart}
								end={evidenceStart + fixture.evidenceKey.length}
							/>
						</FadeIn>
					</div>
				</section>
			</div>
		</article>
	);
}
