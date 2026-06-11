# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Bonus system >> free spins counter changes after spinning in bonus
- Location: e2e\game.spec.ts:166:5

# Error details

```
Error: expect(received).not.toEqual(expected) // deep equality

Expected: not "🎁 10 FREE SPINS"

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
        - text: "Multiplier: x3"
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
> 171 |         expect(after).not.toEqual(before);
      |                           ^ Error: expect(received).not.toEqual(expected) // deep equality
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
  188 |     test("UI remains functional after 10 spins", async ({ page }) => {
  189 |         await page.goto("/");
  190 |         for (let i = 0; i < 10; i++) {
  191 |             await spinAndWait(page);
  192 |         }
  193 |         await expect(page.locator("#spinBtn")).toBeEnabled();
  194 |         await expect(page.locator("#balanceText")).toBeVisible();
  195 |         await expect(page.locator("#betText")).toBeVisible();
  196 |     });
  197 | });
  198 | 
  199 | test.beforeEach(async ({ page }) => {
  200 |     await page.goto("/");
  201 |     // Wacht tot loading screen verdwijnt = spel is volledig geladen
  202 |     await page.waitForSelector("#loadingScreen", { state: "hidden", timeout: 15000 });
  203 | });
  204 | 
  205 | test("spin button is disabled immediately after clicking", async ({ page }) => {
  206 |     await page.locator("#spinBtn").click();
  207 |     await expect(page.locator("#spinBtn")).toBeDisabled();
  208 | });
  209 | 
  210 | test("spin button re-enables after spin completes", async ({ page }) => {
  211 |     await page.locator("#spinBtn").click();
  212 |     await expect(page.locator("#spinBtn")).toBeEnabled({ timeout: 10000 });
  213 | });
```