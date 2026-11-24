import { createFileRoute, notFound } from "@tanstack/react-router";
import { worldThemes } from "../design-system/themes/generated/worlds";

export const Route = createFileRoute("/studio/worlds/$id")({
	loader: ({ params }) => {
		const id = params.id as keyof typeof worldThemes;
		if (!Object.hasOwn(worldThemes, id)) throw notFound();
		return { id };
	},
});

if (import.meta.env.VITE_STUDIO_DISABLED !== "1") {
	Route.lazy(() =>
		import("../studio/worlds/page").then((module) => module.WorldRoute),
	);
}
