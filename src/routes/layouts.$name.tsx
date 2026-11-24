import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FadeIn, Heading, MotionProvider, Text } from "../design-system";
import {
	ApplicationLayout,
	FocusedLayout,
	PresentationLayout,
	WorkspaceLayout,
} from "../layouts";

const names = {
	presentation: "Presentation",
	application: "Application",
	workspace: "Workspace",
	focused: "Focused",
} as const;

export const Route = createFileRoute("/layouts/$name")({
	loader: ({ params }) => {
		if (!Object.hasOwn(names, params.name)) throw notFound();
		return params.name as keyof typeof names;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: loaderData ? `${names[loaderData]} layout` : "Layout preview" },
		],
	}),
	component: LayoutPreview,
});

function LayoutPreview() {
	const name = Route.useLoaderData();
	return (
		<MotionProvider>
			<Preview name={name} />
		</MotionProvider>
	);
}

function Preview({ name }: { name: keyof typeof names }) {
	const header = (
		<Link
			to="/catalog"
			hash="layouts"
			className="inline-block rounded-sm text-sm font-medium underline underline-offset-4"
		>
			Back to layout catalog
		</Link>
	);
	const title = <Heading level={1}>{names[name]} layout</Heading>;

	switch (name) {
		case "presentation":
			return (
				<PresentationLayout header={header}>
					<FadeIn className="grid max-w-xl gap-4">
						{title}
						<Text muted>
							A wide reading surface for a single narrative or a guided
							demonstration.
						</Text>
					</FadeIn>
				</PresentationLayout>
			);
		case "application":
			return (
				<ApplicationLayout
					header={header}
					navigation={
						<a
							href="#overview"
							className="inline-block rounded-sm text-sm font-medium underline underline-offset-4"
						>
							Overview
						</a>
					}
				>
					<FadeIn id="overview" className="grid max-w-xl gap-4">
						{title}
						<Text muted>
							Navigation sits alongside the main content on wider screens and
							moves above it on smaller screens.
						</Text>
					</FadeIn>
				</ApplicationLayout>
			);
		case "workspace":
			return (
				<WorkspaceLayout
					header={header}
					tools={
						<Heading level={2} className="text-base">
							Tools
						</Heading>
					}
					inspector={
						<Heading level={2} className="text-base">
							Inspector
						</Heading>
					}
				>
					<FadeIn className="grid min-h-56 w-full max-w-3xl content-center gap-3 rounded-lg border border-dashed border-muted bg-surface-raised p-5 sm:p-8">
						{title}
						<Text muted>
							A central work surface with optional tools and an inspector.
						</Text>
					</FadeIn>
				</WorkspaceLayout>
			);
		case "focused":
			return (
				<FocusedLayout header={header}>
					<FadeIn className="grid gap-4">
						{title}
						<Text muted>
							A single column for a short task or a small-screen flow.
						</Text>
					</FadeIn>
				</FocusedLayout>
			);
	}
}
