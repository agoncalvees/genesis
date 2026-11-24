import { expect, test } from "@playwright/test";

test("serves the neutral home page", async ({ page }) => {
	const response = await page.goto("/");

	expect(response?.status()).toBe(200);
	await expect(
		page.getByRole("heading", { name: "Application" }),
	).toBeVisible();
});

test("hydrates the smoke route without page errors", async ({ page }) => {
	const pageErrors: Error[] = [];
	page.on("pageerror", (error) => pageErrors.push(error));

	const response = await page.goto("/smoke");

	expect(response?.status()).toBe(200);
	await expect(page.getByRole("main")).toHaveAttribute("data-hydrated", "true");
	await expect(
		page.getByRole("heading", { name: "Genesis smoke" }),
	).toBeVisible();
	expect(pageErrors).toEqual([]);
});
