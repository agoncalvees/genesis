import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { AppError } from "../core/contracts";
import { useHydrated } from "../core/hydration";
import {
	Badge,
	Button,
	Card,
	Container,
	EvidenceExcerpt,
	Field,
	Heading,
	ResultPanel,
	Stack,
	Text,
	Textarea,
} from "../design-system";
import {
	type EvidenceKind,
	type ExtractedItem,
	extractEvidence,
	FIXTURE_TEXT,
} from "../features/doc-evidence";

export const Route = createFileRoute("/demos/doc-evidence")({
	head: () => ({ meta: [{ title: "Document evidence" }] }),
	component: DocEvidence,
});

const MAX_INPUT_CHARS = 8000;
const TOO_LONG: AppError = {
	code: "INPUT_TOO_LONG",
	message: `Cole até ${MAX_INPUT_CHARS} caracteres para analisar.`,
	retryable: false,
};

const KIND_LABEL: Record<EvidenceKind, string> = {
	date: "Data",
	deadline: "Prazo",
	obligation: "Obrigação",
};

const KIND_TONE: Record<EvidenceKind, "info" | "warning" | "danger"> = {
	date: "info",
	deadline: "warning",
	obligation: "danger",
};

type Analysis = { items: ExtractedItem[]; text: string };
type AnalysisState =
	| { status: "idle" }
	| { status: "completed"; data: Analysis }
	| { status: "failed"; error: AppError };

function renderAnalysis(data: Analysis) {
	return (
		<Stack className="gap-3">
			<Text muted>
				{data.items.length} item(ns) extraído(s) de {data.text.length}{" "}
				caracteres.
			</Text>
			{data.items.map((entry) => (
				<Card key={entry.id} className="grid gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<Badge tone={KIND_TONE[entry.kind]}>{KIND_LABEL[entry.kind]}</Badge>
						<Text>{entry.value}</Text>
					</div>
					<EvidenceExcerpt
						text={data.text}
						start={entry.start}
						end={entry.end}
						context={40}
						label="Trecho em destaque"
					/>
				</Card>
			))}
		</Stack>
	);
}

function DocEvidence() {
	const [text, setText] = useState("");
	const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" });
	const hydrated = useHydrated();

	function analyze() {
		if (text.length > MAX_INPUT_CHARS) {
			setAnalysis({ status: "failed", error: TOO_LONG });
			return;
		}
		setAnalysis({
			status: "completed",
			data: { items: extractEvidence(text), text },
		});
	}

	function loadFixture() {
		setText(FIXTURE_TEXT);
		setAnalysis({ status: "idle" });
	}

	return (
		<main
			lang="pt-BR"
			className="min-h-screen bg-background py-8 sm:py-12"
			data-hydrated={hydrated}
		>
			<Container className="max-w-5xl">
				<Stack className="gap-6">
					<header className="grid gap-1">
						<Heading level={1} lang="en">
							Document evidence
						</Heading>
						<Text muted>
							Cole um texto para encontrar datas, prazos e obrigações. Cada item
							mostra o trecho de origem como evidência.
						</Text>
					</header>
					<Card className="grid gap-4">
						<Field
							label="Texto do documento"
							description={`${text.length} / ${MAX_INPUT_CHARS} caracteres`}
						>
							<Textarea
								name="document-text"
								value={text}
								onChange={(event) => setText(event.target.value)}
								rows={8}
							/>
						</Field>
						<div className="flex flex-wrap gap-2">
							<Button onClick={analyze} disabled={text.trim().length === 0}>
								Analisar texto
							</Button>
							<Button variant="secondary" onClick={loadFixture}>
								Carregar edital sintético
							</Button>
						</div>
					</Card>
					<ResultPanel
						{...analysis}
						title="Evidências extraídas"
						isEmpty={(data) => data.items.length === 0}
						renderResult={renderAnalysis}
					/>
				</Stack>
			</Container>
		</main>
	);
}
