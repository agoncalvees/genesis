import { createFileRoute, Link } from "@tanstack/react-router";
import { useHydrated } from "../core/hydration";
import { Container, Grid, Heading, Text } from "../design-system";

export const Route = createFileRoute("/demos/")({
	head: () => ({ meta: [{ title: "Demos · Genesis" }] }),
	component: Demos,
});

const demos = [
	{
		to: "/demos/route-opt",
		title: "Route comparison",
		description:
			"Compare a distância na ordem de entrada com a de uma rota calculada por heurística.",
		execution: "Cálculo de rota e distância no navegador.",
		fixture: "18 coordenadas geradas com a seed 20261124.",
		elapsed: "6.8 min",
	},
	{
		to: "/demos/doc-evidence",
		title: "Document evidence",
		description:
			"Encontre datas, prazos e obrigações em texto em português e confira os trechos de origem.",
		execution: "Extração por regras no navegador, sem chamadas de IA.",
		fixture: "Edital fictício escrito para o ensaio.",
		elapsed: "10.6 min",
	},
] as const;

function Demos() {
	const hydrated = useHydrated();
	return (
		<main lang="pt-BR" className="py-10 sm:py-16" data-hydrated={hydrated}>
			<Container className="grid max-w-5xl gap-8">
				<header className="grid gap-2">
					<Heading level={1}>Demos</Heading>
					<Text muted>
						Dois ensaios locais realizados na fase 07 do Genesis.
					</Text>
				</header>
				<Grid>
					{demos.map((demo) => (
						<article
							key={demo.to}
							className="grid content-start gap-4 rounded-lg border border-border bg-surface-raised p-5 sm:p-6"
						>
							<div className="grid gap-2">
								<Heading>
									<Link
										lang="en"
										className="underline underline-offset-4"
										to={demo.to}
									>
										{demo.title}
									</Link>
								</Heading>
								<Text muted>{demo.description}</Text>
							</div>
							<dl className="grid gap-3 border-t border-border pt-4 text-sm">
								<div>
									<dt className="font-medium">Execução real</dt>
									<dd className="text-muted">{demo.execution}</dd>
								</div>
								<div>
									<dt className="font-medium">Dados sintéticos</dt>
									<dd className="text-muted">{demo.fixture}</dd>
								</div>
								<div>
									<dt className="font-medium">Tempo de construção no ensaio</dt>
									<dd className="text-muted">{demo.elapsed}</dd>
								</div>
							</dl>
						</article>
					))}
				</Grid>
			</Container>
		</main>
	);
}
