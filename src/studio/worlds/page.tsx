import { createLazyFileRoute, Link } from "@tanstack/react-router";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "@fontsource-variable/sora";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/newsreader";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./worlds.css";
import { Button, Container } from "../../design-system";
import { WorldComposition, type WorldId, worlds } from "./composition";

export const WorldsRoute = createLazyFileRoute("/studio/worlds/")({
	component: WorldIndex,
});
export const WorldRoute = createLazyFileRoute("/studio/worlds/$id")({
	component: WorldDetail,
});

const worldIds = Object.keys(worlds) as WorldId[];

function WorldNavigation() {
	return (
		<nav className="world-navigation" aria-label="Worlds">
			<Link to="/studio">Studio</Link>
			<Link to="/studio/worlds" search={{}}>
				Worlds
			</Link>
			{worldIds.map((id) => (
				<Link key={id} to="/studio/worlds/$id" params={{ id }}>
					{worlds[id].name}
				</Link>
			))}
		</nav>
	);
}

function WorldDetail() {
	const { id } = WorldRoute.useLoaderData();
	return (
		<main className="world-detail">
			<WorldNavigation />
			<WorldComposition key={id} id={id} />
		</main>
	);
}

function WorldIndex() {
	const { pair: compare } = WorldsRoute.useLoaderData();
	const [first, second] = compare ?? ["precision", "expressive"];
	const navigate = WorldsRoute.useNavigate();
	return (
		<main>
			<WorldNavigation />
			<Container className="grid gap-6 py-8">
				<header className="grid gap-3">
					<h1 className="text-ds-4xl font-ds-display tracking-display">
						Genesis Worlds
					</h1>
					<p className="max-w-prose text-muted">
						Four ways to present the same synthetic analysis.
					</p>
				</header>
				{!compare && (
					<ul className="world-index">
						{worldIds.map((id) => (
							<li
								key={id}
								data-world={id}
								data-theme={id === "cinematic" ? "dark" : "light"}
								className="world-index-card"
							>
								<Link to="/studio/worlds/$id" params={{ id }}>
									<h2>{worlds[id].name}</h2>
									<p>{worlds[id].description}</p>
								</Link>
							</li>
						))}
					</ul>
				)}
				<form
					className="world-selector"
					onSubmit={(event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						void navigate({
							search: {
								compare: [form.get("first"), form.get("second")].join(","),
							},
						});
					}}
				>
					{[
						{ label: "First world", name: "first", id: first },
						{ label: "Second world", name: "second", id: second },
					].map((field) => (
						<label
							key={field.name}
							className="grid gap-2 text-ds-sm font-medium"
						>
							{field.label}
							<select
								id={field.name}
								name={field.name}
								defaultValue={field.id}
								className="min-h-control rounded-control border border-control-border bg-surface-raised px-3"
							>
								{worldIds.map((id) => (
									<option key={id} value={id}>
										{worlds[id].name}
									</option>
								))}
							</select>
						</label>
					))}
					<Button type="submit">Compare worlds</Button>
				</form>
			</Container>
			{compare && (
				<div className="world-comparison">
					<WorldComposition key={`first-${first}`} id={first} preview />
					<WorldComposition key={`second-${second}`} id={second} preview />
				</div>
			)}
		</main>
	);
}
