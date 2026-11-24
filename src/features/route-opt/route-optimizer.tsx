import { type FormEvent, useId, useState } from "react";
import { useHydrated } from "../../core/hydration";
import {
	BeforeAfter,
	Button,
	Card,
	Container,
	Field,
	Grid,
	Heading,
	Metric,
	ResultPanel,
	Stack,
	Text,
	Textarea,
} from "../../design-system";
import { WorkspaceLayout } from "../../layouts";
import {
	inputOrder,
	optimizeRoute,
	type Point,
	type RouteResult,
} from "./optimizer";
import {
	FIXTURE_SEED,
	formatPoints,
	parsePoints,
	syntheticPoints,
} from "./points";

function compare(points: readonly Point[], source: string) {
	return {
		points,
		source,
		baseline: inputOrder(points),
		improved: optimizeRoute(points),
	};
}

const format = { maximumFractionDigits: 2 };

function RouteDiagram({
	title,
	points,
	route,
}: {
	title: string;
	points: readonly Point[];
	route: RouteResult;
}) {
	const titleId = useId();
	const descriptionId = useId();
	const minX = Math.min(...points.map(({ x }) => x));
	const minY = Math.min(...points.map(({ y }) => y));
	const span = Math.max(
		Math.max(...points.map(({ x }) => x)) - minX,
		Math.max(...points.map(({ y }) => y)) - minY,
		1,
	);
	const positions = points.map(({ x, y }, index) => ({
		row: index + 1,
		x: 16 + ((x - minX) / span) * 208,
		y: 224 - ((y - minY) / span) * 208,
	}));
	return (
		<svg
			role="img"
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			viewBox="0 0 240 240"
			className="size-full text-foreground"
		>
			<title id={titleId}>{`${title} map`}</title>
			<desc id={descriptionId}>
				An open route. Point numbers match input rows. A square marks the
				starting point. Visit order is listed below.
			</desc>
			<polyline
				points={route.order
					.map((index) => `${positions[index].x},${positions[index].y}`)
					.join(" ")}
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			{positions.map(({ x, y, row }) => (
				<g key={row}>
					{row === 1 ? (
						<rect
							x={x - 3}
							y={y - 3}
							width="6"
							height="6"
							fill="currentColor"
						/>
					) : (
						<circle cx={x} cy={y} r="2" fill="currentColor" />
					)}
					{points.length <= 24 && (
						<text
							x={x + 4}
							y={y - 4}
							className="fill-foreground stroke-surface font-mono [paint-order:stroke]"
							strokeWidth="2"
							fontSize="8"
						>
							{row}
						</text>
					)}
				</g>
			))}
		</svg>
	);
}

function RouteSummary({ title, route }: { title: string; route: RouteResult }) {
	const sequence = route.order.map((index) => index + 1).join(" → ");
	return (
		<Card>
			<Stack>
				<Metric
					result={{ metric: title, value: route.distance, unit: "units" }}
					format={format}
					locale="en"
				/>
				<Text muted>Visit order · {sequence}</Text>
			</Stack>
		</Card>
	);
}

function Comparison({
	points,
	source,
	baseline,
	improved,
}: ReturnType<typeof compare>) {
	const reduction =
		baseline.distance === 0
			? 0
			: (baseline.distance - improved.distance) / baseline.distance;
	return (
		<Stack>
			<Text muted>
				{source} · {points.length} points
			</Text>
			<Metric
				result={{ metric: "Distance reduction", value: reduction }}
				format={{ style: "percent", maximumFractionDigits: 2 }}
				locale="en"
			/>
			<BeforeAfter
				label="Route maps · Input order and heuristic route"
				before={
					<RouteDiagram title="Input order" points={points} route={baseline} />
				}
				after={
					<RouteDiagram
						title="Heuristic route"
						points={points}
						route={improved}
					/>
				}
			/>
			<Grid>
				<RouteSummary title="Input order" route={baseline} />
				<RouteSummary title="Heuristic route" route={improved} />
			</Grid>
		</Stack>
	);
}

const syntheticSource = `Synthetic data · seed ${FIXTURE_SEED}`;

export function RouteOptimizer() {
	const hydrated = useHydrated();
	const [source, setSource] = useState(() => formatPoints(syntheticPoints()));
	const [error, setError] = useState<string>();
	const [result, setResult] = useState(() =>
		compare(syntheticPoints(), syntheticSource),
	);

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const parsed = parsePoints(source);
		if ("error" in parsed) {
			setError(parsed.error);
			return;
		}
		setError(undefined);
		setResult(
			compare(
				parsed.points,
				formatPoints(parsed.points) === formatPoints(syntheticPoints())
					? syntheticSource
					: "Entered coordinates",
			),
		);
	}

	function loadFixture() {
		const points = syntheticPoints();
		setSource(formatPoints(points));
		setError(undefined);
		setResult(compare(points, syntheticSource));
	}

	return (
		<WorkspaceLayout>
			<Container className="max-w-5xl px-0" data-hydrated={hydrated}>
				<Stack className="gap-6">
					<Stack className="gap-2">
						<Heading level={1}>Route comparison</Heading>
						<Text>
							Compare input order with nearest neighbor and up to 10 rounds of
							2-opt. Both routes start at the first point and end after visiting
							every point once. Distances are Euclidean.
						</Text>
					</Stack>
					<form onSubmit={submit}>
						<Stack>
							<Field
								label="Coordinates"
								description="Enter 2–80 points, one x, y pair per line. Use a period for decimals. Each coordinate must be within ±1000."
								error={error}
							>
								<Textarea
									disabled={!hydrated}
									rows={5}
									maxLength={16000}
									spellCheck={false}
									className="font-mono"
									value={source}
									onChange={(event) => {
										setSource(event.currentTarget.value);
										setError(undefined);
									}}
								/>
							</Field>
							<div className="flex flex-wrap gap-2">
								<Button disabled={!hydrated} type="submit">
									Compare routes
								</Button>
								<Button
									type="button"
									variant="secondary"
									disabled={!hydrated}
									onClick={loadFixture}
								>
									Load synthetic points
								</Button>
							</div>
						</Stack>
					</form>
					<ResultPanel
						title="Latest route comparison"
						status="completed"
						data={result}
						renderResult={(data) => <Comparison {...data} />}
					/>
				</Stack>
			</Container>
		</WorkspaceLayout>
	);
}
