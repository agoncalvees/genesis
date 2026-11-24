import { createFileRoute } from "@tanstack/react-router";
import { useHydrated } from "../core/hydration";

export const Route = createFileRoute("/smoke")({ component: Smoke });

function Smoke() {
	const hydrated = useHydrated();

	return (
		<main className="p-4" data-hydrated={hydrated}>
			<h1>Genesis smoke</h1>
		</main>
	);
}
