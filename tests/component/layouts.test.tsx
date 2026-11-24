import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import {
	ApplicationLayout,
	FocusedLayout,
	PresentationLayout,
	WorkspaceLayout,
} from "../../src/layouts";

afterEach(cleanup);

test.each([
	ApplicationLayout,
	FocusedLayout,
	PresentationLayout,
	WorkspaceLayout,
])("%p provides optional landmarks and a skip target", (Layout) => {
	render(
		<Layout header="Header" footer="Footer">
			<h1>Preview</h1>
		</Layout>,
	);
	const main = screen.getByRole("main");
	expect(
		screen
			.getByRole("link", { name: "Skip to main content" })
			.getAttribute("href"),
	).toBe(`#${main.id}`);
	expect(main.tabIndex).toBe(-1);
	expect(screen.getByRole("banner").textContent).toBe("Header");
	expect(screen.getByRole("contentinfo").textContent).toBe("Footer");
});

test("application and workspace expose distinct landmarks for their optional slots", () => {
	const { rerender } = render(
		<ApplicationLayout navigation="Menu">Content</ApplicationLayout>,
	);
	expect(
		screen.getByRole("navigation", { name: "Application" }).textContent,
	).toBe("Menu");
	rerender(
		<WorkspaceLayout tools="Tools" inspector="Inspector">
			Content
		</WorkspaceLayout>,
	);
	expect(
		screen.getByRole("complementary", { name: "Workspace tools" }).textContent,
	).toBe("Tools");
	expect(
		screen.getByRole("complementary", { name: "Workspace inspector" })
			.textContent,
	).toBe("Inspector");
});
