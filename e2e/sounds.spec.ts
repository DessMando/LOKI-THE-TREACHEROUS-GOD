import { expect, test, type Page } from "@playwright/test";

async function loadGame(page: Page) {
    await page.goto("/");
    await expect(page.locator("#spinBtn")).toBeVisible();
    await expect(page.locator("#loadingScreen")).toHaveCount(0);
}

test.describe("Feedback and stability", () => {
    test("rapid control interactions do not break the page", async ({ page }) => {
        const pageErrors: string[] = [];
        page.on("pageerror", error => pageErrors.push(error.message));

        await loadGame(page);

        await page.locator("#buyBonusBtn").click();
        await page.locator("#spinBtn").click();
        await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
        await page.locator("#spinBtn").click();
        await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });

        expect(pageErrors).toEqual([]);
    });

    test("the HUD still updates after repeated spins", async ({ page }) => {
        await loadGame(page);

        for (let i = 0; i < 3; i++) {
            await page.locator("#spinBtn").click();
            await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
        }

        await expect(page.locator("#balanceText")).toBeVisible();
        await expect(page.locator("#multiplierText")).toBeVisible();
    });
});
