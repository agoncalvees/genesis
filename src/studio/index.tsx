import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Container, Heading, Stack } from "../design-system";

export const LazyRoute = createLazyFileRoute("/studio/")({
	component: Studio,
});

function Studio() {
	return (
		<main className="py-8">
			<Container>
				<Stack>
					<Heading level={1}>Studio</Heading>
					<Link className="underline underline-offset-4" to="/studio/catalog">
						Component catalog
					</Link>
				</Stack>
			</Container>
		</main>
	);
}
