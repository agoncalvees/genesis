import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const mapControl = (page: Page) =>
	page.getByRole("button", { name: "Mapa do Cerrado" });
const ignite = (page: Page) =>
	page.getByRole("button", { name: "Acender foco" });
const comparison = (page: Page) =>
	page.getByRole("slider", { name: "Comparar sem aceiros e com aceiros" });

async function openField(page: Page) {
	await page.goto("/");
	await expect(page.locator("[data-map]")).toHaveAttribute(
		"data-ready",
		"true",
	);
	await expect(page.getByRole("main")).toHaveAttribute("data-hydrated", "true");
}

async function markFocus(page: Page) {
	await page.getByRole("radio", { name: "Foco" }).press("Space");
	await mapControl(page).press("Enter");
	await expect(ignite(page)).toBeEnabled();
}

test("traça aceiro, marca foco, acende e compara com teclado", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openField(page);
	await mapControl(page).press("Enter");
	await expect(mapControl(page)).toHaveAccessibleDescription(
		/1 células de aceiro/,
	);
	await mapControl(page).press("ArrowRight");
	await mapControl(page).press("Space");
	await expect(mapControl(page)).toHaveAccessibleDescription(
		/2 células de aceiro/,
	);
	await mapControl(page).press("ArrowRight");
	await markFocus(page);
	await ignite(page).press("Enter");
	await expect(comparison(page)).toBeVisible();
	await expect(comparison(page)).toHaveValue("50");
	await comparison(page).press("ArrowLeft");
	await expect(comparison(page)).toHaveValue("49");
	await expect(page.locator(".ace-results dd")).toHaveCount(3);
	for (const reading of await page.locator(".ace-results dd").all()) {
		await expect(reading).toHaveText(/[0-9][0-9.,]* ha/);
	}
});

test("explica por que a ignição pede um foco", async ({ page }) => {
	await openField(page);
	await expect(ignite(page)).toBeDisabled();
	await expect(ignite(page)).toHaveAccessibleDescription(
		"Marque um foco no mapa para acender.",
	);
	await ignite(page).press("Enter");
	await expect(ignite(page)).toHaveAccessibleDescription(
		"Marque um foco no mapa antes de acender.",
	);
});

test("mantém a comparação e sinaliza que uma mudança tornou o resultado desatualizado", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openField(page);
	await markFocus(page);
	await ignite(page).click();
	const direction = page.getByRole("slider", { name: "Direção do vento" });
	await direction.press("ArrowRight");
	await expect(direction).toHaveValue("60");
	await expect(page.getByText("Resultado desatualizado")).toBeVisible();
	await expect(comparison(page)).toBeVisible();
});

test("reduz o movimento e revela o resultado imediatamente em 50%", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openField(page);
	await markFocus(page);
	await ignite(page).click();
	await expect(comparison(page)).toHaveValue("50", { timeout: 1500 });
	await expect(page.locator(".ace-scar-baseline")).toHaveCSS(
		"transition-duration",
		"0s",
	);
	await expect(
		page.getByText(/Simulação concluída\. Área queimada/),
	).toBeAttached();
});

test("pausa e retoma a frente de fogo no modo animado", async ({ page }) => {
	await openField(page);
	await markFocus(page);
	await ignite(page).click();
	await page.getByRole("button", { name: "Pausar" }).click();
	await expect(page.getByText("Simulação pausada.")).toBeAttached();
	await page
		.getByRole("slider", { name: "Umidade relativa do ar" })
		.press("ArrowUp");
	await page.getByRole("button", { name: "Retomar" }).click();
	await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
	await page.getByRole("button", { name: "Recomeçar" }).click();
	await expect(ignite(page)).toBeDisabled();
});

for (const width of [360, 768, 1440]) {
	test(`mapa e instrumentos cabem em ${width} px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await openField(page);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(width);
	});
}

test("o axe não encontra violações antes ou depois da simulação", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openField(page);
	expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
	await markFocus(page);
	await ignite(page).click();
	await expect(comparison(page)).toBeVisible();
	expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
