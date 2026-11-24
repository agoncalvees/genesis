import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { ExecutionStatus } from "../../src/core/contracts";
import {
	AnimatedNumber,
	AnimatedTabsIndicator,
	BeforeAfter,
	EvidenceExcerpt,
	Expandable,
	Metric,
	MotionProvider,
	ProcessingFeedback,
	ResultPanel,
	StaggerGroup,
} from "../../src/design-system";

afterEach(cleanup);

test("formats the target value with Intl and preserves ordered stagger content", () => {
	render(
		<MotionProvider>
			<AnimatedNumber
				value={12345.6}
				locale="de-DE"
				format={{ minimumFractionDigits: 1 }}
			/>
			<StaggerGroup aria-label="Ordered items">
				<span>First</span>
				<span>Second</span>
			</StaggerGroup>
		</MotionProvider>,
	);

	expect(screen.getAllByText("12.345,6")).toHaveLength(2);
	const items = within(
		screen.getByRole("list", { name: "Ordered items" }),
	).getAllByRole("listitem");
	expect(items.map((item) => item.textContent)).toEqual(["First", "Second"]);
});

test("animated tabs retain keyboard selection and the expandable uses a native disclosure", async () => {
	const user = userEvent.setup();
	render(
		<>
			<AnimatedTabsIndicator
				label="Views"
				items={[
					{ value: "first", label: "First", content: "First panel" },
					{ value: "second", label: "Second", content: "Second panel" },
				]}
			/>
			<Expandable label="Show notes">Public notes</Expandable>
		</>,
	);
	screen.getByRole("tab", { name: "First" }).focus();
	await user.keyboard("{ArrowRight}{Enter}");
	expect(screen.getByRole("tab", { selected: true }).textContent).toBe(
		"Second",
	);
	expect(screen.getByRole("tabpanel").textContent).toBe("Second panel");
	await user.click(screen.getByText("Show notes"));
	expect(screen.getByText("Show notes").closest("details")?.open).toBe(true);
});

test("reports observed steps and only exposes a numeric progress value when supplied", () => {
	const steps = [
		{ id: "a", label: "Read input", status: "completed" },
		{ id: "b", label: "Check output", status: "running" },
	] as const;
	const { rerender } = render(<ProcessingFeedback steps={steps} />);
	expect(screen.getByRole("progressbar").hasAttribute("aria-valuenow")).toBe(
		false,
	);
	expect(
		screen.getAllByRole("listitem").map((element) => element.textContent),
	).toEqual(["Read inputCompleted", "Check outputIn progress"]);
	rerender(<ProcessingFeedback steps={steps} progress={0} />);
	expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
		"0",
	);
});

test("uses the result contract for empty data, success, failure and retry", async () => {
	const user = userEvent.setup();
	const onRetry = vi.fn();
	const renderResult = (values: number[]) => <p>{values.join(", ")}</p>;
	const props = { title: "Result" };
	const { rerender } = render(
		<ResultPanel
			{...props}
			status="completed"
			data={[]}
			renderResult={renderResult}
			isEmpty={(values) => values.length === 0}
		/>,
	);
	const panel = screen.getByRole("region", { name: "Result" });
	expect(panel.dataset.state).toBe("empty");

	const error = { code: "FAILURE", message: "Read failed.", retryable: true };
	function resultFor(status: ExecutionStatus) {
		return (
			<ResultPanel
				{...props}
				status={status}
				data={[0]}
				error={error}
				renderResult={renderResult}
			/>
		);
	}
	rerender(resultFor("running"));
	expect(panel.dataset.state).toBe("loading");
	rerender(resultFor("completed"));
	expect(panel.dataset.state).toBe("success");
	expect(within(panel).getByText("0")).toBeTruthy();

	rerender(<ResultPanel {...props} status="completed" data={null} />);
	expect(panel.dataset.state).toBe("empty");
	rerender(
		<ResultPanel {...props} status="failed" error={error} onRetry={onRetry} />,
	);
	expect(within(panel).getByRole("alert").textContent).toContain(
		"Read failed.",
	);
	await user.click(
		within(panel).getByRole("button", { name: "Retry execution" }),
	);
	expect(onRetry).toHaveBeenCalledOnce();

	rerender(
		<ResultPanel
			{...props}
			status="failed"
			error={{ ...error, retryable: false }}
			onRetry={onRetry}
		/>,
	);
	expect(
		within(panel).queryByRole("button", { name: "Retry execution" }),
	).toBeNull();
});

test("compares image descriptors and React content in the same figure", () => {
	render(
		<BeforeAfter
			before={{ src: "/before.svg", alt: "Before graphic" }}
			after={
				<svg role="img">
					<title>After graphic</title>
				</svg>
			}
		/>,
	);
	expect(
		screen.getByRole("img", { name: "Before graphic" }).getAttribute("src"),
	).toBe("/before.svg");
	expect(screen.getByRole("img", { name: "After graphic" })).toBeTruthy();
	expect(
		screen.getByRole("slider", { name: "After content revealed" }),
	).toBeTruthy();
});

test("marks the requested excerpt and keeps context on each side", () => {
	const { container, rerender } = render(
		<EvidenceExcerpt
			text="abcdefghi"
			start={3}
			end={6}
			context={1}
			label="Match"
		/>,
	);
	expect(container.querySelector("mark")?.textContent).toBe("Match: def");
	expect(container.textContent).toBe("…cMatch: defg…");

	rerender(<EvidenceExcerpt text="abcdefghi" start={0} end={3} context={1} />);
	expect(container.textContent).toBe("Highlighted evidence: abcd…");

	rerender(<EvidenceExcerpt text="abcdefghi" start={4} end={10} />);
	expect(container.querySelector("mark")).toBeNull();
	expect(container.textContent).toBe("abcdefghi");
});

test("renders the metric unit and signed baseline delta", () => {
	render(
		<Metric
			result={{
				metric: "Duration",
				value: 8,
				baseline: 10,
				unit: "ms",
				sampleSize: 3,
			}}
			locale="en"
		/>,
	);
	expect(screen.getByText("Duration")).toBeTruthy();
	expect(screen.getByText("-2 ms")).toBeTruthy();
	expect(screen.getByText("3")).toBeTruthy();
});
