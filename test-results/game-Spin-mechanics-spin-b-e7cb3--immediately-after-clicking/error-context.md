# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Spin mechanics >> spin button is disabled immediately after clicking
- Location: e2e\game.spec.ts:70:5

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator:  locator('#spinBtn')
Expected: disabled
Received: enabled
Timeout:  5000ms

Call log:
  - Expect "toBeDisabled" with timeout 5000ms
  - waiting for locator('#spinBtn')
    14 × locator resolved to <button id="spinBtn" class="btn btn-lg shadow-lg px-5 py-3 fw-bold border-3 border-white btn-secondary">↵      SPIN↵    </button>
       - unexpected value "enabled"

```

```yaml
- button "SPIN"
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
  15  | /** Clicks spin and waits until the spin button is enabled again. */
  16  | async function spinAndWait(page: Page): Promise<void> {
  17  |     await page.locator("#spinBtn").click();
  18  |     await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
  19  | }
  20  | 
  21  | // ── page load ────────────────────────────────────────────────────────────────
  22  | 
  23  | test.describe("Page load", () => {
  24  |     test("loading screen disappears after init", async ({ page }) => {
  25  |         await page.goto("/");
  26  |         await expect(page.locator("#loadingScreen")).toBeHidden({ timeout: 10000 });
  27  |     });
  28  | 
  29  |     test("spin button is visible and enabled", async ({ page }) => {
  30  |         await page.goto("/");
  31  |         await expect(page.locator("#spinBtn")).toBeVisible();
  32  |         await expect(page.locator("#spinBtn")).toBeEnabled();
  33  |     });
  34  | 
  35  |     test("balance starts at €1000", async ({ page }) => {
  36  |         await page.goto("/");
  37  |         expect(await getBalance(page)).toBe(1000);
  38  |     });
  39  | 
  40  |     test("bet text shows a value above 0", async ({ page }) => {
  41  |         await page.goto("/");
  42  |         expect(await getBet(page)).toBeGreaterThan(0);
  43  |     });
  44  | 
  45  |     test("all main UI elements are present", async ({ page }) => {
  46  |         await page.goto("/");
  47  |         await expect(page.locator("#spinBtn")).toBeVisible();
  48  |         await expect(page.locator("#betText")).toBeVisible();
  49  |         await expect(page.locator("#balanceText")).toBeVisible();
  50  |         await expect(page.locator("#multiplierText")).toBeVisible();
  51  |         await expect(page.locator("#betPlusBtn")).toBeVisible();
  52  |         await expect(page.locator("#betMinusBtn")).toBeVisible();
  53  |         await expect(page.locator("#buyBonusBtn")).toBeVisible();
  54  |     });
  55  | 
  56  |     test("bigWinText and maxWinText are hidden by default", async ({ page }) => {
  57  |         await page.goto("/");
  58  |         await expect(page.locator("#bigWinText")).toBeHidden();
  59  |         await expect(page.locator("#maxWinText")).toBeHidden();
  60  |     });
  61  | });
  62  | 
  63  | // ── spin mechanics ────────────────────────────────────────────────────────────
  64  | 
  65  | test.describe("Spin mechanics", () => {
  66  |     test.beforeEach(async ({ page }) => {
  67  |         await page.goto("/");
  68  |     });
  69  | 
  70  |     test("spin button is disabled immediately after clicking", async ({ page }) => {
  71  |         await page.locator("#spinBtn").click();
> 72  |         await expect(page.locator("#spinBtn")).toBeDisabled();
      |                                                ^ Error: expect(locator).toBeDisabled() failed
  73  |     });
  74  | 
  75  |     test("spin button re-enables after spin completes", async ({ page }) => {
  76  |         await spinAndWait(page);
  77  |         await expect(page.locator("#spinBtn")).toBeEnabled();
  78  |     });
  79  | 
  80  |     test("balance changes after a spin", async ({ page }) => {
  81  |         const before = await getBalance(page);
  82  |         await spinAndWait(page);
  83  |         const after = await getBalance(page);
  84  |         // balance either dropped (bet deducted) or went up (win), never stays identical guaranteed
  85  |         expect(after).not.toBeNaN();
  86  |         expect(after).toBeGreaterThanOrEqual(0);
  87  |         // At minimum the bet was deducted
  88  |         expect(after).toBeLessThanOrEqual(before);
  89  |     });
  90  | 
  91  |     test("bet buttons are disabled during a spin", async ({ page }) => {
  92  |         await page.locator("#spinBtn").click();
  93  |         await expect(page.locator("#betPlusBtn")).toBeDisabled();
  94  |         await expect(page.locator("#betMinusBtn")).toBeDisabled();
  95  |     });
  96  | 
  97  |     test("bet buttons re-enable after spin completes", async ({ page }) => {
  98  |         await spinAndWait(page);
  99  |         await expect(page.locator("#betPlusBtn")).toBeEnabled();
  100 |         await expect(page.locator("#betMinusBtn")).toBeEnabled();
  101 |     });
  102 | 
  103 |     test("second spin click while spinning does not deduct double", async ({ page }) => {
  104 |         const before = await getBalance(page);
  105 |         await page.locator("#spinBtn").click();
  106 |         await page.locator("#spinBtn").click({ force: true });
  107 |         await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
  108 |         const after = await getBalance(page);
  109 |         // Only one bet should have been deducted (max €150 max bet)
  110 |         expect(before - after).toBeLessThanOrEqual(150);
  111 |     });
  112 | });
  113 | 
  114 | // ── betting system ────────────────────────────────────────────────────────────
  115 | 
  116 | test.describe("Betting system", () => {
  117 |     test.beforeEach(async ({ page }) => {
  118 |         await page.goto("/");
  119 |     });
  120 | 
  121 |     test("bet increases by €0.10 when + is clicked", async ({ page }) => {
  122 |         const before = await getBet(page);
  123 |         await page.locator("#betPlusBtn").click({force: true});
  124 |         const after = await getBet(page);
  125 |         expect(after).toBeCloseTo(before + 0.10, 2);
  126 |     });
  127 | 
  128 |     test("bet decreases by €0.10 when - is clicked", async ({ page }) => {
  129 |         await page.locator("#betPlusBtn").click();
  130 |         const before = await getBet(page);
  131 |         await page.locator("#betMinusBtn").click();
  132 |         const after = await getBet(page);
  133 |         expect(after).toBeCloseTo(before - 0.10, 2);
  134 |     });
  135 | 
  136 |     test("bet does not go below €0.10", async ({ page }) => {
  137 |         await page.locator("#betMinusBtn").click();
  138 |         expect(await getBet(page)).toBeGreaterThanOrEqual(0.10);
  139 |     });
  140 | 
  141 |     test("bet text updates after clicking +", async ({ page }) => {
  142 |         await page.locator("#betPlusBtn").click();
  143 |         const text = await page.locator("#betText").textContent();
  144 |         expect(text).toContain("0.20");
  145 |     });
  146 | });
  147 | 
  148 | // ── bonus system ──────────────────────────────────────────────────────────────
  149 | 
  150 | test.describe("Bonus system", () => {
  151 |     test.beforeEach(async ({ page }) => {
  152 |         await page.goto("/");
  153 |     });
  154 | 
  155 |     test("buy bonus button activates the bonus immediately", async ({ page }) => {
  156 |         await page.locator("#buyBonusBtn").click();
  157 |         const text = await page.locator("#bonusActiveText").textContent();
  158 |         expect(text?.toLowerCase()).toContain("bonus");
  159 |     });
  160 | 
  161 |     test("free spins text appears when bonus is active", async ({ page }) => {
  162 |         await page.locator("#buyBonusBtn").click();
  163 |         const text = await page.locator("#freeSpinsText").textContent();
  164 |         expect(text).toBeDefined();
  165 |     });
  166 | 
  167 |     test("free spins counter changes after spinning in bonus", async ({ page }) => {
  168 |         await page.locator("#buyBonusBtn").click();
  169 |         const before = await page.locator("#freeSpinsText").textContent();
  170 |         await spinAndWait(page);
  171 |         const after = await page.locator("#freeSpinsText").textContent();
  172 |         expect(after).not.toEqual(before);
```