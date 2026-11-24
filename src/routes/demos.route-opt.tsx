import { createFileRoute } from "@tanstack/react-router";
import { RouteOptimizer } from "../features/route-opt/route-optimizer";

export const Route = createFileRoute("/demos/route-opt")({
	head: () => ({ meta: [{ title: "Route comparison" }] }),
	component: RouteOptimizer,
});
