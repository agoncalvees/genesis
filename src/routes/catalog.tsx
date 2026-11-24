import { DotsThreeIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import {
	Badge,
	Button,
	Card,
	Checkbox,
	Code,
	Container,
	Dialog,
	EmptyState,
	ErrorState,
	Field,
	Grid,
	Heading,
	IconButton,
	Input,
	Popover,
	Progress,
	Select,
	Skeleton,
	Spinner,
	Stack,
	Switch,
	Tabs,
	Text,
	Textarea,
	ToastProvider,
	Tooltip,
	TooltipProvider,
	useToast,
} from "../design-system";

export const Route = createFileRoute("/catalog")({
	head: () => ({ meta: [{ title: "Component catalog" }] }),
	component: Catalog,
});

const options = [
	{ value: "first", label: "Option one" },
	{ value: "second", label: "Option two" },
	{ value: "unavailable", label: "Unavailable option", disabled: true },
];

function Catalog() {
	return (
		<main className="isolate min-h-screen bg-background py-8 sm:py-12">
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
								<ThemeToggle />
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

function ThemeToggle() {
	const [theme, setTheme] = useState<"light" | "dark">();
	useEffect(() => {
		setTheme(
			document.documentElement.dataset.theme === "dark" ? "dark" : "light",
		);
	}, []);
	return (
		<Button
			variant="secondary"
			disabled={theme === undefined}
			aria-pressed={theme === "dark"}
			onClick={() => {
				const next =
					document.documentElement.dataset.theme === "dark" ? "light" : "dark";
				document.documentElement.dataset.theme = next;
				setTheme(next);
			}}
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
