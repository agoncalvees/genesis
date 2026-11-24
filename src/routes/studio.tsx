import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useHydrated } from "../core/hydration";

export const Route = createFileRoute("/studio")({
	beforeLoad: () => {
		if (import.meta.env.VITE_STUDIO_DISABLED === "1") throw notFound();
	},
	component: StudioLayout,
});

function StudioLayout() {
	const hydrated = useHydrated();
	return (
		<div data-hydrated={hydrated}>
			<Outlet />
		</div>
	);
}
