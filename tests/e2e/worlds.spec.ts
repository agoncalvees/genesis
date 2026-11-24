import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const widths = [360, 768, 1440];
const worlds = ["precision", "expressive", "cinematic", "civic"] as const;
const desktopHeadingSizes = {
	precision: 18,
	expressive: 47.52,
	cinematic: 30,
	civic: 28,
};
const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

for (const world of worlds) {
	for (const width of widths) {
		test(`${world} at ${width}px is accessible, contained and still with reduced motion`, async ({
			page,
		}) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			const response = await page.goto(`/studio/worlds/${world}`);
			expect(response?.status()).toBe(200);
			await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				"2.4 MB → 168 KB",
			);
			await page.evaluate(() => document.fonts.ready.then(() => undefined));

			const chart = page.locator(".world-chart .ds-chart");
			await expect(chart.locator("[data-chart-label]:visible")).toHaveCount(
				world === "cinematic" ? 4 : 8,
			);
			const chartChecks = await chart.evaluate((figure) => {
				const plot = figure.getBoundingClientRect();
				const fontBase =
					Number.parseFloat(
						getComputedStyle(figure).getPropertyValue("--text-base"),
					) *
					(getComputedStyle(figure)
						.getPropertyValue("--text-base")
						.endsWith("rem")
						? Number.parseFloat(
								getComputedStyle(document.documentElement).fontSize,
							)
						: 1);
				const labels = [...figure.querySelectorAll("[data-chart-label]")].map(
					(label) => {
						const fontSize = Number.parseFloat(
							getComputedStyle(label).fontSize,
						);
						return {
							box: label.getBoundingClientRect(),
							fontSize,
							text: label.textContent,
						};
					},
				);
				const line = figure.querySelector<SVGPathElement>(".ds-chart-line");
				const matrix = line?.getScreenCTM();
				const linePoints =
					line && matrix
						? Array.from({ length: 201 }, (_, step) =>
								line
									.getPointAtLength((line.getTotalLength() * step) / 200)
									.matrixTransform(matrix),
							)
						: [];
				return labels.flatMap(({ box, fontSize, text }, index) => {
					const overlaps = labels
						.slice(index + 1)
						.some(
							({ box: other }) =>
								box.left < other.right &&
								box.right > other.left &&
								box.top < other.bottom &&
								box.bottom > other.top,
						);
					const touchesLine = linePoints.some(
						({ x, y }) =>
							x > box.left && x < box.right && y > box.top && y < box.bottom,
					);
					const inside =
						box.left > plot.left &&
						box.right < plot.right &&
						box.top > plot.top &&
						box.bottom < plot.bottom;
					return Math.abs(fontSize - fontBase * 0.75) > 0.01 ||
						!inside ||
						overlaps ||
						touchesLine
						? [text]
						: [];
				});
			});
			expect(chartChecks).toEqual([]);
			if (width === 1440) {
				const sectionSize = await page
					.locator(".world-heading")
					.first()
					.evaluate((element) =>
						Number.parseFloat(getComputedStyle(element).fontSize),
					);
				expect(sectionSize).toBeCloseTo(desktopHeadingSizes[world]);
			}
			const canvasColors = () =>
				page.evaluate(() =>
					[
						document.documentElement,
						document.body,
						document.querySelector(".world-composition"),
					].map(
						(element) => element && getComputedStyle(element).backgroundColor,
					),
				);
			const [canvas, body, composition] = await canvasColors();
			expect(canvas).toBe(composition);
			expect(body).toBe(composition);
			await expect(page.locator(".world-composition")).toHaveCSS(
				"min-block-size",
				`${width === 768 ? 1024 : 900}px`,
			);

			const results = await new AxeBuilder({ page }).withTags(tags).analyze();
			expect(
				results.violations.map(({ id, nodes }) => ({
					id,
					nodes: nodes.map((node) => node.target),
				})),
			).toEqual([]);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth),
			).toBe(width);

			await mkdir("test-results/worlds", { recursive: true });
			await page.screenshot({
				path: `test-results/worlds/${world}-${width}.png`,
				fullPage: true,
			});

			await page.keyboard.press("Tab");
			const link = page
				.getByRole("navigation", { name: "Worlds" })
				.getByRole("link", { name: "Studio", exact: true });
			await expect(link).toBeFocused();
			await expect(link).toHaveCSS("outline-width", "2px");
			await expect(link).toHaveCSS("outline-style", "solid");
			const resultButton = page.getByRole("button", { name: "Update preview" });
			await page.getByLabel("Preview state").selectOption("empty");
			await resultButton.press("Enter");
			await expect(
				page.getByRole("heading", { name: "No results" }),
			).toBeVisible();
			await expect(resultButton).toBeFocused();
			await expect(resultButton).toHaveCSS("outline-width", "2px");
			expect(
				await page.evaluate(
					() =>
						document
							.getAnimations()
							.filter(({ playState }) => playState === "running").length,
				),
			).toBe(0);

			if (world === "cinematic") {
				const toggle = page.getByRole("button", { name: "Dark mode" });
				await expect(toggle).toHaveAttribute("aria-pressed", "true");
				await toggle.click();
				await expect(toggle).toHaveAttribute("aria-pressed", "false");
				const [lightCanvas, lightBody, lightComposition] = await canvasColors();
				expect(lightCanvas).not.toBe(canvas);
				expect(lightCanvas).toBe(lightComposition);
				expect(lightBody).toBe(lightComposition);
				const light = await new AxeBuilder({ page }).withTags(tags).analyze();
				expect(light.violations.map(({ id }) => id)).toEqual([]);
			}
			expect(errors).toEqual([]);
		});
	}
}

test("two worlds have separate tokens while the surrounding page keeps its identity", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/studio/worlds");
	await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
	const outside = page.getByRole("navigation", { name: "Worlds" });
	const tokens = (element: Element) => {
		const style = getComputedStyle(element);
		return {
			primary: style.getPropertyValue("--primary"),
			face: style.fontFamily,
			duration: style.getPropertyValue("--duration-normal"),
		};
	};

	const baseline = await outside.evaluate(tokens);
	await page.getByRole("button", { name: "Compare worlds" }).click();
	await expect(page).toHaveURL(/compare=/);
	const first = page.locator('article[data-world="precision"]');
	const second = page.locator('article[data-world="expressive"]');
	await expect(first).toBeVisible();
	await expect(second).toBeVisible();
	const a = await first.evaluate(tokens);
	const b = await second.evaluate(tokens);
	expect(a.primary).not.toBe(b.primary);
	expect(a.face).not.toBe(b.face);
	expect(a.duration).not.toBe(b.duration);
	expect((await first.boundingBox())?.y).toBe((await second.boundingBox())?.y);
	expect(await outside.evaluate(tokens)).toEqual(baseline);
});

test("world fonts are requested only when the worlds are visited", async ({
	page,
}) => {
	const fontRequests: string[] = [];
	page.on("request", (request) => {
		if (request.resourceType() === "font") fontRequests.push(request.url());
	});
	const worldFont =
		/ibm-plex|bricolage|figtree|sora|jetbrains|newsreader|atkinson/i;
	for (const path of ["/", "/demos"]) {
		await page.goto(path);
		await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1);
		await page.evaluate(() => document.fonts.ready.then(() => undefined));
		expect(fontRequests.filter((url) => worldFont.test(url))).toEqual([]);
	}

	await page.goto("/studio/worlds/precision");
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	expect(fontRequests.some((url) => /ibm-plex-sans/i.test(url))).toBe(true);
});
