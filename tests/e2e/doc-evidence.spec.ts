import { expect, test } from "@playwright/test";

test("extracts evidence with source excerpts and handles empty and error states", async ({
	page,
}) => {
	const pageErrors: string[] = [];
	page.on("pageerror", (error) => pageErrors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error") pageErrors.push(message.text());
	});

	const response = await page.goto("/demos/doc-evidence");
	expect(response?.status()).toBe(200);
	await expect(page.getByRole("main")).toHaveAttribute("data-hydrated", "true");

	const textarea = page.getByRole("textbox", { name: "Texto do documento" });
	const analyze = page.getByRole("button", { name: "Analisar texto" });
	const panel = page.getByRole("region", { name: "Evidências extraídas" });

	await expect(panel).toHaveAttribute("data-state", "idle");
	await expect(analyze).toBeDisabled();

	await textarea.fill(
		"O candidato deve enviar a documentação até 30/03/2027. É obrigatório assinar em até 30 dias.",
	);
	await analyze.click();

	await expect(panel).toHaveAttribute("data-state", "success");
	await expect(panel.getByText("30/03/2027", { exact: true })).toBeVisible();
	await expect(
		panel.getByText("em até 30 dias", { exact: true }),
	).toBeVisible();
	await expect(
		panel.locator("mark").filter({ hasText: /O candidato deve enviar/ }),
	).toBeVisible();

	await textarea.fill("Texto sem datas, prazos ou obrigações.");
	await analyze.click();
	await expect(panel).toHaveAttribute("data-state", "empty");

	await textarea.fill("x".repeat(8001));
	await analyze.click();
	await expect(panel).toHaveAttribute("data-state", "error");
	await expect(panel.getByRole("alert")).toContainText("8000 caracteres");

	expect(pageErrors).toEqual([]);
});
