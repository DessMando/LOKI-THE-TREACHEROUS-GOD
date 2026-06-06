import { test, expect, type Page } from "@playwright/test";

// ── helpers ──────────────────────────────────────────────────────────────────

async function getBalance(page: Page): Promise<number> {
    const text = await page.locator("#balanceText").textContent() ?? "";
    return parseFloat(text.match(/€([\d.]+)/)?.[1] ?? "0");
}

async function getBet(page: Page): Promise<number> {
    const text = await page.locator("#betText").textContent() ?? "";
    return parseFloat(text.match(/€([\d.]+)/)?.[1] ?? "0");
}

/** Clicks spin and waits until the spin button is enabled again. */
async function spinAndWait(page: Page): Promise<void> {
    await page.locator("#spinBtn").click();
    await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
}

// ── page load ────────────────────────────────────────────────────────────────

test.describe("Page load", () => {
    test("loading screen disappears after init", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#loadingScreen")).toBeHidden({ timeout: 10000 });
    });

    test("spin button is visible and enabled", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#spinBtn")).toBeVisible();
        await expect(page.locator("#spinBtn")).toBeEnabled();
    });

    test("balance starts at €1000", async ({ page }) => {
        await page.goto("/");
        expect(await getBalance(page)).toBe(1000);
    });

    test("bet text shows a value above 0", async ({ page }) => {
        await page.goto("/");
        expect(await getBet(page)).toBeGreaterThan(0);
    });

    test("all main UI elements are present", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#spinBtn")).toBeVisible();
        await expect(page.locator("#betText")).toBeVisible();
        await expect(page.locator("#balanceText")).toBeVisible();
        await expect(page.locator("#multiplierText")).toBeVisible();
        await expect(page.locator("#betPlusBtn")).toBeVisible();
        await expect(page.locator("#betMinusBtn")).toBeVisible();
        await expect(page.locator("#buyBonusBtn")).toBeVisible();
    });

    test("bigWinText and maxWinText are hidden by default", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#bigWinText")).toBeHidden();
        await expect(page.locator("#maxWinText")).toBeHidden();
    });
});

// ── spin mechanics ────────────────────────────────────────────────────────────

test.describe("Spin mechanics", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("spin button is disabled immediately after clicking", async ({ page }) => {
        await page.locator("#spinBtn").click();
        await expect(page.locator("#spinBtn")).toBeDisabled();
    });

    test("spin button re-enables after spin completes", async ({ page }) => {
        await spinAndWait(page);
        await expect(page.locator("#spinBtn")).toBeEnabled();
    });

    test("balance changes after a spin", async ({ page }) => {
        const before = await getBalance(page);
        await spinAndWait(page);
        const after = await getBalance(page);
        // balance either dropped (bet deducted) or went up (win), never stays identical guaranteed
        expect(after).not.toBeNaN();
        expect(after).toBeGreaterThanOrEqual(0);
        // At minimum the bet was deducted
        expect(after).toBeLessThanOrEqual(before);
    });

    test("bet buttons are disabled during a spin", async ({ page }) => {
        await page.locator("#spinBtn").click();
        await expect(page.locator("#betPlusBtn")).toBeDisabled();
        await expect(page.locator("#betMinusBtn")).toBeDisabled();
    });

    test("bet buttons re-enable after spin completes", async ({ page }) => {
        await spinAndWait(page);
        await expect(page.locator("#betPlusBtn")).toBeEnabled();
        await expect(page.locator("#betMinusBtn")).toBeEnabled();
    });

    test("second spin click while spinning does not deduct double", async ({ page }) => {
        const before = await getBalance(page);
        await page.locator("#spinBtn").click();
        await page.locator("#spinBtn").click({ force: true });
        await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
        const after = await getBalance(page);
        // Only one bet should have been deducted (max €150 max bet)
        expect(before - after).toBeLessThanOrEqual(150);
    });
});

// ── betting system ────────────────────────────────────────────────────────────

test.describe("Betting system", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("bet increases by €0.10 when + is clicked", async ({ page }) => {
        const before = await getBet(page);
        await page.locator("#betPlusBtn").click({force: true});
        const after = await getBet(page);
        expect(after).toBeCloseTo(before + 0.10, 2);
    });

    test("bet decreases by €0.10 when - is clicked", async ({ page }) => {
        await page.locator("#betPlusBtn").click();
        const before = await getBet(page);
        await page.locator("#betMinusBtn").click();
        const after = await getBet(page);
        expect(after).toBeCloseTo(before - 0.10, 2);
    });

    test("bet does not go below €0.10", async ({ page }) => {
        await page.locator("#betMinusBtn").click();
        expect(await getBet(page)).toBeGreaterThanOrEqual(0.10);
    });

    test("bet text updates after clicking +", async ({ page }) => {
        await page.locator("#betPlusBtn").click();
        const text = await page.locator("#betText").textContent();
        expect(text).toContain("0.20");
    });
});

// ── bonus system ──────────────────────────────────────────────────────────────

test.describe("Bonus system", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("buy bonus button activates the bonus immediately", async ({ page }) => {
        await page.locator("#buyBonusBtn").click();
        const text = await page.locator("#bonusActiveText").textContent();
        expect(text?.toLowerCase()).toContain("bonus");
    });

    test("free spins text appears when bonus is active", async ({ page }) => {
        await page.locator("#buyBonusBtn").click();
        const text = await page.locator("#freeSpinsText").textContent();
        expect(text).toBeDefined();
    });

    test("free spins counter changes after spinning in bonus", async ({ page }) => {
        await page.locator("#buyBonusBtn").click();
        const before = await page.locator("#freeSpinsText").textContent();
        await spinAndWait(page);
        const after = await page.locator("#freeSpinsText").textContent();
        expect(after).not.toEqual(before);
    });
});

// ── full session ──────────────────────────────────────────────────────────────

test.describe("Spin session stability", () => {
    test("balance remains a valid number after 10 spins", async ({ page }) => {
        await page.goto("/");
        for (let i = 0; i < 10; i++) {
            await spinAndWait(page);
        }
        const balance = await getBalance(page);
        expect(isNaN(balance)).toBe(false);
        expect(balance).toBeGreaterThanOrEqual(0);
    });

    test("UI remains functional after 10 spins", async ({ page }) => {
        await page.goto("/");
        for (let i = 0; i < 10; i++) {
            await spinAndWait(page);
        }
        await expect(page.locator("#spinBtn")).toBeEnabled();
        await expect(page.locator("#balanceText")).toBeVisible();
        await expect(page.locator("#betText")).toBeVisible();
    });
});

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wacht tot loading screen verdwijnt = spel is volledig geladen
    await page.waitForSelector("#loadingScreen", { state: "hidden", timeout: 15000 });
});

test("spin button is disabled immediately after clicking", async ({ page }) => {
    await page.locator("#spinBtn").click();
    await expect(page.locator("#spinBtn")).toBeDisabled();
});

test("spin button re-enables after spin completes", async ({ page }) => {
    await page.locator("#spinBtn").click();
    await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 10000 });
});