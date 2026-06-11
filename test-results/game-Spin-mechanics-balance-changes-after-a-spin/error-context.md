# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Spin mechanics >> balance changes after a spin
- Location: e2e\game.spec.ts:79:5

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1000
Received:    1002.3
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: BALANCE
        - text: "Balance: €1002.30"
      - generic [ref=e6]:
        - generic [ref=e7]: BET
        - text: "Bet: €0.10"
      - generic [ref=e8]:
        - generic [ref=e9]: MULTIPLIER
        - text: "Multiplier: x2"
      - generic [ref=e10]:
        - generic [ref=e11]: FREE SPINS
        - generic [ref=e12]: 🎁 10 FREE SPINS
      - generic [ref=e13]: 🔥 BONUS ACTIVE
    - generic [ref=e14]:
      - button "TURBO OFF" [ref=e15] [cursor=pointer]
      - button "AUTO PLAY" [ref=e16] [cursor=pointer]
  - contentinfo [ref=e17]:
    - generic [ref=e18]:
      - button "-" [ref=e19] [cursor=pointer]
      - button "+" [ref=e20] [cursor=pointer]
    - button "SPIN" [ref=e22] [cursor=pointer]
    - button "BUY BONUS" [ref=e24] [cursor=pointer]
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
  17  |     await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 15000 });
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
> 87  |         expect(after).toBeLessThanOrEqual(before);
      |                       ^ Error: expect(received).toBeLessThanOrEqual(expected)
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
  118 |     });
  119 | 
  120 |     test("bet increases by €0.10 when + is clicked", async ({ page }) => {
  121 |         const before = await getBet(page);
  122 |         await page.locator("#betPlusBtn").click({force: true});
  123 |         const after = await getBet(page);
  124 |         expect(after).toBeCloseTo(before + 0.10, 2);
  125 |     });
  126 | 
  127 |     test("bet decreases by €0.10 when - is clicked", async ({ page }) => {
  128 |         await page.locator("#betPlusBtn").click();
  129 |         const before = await getBet(page);
  130 |         await page.locator("#betMinusBtn").click();
  131 |         const after = await getBet(page);
  132 |         expect(after).toBeCloseTo(before - 0.10, 2);
  133 |     });
  134 | 
  135 |     test("bet does not go below €0.10", async ({ page }) => {
  136 |         await page.locator("#betMinusBtn").click();
  137 |         expect(await getBet(page)).toBeGreaterThanOrEqual(0.10);
  138 |     });
  139 | 
  140 |     test("bet text updates after clicking +", async ({ page }) => {
  141 |         await page.locator("#betPlusBtn").click();
  142 |         const text = await page.locator("#betText").textContent();
  143 |         expect(text).toContain("0.20");
  144 |     });
  145 | });
  146 | 
  147 | // ── bonus system ──────────────────────────────────────────────────────────────
  148 | 
  149 | test.describe("Bonus system", () => {
  150 |     test.beforeEach(async ({ page }) => {
  151 |         await page.goto("/");
  152 |     });
  153 | 
  154 |     test("buy bonus button activates the bonus immediately", async ({ page }) => {
  155 |         await page.locator("#buyBonusBtn").click();
  156 |         const text = await page.locator("#bonusActiveText").textContent();
  157 |         expect(text?.toLowerCase()).toContain("bonus");
  158 |     });
  159 | 
  160 |     test("free spins text appears when bonus is active", async ({ page }) => {
  161 |         await page.locator("#buyBonusBtn").click();
  162 |         const text = await page.locator("#freeSpinsText").textContent();
  163 |         expect(text).toBeDefined();
  164 |     });
  165 | 
  166 |     test("free spins counter changes after spinning in bonus", async ({ page }) => {
  167 |         await page.locator("#buyBonusBtn").click();
  168 |         const before = await page.locator("#freeSpinsText").textContent();
  169 |         await spinAndWait(page);
  170 |         const after = await page.locator("#freeSpinsText").textContent();
  171 |         expect(after).not.toEqual(before);
  172 |     });
  173 | });
  174 | 
  175 | // ── full session ──────────────────────────────────────────────────────────────
  176 | 
  177 | test.describe("Spin session stability", () => {
  178 |     test("balance remains a valid number after 10 spins", async ({ page }) => {
  179 |         await page.goto("/");
  180 |         for (let i = 0; i < 10; i++) {
  181 |             await spinAndWait(page);
  182 |         }
  183 |         const balance = await getBalance(page);
  184 |         expect(isNaN(balance)).toBe(false);
  185 |         expect(balance).toBeGreaterThanOrEqual(0);
  186 |     });
  187 | 
```