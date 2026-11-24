import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/studio/layouts/$name")({
	loader: async ({ params }) => {
		if (import.meta.env.VITE_STUDIO_DISABLED !== "1") {
			const { layoutNames } = await import("../studio/layout-preview");
			const name = params.name as keyof typeof layoutNames;
			if (Object.hasOwn(layoutNames, name)) {
				return { name, label: layoutNames[name] };
			}
		}
		throw notFound();
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: loaderData ? `${loaderData.label} layout` : "Layout preview" },
		],
	}),
});

if (import.meta.env.VITE_STUDIO_DISABLED !== "1") {
	Route.lazy(() =>
		import("../studio/layout-preview").then((module) => module.LazyRoute),
	);
}
