import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",

    reporter: [
        ['html', { open: 'never' }]
    ],

    use: {
        baseURL: "http://localhost:5173",
        headless: true
    },

    webServer: {
        command: "pnpm dev",
        port: 5173,
        reuseExistingServer: !process.env.CI
    }
});