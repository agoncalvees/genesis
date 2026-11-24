import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { appConfig } from "../core/app-config";
// Licensed fonts required by the active design/DESIGN.md (empty for system fonts).
import "../design-system/themes/generated/product-fonts";

import appCss from "../styles/base.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: appConfig.name,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}

				<Scripts />
			</body>
		</html>
	);
}
