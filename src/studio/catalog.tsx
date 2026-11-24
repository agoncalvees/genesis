import { DotsThreeIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
	AnimatedNumber,
	AnimatedTabsIndicator,
	Badge,
	BeforeAfter,
	Button,
	Card,
	Checkbox,
	Code,
	Container,
	Dialog,
	EmptyState,
	ErrorState,
	EvidenceExcerpt,
	Expandable,
	FadeIn,
	Field,
	Grid,
	Heading,
	IconButton,
	Input,
	Metric,
	MotionProvider,
	Popover,
	ProcessingFeedback,
	type ProcessStep,
	Progress,
	ResultPanel,
	Select,
	Skeleton,
	Spinner,
	Stack,
	StaggerGroup,
	Switch,
	Tabs,
	Text,
	Textarea,
	ToastProvider,
	Tooltip,
	TooltipProvider,
	useToast,
} from "../design-system";

const options = [
	{ value: "first", label: "Option one" },
	{ value: "second", label: "Option two" },
	{ value: "unavailable", label: "Unavailable option", disabled: true },
];

export const LazyRoute = createLazyFileRoute("/studio/catalog")({
	component: Catalog,
});

function Catalog() {
	return (
		<MotionProvider>
			<CatalogContent />
		</MotionProvider>
	);
}

function CatalogContent() {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	return (
		<main
			data-theme={theme}
			className="isolate min-h-screen bg-background py-8 sm:py-12"
		>
			<ToastProvider dismissLabel="Dismiss notification">
				<TooltipProvider>
					<Container>
						<Stack className="gap-9">
							<header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
								<Stack className="gap-1">
									<Heading level={1}>Component catalog</Heading>
									<Text muted>
										Design system primitives and interaction states.
									</Text>
								</Stack>
								<ThemeToggle
									theme={theme}
									onToggle={() =>
										setTheme(theme === "light" ? "dark" : "light")
									}
								/>
							</header>
							<CatalogSection title="Buttons and typography">
								<div className="flex flex-wrap items-center gap-2">
									<Button>Primary</Button>
									<Button variant="secondary">Secondary</Button>
									<Button variant="ghost">Ghost</Button>
									<Button variant="danger">Danger</Button>
									<Button disabled>Disabled</Button>
									<Button loading>Loading</Button>
									<IconButton aria-label="More options">
										<DotsThreeIcon weight="bold" size={20} />
									</IconButton>
								</div>
								<Card>
									<Stack className="gap-2">
										<Heading level={3}>Heading</Heading>
										<Text>
											Body text with an inline <Code>value</Code>.
										</Text>
									</Stack>
								</Card>
							</CatalogSection>
							<CatalogSection title="Fields">
								<Grid>
									<Card className="grid content-start gap-4">
										<Field label="Label" description="Description">
											<Input placeholder="Enter a value" />
										</Field>
										<Field label="Invalid input" error="Enter a value.">
											<Input />
										</Field>
										<Field label="Disabled input" disabled>
											<Input defaultValue="Unavailable" />
										</Field>
									</Card>
									<Card className="grid content-start gap-4">
										<Field label="Notes">
											<Textarea placeholder="Enter text" />
										</Field>
										<Field label="Choice">
											<Select
												options={options}
												placeholder="Choose an option"
											/>
										</Field>
									</Card>
									<Card className="grid content-start gap-4">
										<Field label="Checkbox">
											<Checkbox />
										</Field>
										<Field label="Mixed checkbox">
											<Checkbox indeterminate />
										</Field>
										<Field label="Switch">
											<Switch defaultChecked />
										</Field>
										<Field label="Disabled switch" disabled>
											<Switch />
										</Field>
									</Card>
								</Grid>
							</CatalogSection>
							<CatalogSection title="Overlays and tabs">
								<div className="flex flex-wrap items-center gap-2">
									<Dialog
										trigger={<Button variant="secondary">Open dialog</Button>}
										title="Dialog"
										description="Dialog description."
										closeLabel="Close"
									>
										<Text>Dialog content.</Text>
									</Dialog>
									<Popover
										trigger={<Button variant="secondary">Open popover</Button>}
										title="Popover"
										description="Popover description."
									/>
									<Tooltip trigger={<Button variant="ghost">Tooltip</Button>}>
										Supplementary text.
									</Tooltip>
									<ToastExample />
								</div>
								<Tabs
									label="Sample views"
									items={[
										{
											value: "one",
											label: "First tab",
											content: <Text>First panel.</Text>,
										},
										{
											value: "two",
											label: "Second tab",
											content: <Text>Second panel.</Text>,
										},
										{
											value: "three",
											label: "Disabled tab",
											content: null,
											disabled: true,
										},
									]}
								/>
							</CatalogSection>
							<CatalogSection title="Feedback">
								<div className="flex flex-wrap items-center gap-2">
									<Badge>Neutral</Badge>
									<Badge tone="success">Success</Badge>
									<Badge tone="warning">Warning</Badge>
									<Badge tone="danger">Error</Badge>
									<Badge tone="info">Information</Badge>
								</div>
								<Grid>
									<Card className="grid content-start gap-4">
										<Heading level={3}>Loading</Heading>
										<Spinner label="Loading example" />
										<Skeleton className="w-3/4" />
										<Skeleton className="w-1/2" />
									</Card>
									<Card className="grid content-start gap-5">
										<Progress label="Determinate example" value={60} />
										<Progress label="Indeterminate example" />
									</Card>
								</Grid>
								<Grid>
									<EmptyState
										title="Empty state"
										headingLevel={3}
										description="No items to display."
									/>
									<ErrorExample />
								</Grid>
							</CatalogSection>
							<MotionExamples />
							<ResultExamples />
							<LayoutLinks />
						</Stack>
					</Container>
				</TooltipProvider>
			</ToastProvider>
		</main>
	);
}

function CatalogSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="grid min-w-0 gap-4">
			<Heading>{title}</Heading>
			{children}
		</section>
	);
}

function ThemeToggle({
	theme,
	onToggle,
}: {
	theme: "light" | "dark";
	onToggle: () => void;
}) {
	return (
		<Button
			variant="secondary"
			requireHydration
			aria-pressed={theme === "dark"}
			onClick={onToggle}
		>
			{theme === "dark" ? (
				<SunIcon size={16} aria-hidden="true" />
			) : (
				<MoonIcon size={16} aria-hidden="true" />
			)}
			Dark theme
		</Button>
	);
}

function ToastExample() {
	const toast = useToast();
	return (
		<Button
			variant="secondary"
			onClick={() =>
				toast.add({
					title: "Notification",
					description: "Example message.",
					timeout: 0,
					id: "catalog-notice",
				})
			}
		>
			Show toast
		</Button>
	);
}

function ErrorExample() {
	const [retried, setRetried] = useState(false);
	return (
		<Stack className="gap-2">
			<ErrorState
				title="Error state"
				headingLevel={3}
				error={{
					code: "EXAMPLE",
					message: "Example error message.",
					retryable: true,
				}}
				onRetry={() => setRetried(true)}
				retryLabel="Retry"
			/>
			{retried && <Text role="status">Retry requested in this example.</Text>}
		</Stack>
	);
}

const sampleSteps: readonly ProcessStep[] = [
	{ id: "load", label: "Load fixture", status: "completed" },
	{ id: "compare", label: "Compare output", status: "running" },
	{ id: "save", label: "Save report", status: "idle" },
];

function MotionExamples() {
	const [run, setRun] = useState(0);
	const [count, setCount] = useState(0);

	return (
		<CatalogSection title="Motion">
			<Grid>
				<Card className="grid content-start gap-4">
					<Heading level={3}>Entrances and values</Heading>
					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" onClick={() => setRun(run + 1)}>
							Replay entrance
						</Button>
						<Button variant="secondary" onClick={() => setCount(count + 12)}>
							Add 12 samples
						</Button>
					</div>
					<p className="text-sm">
						Samples <AnimatedNumber value={count} locale="en" />
					</p>
					<FadeIn key={run}>
						<StaggerGroup>
							<span>Source loaded</span>
							<span>Output validated</span>
							<span>Report available</span>
						</StaggerGroup>
					</FadeIn>
				</Card>
				<Card className="grid content-start gap-4">
					<Heading level={3}>Selection and disclosure</Heading>
					<AnimatedTabsIndicator
						label="Motion example views"
						items={[
							{
								value: "summary",
								label: "Summary",
								content: <Text muted>Three steps are available.</Text>,
							},
							{
								value: "details",
								label: "Details",
								content: <Text muted>The steps run in order.</Text>,
							},
						]}
					/>
					<Expandable label="Show timing details">
						<Text muted>Entrances use the fast duration token.</Text>
					</Expandable>
				</Card>
			</Grid>
		</CatalogSection>
	);
}

const resultStates = [
	{ value: "idle", label: "Idle" },
	{ value: "loading", label: "Loading" },
	{ value: "empty", label: "Empty" },
	{ value: "error", label: "Error" },
	{ value: "success", label: "Success" },
	{ value: "cancelled", label: "Cancelled" },
] as const;

type CatalogResultState = (typeof resultStates)[number]["value"];

const fixtures = {
	idle: { status: "idle" },
	loading: {
		status: "running",
		feedback: (
			<ProcessingFeedback steps={sampleSteps} label="Fixture execution" />
		),
	},
	empty: { status: "completed", data: null },
	error: {
		status: "failed",
		error: {
			code: "FIXTURE_READ",
			message: "The fixture could not be read.",
			retryable: true,
		},
	},
	success: {
		status: "completed",
		data: {
			metric: "Validated records",
			value: 24,
			unit: "records",
			baseline: 20,
			sampleSize: 30,
		},
	},
	cancelled: { status: "cancelled" },
} as const;

function ComparisonGraphic({ organized }: { organized: boolean }) {
	const positions = organized
		? [
				[42, 24],
				[112, 24],
				[182, 24],
				[252, 24],
			]
		: [
				[38, 38],
				[110, 90],
				[193, 55],
				[255, 105],
			];
	return (
		<svg role="img" viewBox="0 0 320 180" className="size-full text-foreground">
			<title>
				{organized
					? "After: four blocks aligned in a row"
					: "Before: four scattered blocks"}
			</title>
			{positions.map(([x, y]) => (
				<rect
					key={x}
					x={x}
					y={y}
					width="30"
					height="30"
					rx="4"
					fill="currentColor"
				/>
			))}
		</svg>
	);
}

const fixtureSource =
	"Fixture record. Review confirmed four blocks were aligned. The record was archived after review.";
const fixtureHighlight = "four blocks were aligned";
const fixtureStart = fixtureSource.indexOf(fixtureHighlight);

function ResultExamples() {
	const [state, setState] = useState<CatalogResultState>("idle");
	const fixture =
		state === "error"
			? { ...fixtures.error, onRetry: () => setState("loading") }
			: fixtures[state];
	return (
		<CatalogSection title="Result patterns">
			<Grid>
				<div className="grid min-w-0 content-start gap-4">
					<fieldset className="min-w-0 space-y-2">
						<legend className="text-sm font-medium">
							Fixture result state
						</legend>
						<div className="flex flex-wrap gap-2">
							{resultStates.map(({ value, label }) => (
								<Button
									key={value}
									size="sm"
									variant={state === value ? "primary" : "secondary"}
									aria-pressed={state === value}
									onClick={() => setState(value)}
								>
									{label}
								</Button>
							))}
						</div>
					</fieldset>
					<ResultPanel
						{...fixture}
						title="Fixture result"
						headingLevel={3}
						renderResult={(result) => <Metric result={result} locale="en" />}
					/>
				</div>
				<Card className="grid content-start gap-4">
					<Heading level={3}>Before and after</Heading>
					<BeforeAfter
						label="Fixture comparison"
						before={<ComparisonGraphic organized={false} />}
						after={<ComparisonGraphic organized />}
					/>
				</Card>
				<Card className="grid content-start gap-4">
					<Heading level={3}>Fixture evidence excerpt</Heading>
					<EvidenceExcerpt
						text={fixtureSource}
						start={fixtureStart}
						end={fixtureStart + fixtureHighlight.length}
						context={15}
					/>
				</Card>
			</Grid>
		</CatalogSection>
	);
}

const layoutLinks = [
	{
		name: "presentation",
		title: "Presentation",
		description: "Wide reading surface",
	},
	{
		name: "application",
		title: "Application",
		description: "Navigation and content",
	},
	{
		name: "workspace",
		title: "Workspace",
		description: "Work surface and tools",
	},
	{ name: "focused", title: "Focused", description: "Single-column flow" },
] as const;

function LayoutLinks() {
	return (
		<div id="layouts">
			<CatalogSection title="Layout previews">
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{layoutLinks.map(({ name, title, description }) => (
						<li key={name} className="min-w-0">
							<Link
								to="/studio/layouts/$name"
								params={{ name }}
								className="grid gap-1 rounded-lg border border-border bg-surface-raised p-4 hover:border-muted"
							>
								<span className="font-medium underline underline-offset-4">
									{title}
								</span>
								<span className="text-sm text-muted">{description}</span>
							</Link>
						</li>
					))}
				</ul>
			</CatalogSection>
		</div>
	);
}
