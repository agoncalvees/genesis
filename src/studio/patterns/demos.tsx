import { useEffect, useId, useRef, useState } from "react";
import type { AppError } from "../../core/contracts";
import {
	AiStatus,
	type AiStatusValue,
	Badge,
	Citation,
	FadeIn,
	Figure,
	FileDrop,
	FileList,
	Kicker,
	Lede,
	PromptComposer,
	PullQuote,
	SourceList,
	StreamingText,
} from "../../design-system";
import { MOCK_LABEL, mockSources, mockStream } from "./ai-mock";

type HeadingLevel = 3 | 4;
type MockOutcome = "completed" | "rate_limited" | "timeout";

const mockErrors: Record<Exclude<MockOutcome, "completed">, AppError> = {
	rate_limited: {
		code: "rate_limited",
		message: "Mock rate limit.",
		retryable: true,
	},
	timeout: { code: "timeout", message: "Mock timeout.", retryable: true },
};

/** Studio demo: composes the AI patterns around a labelled MOCK stream. */
export function AiDemo({
	headingLevel = 3,
	delayMs,
}: {
	headingLevel?: HeadingLevel;
	delayMs?: number;
}) {
	const idPrefix = `src${useId().replace(/[^\w]/g, "")}`;
	const [prompt, setPrompt] = useState("Summarize the size change.");
	const [lastPrompt, setLastPrompt] = useState("");
	const [outcome, setOutcome] = useState<MockOutcome>("completed");
	const [status, setStatus] = useState<AiStatusValue>("idle");
	const [text, setText] = useState("");
	const [error, setError] = useState<AppError>();
	const controller = useRef<AbortController>(null);

	useEffect(() => () => controller.current?.abort(), []);

	async function run(value: string, mode: MockOutcome = outcome) {
		controller.current?.abort();
		const current = new AbortController();
		controller.current = current;
		setLastPrompt(value);
		setText("");
		setError(undefined);
		setStatus("running");
		try {
			let first = true;
			for await (const chunk of mockStream(current.signal, delayMs)) {
				if (mode !== "completed") throw mockErrors[mode];
				if (first) setStatus("streaming");
				first = false;
				setText((previous) => previous + chunk);
			}
			setStatus("completed");
		} catch (reason) {
			if (current.signal.aborted) {
				if (controller.current === current) setStatus("cancelled");
				return;
			}
			setError(reason as AppError);
			setStatus("failed");
		}
	}

	const running = status === "running" || status === "streaming";
	return (
		<div className="grid min-w-0 gap-4 text-start">
			<p className="flex flex-wrap items-center gap-2 text-ds-xs text-muted">
				<Badge tone="warning">Mock</Badge>
				{MOCK_LABEL}
			</p>
			<PromptComposer
				label="Prompt"
				value={prompt}
				onChange={setPrompt}
				onSubmit={(value) => run(value)}
				onCancel={() => controller.current?.abort()}
				running={running}
				maxLength={280}
			/>
			<label className="grid gap-1.5 text-ds-sm font-medium">
				Mock outcome
				<select
					className="min-h-control w-full rounded-control border border-control-border bg-surface-raised px-3 text-foreground"
					value={outcome}
					disabled={running}
					onChange={(event) =>
						setOutcome(event.currentTarget.value as MockOutcome)
					}
				>
					<option value="completed">Completed with sources</option>
					<option value="rate_limited">Rate limited</option>
					<option value="timeout">Timeout</option>
				</select>
			</label>
			<AiStatus
				status={status}
				error={error}
				onRetry={() => {
					setOutcome("completed");
					void run(lastPrompt, "completed");
				}}
			/>
			<StreamingText
				text={text}
				streaming={status === "streaming"}
				label="Mock response"
				placeholder={
					<span className="text-muted">The response appears here.</span>
				}
			/>
			{status === "completed" && (
				<FadeIn duration="slow" className="grid min-w-0 gap-4">
					<p className="text-ds-sm">
						Cited:{" "}
						{mockSources.map((source, index) => (
							<Citation
								key={source.id}
								index={index + 1}
								source={source}
								idPrefix={idPrefix}
							/>
						))}
					</p>
					<SourceList
						sources={mockSources}
						idPrefix={idPrefix}
						headingLevel={(headingLevel + 1) as 4 | 5}
					/>
				</FadeIn>
			)}
		</div>
	);
}

export function UploadDemo() {
	const [files, setFiles] = useState<File[]>([]);
	return (
		<div className="grid min-w-0 gap-4 text-start">
			<FileDrop
				label="Files to preview"
				description="Previews stay in this browser; nothing is uploaded."
				accept={[".csv", ".txt", "image/png", "image/jpeg"]}
				maxSize={1_000_000}
				maxFiles={3}
				existing={files.length}
				onFiles={(added) => setFiles((current) => [...current, ...added])}
			/>
			<FileList
				files={files}
				onRemove={(index) =>
					setFiles((current) =>
						current.filter((_, position) => position !== index),
					)
				}
			/>
		</div>
	);
}

export function EditorialDemo({
	headingLevel = 3,
}: {
	headingLevel?: HeadingLevel;
}) {
	const Heading = `h${headingLevel}` as const;
	return (
		<div className="grid min-w-0 gap-5">
			<div className="grid gap-2">
				<Kicker>Synthetic analysis</Kicker>
				<Heading className="font-display text-ds-2xl font-ds-heading">
					Three passes, one result
				</Heading>
			</div>
			<Lede>
				Each pass removed redundant data. The largest step came first; later
				passes refined what remained.
			</Lede>
			<PullQuote cite="Synthetic log, final pass">
				The final pass retained 168 KB from a 2,400 KB source.
			</PullQuote>
			<Figure
				caption="Relative output size after each pass."
				credit="Genesis Studio"
				licence="Synthetic fixture, project-owned"
			>
				<svg
					role="img"
					aria-label="Bars shrinking from full width to 7 percent"
					viewBox="0 0 320 96"
					className="w-full bg-surface text-primary"
				>
					{[100, 45, 17.5, 7].map((share, index) => (
						<rect
							key={share}
							x="12"
							y={12 + index * 20}
							width={(296 * share) / 100}
							height="12"
							rx="2"
							fill="currentColor"
						/>
					))}
				</svg>
			</Figure>
		</div>
	);
}
