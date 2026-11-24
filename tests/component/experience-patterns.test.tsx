import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import {
	AiStatus,
	AppNav,
	aiStatusMessage,
	BottomNav,
	Citation,
	EvidenceHeadline,
	Figure,
	FileDrop,
	FileList,
	FilePreview,
	Kicker,
	Lede,
	ProcessingFeedback,
	PromptComposer,
	PullQuote,
	ResizablePanels,
	SourceList,
	StreamingText,
	validateFiles,
} from "../../src/design-system";

afterEach(cleanup);

test("editorial patterns render semantic quote, figure credit and inline evidence", () => {
	render(
		<>
			<Kicker>Section</Kicker>
			<Lede>Opening paragraph.</Lede>
			<PullQuote cite="Source A">Quoted line.</PullQuote>
			<Figure caption="Caption text" credit="Author" licence="CC0">
				<span>media</span>
			</Figure>
			<h1>
				<EvidenceHeadline before="2.4 MB" after="168 KB" change="−93%" />
			</h1>
		</>,
	);
	expect(screen.getByText("Opening paragraph.").className).toContain(
		"max-w-(--measure)",
	);
	expect(screen.getByText("Quoted line.").tagName).toBe("BLOCKQUOTE");
	const figures = screen.getAllByRole("figure");
	expect(figures[0].textContent).toContain("Source A");
	expect(within(figures[1]).getByText("Author · CC0")).toBeTruthy();
	expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
		"2.4 MB → 168 KB −93%",
	);
});

function Composer({
	onSubmit = () => {},
	onCancel,
	running = false,
	initial = "",
}: {
	onSubmit?: (value: string) => void;
	onCancel?: () => void;
	running?: boolean;
	initial?: string;
}) {
	const [value, setValue] = useState(initial);
	return (
		<PromptComposer
			label="Prompt"
			value={value}
			onChange={setValue}
			onSubmit={onSubmit}
			onCancel={onCancel}
			running={running}
			maxLength={10}
		/>
	);
}

test("prompt composer submits with Mod+Enter and validates empty and over-limit input", async () => {
	const user = userEvent.setup();
	const onSubmit = vi.fn();
	render(<Composer onSubmit={onSubmit} />);
	const box = screen.getByRole("textbox", { name: "Prompt" });
	await user.click(screen.getByRole("button", { name: "Send" }));
	expect(screen.getByRole("alert").textContent).toBe("Enter a prompt.");
	expect(box.getAttribute("aria-invalid")).toBe("true");
	expect(onSubmit).not.toHaveBeenCalled();

	await user.type(box, "hello");
	await user.keyboard("{Control>}{Enter}{/Control}");
	expect(onSubmit).toHaveBeenCalledWith("hello");
	await user.keyboard("{Meta>}{Enter}{/Meta}");
	expect(onSubmit).toHaveBeenCalledTimes(2);

	await user.type(box, " world!!");
	expect(screen.getByRole("alert").textContent).toContain("at most 10");
	expect(screen.getByText("13 / 10 characters")).toBeTruthy();
	await user.keyboard("{Control>}{Enter}{/Control}");
	expect(onSubmit).toHaveBeenCalledTimes(2);
	expect(box.getAttribute("aria-describedby")).toContain(
		screen.getByText("13 / 10 characters").id,
	);
});

test("prompt composer exposes cancel while running and Esc cancels", async () => {
	const user = userEvent.setup();
	const onCancel = vi.fn();
	const onSubmit = vi.fn();
	render(
		<Composer running onCancel={onCancel} onSubmit={onSubmit} initial="hi" />,
	);
	expect(
		screen.getByRole("button", { name: "Send" }).hasAttribute("disabled"),
	).toBe(true);
	await user.click(screen.getByRole("button", { name: "Cancel" }));
	screen.getByRole("textbox", { name: "Prompt" }).focus();
	await user.keyboard("{Escape}");
	await user.keyboard("{Control>}{Enter}{/Control}");
	expect(onCancel).toHaveBeenCalledTimes(2);
	expect(onSubmit).not.toHaveBeenCalled();
});

test("streaming text is a polite live log, busy while streaming, with a cursor only when motion is allowed", () => {
	const { rerender, unmount } = render(<StreamingText text="Part" streaming />);
	const log = screen.getByRole("log", { name: "Response" });
	expect(log.getAttribute("aria-live")).toBe("polite");
	expect(log.getAttribute("aria-busy")).toBe("true");
	const cursor = log.querySelector(".ds-stream-cursor");
	expect(cursor?.getAttribute("aria-hidden")).toBe("true");
	expect(cursor?.hasAttribute("data-motion")).toBe(true);
	rerender(<StreamingText text="Part done." streaming={false} />);
	expect(log.getAttribute("aria-busy")).toBe("false");
	expect(log.querySelector(".ds-stream-cursor")).toBeNull();
	expect(log.textContent).toBe("Part done.");
	unmount();

	const matchMedia = vi.fn(() => ({ matches: true }));
	vi.stubGlobal("matchMedia", matchMedia);
	try {
		render(<StreamingText text="Part" streaming />);
		expect(
			screen
				.getByRole("log")
				.querySelector(".ds-stream-cursor")
				?.hasAttribute("data-motion"),
		).toBe(false);
		expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
	} finally {
		vi.unstubAllGlobals();
	}
});

test("citations link to evidence items and unsafe source links are dropped", () => {
	const text = "Alpha beta gamma.";
	const sources = [
		{
			id: "a",
			title: "First",
			href: "https://example.org/a",
			text,
			start: 6,
			end: 10,
		},
		{
			id: "b",
			title: "Second",
			href: "javascript:alert(1)",
			text,
			start: 0,
			end: 5,
		},
	];
	render(
		<>
			<Citation index={1} source={sources[0]} idPrefix="t" />
			<SourceList sources={sources} idPrefix="t" />
		</>,
	);
	const citation = screen.getByRole("link", { name: "Source 1: First" });
	expect(citation.getAttribute("href")).toBe("#t-a");
	const list = screen.getByRole("region", { name: "Sources" });
	expect(
		list.querySelector("#t-a")?.querySelector("mark")?.textContent,
	).toContain("beta");
	expect(
		within(list).getByRole("link", { name: "First" }).getAttribute("rel"),
	).toBe("noreferrer");
	expect(within(list).queryByRole("link", { name: "Second" })).toBeNull();
	expect(within(list).getByText("Second")).toBeTruthy();
});

test("AI status maps contract errors to messages and offers retry only when retryable", async () => {
	const user = userEvent.setup();
	const onRetry = vi.fn();
	const error = (code: string, retryable: boolean) => ({
		code,
		message: "raw",
		retryable,
	});
	expect(aiStatusMessage("unavailable")).toMatch(/not available/);
	expect(aiStatusMessage("failed", error("forbidden", false))).toMatch(
		/not enabled/,
	);
	expect(aiStatusMessage("failed", error("rate_limited", true))).toMatch(
		/Too many requests/,
	);
	expect(aiStatusMessage("failed", error("timeout", true))).toMatch(/too long/);
	expect(aiStatusMessage("cancelled")).toMatch(/cancelled/);
	expect(aiStatusMessage("failed", error("other", false))).toBe(
		"Something went wrong.",
	);

	const { rerender } = render(
		<AiStatus
			status="failed"
			error={error("timeout", true)}
			onRetry={onRetry}
		/>,
	);
	expect(screen.getByRole("status").textContent).not.toContain("raw");
	await user.click(screen.getByRole("button", { name: "Try again" }));
	expect(onRetry).toHaveBeenCalledOnce();
	rerender(
		<AiStatus
			status="failed"
			error={error("forbidden", false)}
			onRetry={onRetry}
		/>,
	);
	expect(screen.queryByRole("button")).toBeNull();
	rerender(<AiStatus status="unavailable" onRetry={onRetry} />);
	expect(screen.getByRole("status").textContent).toContain("Unavailable");
	expect(screen.queryByRole("button")).toBeNull();
});

const file = (name: string, type: string, content = "a") =>
	new File([content], name, { type });

test("validateFiles reports type, size and count errors as text", () => {
	const rules = { accept: [".csv", "image/*"], maxSize: 5, maxFiles: 2 };
	const result = validateFiles(
		[
			file("a.csv", "text/csv"),
			file("b.exe", "application/octet-stream"),
			file("c.png", "image/png", "too large"),
			file("d.PNG", "image/png"),
			file("e.csv", "text/csv"),
		],
		rules,
	);
	expect(result.accepted.map(({ name }) => name)).toEqual(["a.csv", "d.PNG"]);
	expect(result.errors).toEqual([
		"“b.exe” is not an accepted type. Use .csv, image/*.",
		"“c.png” is 9 bytes; the limit is 5 bytes.",
		"“e.csv” was not added: the limit is 2 files.",
	]);
});

test("file drop opens the picker from a button, accepts drops and shows textual errors", async () => {
	const user = userEvent.setup();
	const onFiles = vi.fn();
	render(
		<FileDrop
			label="Files"
			accept={[".txt"]}
			maxSize={100}
			onFiles={onFiles}
		/>,
	);
	const group = screen.getByRole("group", { name: "Files" });
	expect(group.getAttribute("aria-describedby")).toBeTruthy();
	const button = within(group).getByRole("button", { name: "Choose files" });
	const input = group.querySelector<HTMLInputElement>("input[type=file]");
	const click = vi.spyOn(input as HTMLInputElement, "click");
	button.focus();
	await user.keyboard("{Enter}");
	expect(click).toHaveBeenCalled();

	await user.upload(input as HTMLInputElement, file("notes.txt", "text/plain"));
	expect(onFiles).toHaveBeenCalledWith([
		expect.objectContaining({ name: "notes.txt" }),
	]);

	fireEvent.drop(group, {
		dataTransfer: { files: [file("run.sh", "text/x-sh")] },
	});
	expect(screen.getByRole("alert").textContent).toContain(
		"“run.sh” is not an accepted type",
	);
	expect(onFiles).toHaveBeenCalledTimes(1);
});

test("file previews read text and CSV as text, use revoked object URLs for images", async () => {
	const create = vi.fn(() => "blob:preview");
	const revoke = vi.fn();
	Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
	const csv = file(
		"data.csv",
		"text/csv",
		"a,b\n1,2\n3,4\n5,6\n7,8\n9,10\n<script>x</script>",
	);
	const { unmount } = render(
		<>
			<FilePreview file={csv} lines={3} />
			<FilePreview file={file("pic.png", "image/png")} />
			<FilePreview file={file("bin.zip", "application/zip")} />
		</>,
	);
	await waitFor(() => expect(screen.getByText(/3 rows shown/)).toBeTruthy());
	expect(
		screen.getByText("a,b 1,2 3,4", {
			normalizer: (t) => t.replace(/\s+/g, " "),
		}),
	).toBeTruthy();
	expect(document.querySelector("script")).toBeNull();
	expect(
		screen.getByRole("img", { name: "Preview of pic.png" }).getAttribute("src"),
	).toBe("blob:preview");
	expect(screen.getByText(/No preview for this type/)).toBeTruthy();
	unmount();
	expect(revoke).toHaveBeenCalledWith("blob:preview");
});

test("file list removes files by accessible name", async () => {
	const user = userEvent.setup();
	const onRemove = vi.fn();
	render(
		<FileList
			files={[file("one.bin", ""), file("two.bin", "")]}
			onRemove={onRemove}
			preview={false}
		/>,
	);
	const list = screen.getByRole("list", { name: "Selected files" });
	expect(within(list).getAllByRole("listitem")).toHaveLength(2);
	await user.click(screen.getByRole("button", { name: "Remove two.bin" }));
	expect(onRemove).toHaveBeenCalledWith(1);
	expect(list).toBe(document.activeElement);
});

test("processing feedback shows per-step durations and a throughput sparkline", () => {
	render(
		<ProcessingFeedback
			label="Work"
			progress={50}
			steps={[
				{ id: "a", label: "Read", status: "completed", durationMs: 420 },
				{ id: "b", label: "Write", status: "completed", durationMs: 1830 },
				{ id: "c", label: "Wait", status: "idle" },
			]}
			throughput={{
				title: "Throughput",
				data: [
					{ label: "0", value: 1 },
					{ label: "1", value: 3 },
				],
			}}
		/>,
	);
	const steps = screen.getByRole("list", { name: "Execution steps" });
	expect(steps.textContent).toContain("Duration: 420 ms");
	expect(steps.textContent).toContain("Duration: 1.8 sec");
	expect(screen.getByRole("img", { name: "Throughput" })).toBeTruthy();
	expect(
		document.querySelector(".ds-chart-draw")?.getAttribute("pathLength"),
	).toBe("1");
});

test("app nav keeps inline links and opens a drawer with the same links", async () => {
	const user = userEvent.setup();
	const items = [
		{ href: "#a", label: "First", current: true },
		{ href: "#b", label: "Second" },
	];
	render(<AppNav label="Main" brand="Product" items={items} />);
	const nav = screen.getByRole("navigation", { name: "Main" });
	expect(
		within(nav)
			.getByRole("link", { name: "First" })
			.getAttribute("aria-current"),
	).toBe("page");
	await user.click(screen.getByRole("button", { name: "Open menu" }));
	const drawer = await screen.findByRole("dialog");
	const drawerNav = within(drawer).getByRole("navigation", { name: "Main" });
	await user.click(within(drawerNav).getByRole("link", { name: "Second" }));
	await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

test("bottom nav marks the current item", () => {
	render(
		<BottomNav
			label="Sections"
			items={[
				{ href: "#a", label: "Home", current: true },
				{ href: "#b", label: "Files" },
			]}
		/>,
	);
	const nav = screen.getByRole("navigation", { name: "Sections" });
	expect(within(nav).getAllByRole("link")).toHaveLength(2);
	expect(
		within(nav)
			.getByRole("link", { name: "Home" })
			.getAttribute("aria-current"),
	).toBe("page");
});

test("resizable panels resize from the keyboard within bounds and report commits", async () => {
	const user = userEvent.setup();
	const onSizeChange = vi.fn();
	render(
		<ResizablePanels
			label="Resize"
			start="A"
			end="B"
			defaultSize={50}
			min={30}
			max={60}
			step={5}
			onSizeChange={onSizeChange}
		/>,
	);
	const separator = screen.getByRole("separator", { name: "Resize" });
	expect(separator.getAttribute("aria-valuenow")).toBe("50");
	expect(separator.getAttribute("aria-valuemin")).toBe("30");
	expect(separator.getAttribute("aria-valuemax")).toBe("60");
	separator.focus();
	await user.keyboard("{ArrowRight}");
	expect(separator.getAttribute("aria-valuenow")).toBe("55");
	await user.keyboard("{End}{ArrowRight}");
	expect(separator.getAttribute("aria-valuenow")).toBe("60");
	await user.keyboard("{Home}");
	expect(separator.getAttribute("aria-valuenow")).toBe("30");
	await act(async () => {
		await user.keyboard("{ArrowLeft}");
	});
	expect(onSizeChange.mock.calls.map(([size]) => size)).toEqual([
		55, 60, 60, 30, 30,
	]);
});
