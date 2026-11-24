import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import {
	BarChart,
	Legend,
	LineChart,
	Sparkline,
} from "../../src/design-system";

afterEach(cleanup);

const data = [
	{ label: "Source", value: -20 },
	{ label: "Final", value: 120 },
];

test.each([BarChart, LineChart, Sparkline])(
	"chart exposes the title, description and data table",
	(Chart) => {
		const { container } = render(
			<Chart
				title="Size by pass"
				description="Two synthetic passes"
				data={data}
				unit="KB"
			/>,
		);
		const image = screen.getByRole("img", { name: "Size by pass" });
		expect(image.getAttribute("viewBox")).toMatch(/^0 0 320 /);
		expect(image.getAttribute("aria-describedby")).toBe(
			image.querySelector("desc")?.id,
		);
		const table = screen.getByRole("table", { name: "Size by pass" });
		expect(
			within(table).getByRole("columnheader", { name: "Value (KB)" }),
		).toBeTruthy();
		expect(within(table).getByRole("cell", { name: "-20" })).toBeTruthy();
		expect(within(table).getByRole("cell", { name: "120" })).toBeTruthy();
		expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
	},
);

test("bars use nonnegative widths and a tokenized highlight", () => {
	const { container } = render(
		<BarChart title="Bars" data={data} highlightLast color={5} />,
	);
	const bars = container.querySelectorAll("rect");
	expect(bars).toHaveLength(2);
	expect([...bars].every((bar) => Number(bar.getAttribute("width")) > 0)).toBe(
		true,
	);
	expect(bars[1].getAttribute("fill")).toBe("var(--data-5)");
});

test("line renders an optional area and omits non-finite points", () => {
	const { container, rerender } = render(
		<LineChart title="Trend" data={data} area />,
	);
	expect(
		container.querySelector("path[fill-opacity]")?.getAttribute("d"),
	).toMatch(/Z$/);
	rerender(
		<LineChart
			title="Trend"
			data={[{ label: "Invalid", value: Infinity }]}
			area
		/>,
	);
	expect(container.querySelector("path[fill-opacity]")).toBeNull();
	expect(container.querySelector("desc")?.textContent).toBe("No data.");
});

test("legend displays labels alongside semantic swatches", () => {
	render(<Legend items={[{ label: "Output", color: 2 }]} />);
	expect(
		within(screen.getByRole("list", { name: "Chart legend" })).getByText(
			"Output",
		),
	).toBeTruthy();
});
