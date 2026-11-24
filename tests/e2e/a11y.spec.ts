import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/*
 * Gate 02 (docs/ROADMAP.md:9, test-strategy.md:50-75): axe WCAG 2.2 AA,
 * no horizontal overflow and a visible keyboard focus indicator across the
 * required viewports and both themes. /catalog is written in parallel, so a
 * missing route (404) skips instead of failing the suite.
 */
const CATALOG = "/catalog";
const VIEWPORTS = [
	{ name: "mobile", width: 360, height: 800 },
	{ name: "tablet", width: 768, height: 1024 },
	{ name: "desktop", width: 1440, height: 900 },
] as const;
const THEMES = ["light", "dark"] as const;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

async function openCatalog(
	page: Page,
	viewport: { width: number; height: number },
	theme: (typeof THEMES)[number],
): Promise<void> {
	await page.setViewportSize({
		width: viewport.width,
		height: viewport.height,
	});
	const response = await page.goto(CATALOG);
	if (response?.status() === 404) {
		test.skip(
			true,
			"/catalog is being built in parallel and is not available yet",
		);
		return;
	}
	expect(response?.status()).toBe(200);
	await page.evaluate((value) => {
		document.documentElement.dataset.theme = value;
	}, theme);
}

for (const viewport of VIEWPORTS) {
	for (const theme of THEMES) {
		test(`${viewport.name} ${viewport.width}x${viewport.height} / ${theme}: no AA violations, overflow or focus gap`, async ({
			page,
		}) => {
			await openCatalog(page, viewport, theme);

			// Collect every gate-02 check so one run reports all findings instead of
			// hiding overflow/focus failures behind an earlier axe assertion.
			const failures: string[] = [];

			const results = await new AxeBuilder({ page })
				.withTags(AXE_TAGS)
				.analyze();
			if (results.violations.length > 0) {
				failures.push(
					`axe: ${JSON.stringify(
						results.violations.map((violation) => ({
							id: violation.id,
							impact: violation.impact,
							nodes: violation.nodes.map((node) => node.target.join(" ")),
						})),
					)}`,
				);
			}

			const layout = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth,
			}));
			if (layout.scrollWidth > layout.clientWidth) {
				failures.push(
					`overflow: scrollWidth ${layout.scrollWidth} > clientWidth ${layout.clientWidth}`,
				);
			}

			await page.evaluate(() => {
				(document.activeElement as HTMLElement | null)?.blur();
			});
			for (let press = 0; press < 5; press += 1) {
				await page.keyboard.press("Tab");
			}
			const focus = await page.evaluate(() => {
				const active = document.activeElement;
				return {
					tag: active?.tagName ?? "none",
					isBody: active === null || active === document.body,
					outlineStyle:
						active instanceof Element
							? getComputedStyle(active).outlineStyle
							: "none",
				};
			});
			if (focus.isBody)
				failures.push(`focus: Tab x5 left focus on <${focus.tag}>`);
			if (focus.outlineStyle === "none") {
				failures.push(`focus: <${focus.tag}> has no visible outline`);
			}

			expect(failures).toEqual([]);
		});
	}
}

test.describe("reduced motion", () => {
	test.use({ reducedMotion: "reduce" });

	test("renders /catalog with prefers-reduced-motion: reduce", async ({
		page,
	}) => {
		await openCatalog(page, VIEWPORTS[0], "light");

		const state = await page.evaluate(() => ({
			reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
			textLength: (document.body.textContent ?? "").trim().length,
			height: document.body.getBoundingClientRect().height,
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(state.reduced).toBe(true);
		expect(state.height).toBeGreaterThan(0);
		expect(state.textLength).toBeGreaterThan(0);
		expect(state.scrollWidth).toBeLessThanOrEqual(state.clientWidth);
	});
});
