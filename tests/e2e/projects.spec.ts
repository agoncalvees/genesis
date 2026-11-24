import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("selects and previews projects using the keyboard", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Projetos", exact: true }).click();
	await expect(page).toHaveURL(/\/projetos$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
	await expect(
		page.getByRole("heading", { name: "Projetos", level: 1 }),
	).toBeVisible();
	const first = page.getByRole("radio", { name: /ISOTERMA/i });
	const second = page.getByRole("radio", { name: /Entrelaços/i });
	await expect(first).toBeEnabled();
	await expect(first).toBeChecked();
	await expect(
		page.getByRole("heading", { name: "ISOTERMA", level: 2 }),
	).toBeVisible();
	await first.focus();
	await page.keyboard.press("ArrowRight");
	await expect(second).toBeChecked();
	await expect(
		page.getByRole("heading", { name: "Entrelaços", level: 2 }),
	).toBeVisible();
	const preview = page.getByRole("img", { name: /prévia do entrelaços/i });
	await expect(preview).toBeVisible();
	await expect
		.poll(() =>
			preview.evaluate((image) => (image as HTMLImageElement).naturalWidth),
		)
		.toBeGreaterThan(0);
	await expect(
		page.getByText("bun run dev:projects", { exact: true }),
	).toBeVisible();
});

test("the stage selector fits mobile without axe violations", async ({
	page,
}) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto("/projetos");
	await expect(page.getByRole("radio", { name: /ISOTERMA/i })).toBeEnabled();
	expect(
		await page.evaluate(() => document.documentElement.scrollWidth),
	).toBeLessThanOrEqual(360);
	expect(
		(
			await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
				.analyze()
		).violations,
	).toEqual([]);
});
