import { beforeEach, describe, expect, it, vi } from "vitest";
import { UIManager } from "../../game/systems/UIManager.ts";

function mountDom(includeFloatingTexts = true) {
    document.body.innerHTML = `
        <div id="loadingScreen" style="display:flex"></div>
        <div id="uiPanel">
            <span id="balanceText"></span>
            <span id="betText"></span>
            <span id="multiplierText"></span>
            <span id="freeSpinsText"></span>
            <span id="bonusActiveText"></span>
        </div>
        <span id="betDisplayValue"></span>
        <button id="spinBtn"></button>
        <button id="buyBonusBtn"></button>
        <button id="betMinusBtn"></button>
        <button id="betPlusBtn"></button>
        ${includeFloatingTexts ? `<div id="currentWinText" style="display:none"></div><div id="statusText"></div>` : ""}
    `;
}

describe("UIManager", () => {
    beforeEach(() => {
        mountDom();
    });

    it("updates the main HUD values", () => {
        const ui = new UIManager();
        ui.updateAll({
            balance: 1234.56,
            bet: 2.5,
            multiplier: 4,
            freeSpins: 7,
            bonusActive: true,
            currentWin: 12.34,
        });

        expect(document.getElementById("balanceText")?.textContent).toBe("€1234.56");
        expect(document.getElementById("betText")?.textContent).toBe("€2.50");
        expect(document.getElementById("betDisplayValue")?.textContent).toBe("€2.50");
        expect(document.getElementById("multiplierText")?.textContent).toBe("x4");
        expect(document.getElementById("freeSpinsText")?.textContent).toBe("7");
        expect(document.getElementById("bonusActiveText")?.textContent).toBe("BONUS ACTIVE");
        expect(document.getElementById("currentWinText")?.textContent).toBe("WIN: €12.34");
    });

    it("creates floating text elements when they do not exist", () => {
        mountDom(false);

        const ui = new UIManager();
        ui.updateCurrentWin(3.21);
        ui.showBigWin();
        ui.showMaxWin();

        expect(document.getElementById("currentWinText")).not.toBeNull();
        expect(document.getElementById("statusText")).not.toBeNull();
    });

    it("locks and unlocks the core controls", () => {
        const ui = new UIManager();

        ui.lockUI();
        expect((document.getElementById("spinBtn") as HTMLButtonElement).disabled).toBe(true);
        expect((document.getElementById("betPlusBtn") as HTMLButtonElement).disabled).toBe(true);
        expect((document.getElementById("betMinusBtn") as HTMLButtonElement).disabled).toBe(true);

        ui.unlockUI();
        expect((document.getElementById("spinBtn") as HTMLButtonElement).disabled).toBe(false);
        expect((document.getElementById("betPlusBtn") as HTMLButtonElement).disabled).toBe(false);
        expect((document.getElementById("betMinusBtn") as HTMLButtonElement).disabled).toBe(false);
    });

    it("binds click handlers for the visible buttons", () => {
        const ui = new UIManager();
        const spin = vi.fn();
        const bonus = vi.fn();
        const inc = vi.fn();
        const dec = vi.fn();

        ui.onSpinButtonClick(spin);
        ui.onBuyBonusClick(bonus);
        ui.onBetIncrement(inc);
        ui.onBetDecrement(dec);

        document.getElementById("spinBtn")?.dispatchEvent(new MouseEvent("click"));
        document.getElementById("buyBonusBtn")?.dispatchEvent(new MouseEvent("click"));
        document.getElementById("betPlusBtn")?.dispatchEvent(new MouseEvent("click"));
        document.getElementById("betMinusBtn")?.dispatchEvent(new MouseEvent("click"));

        expect(spin).toHaveBeenCalledOnce();
        expect(bonus).toHaveBeenCalledOnce();
        expect(inc).toHaveBeenCalledOnce();
        expect(dec).toHaveBeenCalledOnce();
    });

    it("toggles loading screen visibility", () => {
        const ui = new UIManager();
        ui.showLoading(false);
        expect(document.getElementById("loadingScreen")?.style.display).toBe("none");

        ui.showLoading(true);
        expect(document.getElementById("loadingScreen")?.style.display).toBe("flex");
    });

    it("updates win and bonus text states", () => {
        const ui = new UIManager();
        ui.updateCurrentWin(0);
        expect(document.getElementById("currentWinText")?.style.display).toBe("none");

        ui.updateBonusStatus(false);
        expect(document.getElementById("bonusActiveText")?.textContent).toBe("BONUS INACTIVE");

        ui.updateBonusStatus(true);
        expect(document.getElementById("bonusActiveText")?.textContent).toBe("BONUS ACTIVE");
    });

    it("updates the separate bet display without breaking the HUD value", () => {
        const ui = new UIManager();
        ui.updateBet(0.7);

        expect(document.getElementById("betText")?.textContent).toBe("€0.70");
        expect(document.getElementById("betDisplayValue")?.textContent).toBe("€0.70");
    });
});
