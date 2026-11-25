import { ArrowsLeftRight } from "@phosphor-icons/react";
import {
	type CSSProperties,
	type KeyboardEvent,
	type PointerEvent,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from "react";
import {
	drawMarks,
	drawScar,
	drawWind,
	FIELD_HEIGHT,
	FIELD_WIDTH,
	readInk,
} from "./field-art";
import { clamp, formatNumber, type Phase, type Tool } from "./instruments";
import {
	classifyGrid,
	type Fire,
	HEIGHT,
	ignitionChance,
	terrain,
	type Weather,
	WIDTH,
} from "./model";

const artwork = "/art/terrain.webp";
const cellKeys: Record<string, [number, number]> = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
};
const contourLines = [
	"M-30 81C63 16 121 107 187 82S204 36 276 44 372 79 415 16",
	"M-40 160C23 96 61 127 109 143S157 185 208 165 267 98 319 113 389 142 445 66",
	"M632 164C585 186 613 239 561 255S486 251 479 289 528 330 499 383 440 453 456 490",
	"M670 205C611 212 642 258 574 284S517 299 534 324 548 400 494 442 495 474 502 493",
	"M-54 350C29 335 83 390 152 342S239 331 270 350 293 411 361 408",
];

export type Comparison = { actual: Fire; baseline: Fire };

type FieldProps = {
	classes: Uint8Array | null;
	onReady: (classes: Uint8Array) => void;
	onError: () => void;
	breaks: ReadonlySet<number>;
	foci: readonly number[];
	phase: Phase;
	weather: Weather;
	fire: Fire | undefined;
	comparison: Comparison | null;
	stale: boolean;
	reduced: boolean;
	tool: Tool;
	onEdit: (from: number, to: number) => void;
};

export function FieldMap({
	classes,
	onReady,
	onError,
	breaks,
	foci,
	phase,
	weather,
	fire,
	comparison,
	stale,
	reduced,
	tool,
	onEdit,
}: FieldProps) {
	const viewport = useRef<HTMLDivElement>(null);
	const sheet = useRef<HTMLDivElement>(null);
	const image = useRef<HTMLImageElement>(null);
	const scar = useRef<HTMLCanvasElement>(null);
	const baseline = useRef<HTMLCanvasElement>(null);
	const details = useRef<HTMLCanvasElement>(null);
	const pointer = useRef<number | null>(null);
	const [cursor, setCursor] = useState(71 * WIDTH + 48);
	const [inspecting, setInspecting] = useState(false);
	const [selection, setSelection] = useState<{
		run: Comparison;
		value: number;
	}>();
	const split = selection?.run === comparison ? selection.value : 50;
	const setSplit = (value: number) => {
		if (comparison) setSelection({ run: comparison, value });
	};
	const locked = phase === "running" || phase === "paused";
	const tick = fire?.step ?? 0;
	const reading = classes ? terrain[classes[cursor]] : undefined;
	const chance = breaks.has(cursor)
		? 0
		: ignitionChance(reading?.fuel ?? 0, weather);
	const inspected = breaks.has(cursor) ? "Aceiro" : reading?.name;
	const scene = comparison?.actual ?? fire;

	const sample = (source: HTMLImageElement) => {
		if (classes || !source.naturalWidth) return;
		const canvas = document.createElement("canvas");
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		const context = canvas.getContext("2d");
		if (!context) {
			onError();
			return;
		}
		context.drawImage(source, 0, 0, WIDTH, HEIGHT);
		onReady(
			classifyGrid(
				context.getImageData(0, 0, WIDTH, HEIGHT).data,
				WIDTH,
				HEIGHT,
			),
		);
	};
	const sampleCachedImage = useEffectEvent(() => {
		if (image.current?.complete) {
			if (image.current.naturalWidth) sample(image.current);
			else onError();
		}
	});
	useEffect(() => {
		sampleCachedImage();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: the grid is mutated in place each simulation step.
	useEffect(() => {
		const context = scar.current?.getContext("2d");
		if (context) drawScar(context, scene, readInk());
	}, [scene, tick]);

	useEffect(() => {
		const context = baseline.current?.getContext("2d");
		if (context) drawScar(context, comparison?.baseline, readInk());
	}, [comparison]);

	const renderDetail = useEffectEvent(
		(
			context: CanvasRenderingContext2D,
			now: number,
			ink: ReturnType<typeof readInk>,
		) => {
			context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
			if (!comparison) drawWind(context, now, weather, reduced, ink);
			drawMarks(
				context,
				breaks,
				comparison ? [] : foci,
				comparison ? undefined : fire,
				phase === "paused" ? 0 : now,
				ink,
			);
		},
	);
	useEffect(() => {
		const context = details.current?.getContext("2d");
		if (!context || reduced || comparison) return;
		const ink = readInk();
		let frame = 0;
		const paint = (time: number) => {
			renderDetail(context, time, ink);
			frame = requestAnimationFrame(paint);
		};
		paint(performance.now());
		return () => cancelAnimationFrame(frame);
	}, [reduced, comparison]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: redraw a still frame when the map inputs change.
	useEffect(() => {
		const context = details.current?.getContext("2d");
		if (context && (reduced || comparison)) renderDetail(context, 0, readInk());
	}, [reduced, comparison, breaks, foci, weather, tick]);

	const cellAt = (x: number, y: number) => {
		const rect = sheet.current?.getBoundingClientRect();
		if (!rect) return cursor;
		const col = clamp(
			Math.floor(((x - rect.x) * WIDTH) / rect.width),
			0,
			WIDTH - 1,
		);
		const row = clamp(
			Math.floor(((y - rect.y) * HEIGHT) / rect.height),
			0,
			HEIGHT - 1,
		);
		return row * WIDTH + col;
	};
	const track = (event: PointerEvent<HTMLButtonElement>) => {
		const cell = cellAt(event.clientX, event.clientY);
		setCursor(cell);
		setInspecting(event.pointerType === "mouse");
		if (
			pointer.current !== null &&
			pointer.current !== cell &&
			tool !== "focus"
		) {
			onEdit(pointer.current, cell);
			pointer.current = cell;
		}
	};
	const moveCursor = (event: KeyboardEvent<HTMLButtonElement>) => {
		const movement = cellKeys[event.key];
		const rect = viewport.current?.getBoundingClientRect();
		if (!movement || !rect) return;
		event.preventDefault();
		const first = cellAt(rect.left + 6, rect.top + 6);
		const last = cellAt(rect.right - 6, rect.bottom - 6);
		const x = clamp(
			(cursor % WIDTH) + movement[0],
			first % WIDTH,
			last % WIDTH,
		);
		const y = clamp(
			Math.floor(cursor / WIDTH) + movement[1],
			Math.floor(first / WIDTH),
			Math.floor(last / WIDTH),
		);
		setCursor(y * WIDTH + x);
		setInspecting(true);
	};
	const moveSplit = (event: PointerEvent<HTMLInputElement>) => {
		const bounds = viewport.current?.getBoundingClientRect();
		if (bounds)
			setSplit(
				clamp(
					Math.round(((event.clientX - bounds.left) * 100) / bounds.width),
					7,
					93,
				),
			);
	};

	const minute = 16 * 60 + tick;
	const clock = `${String(Math.floor(minute / 60) % 24).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
	return (
		<section className="ace-atlas" aria-label="Carta do terreno">
			<header className="ace-title">
				<p data-label className="ace-title-kicker">
					<span aria-hidden="true">✳</span> Aceiro{" "}
					<span className="ace-kicker-divider" /> Carta de campo
				</p>
				<h1 data-hero-title>
					O fogo lê o <em data-signal-word>vento</em>.
				</h1>
			</header>
			<div
				className="ace-map"
				data-map
				data-ready={Boolean(classes)}
				data-comparing={Boolean(comparison)}
				data-stale={stale}
				ref={viewport}
				style={{ "--split": `${split}%` } as CSSProperties}
			>
				<div className="ace-sheet" ref={sheet}>
					<img
						ref={image}
						src={artwork}
						width="1448"
						height="1086"
						alt=""
						fetchPriority="high"
						onLoad={(event) => sample(event.currentTarget)}
						onError={onError}
					/>
					<svg
						viewBox="0 0 640 480"
						className="ace-contours"
						aria-hidden="true"
					>
						{[-6, -3, 0, 3, 6, 9].map((offset) => (
							<g
								key={offset}
								transform={`translate(${offset} ${offset * 2 - 3})`}
							>
								{contourLines.map((path) => (
									<path key={path} d={path} />
								))}
							</g>
						))}
					</svg>
				</div>
				<div className="ace-scar ace-scar-actual" aria-hidden="true">
					<canvas ref={scar} width={FIELD_WIDTH} height={FIELD_HEIGHT} />
				</div>
				{comparison && (
					<div className="ace-scar ace-scar-baseline" aria-hidden="true">
						<canvas ref={baseline} width={FIELD_WIDTH} height={FIELD_HEIGHT} />
					</div>
				)}
				<div className="ace-detail-wrap" aria-hidden="true">
					<canvas
						ref={details}
						width={FIELD_WIDTH}
						height={FIELD_HEIGHT}
						className="ace-detail"
					/>
				</div>
				<div className="ace-cursor-sheet" aria-hidden="true">
					<span
						className="ace-cell"
						data-visible={inspecting}
						style={{
							left: `${(((cursor % WIDTH) + 0.5) * 100) / WIDTH}%`,
							top: `${((Math.floor(cursor / WIDTH) + 0.5) * 100) / HEIGHT}%`,
						}}
					/>
				</div>
				<button
					className="ace-field-target"
					type="button"
					aria-label="Mapa do Cerrado"
					aria-describedby="ace-map-description"
					onPointerDown={(event) => {
						if (event.button !== 0 || locked) return;
						const cell = cellAt(event.clientX, event.clientY);
						setCursor(cell);
						pointer.current = cell;
						event.currentTarget.setPointerCapture(event.pointerId);
						onEdit(cell, cell);
					}}
					onPointerMove={track}
					onLostPointerCapture={() => {
						pointer.current = null;
					}}
					onPointerLeave={() => setInspecting(false)}
					onKeyDown={moveCursor}
					onClick={(event) => {
						if (event.detail === 0 && !locked) onEdit(cursor, cursor);
					}}
					onFocus={() => setInspecting(true)}
					onBlur={() => setInspecting(false)}
				/>
				<p id="ace-map-description" className="ace-sr">
					Terreno ilustrado com campo seco, vereda, cerrado arbustivo e rocha.
					Use as setas para mover o cursor e Enter ou Espaço para aplicar a
					ferramenta.
					{` ${breaks.size} células de aceiro, ${foci.length} de 3 focos. Hora simulada ${clock}.`}
					{inspected &&
						` Célula atual: ${inspected}, ${formatNumber(chance * 100)} por cento de chance de ignição a favor do vento.`}
					{comparison &&
						" Arraste ou use as setas no controle de comparação para revelar as cicatrizes."}
				</p>
				{!comparison && phase === "ready" && (
					<ol className="ace-map-steps" aria-label="Como usar o mapa">
						<li>
							<b>1</b> Trace um aceiro
						</li>
						<li>
							<b>2</b> Marque o foco
						</li>
						<li>
							<b>3</b> Acenda
						</li>
					</ol>
				)}
				{comparison && (
					<>
						<div className="ace-compare-labels" aria-hidden="true">
							<span>Sem aceiros</span>
							<span>Com aceiros</span>
						</div>
						<div className="ace-compare-handle">
							<span aria-hidden="true">
								<ArrowsLeftRight size={19} weight="light" />
							</span>
							<input
								type="range"
								min="7"
								max="93"
								value={split}
								aria-label="Comparar sem aceiros e com aceiros"
								aria-valuetext={`${split}% do mapa revela o cenário sem aceiros`}
								onChange={(event) =>
									setSplit(event.currentTarget.valueAsNumber)
								}
								onPointerDown={(event) => {
									if (event.button !== 0) return;
									event.preventDefault();
									event.currentTarget.focus();
									event.currentTarget.setPointerCapture(event.pointerId);
									moveSplit(event);
								}}
								onPointerMove={(event) => {
									if (event.currentTarget.hasPointerCapture(event.pointerId))
										moveSplit(event);
								}}
							/>
						</div>
					</>
				)}
				<div className="ace-map-footer" aria-hidden="true">
					<span>
						<b>{clock}</b> Hora simulada
					</span>
					<span className="ace-map-scale">
						<i />
						250 m
					</span>
				</div>
				{inspecting && inspected && (
					<div className="ace-inspector" aria-hidden="true">
						<span
							className="ace-risk"
							data-level={
								chance === 0
									? "none"
									: chance < 0.12
										? "low"
										: chance < 0.35
											? "medium"
											: "high"
							}
						/>
						{inspected} <span>· {formatNumber(chance * 100)}% ignição</span>
					</div>
				)}
			</div>
		</section>
	);
}
