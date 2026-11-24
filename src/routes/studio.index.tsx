import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/studio/")({});

if (import.meta.env.VITE_STUDIO_DISABLED !== "1") {
	Route.lazy(() =>
		import("../studio/index").then((module) => module.LazyRoute),
	);
}
