import { defineConfig, devices } from "@playwright/test";
import * as os from "node:os";

export default defineConfig({
    testDir: "tests/e2e",
    outputDir: "tests/e2e/test-results",
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: [
        ["line"],
        [
            "allure-playwright",
            {
                resultsDir: "tests/e2e/allure-results",
                detail: true,
                suiteTitle: false,
                environmentInfo: {
                    os_platform: os.platform(),
                    os_release: os.release(),
                    os_version: os.version(),
                    node_version: process.version,
                },
            },
        ],
    ],

    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
});
