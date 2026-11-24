import { afterEach, beforeEach, expect, test, vi } from "vitest";

const requestState = vi.hoisted(() => ({
	headers: new Headers(),
	ip: "192.0.2.1",
}));

// Vitest does not run the Start compiler. Capture the handlers and supply a
// request context so the tests exercise the actual guard at each entry point.
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		validator: () => ({
			handler: (handler: unknown) => handler,
		}),
	}),
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () =>
		new Request("https://genesis.invalid/", { headers: requestState.headers }),
	getRequestIP: () => requestState.ip,
}));

const input = { data: { prompt: "Hello" } };
const mockToken = "MOCK-private-access-token";
const forbidden = {
	status: "failed",
	error: { code: "forbidden", retryable: false },
};
const rateLimited = {
	status: "failed",
	error: { code: "rate_limited", retryable: true },
};

beforeEach(() => {
	vi.resetModules();
	vi.stubEnv("NODE_ENV", "production");
	vi.stubEnv("AI_ENDPOINTS_ENABLED", undefined);
	vi.stubEnv("AI_ACCESS_TOKEN", mockToken);
	vi.stubEnv("OPENROUTER_API_KEY", undefined);
	requestState.headers = new Headers();
	requestState.ip = "192.0.2.1";
});

afterEach(() => vi.unstubAllEnvs());

test("all four endpoints are disabled by default even with a valid token", async () => {
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText, generateAiObject, callAiTool, streamAiText } =
		await import("../../../src/ai/server");
	for (const endpoint of [
		generateAiText,
		generateAiObject,
		callAiTool,
		streamAiText,
	]) {
		expect(await endpoint(input)).toMatchObject(forbidden);
	}
});

test.each([undefined, "MOCK-wrong-access-token", "short"])(
	"rejects absent and invalid production tokens (%s)",
	async (suppliedToken) => {
		vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
		if (suppliedToken)
			requestState.headers.set("x-genesis-ai-token", suppliedToken);
		const { generateAiText } = await import("../../../src/ai/server");
		const result = await generateAiText(input);
		expect(result).toMatchObject(forbidden);
		expect(JSON.stringify(result)).not.toContain(mockToken);
	},
);

test("rejects access when the production token is unconfigured", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	vi.stubEnv("AI_ACCESS_TOKEN", undefined);
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject(forbidden);
});

test("accepts a matching production token", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject({ status: "unavailable" });
});

test("allows enabled development endpoints without a token", async () => {
	vi.stubEnv("NODE_ENV", "development");
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	const { generateAiText } = await import("../../../src/ai/server");
	expect(await generateAiText(input)).toMatchObject({ status: "unavailable" });
});

test("limits one IP across operations while another IP can still proceed", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText, callAiTool, streamAiText } = await import(
		"../../../src/ai/server"
	);
	for (let call = 0; call < 5; call++) {
		expect(await generateAiText(input)).toMatchObject({
			status: "unavailable",
		});
	}
	expect(await streamAiText(input)).toMatchObject(rateLimited);
	requestState.ip = "192.0.2.2";
	expect(await callAiTool(input)).toMatchObject({ status: "unavailable" });
});

test("limits aggregate requests across distinct IPs", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const { generateAiText } = await import("../../../src/ai/server");
	for (let caller = 1; caller <= 30; caller++) {
		requestState.ip = `192.0.2.${caller}`;
		expect(await generateAiText(input)).toMatchObject({
			status: "unavailable",
		});
	}
	requestState.ip = "192.0.2.31";
	expect(await generateAiText(input)).toMatchObject(rateLimited);
});

test("renews the quota after one minute", async () => {
	vi.stubEnv("AI_ENDPOINTS_ENABLED", "1");
	requestState.headers.set("x-genesis-ai-token", mockToken);
	const clock = vi.spyOn(performance, "now").mockReturnValue(100);
	try {
		const { generateAiText } = await import("../../../src/ai/server");
		for (let call = 0; call < 5; call++) await generateAiText(input);
		clock.mockReturnValue(60_099);
		expect(await generateAiText(input)).toMatchObject(rateLimited);
		clock.mockReturnValue(60_100);
		expect(await generateAiText(input)).toMatchObject({
			status: "unavailable",
		});
	} finally {
		clock.mockRestore();
	}
});
