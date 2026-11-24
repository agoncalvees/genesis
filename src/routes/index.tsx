import { createFileRoute, Link } from "@tanstack/react-router";
import { appConfig } from "../core/app-config";
import { useHydrated } from "../core/hydration";
import { Container, Heading, Text } from "../design-system";

export const Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: appConfig.name }] }),
	component: Home,
});

const linkStyle =
	"flex min-h-12 items-center rounded-md px-3 font-medium underline decoration-border underline-offset-4 hover:bg-surface-raised hover:decoration-current";

function Home() {
	const hydrated = useHydrated();
	return (
		<main
			lang="pt-BR"
			className="min-h-dvh bg-background py-16 sm:py-24"
			data-hydrated={hydrated}
		>
			<Container className="max-w-3xl">
				<header className="grid gap-3 pb-8">
					<Heading level={1} className="text-4xl sm:text-5xl">
						{appConfig.name}
					</Heading>
					<Text className="text-base" muted>
						Uma fundação modular para desenvolver e validar soluções para novos
						desafios.
					</Text>
				</header>
				<nav
					aria-label={`Páginas de ${appConfig.name}`}
					className="flex flex-wrap gap-2 border-t border-border pt-4"
				>
					<Link className={linkStyle} to="/demos">
						Demos
					</Link>
					{import.meta.env.VITE_STUDIO_DISABLED !== "1" && (
						<Link className={linkStyle} to="/studio">
							Studio
						</Link>
					)}
					<Link className={linkStyle} to="/smoke">
						Smoke
					</Link>
				</nav>
			</Container>
		</main>
	);
}
