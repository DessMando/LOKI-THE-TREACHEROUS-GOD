import { expect, test, type Page } from "@playwright/test";

async function loadGame(page: Page) {
    await page.goto("/");
    await expect(page.locator("#spinBtn")).toBeVisible();
    await expect(page.locator("#loadingScreen")).toHaveCount(0);
}

function parseMoney(text: string | null): number {
    if (!text) {
        return NaN;
    }

    return Number(text.replace(/[^\d.,-]/g, "").replace(",", "."));
}

test.describe("UI behaviour", () => {
    test("bet buttons update the displayed bet amount", async ({ page }) => {
        await loadGame(page);

        const before = parseMoney(await page.locator("#betText").textContent());
        await page.locator("#betPlusBtn").click();
        const afterPlus = parseMoney(await page.locator("#betText").textContent());
        await page.locator("#betMinusBtn").click();
        const afterMinus = parseMoney(await page.locator("#betText").textContent());

        expect(afterPlus).toBeCloseTo(before + 0.10, 2);
        expect(afterMinus).toBeCloseTo(before, 2);
    });

    test("bonus buy activates the bonus UI", async ({ page }) => {
        await loadGame(page);

        await page.locator("#buyBonusBtn").click();

        await expect(page.locator("#bonusActiveText")).toContainText("BONUS");
        await expect(page.locator("#freeSpinsText")).toContainText("10");
    });

    test("the control panel stays visible on a mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await loadGame(page);

        await expect(page.locator("#spinBtn")).toBeVisible();
        await expect(page.locator("#buyBonusBtn")).toBeVisible();
        await expect(page.locator("#balanceText")).toBeVisible();
    });
});
