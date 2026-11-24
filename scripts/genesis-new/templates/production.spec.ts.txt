import { readdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const path of [
	"/studio",
	"/studio/catalog",
	"/studio/layouts/workspace",
	"/demos",
	"/demos/route-opt",
	"/demos/doc-evidence",
]) {
	test(`${path} is excluded from the product`, async ({ request }) => {
		const response = await request.get(path);
		expect(response.status()).toBe(404);
	});
}

test("served client JavaScript excludes server credentials", async ({
	request,
}) => {
	const assets = await readdir(".output/public", { recursive: true });
	const scripts = assets.filter((asset) => asset.endsWith(".js"));
	expect(scripts.length).toBeGreaterThan(0);

	for (const script of scripts) {
		const response = await request.get(`/${script}`);
		expect(response.ok(), script).toBe(true);
		expect(response.headers()["content-type"], script).toMatch(/javascript/);
		const source = await response.text();
		expect(
			/OPENROUTER|openrouter\.ai|AI_MODEL_|AI_ACCESS_TOKEN|x-genesis-ai-token|sk-or-v1-/i.test(
				source,
			),
			script,
		).toBe(false);
	}
});
