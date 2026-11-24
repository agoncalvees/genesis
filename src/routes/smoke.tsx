import { createFileRoute } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";

export const Route = createFileRoute("/smoke")({ component: Smoke });

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function Smoke() {
	const hydrated = useSyncExternalStore(
		subscribe,
		getClientSnapshot,
		getServerSnapshot,
	);

	return (
		<main className="p-4" data-hydrated={hydrated}>
			<h1>Genesis smoke</h1>
		</main>
	);
}
