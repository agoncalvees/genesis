import type { Source } from "../../design-system";

/**
 * MOCK — Studio fixture only. Emits a fixed synthetic answer word by word.
 * It never calls a model, the network or `src/ai`.
 */
export const MOCK_LABEL = "Mock response — no model is called";

const mockSource =
	"Synthetic log • Pass 1 reduced the source to 1,080 KB. Pass 2 reached 420 KB. The final pass retained 168 KB from a 2,400 KB source.";

export const mockSources: readonly Source[] = [
	{
		id: "pass-2",
		title: "Synthetic log, pass 2",
		text: mockSource,
		start: mockSource.indexOf("Pass 2 reached 420 KB"),
		end:
			mockSource.indexOf("Pass 2 reached 420 KB") +
			"Pass 2 reached 420 KB".length,
	},
	{
		id: "final",
		title: "Synthetic log, final pass",
		text: mockSource,
		start: mockSource.indexOf("retained 168 KB"),
		end: mockSource.indexOf("retained 168 KB") + "retained 168 KB".length,
	},
];

const answer =
	"The output shrank in three passes. The second pass reached 420 KB, and the final pass kept 168 KB.";

export async function* mockStream(
	signal: AbortSignal,
	delayMs = 40,
): AsyncGenerator<string> {
	await wait(delayMs * 4, signal);
	for (const word of answer.split(/(?<= )/)) {
		await wait(delayMs, signal);
		yield word;
	}
}

function wait(ms: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) return reject(signal.reason);
		const timer = setTimeout(resolve, ms);
		signal.addEventListener(
			"abort",
			() => {
				clearTimeout(timer);
				reject(signal.reason);
			},
			{ once: true },
		);
	});
}
