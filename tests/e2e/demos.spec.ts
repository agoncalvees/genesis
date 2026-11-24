import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("navigates from home to both rehearsals", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("main")).toHaveAttribute("data-hydrated", "true");
	await page.getByRole("link", { name: "Demos" }).click();
	await expect(page).toHaveURL("/demos");
	await expect(page.getByText("6.8 min")).toBeVisible();
	await expect(page.getByText("10.6 min")).toBeVisible();
	await page.getByRole("link", { name: "Route comparison" }).click();
	await expect(page).toHaveURL("/demos/route-opt");
	await page.goBack();
	await page.getByRole("link", { name: "Document evidence" }).click();
	await expect(page).toHaveURL("/demos/doc-evidence");
});

for (const width of [360, 1440]) {
	for (const path of [
		"/",
		"/demos",
		"/demos/route-opt",
		"/demos/doc-evidence",
	]) {
		test(`${path} has no axe violations or overflow at ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			expect((await page.goto(path))?.status()).toBe(200);
			await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
			if (path.endsWith("doc-evidence")) {
				await page
					.getByRole("button", { name: "Carregar edital sintético" })
					.click();
				await page.getByRole("button", { name: "Analisar texto" }).click();
				await expect(page.locator("mark").first()).toBeVisible();
			}
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth),
			).toBe(width);
			const audit = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(audit.violations).toEqual([]);
		});
	}
}
