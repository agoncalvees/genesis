import { expect, type Page, test } from "@playwright/test";

const layouts = ["presentation", "application", "workspace", "focused"];
const paths = ["/catalog", ...layouts.map((name) => `/layouts/${name}`)];

async function openCatalog(page: Page) {
	await page.goto("/catalog");
	await expect(page.getByRole("button", { name: "Dark theme" })).toBeEnabled();
}

async function expectNoOverflow(page: Page) {
	const overflow = await page.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(0);
}

for (const width of [360, 768, 1440]) {
	test(`catalog and layout previews fit at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 850 });
		for (const path of paths) {
			const response = await page.goto(path);
			expect(response?.status(), path).toBe(200);
			await expect(page.getByRole("main")).toBeVisible();
			await expectNoOverflow(page);
		}
	});
}

test("all six result states are identifiable and retry returns to loading", async ({
	page,
}) => {
	await openCatalog(page);
	const panel = page.getByRole("region", { name: "Fixture result" });
	const switcher = page.getByRole("group", { name: "Fixture result state" });
	for (const label of [
		"Idle",
		"Loading",
		"Empty",
		"Success",
		"Cancelled",
		"Error",
	]) {
		await switcher.getByRole("button", { name: label, exact: true }).click();
		await expect(panel).toHaveAttribute("data-state", label.toLowerCase());
		await expect(panel.getByRole("status")).toHaveText(label);
		await expectNoOverflow(page);
	}
	await panel.getByRole("button", { name: "Retry execution" }).click();
	await expect(panel.getByRole("status")).toHaveText("Loading");
	await expect(panel.getByRole("progressbar")).not.toHaveAttribute(
		"aria-valuenow",
	);
});

test("the comparison and layout skip links are keyboard operable", async ({
	page,
}) => {
	await openCatalog(page);
	const slider = page.getByRole("slider", { name: "After image revealed" });
	await slider.focus();
	await slider.press("End");
	await expect(slider).toHaveAttribute(
		"aria-valuetext",
		"100% after, 0% before",
	);
	await slider.press("Home");
	await expect(slider).toHaveAttribute(
		"aria-valuetext",
		"0% after, 100% before",
	);
	await page
		.getByRole("link", { name: "Workspace Work surface and tools" })
		.click();
	const skip = page.getByRole("link", { name: "Skip to main content" });
	await skip.focus();
	await page.keyboard.press("Enter");
	await expect(page.getByRole("main")).toBeFocused();
});

test("an entrance animation leaves the adjacent controls clickable", async ({
	page,
}) => {
	await openCatalog(page);
	const add = page.getByRole("button", { name: "Add 12 samples" });
	await add.scrollIntoViewIfNeeded();
	const previous = await page
		.getByText("Source loaded", { exact: true })
		.elementHandle();
	// Slower token on this instance makes the race deterministic on busy CI hosts.
	await page
		.getByRole("button", { name: "Replay entrance" })
		.evaluate((button) => {
			button.closest("section")?.style.setProperty("--duration-fast", "2s");
		});
	await page.getByRole("button", { name: "Replay entrance" }).click();
	await expect
		.poll(() => previous.evaluate((element) => element.isConnected))
		.toBe(false);
	await expect
		.poll(() =>
			page.evaluate(() =>
				document
					.getAnimations()
					.some(
						(animation) =>
							animation.playState === "running" &&
							animation instanceof CSSAnimation &&
							animation.animationName === "ds-fade-in",
					),
			),
		)
		.toBe(true);
	const box = await add.boundingBox();
	if (!box) throw new Error("Missing sample control");
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
	const sampleValue = page
		.locator("p")
		.filter({ hasText: /^Samples/ })
		.locator("[aria-hidden=true]");
	await expect(sampleValue).toHaveText("12");
});

test.describe("reduced motion", () => {
	test.use({ reducedMotion: "reduce" });

	test("the catalog and previews settle without running animations", async ({
		page,
	}) => {
		await openCatalog(page);
		await page.getByRole("button", { name: "Replay entrance" }).click();
		await page.getByRole("button", { name: "Add 12 samples" }).click();
		await page
			.getByRole("tablist", { name: "Motion example views" })
			.getByRole("tab", { name: "Details" })
			.click();
		await page.getByText("Show timing details").press("Enter");
		await expect(
			page.getByText("Entrances use the fast duration token."),
		).toBeVisible();
		await page
			.getByRole("group", { name: "Fixture result state" })
			.getByRole("button", { name: "Loading", exact: true })
			.click();
		await expect(
			page.getByRole("progressbar", { name: "Fixture execution" }),
		).toBeVisible();

		async function expectSettled() {
			const running = await page.evaluate(async () => {
				await new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve)),
				);
				return document
					.getAnimations()
					.filter(({ playState }) => playState === "running").length;
			});
			expect(running).toBe(0);
		}

		await expectSettled();
		for (const path of paths.slice(1)) {
			await page.goto(path);
			await expect(page.getByRole("main")).toBeVisible();
			await expectSettled();
		}
	});
});
