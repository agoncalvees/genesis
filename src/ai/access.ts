import "@tanstack/react-start/server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { getRequestIP } from "@tanstack/react-start/server";
import { createAppError, withCorrelationId } from "../core/errors";

const WINDOW_MS = 60_000;
const PER_IP_LIMIT = 5;
const GLOBAL_LIMIT = 30;

// Shared across the four endpoints within this process. Serverless instances
// have independent counters and can reset them on cold start.
let windowEndsAt = 0;
let totalRequests = 0;
const requestsByIp = new Map<string, number>();

function validToken(expected: string | undefined, supplied: string | null) {
	if (!expected?.trim() || !supplied) return false;

	// Fixed-size digests let timingSafeEqual compare even different token lengths.
	const expectedDigest = createHash("sha256").update(expected).digest();
	const suppliedDigest = createHash("sha256").update(supplied).digest();
	return timingSafeEqual(expectedDigest, suppliedDigest);
}

export function checkAiAccess(request: Request) {
	if (
		process.env.AI_ENDPOINTS_ENABLED !== "1" ||
		(process.env.NODE_ENV === "production" &&
			!validToken(
				process.env.AI_ACCESS_TOKEN,
				request.headers.get("x-genesis-ai-token"),
			))
	) {
		return {
			status: "failed" as const,
			error: createAppError(
				"forbidden",
				"AI endpoint access is forbidden.",
				false,
			),
			correlationId: withCorrelationId(),
		};
	}

	const now = performance.now();
	if (now >= windowEndsAt) {
		windowEndsAt = now + WINDOW_MS;
		totalRequests = 0;
		requestsByIp.clear();
	}

	const ip =
		getRequestIP({ xForwardedFor: process.env.VERCEL === "1" }) ?? "unknown";
	const ipRequests = requestsByIp.get(ip) ?? 0;
	if (totalRequests >= GLOBAL_LIMIT || ipRequests >= PER_IP_LIMIT) {
		return {
			status: "failed" as const,
			error: createAppError(
				"rate_limited",
				"AI request limit reached. Try again later.",
				true,
			),
			correlationId: withCorrelationId(),
		};
	}

	totalRequests++;
	requestsByIp.set(ip, ipRequests + 1);
}
