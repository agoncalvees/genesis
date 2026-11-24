import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { loadDesign, renderWorld } from "../../tools/design-engine/generate";

test("rendered controls, panels and headings inherit independent world axes", async ({
	page,
}) => {
	await page.goto("/studio/catalog");
	await expect(page.getByRole("button", { name: "Dark theme" })).toBeEnabled();
	const source = readFileSync("tests/fixtures/design-neutral.md", "utf8");
	const compactDesign = loadDesign(
		source
			.replace("density: 1", "density: 0.75")
			.replace('control: "{rounded.md}"', "control: 2px"),
	).identity;
	const spaciousDesign = loadDesign(
		source
			.replace("density: 1", "density: 1.25")
			.replace('control: "{rounded.md}"', "control: 16px")
			.replace("surfaceStyle: border", "surfaceStyle: tint")
			.replace("typeScale: 1", "typeScale: 1.2")
			.replace(
				"headline:\n    fontWeight: 600",
				"headline:\n    fontWeight: 800",
			),
	).identity;
	const primary = page.getByRole("button", { name: "Primary", exact: true });
	const baseline = await primary.evaluate((button) => {
		const styles = getComputedStyle(button);
		return {
			height: styles.minHeight,
			radius: styles.borderRadius,
			color: styles.backgroundColor,
		};
	});
	await page.addStyleTag({
		content:
			renderWorld("compact-fixture", compactDesign) +
			renderWorld("spacious-fixture", spaciousDesign),
	});

	const panel = page.getByRole("heading", { name: "Heading", exact: true });
	const buttonClasses = await primary.getAttribute("class");
	const { headingClasses, panelClasses } = await panel.evaluate((heading) => ({
		headingClasses: heading.className,
		panelClasses: heading.parentElement?.parentElement?.className ?? "",
	}));

	await page.evaluate(
		({ buttonClasses, headingClasses, panelClasses }) => {
			const row = document.createElement("div");
			row.style.display = "flex";
			for (const id of ["compact-fixture", "spacious-fixture"]) {
				const scope = document.createElement("article");
				scope.dataset.world = id;
				const card = document.createElement("div");
				card.className = panelClasses;
				const heading = document.createElement("h3");
				heading.className = headingClasses;
				heading.textContent = id;
				const button = document.createElement("button");
				button.className = buttonClasses ?? "";
				button.textContent = id;
				card.append(heading, button);
				scope.append(card);
				row.append(scope);
			}
			document.querySelector("main")?.append(row);
		},
		{ buttonClasses, headingClasses, panelClasses },
	);

	const compact = page.locator('[data-world="compact-fixture"]');
	const spacious = page.locator('[data-world="spacious-fixture"]');
	await expect(compact.getByRole("button")).toHaveCSS("min-height", "30px");
	await expect(spacious.getByRole("button")).toHaveCSS("min-height", "50px");
	await expect(primary).toHaveCSS("min-height", baseline.height);
	await expect(compact.getByRole("button")).toHaveCSS("border-radius", "2px");
	await expect(spacious.getByRole("button")).toHaveCSS("border-radius", "16px");
	await expect(primary).toHaveCSS("border-radius", baseline.radius);
	await expect(compact.locator("div")).toHaveCSS("padding", "12px");
	await expect(spacious.locator("div")).toHaveCSS("padding", "20px");
	await expect(compact.locator("div")).toHaveCSS("border-top-width", "1px");
	await expect(spacious.locator("div")).toHaveCSS("border-top-width", "0px");
	await expect(compact.getByRole("heading")).toHaveCSS("font-weight", "600");
	await expect(spacious.getByRole("heading")).toHaveCSS("font-weight", "800");
	await expect(spacious.getByRole("heading")).toHaveCSS("font-size", "21.6px");

	await spacious.evaluate((scope) => {
		scope.setAttribute("data-theme", "dark");
	});
	await expect(spacious.getByRole("button")).toHaveCSS(
		"background-color",
		"rgb(250, 250, 250)",
	);
	await expect(compact.getByRole("button")).toHaveCSS(
		"background-color",
		"rgb(39, 39, 42)",
	);
	await expect(primary).toHaveCSS("background-color", baseline.color);
});

test("the catalog dialog retains its dark scrim in both schemes", async ({
	page,
}) => {
	await page.goto("/studio/catalog");
	const toggle = page.getByRole("button", { name: "Dark theme" });
	await expect(toggle).toBeEnabled();
	const opener = page.getByRole("button", { name: "Open dialog" });
	const scrim = page.locator("main[data-theme] .bg-dialog-scrim");

	await opener.click();
	await expect(
		page.getByRole("dialog", { name: "Dialog", exact: true }),
	).toBeVisible();
	const lightColor = await scrim.evaluate(
		(element) => getComputedStyle(element).backgroundColor,
	);
	await page.keyboard.press("Escape");
	await toggle.click();
	await opener.click();
	await expect(scrim).toHaveCSS("background-color", lightColor);
	await expect(scrim).toBeVisible();
});
