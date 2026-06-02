import { test, expect } from "@playwright/test";

test('player can spin and win', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#spinBtn', { timeout: 5000 });

    const balanceText = await page.locator('#balanceText').textContent();
    expect(balanceText).toContain('Balance');

    await page.locator('#spinBtn').click();

    await page.waitForTimeout(2000);

    const updateBalance = await page.locator('#balanceText').textContent();
    expect(updateBalance).toBeDefined();
});

test('bet buttons work', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const initialBet = await page.locator('#betText').textContent();
    await page.locator('#betPlusBtn').click();

    const newBet = await page.locator('#betText').textContent();
    expect(newBet).not.toEqual(initialBet);
});

test('bonus round triggers', async ({ page }) => {
    await page.goto('https://localhost:5173');

    for (let i = 0; i < 20; i++) {
        await page.locator('#spinBtn').click();
        await page.waitForTimeout(500);
    }

    const bonusStatus = await page.locator('#bonusActiveText').textContent();
});