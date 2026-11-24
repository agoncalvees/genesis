import { expect, test } from "@playwright/test";

test("the Studio opens the existing component catalog", async ({ page }) => {
	const response = await page.goto("/studio");
	expect(response?.status()).toBe(200);
	await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
	await page.getByRole("link", { name: "Component catalog" }).click();
	await expect(page).toHaveURL("/studio/catalog");
	await expect(
		page.getByRole("heading", { name: "Component catalog" }),
	).toBeVisible();
});
