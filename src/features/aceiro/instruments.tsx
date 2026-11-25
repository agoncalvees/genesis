import {
	ArrowCounterClockwise,
	Broom,
	FireSimple,
	LineSegments,
	Pause,
} from "@phosphor-icons/react";
import { animate } from "motion";
import { type PointerEvent, useEffect, useId, useRef } from "react";
import type { Weather } from "./model";

export type Tool = "break" | "focus" | "erase";
export type Phase = "ready" | "running" | "paused" | "result";
const tools = [
	{ value: "break", label: "Aceiro", Icon: LineSegments },
	{ value: "focus", label: "Foco", Icon: FireSimple },
	{ value: "erase", label: "Apagar", Icon: Broom },
] as const;

const number = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});
export const formatNumber = (value: number) => number.format(value);
export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(value, min));
const wrap = (degrees: number) => (degrees + 360) % 360;
const bearings = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
const bearing = (angle: number) => bearings[Math.round(angle / 45) % 8];

export function WeatherInstruments({
	weather,
	onChange,
	reduced,
}: {
	weather: Weather;
	onChange: (weather: Weather) => void;
	reduced: boolean;
}) {
	const windHelp = useId();
	const needle = useRef<SVGGElement>(null);
	const settling = useRef<ReturnType<typeof animate> | null>(null);
	const dragAngle = useRef(weather.angle);
	useEffect(() => () => settling.current?.stop(), []);
	const updateNeedle = (angle: number) => {
		needle.current?.setAttribute("transform", `rotate(${angle} 80 80)`);
	};
	const pointAt = (event: PointerEvent<HTMLInputElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const angle = wrap(
			(Math.atan2(
				event.clientX - rect.x - rect.width / 2,
				rect.y + rect.height / 2 - event.clientY,
			) *
				180) /
				Math.PI,
		);
		dragAngle.current = angle;
		onChange({ ...weather, angle });
	};
	const settle = () => {
		const start = dragAngle.current;
		const end = Math.round(start / 5) * 5;
		onChange({ ...weather, angle: wrap(end) });
		if (!reduced)
			settling.current = animate(start, end, {
				type: "spring",
				stiffness: 520,
				damping: 38,
				onUpdate: updateNeedle,
			});
	};

	return (
		<section
			className="ace-weather ace-section"
			aria-label="Condições do terreno"
		>
			<div className="ace-wind">
				<h2 data-label>Vento</h2>
				<p id={windHelp} className="ace-instruction">
					Gire na direção do vento.
				</p>
				<div className="ace-compass">
					<svg viewBox="0 0 160 160" aria-hidden="true">
						<circle cx="80" cy="80" r="54" />
						<circle cx="80" cy="80" r="49" className="ace-compass-inner" />
						{bearings.map((label, index) => {
							const radians = (index * Math.PI) / 4;
							return (
								<text
									key={label}
									x={80 + Math.sin(radians) * 69}
									y={80 - Math.cos(radians) * 69}
								>
									{label}
								</text>
							);
						})}
						{bearings.map((label, index) => (
							<path
								key={label}
								transform={`rotate(${index * 45} 80 80)`}
								d={
									index % 2 === 0
										? "M80 33 86 74 80 80 74 74Z M80 33V80"
										: "M80 48 84 75 80 80 76 75Z M80 48V80"
								}
								className={
									index % 2 === 0 ? "ace-compass-spoke" : "ace-compass-minor"
								}
							/>
						))}
						<g ref={needle} transform={`rotate(${weather.angle} 80 80)`}>
							<path className="ace-needle-tail" d="M74 80 80 108 86 80Z" />
							<path
								className="ace-needle"
								d="M80 29 87 80 80 86 73 80Z M80 36V80"
							/>
						</g>
						<circle cx="80" cy="80" r="3" className="ace-compass-pin" />
					</svg>
					<input
						className="ace-dial-target"
						type="range"
						min="0"
						max="359"
						value={Math.round(weather.angle) % 360}
						aria-label="Direção do vento"
						aria-valuetext={`${Math.round(weather.angle) % 360} graus, ${bearing(weather.angle)}`}
						aria-describedby={windHelp}
						onChange={(event) =>
							onChange({ ...weather, angle: event.currentTarget.valueAsNumber })
						}
						onPointerDown={(event) => {
							if (event.button !== 0) return;
							event.preventDefault();
							settling.current?.stop();
							event.currentTarget.focus();
							event.currentTarget.setPointerCapture(event.pointerId);
							pointAt(event);
						}}
						onPointerMove={(event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId))
								pointAt(event);
						}}
						onLostPointerCapture={settle}
						onKeyDown={(event) => {
							const direction =
								event.key === "ArrowLeft"
									? -15
									: event.key === "ArrowRight"
										? 15
										: 0;
							const speed =
								event.key === "ArrowUp"
									? 1
									: event.key === "ArrowDown"
										? -1
										: 0;
							if (!direction && !speed) return;
							event.preventDefault();
							settling.current?.stop();
							onChange({
								...weather,
								angle: wrap(weather.angle + direction),
								speed: clamp(weather.speed + speed, 0, 40),
							});
						}}
					/>
				</div>
				<div className="ace-wind-speed">
					<span data-reading>
						{weather.speed} <small>km/h</small>
					</span>
					<input
						type="range"
						min="0"
						max="40"
						value={weather.speed}
						aria-label="Velocidade do vento"
						aria-valuetext={`${weather.speed} quilômetros por hora`}
						onChange={(event) =>
							onChange({ ...weather, speed: event.currentTarget.valueAsNumber })
						}
					/>
				</div>
			</div>
			<div className="ace-humidity">
				<h2 data-label>Umidade</h2>
				<p className="ace-instruction">Ajuste a umidade do ar.</p>
				<div className="ace-humidity-instrument">
					<div className="ace-humidity-tube" aria-hidden="true">
						<span
							style={{ transform: `scaleY(${(weather.humidity - 10) / 70})` }}
						/>
					</div>
					<div className="ace-humidity-ticks" aria-hidden="true">
						<span>80 %</span>
						<span>60</span>
						<span>40</span>
						<span>20</span>
						<span>10</span>
					</div>
					<input
						type="range"
						min="10"
						max="80"
						value={weather.humidity}
						aria-label="Umidade relativa do ar"
						aria-valuetext={`${weather.humidity} por cento`}
						onChange={(event) =>
							onChange({
								...weather,
								humidity: event.currentTarget.valueAsNumber,
							})
						}
					/>
				</div>
				<span className="ace-humidity-reading" data-reading>
					{weather.humidity} <small>%</small>
				</span>
			</div>
		</section>
	);
}

export function Tools({
	tool,
	setTool,
	locked,
	className,
}: {
	tool: Tool;
	setTool: (value: Tool) => void;
	locked: boolean;
	className: string;
}) {
	const group = useId();
	return (
		<div
			className={className}
			role="radiogroup"
			aria-label="Ferramentas de manejo"
		>
			{tools.map(({ value, label, Icon }) => (
				<label key={value} className="ace-tool">
					<input
						type="radio"
						name={group}
						checked={tool === value}
						disabled={locked}
						onChange={() => setTool(value)}
					/>
					<span data-label>
						<Icon size={19} weight="light" aria-hidden="true" />
						{label}
					</span>
				</label>
			))}
		</div>
	);
}

export function Actions({
	phase,
	canIgnite,
	onIgnite,
	onReset,
	className,
}: {
	phase: Phase;
	canIgnite: boolean;
	onIgnite: () => void;
	onReset: () => void;
	className: string;
}) {
	const label =
		phase === "running"
			? "Pausar"
			: phase === "paused"
				? "Retomar"
				: "Acender foco";
	const Icon = phase === "running" ? Pause : FireSimple;
	return (
		<div className={className}>
			<button
				type="button"
				data-label
				data-action="ignite"
				aria-disabled={!canIgnite}
				aria-describedby="ace-ignite-help"
				onClick={onIgnite}
			>
				<Icon size={21} weight="light" aria-hidden="true" />
				<span>{label}</span>
			</button>
			<button
				type="button"
				className="ace-reset"
				onClick={onReset}
				aria-label="Recomeçar"
				title="Recomeçar"
			>
				<ArrowCounterClockwise size={21} weight="light" aria-hidden="true" />
			</button>
		</div>
	);
}
