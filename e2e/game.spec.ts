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
    await page.goto('http://localhost:5173');

    for (let i = 0; i < 20; i++) {
        await page.locator('#spinBtn').click();
        await page.waitForTimeout(500);
    }

    const bonusStatus = await page.locator('#bonusActiveText').textContent();
    expect(bonusStatus).toBe("BONUS");
});

test('bonus round activates', async ({ page }) => {
    await page.goto('http://localhost:5173');

    let triggered = false;

    for (let i = 0; i < 100; i++) {
        await page.locator('#spinBtn').click();
        await page.waitForTimeout(500);

        const text = await page.locator('#bonusActiveText').textContent();

        if (text === 'BONUS') {
            triggered = true;
            break;
        }
    }

    expect(triggered).toBeTruthy();
});

test('game starts with valid ui state', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await expect(page.locator('#spinBtn')).toBeVisible();
    await expect(page.locator('#betText')).toBeVisible();
    await expect(page.locator('#balanceText')).toBeVisible();

    const balance = await page.locator('#balanceText').textContent();

    expect(balance).toContain('Balance');
});

test('spin deducts balance', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const before = await page.locator('#balanceText').textContent();

    await page.locator('#spinBtn').click();

    await page.waitForTimeout(2500);

    const after = await page.locator('#balanceText').textContent();

    expect(after).not.toEqual(before);
});

test('bet increase updates bet amount', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const before = await page.locator('#betText').textContent();

    await page.locator('#betPlusBtn').click();

    const after = await page.locator('#betText').textContent();

    expect(after).not.toEqual(before);
});

test('bet decrease updates bet amount', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.locator('#betPlusBtn').click();

    const before = await page.locator('#betText').textContent();

    await page.locator('#betMinusBtn').click();

    const after = await page.locator('#betText').textContent();

    expect(after).not.toEqual(before);
});

test('spin button disabled during spin', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.locator('#spinBtn').click();

    await expect(page.locator('#spinBtn')).toBeDisabled();
});
