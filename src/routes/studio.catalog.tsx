import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/studio/catalog")({
	head: () =>
		import.meta.env.VITE_STUDIO_DISABLED !== "1"
			? { meta: [{ title: "Component catalog" }] }
			: {},
});

if (import.meta.env.VITE_STUDIO_DISABLED !== "1") {
	Route.lazy(() =>
		import("../studio/catalog").then((module) => module.LazyRoute),
	);
}
