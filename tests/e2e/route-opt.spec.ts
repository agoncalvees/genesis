import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("compares routes, explains invalid input and restores the synthetic fixture", async ({
	page,
}) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error") errors.push(message.text());
	});
	await page.goto("/demos/route-opt");
	await expect(
		page.getByRole("heading", { name: "Route comparison", exact: true }),
	).toBeVisible();
	await expect(
		page.getByRole("img", { name: "Input order map" }),
	).toHaveAccessibleDescription(/square marks the starting point/);
	await expect(
		page.getByText(/Synthetic data · seed 20261124 · 18 points/),
	).toBeVisible();

	const coordinates = page.getByRole("textbox", { name: "Coordinates" });
	const compare = page.getByRole("button", { name: "Compare routes" });
	await coordinates.fill("0, 0\ninvalid");
	await compare.click();
	await expect(page.getByRole("alert")).toContainText("Line 2");
	await expect(coordinates).toHaveAttribute("aria-invalid", "true");

	await coordinates.fill("0, 0\n3, 4\n0, 4");
	await coordinates.press("Tab");
	await expect(compare).toBeFocused();
	await compare.press("Enter");
	await expect(page.getByText("Entered coordinates · 3 points")).toBeVisible();
	await expect(page.getByText("12.5%")).toBeVisible();
	await expect(page.getByText("Visit order · 1 → 2 → 3")).toBeVisible();
	await expect(page.getByText("Visit order · 1 → 3 → 2")).toBeVisible();
	await expect(page.getByRole("alert")).toHaveCount(0);

	await page.getByRole("button", { name: "Load synthetic points" }).click();
	await expect(
		page.getByText(/Synthetic data · seed 20261124 · 18 points/),
	).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
		360,
	);
	const audit = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
		.analyze();
	expect(audit.violations).toEqual([]);
	expect(errors).toEqual([]);
});
