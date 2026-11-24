import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/studio/catalog")({
	head: () =>
		import.meta.env.DEV ? { meta: [{ title: "Component catalog" }] } : {},
});

if (import.meta.env.DEV) {
	Route.lazy(() =>
		import("../studio/catalog").then((module) => module.LazyRoute),
	);
}
