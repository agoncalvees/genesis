import { animate, motion, useMotionValue, useTransform } from "motion/react";
import {
	useEffect,
	useEffectEvent,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { useHydrated } from "../../core/hydration";
import { readMotionTiming } from "../../design-system/motion/presets";
import {
	type ChalkPoint,
	type ChalkStroke,
	eraseChalk,
	extendChalk,
} from "./chalk";
import { type Comparison, FieldMap } from "./field-map";
import {
	Actions,
	formatNumber,
	type Phase,
	type Tool,
	Tools,
	WeatherInstruments,
} from "./instruments";
import {
	advanceFire,
	createFire,
	DEFAULT_WEATHER,
	type Fire,
	finishFire,
	HECTARES_PER_CELL,
	HEIGHT,
	STEPS_PER_SECOND,
	terrain,
	traceCells,
	type Weather,
	WIDTH,
} from "./model";

const noBreaks: ReadonlySet<number> = new Set();
const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(change: () => void) {
	const media = window.matchMedia(motionPreference);
	media.addEventListener("change", change);
	return () => media.removeEventListener("change", change);
}

type Session = {
	actual: Fire;
	baseline: Fire;
	history: Weather[];
	initial: Weather;
	foci: readonly number[];
};

function readings(comparison: Comparison) {
	const burned = comparison.actual.total * HECTARES_PER_CELL;
	const baseline = comparison.baseline.total * HECTARES_PER_CELL;
	return { burned, baseline, saved: Math.max(0, baseline - burned) };
}

function AreaReading({ value, reduced }: { value: number; reduced: boolean }) {
	const element = useRef<HTMLSpanElement>(null);
	const amount = useMotionValue(reduced ? value : 0);
	const display = useTransform(amount, formatNumber);
	useEffect(() => {
		if (reduced) {
			amount.set(value);
			return;
		}
		if (!element.current) return;
		const playback = animate(amount, value, {
			...readMotionTiming(element.current, "showcase", "enter"),
			type: "tween",
		});
		return () => playback.stop();
	}, [amount, reduced, value]);
	return (
		<span ref={element}>
			{reduced ? (
				formatNumber(value)
			) : (
				<>
					<span className="ace-sr">{formatNumber(value)}</span>
					<motion.span aria-hidden="true">{display}</motion.span>
				</>
			)}
		</span>
	);
}

function Results({
	comparison,
	burned,
	stale,
	reduced,
}: {
	comparison: Comparison | null;
	burned: number | undefined;
	stale: boolean;
	reduced: boolean;
}) {
	const values = comparison && readings(comparison);
	const metrics = [{ label: "Área queimada", value: values?.burned ?? burned }];
	if (values)
		metrics.push(
			{ label: "Área preservada", value: values.saved },
			{ label: "Sem aceiros", value: values.baseline },
		);
	return (
		<section
			className="ace-results ace-section"
			aria-label="Leituras da simulação"
		>
			{stale && (
				<p className="ace-stale" data-label>
					Resultado desatualizado
				</p>
			)}
			<dl>
				{metrics.map(({ label, value }, index) => (
					<div className="ace-metric" key={label}>
						<dt data-label>{label}</dt>
						<dd data-reading>
							{value === undefined ? (
								"—"
							) : index === 0 ? (
								formatNumber(value)
							) : (
								<AreaReading value={value} reduced={reduced} />
							)}
							<small> ha</small>
						</dd>
					</div>
				))}
			</dl>
			{values && values.baseline < values.burned && (
				<p className="ace-instruction">
					Nesta simulação, queimou mais área com aceiros. A área preservada é
					registrada como zero.
				</p>
			)}
		</section>
	);
}

export function Aceiro() {
	const hydrated = useHydrated();
	const reduced = useSyncExternalStore(
		subscribeToMotion,
		() => window.matchMedia(motionPreference).matches,
		() => false,
	);
	const [classes, setClasses] = useState<Uint8Array | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);
	const [tool, setTool] = useState<Tool>("break");
	const [weather, setWeather] = useState<Weather>(DEFAULT_WEATHER);
	const [breaks, setBreaks] = useState<ReadonlySet<number>>(noBreaks);
	const [chalk, setChalk] = useState<readonly ChalkStroke[]>([]);
	const [foci, setFoci] = useState<readonly number[]>([]);
	const [phase, setPhase] = useState<Phase>("ready");
	const [comparison, setComparison] = useState<Comparison | null>(null);
	const [stale, setStale] = useState(false);
	const [announcement, setAnnouncement] = useState("");
	const [feedback, setFeedback] = useState("");
	const [, renderStep] = useState(0);
	const session = useRef<Session | null>(null);
	const locked = phase === "paused" || phase === "running";
	const fire = session.current?.actual;
	const burned =
		locked && fire
			? (fire.total - fire.active.length) * HECTARES_PER_CELL
			: undefined;
	const canIgnite = hydrated && Boolean(classes) && (locked || foci.length > 0);
	const hint =
		feedback ||
		(loadFailed
			? "O mapa não pôde ser carregado."
			: !classes
				? "Carregando o terreno…"
				: foci.length === 0
					? "Marque um foco no mapa para acender."
					: `${foci.length} de 3 focos marcados.`);

	const finish = (run: Session, currentWeather: Weather) => {
		const baseline =
			run.history.every((value) => value === run.initial) &&
			currentWeather === run.initial
				? run.baseline
				: finishFire(
						createFire(run.actual.classes, WIDTH, HEIGHT, noBreaks, run.foci),
						currentWeather,
						run.history,
					);
		const result = { actual: run.actual, baseline };
		const { burned, saved } = readings(result);
		setComparison(result);
		setPhase("result");
		setAnnouncement(
			`Simulação concluída. Área queimada: ${formatNumber(burned)} hectares. Área preservada: ${formatNumber(saved)} hectares.`,
		);
	};

	const step = useEffectEvent(() => {
		const run = session.current;
		if (!run) return;
		if (reduced) {
			finishFire(run.actual, weather, run.history);
			finish(run, weather);
			return;
		}
		run.history.push(weather);
		advanceFire(run.actual, weather);
		if (run.actual.active.length) renderStep(run.actual.step);
		else finish(run, weather);
	});

	useEffect(() => {
		if (phase !== "running") return;
		let previous = performance.now();
		let frame = 0;
		const play = (now: number) => {
			const interval = 1000 / STEPS_PER_SECOND;
			if (now - previous >= interval) {
				previous = now - ((now - previous) % interval);
				step();
			}
			frame = requestAnimationFrame(play);
		};
		frame = requestAnimationFrame(play);
		return () => cancelAnimationFrame(frame);
	}, [phase]);

	const invalidate = () => {
		if (comparison) setStale(true);
	};
	const edit = (start: ChalkPoint, end: ChalkPoint, join = false) => {
		const from = start.cell;
		const to = end.cell;
		if (!classes || locked) return;
		if (tool === "focus") {
			if (breaks.has(to) || !terrain[classes[to]].fuel) {
				setFeedback("Escolha uma célula com combustível, fora do aceiro.");
				return;
			}
			if (foci.includes(to)) return;
			if (foci.length === 3) {
				setFeedback("Apague um dos três focos para marcar outro.");
				return;
			}
			setFoci([...foci, to]);
		} else {
			const cells = traceCells(from, to);
			const next = new Set(breaks);
			for (const cell of cells) {
				if (tool === "break") next.add(cell);
				else next.delete(cell);
			}
			const remaining = foci.filter((cell) => !cells.includes(cell));
			const changed =
				next.size !== breaks.size || remaining.length !== foci.length;
			if (tool === "break")
				setChalk((strokes) => extendChalk(strokes, cells, start, end, join));
			else if (changed)
				setChalk((strokes) => eraseChalk(strokes, new Set(cells)));
			if (!changed) return;
			setBreaks(next);
			setFoci(remaining);
		}
		setFeedback("");
		invalidate();
	};

	const ignite = () => {
		if (!classes || !canIgnite) {
			if (classes) setFeedback("Marque um foco no mapa antes de acender.");
			return;
		}
		setFeedback("");
		if (phase === "running") {
			setPhase("paused");
			setAnnouncement("Simulação pausada.");
			return;
		}
		if (phase === "paused") {
			setPhase("running");
			setAnnouncement("Simulação retomada.");
			return;
		}
		const actual = createFire(classes, WIDTH, HEIGHT, breaks, foci);
		const baseline = finishFire(
			createFire(classes, WIDTH, HEIGHT, noBreaks, foci),
			weather,
		);
		const run = { actual, baseline, initial: weather, history: [], foci };
		session.current = run;
		setComparison(null);
		setStale(false);
		renderStep(0);
		if (reduced) {
			finishFire(actual, weather);
			finish(run, weather);
		} else {
			setPhase("running");
			setAnnouncement("Simulação iniciada.");
		}
	};

	const reset = () => {
		session.current = null;
		setComparison(null);
		setStale(false);
		setPhase("ready");
		setWeather(DEFAULT_WEATHER);
		setFoci([]);
		setBreaks(noBreaks);
		setChalk([]);
		setTool("break");
		setFeedback("");
		setAnnouncement("Carta reiniciada.");
	};

	const weatherChange = (next: Weather) => {
		if (
			next.angle === weather.angle &&
			next.speed === weather.speed &&
			next.humidity === weather.humidity
		)
			return;
		setWeather(next);
		invalidate();
	};

	return (
		<main className="aceiro" data-hydrated={hydrated}>
			<FieldMap
				classes={classes}
				onReady={setClasses}
				onError={() => setLoadFailed(true)}
				breaks={breaks}
				chalk={chalk}
				foci={foci}
				phase={phase}
				weather={weather}
				fire={fire}
				burned={burned}
				comparison={comparison}
				stale={stale}
				reduced={reduced}
				tool={tool}
				onEdit={edit}
			/>
			<aside className="ace-instruments" aria-label="Caderno de instrumentos">
				<header className="ace-panel-head">
					<p data-label>Instrumentos de campo</p>
					<p className="ace-instruction">
						Simulação de manejo do fogo no Cerrado
					</p>
				</header>
				<WeatherInstruments
					weather={weather}
					onChange={weatherChange}
					reduced={reduced}
				/>
				<section className="ace-management ace-section" aria-label="Manejo">
					<h2 data-label>Ferramentas de manejo</h2>
					<p className="ace-instruction">
						Aja sobre o terreno para conter o fogo.
					</p>
					<div className="ace-controls">
						<Tools
							className="ace-tools"
							tool={tool}
							setTool={setTool}
							locked={locked}
						/>
						<Actions
							className="ace-actions"
							phase={phase}
							canIgnite={canIgnite}
							onIgnite={ignite}
							onReset={reset}
						/>
					</div>
					<p
						id="ace-ignite-help"
						className="ace-help"
						data-feedback={Boolean(feedback)}
						role="status"
					>
						{hint}
					</p>
				</section>
				<Results
					comparison={comparison}
					burned={burned}
					stale={stale}
					reduced={reduced}
				/>
				<footer className="ace-specimen ace-section">
					<figure>
						<img
							src="/art/specimen.webp"
							width="1086"
							height="1448"
							alt="Gravura de um broto de pequizeiro saindo de um galho"
						/>
						<figcaption>
							<span data-label>Pequizeiro</span>
							<span>
								O pequizeiro pode rebrotar depois do fogo. Queimadas frequentes
								podem impedir a recuperação do Cerrado.
							</span>
						</figcaption>
					</figure>
					<div className="ace-model-note">
						<span>Modelo didático, não preditivo</span>
						<span>1 célula = 0,25 ha</span>
					</div>
				</footer>
			</aside>
			<p className="ace-sr" role="status">
				{announcement}
			</p>
		</main>
	);
}
