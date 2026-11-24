import { readdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const studioDisabled = process.env.VITE_STUDIO_DISABLED === "1";
const studioPaths = ["/studio", "/studio/catalog", "/studio/layouts/workspace"];

for (const path of [
	"/",
	"/demos",
	"/demos/route-opt",
	"/demos/doc-evidence",
	...studioPaths,
]) {
	test(`${path} serves and hydrates with the configured Studio policy`, async ({
		page,
	}) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") errors.push(message.text());
		});
		const response = await page.goto(path);
		const hidden = studioDisabled && studioPaths.includes(path);
		expect(response?.status()).toBe(hidden ? 404 : 200);
		expect(new URL(page.url()).pathname).toBe(path);
		if (!hidden) {
			await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
			expect(errors).toEqual([]);
		}
		if (path === "/") {
			await expect(page.getByRole("link", { name: "Studio" })).toHaveCount(
				studioDisabled ? 0 : 1,
			);
		}
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
		if (studioDisabled) {
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
	}
});
