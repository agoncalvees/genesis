import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/studio/")({});

if (import.meta.env.DEV) {
	Route.lazy(() =>
		import("../studio/index").then((module) => module.LazyRoute),
	);
}
