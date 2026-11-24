import {
	ArrowLeftIcon,
	ArrowUpRightIcon,
	CheckIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useHydrated } from "../core/hydration";
import { projects } from "../projects/catalog";
import "../projects/selector.css";

export const Route = createFileRoute("/projetos")({
	head: () => ({ meta: [{ title: "Projetos · Genesis" }] }),
	staticData: { language: "pt-BR" },
	component: ProjectsPage,
});

const canLaunch =
	import.meta.env.DEV && import.meta.env.VITE_GENESIS_LOCAL_PROJECTS === "1";

function ProjectsPage() {
	const [selected, setSelected] = useState(0);
	const hydrated = useHydrated();
	const project = projects[selected];

	return (
		<main
			className="project-selector"
			data-theme="dark"
			data-hydrated={hydrated}
		>
			<div className="project-shell">
				<nav aria-label="Genesis" className="project-top">
					<Link to="/" className="project-back">
						<ArrowLeftIcon aria-hidden="true" />
						Genesis
					</Link>
				</nav>

				<header className="project-heading">
					<h1>Projetos</h1>
					<p>Escolha uma fase para conhecer a experiência.</p>
				</header>

				<fieldset className="phase-picker" disabled={!hydrated}>
					<legend className="sr-only">Selecionar fase</legend>
					{projects.map((item, index) => (
						<label
							key={item.id}
							className="phase-choice"
							data-project={item.id}
						>
							<input
								className="sr-only"
								type="radio"
								name="project"
								checked={selected === index}
								onChange={() => setSelected(index)}
							/>
							<span className="phase-index" aria-hidden="true">
								{String(index + 1).padStart(2, "0")}
							</span>
							<span className="phase-name">{item.name}</span>
							{selected === index && (
								<CheckIcon
									className="phase-check"
									aria-hidden="true"
									weight="bold"
								/>
							)}
						</label>
					))}
				</fieldset>

				<section
					className="phase-stage"
					data-project={project.id}
					aria-labelledby="phase-title"
				>
					<figure className="phase-preview">
						<img
							src={project.preview}
							alt={project.previewAlt}
							width={1120}
							height={700}
						/>
					</figure>
					<div className="phase-story">
						<p className="phase-category">{project.category}</p>
						<h2 id="phase-title">{project.name}</h2>
						<p className="phase-description">{project.description}</p>
						{canLaunch ? (
							<a
								className="phase-launch"
								href={`http://127.0.0.1:${project.port}/`}
								target="_blank"
								rel="noreferrer"
							>
								Abrir projeto
								<span className="sr-only">: {project.name} (em nova aba)</span>
								<ArrowUpRightIcon aria-hidden="true" weight="bold" />
							</a>
						) : (
							<p className="phase-command">
								Para abrir os projetos localmente, execute{" "}
								<code>bun run dev:projects</code>.
							</p>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
