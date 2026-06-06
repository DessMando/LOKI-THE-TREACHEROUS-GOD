# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> spin button is disabled immediately after clicking
- Location: e2e\game.spec.ts:206:1

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
  173 |     });
  174 | });
  175 | 
  176 | // ── full session ──────────────────────────────────────────────────────────────
  177 | 
  178 | test.describe("Spin session stability", () => {
  179 |     test("balance remains a valid number after 10 spins", async ({ page }) => {
  180 |         await page.goto("/");
  181 |         for (let i = 0; i < 10; i++) {
  182 |             await spinAndWait(page);
  183 |         }
  184 |         const balance = await getBalance(page);
  185 |         expect(isNaN(balance)).toBe(false);
  186 |         expect(balance).toBeGreaterThanOrEqual(0);
  187 |     });
  188 | 
  189 |     test("UI remains functional after 10 spins", async ({ page }) => {
  190 |         await page.goto("/");
  191 |         for (let i = 0; i < 10; i++) {
  192 |             await spinAndWait(page);
  193 |         }
  194 |         await expect(page.locator("#spinBtn")).toBeEnabled();
  195 |         await expect(page.locator("#balanceText")).toBeVisible();
  196 |         await expect(page.locator("#betText")).toBeVisible();
  197 |     });
  198 | });
  199 | 
  200 | test.beforeEach(async ({ page }) => {
  201 |     await page.goto("/");
  202 |     // Wacht tot loading screen verdwijnt = spel is volledig geladen
  203 |     await page.waitForSelector("#loadingScreen", { state: "hidden", timeout: 15000 });
  204 | });
  205 | 
  206 | test("spin button is disabled immediately after clicking", async ({ page }) => {
  207 |     await page.locator("#spinBtn").click();
> 208 |     await expect(page.locator("#spinBtn")).toBeDisabled();
      |                                            ^ Error: expect(locator).toBeDisabled() failed
  209 | });
  210 | 
  211 | test("spin button re-enables after spin completes", async ({ page }) => {
  212 |     await page.locator("#spinBtn").click();
  213 |     await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 10000 });
  214 | });
```