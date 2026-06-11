# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Spin session stability >> UI remains functional after 10 spins
- Location: e2e\game.spec.ts:188:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeEnabled() failed

Locator:  locator('#spinBtn')
Expected: enabled
Received: disabled

Call log:
  - Expect "toBeEnabled" with timeout 15000ms
  - waiting for locator('#spinBtn')
    4 × locator resolved to <button disabled id="spinBtn" class="btn btn-lg shadow-lg px-5 py-3 fw-bold border-3 border-white btn-secondary">↵      SPIN↵    </button>
      - unexpected value "disabled"

```

```yaml
- button "SPIN" [disabled]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | // ── helpers ──────────────────────────────────────────────────────────────────
  4   | 
  5   | async function getBalance(page: Page): Promise<number> {
  6   |     const text = await page.locator("#balanceText").textContent() ?? "";
  7   |     return parseFloat(text.match(/€([\d.]+)/)?.[1] ?? "0");
  8   | }
  9   | 
  10  | async function getBet(page: Page): Promise<number> {
  11  |     const text = await page.locator("#betText").textContent() ?? "";
  12  |     return parseFloat(text.match(/€([\d.]+)/)?.[1] ?? "0");
  13  | }
  14  | 
  15  | async function spinAndWait(page: Page): Promise<void> {
  16  |     await page.locator("#spinBtn").click();
> 17  |     await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
      |                                            ^ Error: expect(locator).toBeEnabled() failed
  18  | }
  19  | 
  20  | // ── page load ────────────────────────────────────────────────────────────────
  21  | 
  22  | test.describe("Page load", () => {
  23  |     test("loading screen disappears after init", async ({ page }) => {
  24  |         await page.goto("/");
  25  |         await expect(page.locator("#loadingScreen")).toBeHidden({ timeout: 10000 });
  26  |     });
  27  | 
  28  |     test("spin button is visible and enabled", async ({ page }) => {
  29  |         await page.goto("/");
  30  |         await expect(page.locator("#spinBtn")).toBeVisible();
  31  |         await expect(page.locator("#spinBtn")).toBeEnabled();
  32  |     });
  33  | 
  34  |     test("balance starts at €1000", async ({ page }) => {
  35  |         await page.goto("/");
  36  |         expect(await getBalance(page)).toBe(1000);
  37  |     });
  38  | 
  39  |     test("bet text shows a value above 0", async ({ page }) => {
  40  |         await page.goto("/");
  41  |         expect(await getBet(page)).toBeGreaterThan(0);
  42  |     });
  43  | 
  44  |     test("all main UI elements are present", async ({ page }) => {
  45  |         await page.goto("/");
  46  |         await expect(page.locator("#spinBtn")).toBeVisible();
  47  |         await expect(page.locator("#betText")).toBeVisible();
  48  |         await expect(page.locator("#balanceText")).toBeVisible();
  49  |         await expect(page.locator("#multiplierText")).toBeVisible();
  50  |         await expect(page.locator("#betPlusBtn")).toBeVisible();
  51  |         await expect(page.locator("#betMinusBtn")).toBeVisible();
  52  |         await expect(page.locator("#buyBonusBtn")).toBeVisible();
  53  |     });
  54  | 
  55  |     test("bigWinText and maxWinText are hidden by default", async ({ page }) => {
  56  |         await page.goto("/");
  57  |         await expect(page.locator("#bigWinText")).toBeHidden();
  58  |         await expect(page.locator("#maxWinText")).toBeHidden();
  59  |     });
  60  | });
  61  | 
  62  | // ── spin mechanics ────────────────────────────────────────────────────────────
  63  | 
  64  | test.describe("Spin mechanics", () => {
  65  |     test.beforeEach(async ({ page }) => {
  66  |         await page.goto("/");
  67  |     });
  68  | 
  69  |     test("spin button is disabled immediately after clicking", async ({ page }) => {
  70  |         await page.locator("#spinBtn").click();
  71  |         await expect(page.locator("#spinBtn")).toBeDisabled();
  72  |     });
  73  | 
  74  |     test("spin button re-enables after spin completes", async ({ page }) => {
  75  |         await spinAndWait(page);
  76  |         await expect(page.locator("#spinBtn")).toBeEnabled();
  77  |     });
  78  | 
  79  |     test("balance changes after a spin", async ({ page }) => {
  80  |         const before = await getBalance(page);
  81  |         await spinAndWait(page);
  82  |         const after = await getBalance(page);
  83  |         // balance either dropped (bet deducted) or went up (win), never stays identical guaranteed
  84  |         expect(after).not.toBeNaN();
  85  |         expect(after).toBeGreaterThanOrEqual(0);
  86  |         // At minimum the bet was deducted
  87  |         expect(after).toBeLessThanOrEqual(before);
  88  |     });
  89  | 
  90  |     test("bet buttons are disabled during a spin", async ({ page }) => {
  91  |         await page.locator("#spinBtn").click();
  92  |         await expect(page.locator("#betPlusBtn")).toBeDisabled();
  93  |         await expect(page.locator("#betMinusBtn")).toBeDisabled();
  94  |     });
  95  | 
  96  |     test("bet buttons re-enable after spin completes", async ({ page }) => {
  97  |         await spinAndWait(page);
  98  |         await expect(page.locator("#betPlusBtn")).toBeEnabled();
  99  |         await expect(page.locator("#betMinusBtn")).toBeEnabled();
  100 |     });
  101 | 
  102 |     test("second spin click while spinning does not deduct double", async ({ page }) => {
  103 |         const before = await getBalance(page);
  104 |         await page.locator("#spinBtn").click();
  105 |         await page.locator("#spinBtn").click({ force: true });
  106 |         await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
  107 |         const after = await getBalance(page);
  108 |         // Only one bet should have been deducted (max €150 max bet)
  109 |         expect(before - after).toBeLessThanOrEqual(150);
  110 |     });
  111 | });
  112 | 
  113 | // ── betting system ────────────────────────────────────────────────────────────
  114 | 
  115 | test.describe("Betting system", () => {
  116 |     test.beforeEach(async ({ page }) => {
  117 |         await page.goto("/");
```