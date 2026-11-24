import { readdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const path of [
	"/studio",
	"/studio/catalog",
	"/studio/layouts/workspace",
]) {
	test(`${path} returns 404 on direct navigation`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.status()).toBe(404);
		expect(new URL(page.url()).pathname).toBe(path);
	});
}

test("served client JavaScript excludes Studio demos and OPENROUTER", async ({
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
		expect(source.includes("OPENROUTER"), script).toBe(false);
		expect(
			source.includes("Design system primitives and interaction states."),
			script,
		).toBe(false);
		expect(
			source.includes(
				"A central work surface with optional tools and an inspector.",
			),
			script,
		).toBe(false);
	}
});
