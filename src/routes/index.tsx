import { createFileRoute } from "@tanstack/react-router";
import { appConfig } from "../core/app-config";
import { useHydrated } from "../core/hydration";
import { Container, Heading, Text } from "../design-system";

export const Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: appConfig.name }] }),
	component: Home,
});

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
						O escopo do produto será definido após a confirmação do desafio.
					</Text>
				</header>
			</Container>
		</main>
	);
}
