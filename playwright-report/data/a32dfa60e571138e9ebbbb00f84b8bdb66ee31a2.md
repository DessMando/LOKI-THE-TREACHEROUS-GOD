# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> bet buttons work
- Location: e2e\game.spec.ts:18:1

# Error details

```
Error: expect(received).not.toEqual(expected) // deep equality

Expected: not "
        Bet: €0.10
      "

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - button "SPIN" [ref=e2] [cursor=pointer]
  - button "BUY BONUS" [ref=e3] [cursor=pointer]
  - generic [ref=e4]:
    - button "-" [ref=e5] [cursor=pointer]
    - button "+" [active] [ref=e6] [cursor=pointer]
  - button "AUTO PLAY" [ref=e7] [cursor=pointer]
  - button "TURBO OFF" [ref=e8] [cursor=pointer]
  - generic [ref=e9]:
    - generic [ref=e10]: "Balance: €1000.00"
    - generic [ref=e11]: "Bet: €0.10"
    - generic [ref=e12]: "Multiplier: x1"
    - generic [ref=e13]: "Free Spins: 0"
    - generic [ref=e14]: BONUS INACTIVE
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test('player can spin and win', async ({ page }) => {
  4  |     await page.goto('http://localhost:5173');
  5  |     await page.waitForSelector('#spinBtn', { timeout: 5000 });
  6  | 
  7  |     const balanceText = await page.locator('#balanceText').textContent();
  8  |     expect(balanceText).toContain('Balance');
  9  | 
  10 |     await page.locator('#spinBtn').click();
  11 | 
  12 |     await page.waitForTimeout(2000);
  13 | 
  14 |     const updateBalance = await page.locator('#balanceText').textContent();
  15 |     expect(updateBalance).toBeDefined();
  16 | });
  17 | 
  18 | test('bet buttons work', async ({ page }) => {
  19 |     await page.goto('http://localhost:5173');
  20 | 
  21 |     const initialBet = await page.locator('#betText').textContent();
  22 |     await page.locator('#betPlusBtn').click();
  23 | 
  24 |     const newBet = await page.locator('#betText').textContent();
> 25 |     expect(newBet).not.toEqual(initialBet);
     |                        ^ Error: expect(received).not.toEqual(expected) // deep equality
  26 | });
  27 | 
  28 | test('bonus round triggers', async ({ page }) => {
  29 |     await page.goto('http://localhost:5173');
  30 | 
  31 |     for (let i = 0; i < 20; i++) {
  32 |         await page.locator('#spinBtn').click();
  33 |         await page.waitForTimeout(500);
  34 |     }
  35 | 
  36 |     const bonusStatus = await page.locator('#bonusActiveText').textContent();
  37 |     expect(bonusStatus).toBe("BONUS");
  38 | });
```