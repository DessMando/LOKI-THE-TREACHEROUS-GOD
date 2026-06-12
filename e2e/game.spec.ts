import { expect, test, type Page } from "@playwright/test";

async function waitForGame(page: Page) {
    await page.goto("/");
    await expect(page.locator("#spinBtn")).toBeVisible();
    await expect(page.locator("#balanceText")).toBeVisible();
    await expect(page.locator("#betText")).toBeVisible();
    await expect(page.locator("#loadingScreen")).toHaveCount(0);
}

function parseMoney(text: string | null): number {
    if (!text) {
        return NaN;
    }

    return Number(text.replace(/[^\d.,-]/g, "").replace(",", "."));
}

async function spinAndWait(page: Page) {
    const spinBtn = page.locator("#spinBtn");
    await spinBtn.click();
    await expect(spinBtn).toBeEnabled({ timeout: 15000 });
}

test.describe("Game shell", () => {
    test("loads the HUD, controls and canvas", async ({ page }) => {
        await waitForGame(page);

        await expect(page.locator("canvas")).toBeVisible();
        await expect(page.locator("#uiPanel")).toBeVisible();
        await expect(page.locator("#spinBtn")).toBeEnabled();
        await expect(page.locator("#buyBonusBtn")).toBeVisible();
    });

    test("shows numeric balance and bet values on load", async ({ page }) => {
        await waitForGame(page);

        expect(parseMoney(await page.locator("#balanceText").textContent())).toBeGreaterThan(0);
        expect(parseMoney(await page.locator("#betText").textContent())).toBeGreaterThan(0);
    });

    test("rapid spin clicks still leave the page responsive", async ({ page }) => {
        await waitForGame(page);

        await page.locator("#spinBtn").click();
        await page.locator("#spinBtn").click({ force: true });
        await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
        const balance = parseMoney(await page.locator("#balanceText").textContent());
        expect(Number.isFinite(balance)).toBe(true);
    });

    test("multiple spins keep the UI responsive", async ({ page }) => {
        await waitForGame(page);

        for (let i = 0; i < 5; i++) {
            await spinAndWait(page);
        }

        const balance = parseMoney(await page.locator("#balanceText").textContent());
        expect(Number.isFinite(balance)).toBe(true);
        expect(balance).toBeGreaterThanOrEqual(0);
    });
});
