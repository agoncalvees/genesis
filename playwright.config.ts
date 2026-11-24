import { defineConfig } from "@playwright/test";

const production = process.env.GENESIS_E2E_PROD === "1";
const baseURL = production ? "http://127.0.0.1:3001" : "http://127.0.0.1:3000";

export default defineConfig({
	testDir: "tests/e2e",
	reporter: [["list"], ["html", { open: "never" }]],
	use: { baseURL, browserName: "chromium", trace: "retain-on-failure" },
	projects: production
		? [
				{
					name: "production",
					testMatch: ["**/smoke.spec.ts", "**/production.spec.ts"],
				},
			]
		: [{ name: "development", testIgnore: "**/production.spec.ts" }],
	webServer: {
		command: production ? "node .output/server/index.mjs" : "bun run dev",
		env: production
			? { NITRO_HOST: "127.0.0.1", NITRO_PORT: "3001", NODE_ENV: "production" }
			: {},
		url: baseURL,
	},
});
