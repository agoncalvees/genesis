import "@tanstack/react-start/server-only";

import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createAiClient } from "./client";
import {
	AI_LIMITS,
	runStream,
	runStructured,
	runText,
	runTool,
} from "./operations";

const input = z.strictObject({
	prompt: z.string().min(1).max(AI_LIMITS.inputCharacters),
});

export const generateAiText = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		runText(createAiClient(), data.prompt, { signal: getRequest().signal }),
	);

export const generateAiObject = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		runStructured(createAiClient(), data.prompt, {
			signal: getRequest().signal,
		}),
	);

export const callAiTool = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) =>
		runTool(createAiClient(), data.prompt, { signal: getRequest().signal }),
	);

export const streamAiText = createServerFn({ method: "POST" })
	.validator(input)
	.handler(({ data }) => {
		const disconnect = new AbortController();
		const signal = AbortSignal.any([getRequest().signal, disconnect.signal]);
		const encoder = new TextEncoder();
		const client = createAiClient();
		const body = new ReadableStream<Uint8Array>({
			async start(controller) {
				const write = (event: unknown) => {
					if (!disconnect.signal.aborted) {
						controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
					}
				};

				const result = await runStream(
					client,
					data.prompt,
					(text) => write({ type: "chunk", text }),
					{ signal },
				);
				if (!disconnect.signal.aborted) {
					write({ type: "result", result });
					controller.close();
				}
			},
			cancel() {
				disconnect.abort();
			},
		});
		return new Response(body, {
			headers: {
				"Content-Type": "application/x-ndjson; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	});
