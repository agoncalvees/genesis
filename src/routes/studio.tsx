import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/studio")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw notFound();
	},
});
