import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Container } from "../design-system";

export const Route = createFileRoute("/demos")({ component: DemosLayout });

function DemosLayout() {
	return (
		<div>
			<nav
				lang="pt-BR"
				aria-label="Navegação das demonstrações"
				className="border-b border-border"
			>
				<Container className="flex min-h-14 max-w-5xl items-center gap-5">
					<Link className="underline underline-offset-4" to="/">
						Genesis
					</Link>
					<Link
						className="underline underline-offset-4"
						to="/demos"
						activeOptions={{ exact: true }}
					>
						Demos
					</Link>
				</Container>
			</nav>
			<Outlet />
		</div>
	);
}
