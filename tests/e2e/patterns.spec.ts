import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const worlds = ["precision", "expressive", "cinematic", "civic"] as const;
const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const patternSections = [".world-editorial", ".world-ai", ".world-upload"];

async function openWorld(page: Page, world: string, width = 1440) {
	await page.setViewportSize({ width, height: 900 });
	const response = await page.goto(`/studio/worlds/${world}`);
	expect(response?.status()).toBe(200);
	await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
}

async function expectNoViolations(page: Page, include: string[]) {
	let builder = new AxeBuilder({ page }).withTags(tags);
	for (const selector of include) builder = builder.include(selector);
	const results = await builder.analyze();
	expect(
		results.violations.map(({ id, nodes }) => ({
			id,
			nodes: nodes.map((node) => node.target),
		})),
	).toEqual([]);
}

test("the catalog shows the patterns section with AI statuses, upload and resizable panels", async ({
	page,
}) => {
	await page.goto("/studio/catalog");
	await expect(page.getByRole("button", { name: "Dark theme" })).toBeEnabled();
	const patterns = page.locator("#patterns");
	await expect(
		patterns.getByRole("heading", { name: "Patterns", level: 2 }),
	).toBeVisible();
	await expect(
		patterns.getByText("Mock response — no model is called"),
	).toBeVisible();
	await expect(
		patterns.getByText("Too many requests right now.", { exact: false }),
	).toBeVisible();
	await expect(
		patterns.getByRole("group", { name: "Files to preview" }),
	).toBeVisible();
	await expect(
		patterns.getByRole("list", { name: "Execution steps" }),
	).toContainText("1.8 sec");
	const separator = patterns.getByRole("separator", {
		name: "Resize example panels",
	});
	await separator.focus();
	await page.keyboard.press("ArrowRight");
	await expect(separator).toHaveAttribute("aria-valuenow", "45");
	await expect(patterns.getByText("Tools (45%)")).toBeVisible();
	await expectNoViolations(page, ["#patterns"]);
});

test("the app nav switches to a drawer on narrow screens", async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto("/studio/catalog");
	await expect(page.getByRole("button", { name: "Dark theme" })).toBeEnabled();
	await expect(
		page.getByRole("navigation", { name: "Example navigation" }),
	).toBeHidden();
	await page.getByRole("button", { name: "Open menu" }).click();
	const drawer = page.getByRole("dialog");
	await expect(
		drawer.getByRole("navigation", { name: "Example navigation" }),
	).toBeVisible();
	await expectNoViolations(page, ['[role="dialog"]']);
	await page.keyboard.press("Escape");
	await expect(drawer).toBeHidden();
	await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
		360,
	);
});

test("precision: the mock AI flow streams, completes and links its sources", async ({
	page,
}) => {
	await openWorld(page, "precision");
	const section = page.locator(".world-ai");
	const prompt = section.getByRole("textbox", { name: "Prompt" });
	await prompt.fill("What changed?");
	await prompt.press("ControlOrMeta+Enter");
	const status = section.getByRole("status");
	await expect(status).toContainText(/Waiting|Responding/);
	const log = section.getByRole("log", { name: "Mock response" });
	await expect(log).toHaveAttribute("aria-busy", "true");
	await expect(status).toContainText("Responding");
	await expect(status).toContainText("Completed");
	await expect(log).toHaveAttribute("aria-busy", "false");
	await expect(log).toContainText("final pass kept 168 KB");
	const sources = section.getByRole("region", { name: "Sources" });
	await expect(sources.locator("mark")).toHaveCount(2);
	const citation = section.getByRole("link", {
		name: "Source 2: Synthetic log, final pass",
	});
	await citation.click();
	const target = await citation.getAttribute("href");
	expect(await page.evaluate(() => location.hash)).toBe(target);
	await expectNoViolations(page, [".world-ai"]);
});

test("cinematic: the mock AI flow can be cancelled and a retryable error offers retry", async ({
	page,
}) => {
	await openWorld(page, "cinematic");
	const section = page.locator(".world-ai");
	const prompt = section.getByRole("textbox", { name: "Prompt" });
	await prompt.press("ControlOrMeta+Enter");
	await prompt.press("Escape");
	await expect(section.getByRole("status")).toContainText("Cancelled");
	await section.getByLabel("Mock outcome").selectOption("timeout");
	await section.getByRole("button", { name: "Send" }).click();
	await expect(section.getByRole("status")).toContainText("took too long");
	await section.getByRole("button", { name: "Try again" }).click();
	await expect(section.getByRole("status")).toContainText("Completed");
});

test("expressive: upload validation reports errors in text and previews accepted files", async ({
	page,
}) => {
	await openWorld(page, "expressive", 360);
	const section = page.locator(".world-upload");
	const input = section.locator('input[type="file"]');
	await input.setInputFiles([
		{ name: "run.sh", mimeType: "text/x-sh", buffer: Buffer.from("echo hi") },
		{
			name: "big.csv",
			mimeType: "text/csv",
			buffer: Buffer.alloc(1_000_001, "a"),
		},
		{
			name: "rows.csv",
			mimeType: "text/csv",
			buffer: Buffer.from("name,value\n<b>a</b>,1\nb,2"),
		},
	]);
	const alert = section.getByRole("alert");
	await expect(alert).toContainText("“run.sh” is not an accepted type");
	await expect(alert).toContainText("“big.csv” is 1 MB; the limit is 1 MB");
	const list = section.getByRole("list", { name: "Selected files" });
	await expect(list.getByRole("listitem")).toHaveCount(1);
	await expect(list.locator("pre")).toHaveText("name,value\n<b>a</b>,1\nb,2");
	await expect(list.locator("b")).toHaveCount(0);
	await expectNoViolations(page, [".world-upload"]);
	await list.getByRole("button", { name: "Remove rows.csv" }).click();
	await expect(list).toBeHidden();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
		360,
	);
});

for (const world of worlds) {
	for (const width of [360, 1440]) {
		test(`${world} at ${width}px: pattern sections pass axe`, async ({
			page,
		}) => {
			await openWorld(page, world, width);
			await page.evaluate(() => document.fonts.ready.then(() => undefined));
			await expectNoViolations(page, patternSections);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth),
			).toBe(width);
		});
	}
}
