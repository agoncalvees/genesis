import { createFileRoute } from "@tanstack/react-router";
import { worldThemes } from "../design-system/themes/generated/worlds";

type Id = keyof typeof worldThemes;

export const Route = createFileRoute("/studio/worlds/")({
	validateSearch: ({ compare }): { compare?: string } =>
		typeof compare === "string" ? { compare } : {},
	loaderDeps: ({ search }) => ({ compare: search.compare }),
	loader: ({ deps }): { pair?: [Id, Id] } => {
		const ids = deps.compare?.split(",") as Id[] | undefined;
		return ids?.length === 2 &&
			ids.every((id) => Object.hasOwn(worldThemes, id))
			? { pair: [ids[0], ids[1]] }
			: {};
	},
	head: () => ({ meta: [{ title: "Genesis Worlds" }] }),
});

if (import.meta.env.VITE_STUDIO_DISABLED !== "1") {
	Route.lazy(() =>
		import("../studio/worlds/page").then((module) => module.WorldsRoute),
	);
}
