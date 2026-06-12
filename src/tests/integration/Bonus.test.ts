import { beforeEach, describe, expect, it } from "vitest";
import { BonusSystem } from "../../game/systems/BonusSystem.ts";

function makeGrid(rows: number, cols: number, scatterCount = 0) {
    const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ type: "rune" } as any))
    );

    let placed = 0;
    for (let row = 0; row < rows && placed < scatterCount; row++) {
        for (let col = 0; col < cols && placed < scatterCount; col++) {
            grid[row][col] = { type: "scatter" } as any;
            placed++;
        }
    }

    return grid;
}

describe("BonusSystem integration", () => {
    let bonus: BonusSystem;

    beforeEach(() => {
        bonus = new BonusSystem();
    });

    it("starts the bonus when 4 scatters land on the grid", () => {
        const grid = makeGrid(5, 6, 4);

        expect(bonus.checkScatterBonus(grid)).toBe(true);
        expect(bonus.getIsBonusActive()).toBe(true);
        expect(bonus.getFreeSpins()).toBe(10);
    });

    it("does not start the bonus with fewer than 4 scatters", () => {
        const grid = makeGrid(5, 6, 3);

        expect(bonus.checkScatterBonus(grid)).toBe(false);
        expect(bonus.getIsBonusActive()).toBe(false);
        expect(bonus.getFreeSpins()).toBe(0);
    });

    it("allows buying the bonus when balance covers the buy price", () => {
        expect(bonus.buyBonus(1000, 0.10)).toBe(true);
        expect(bonus.getIsBonusActive()).toBe(true);
        expect(bonus.getFreeSpins()).toBe(10);
    });

    it("rejects buying the bonus when balance is too low", () => {
        expect(bonus.buyBonus(5, 0.10)).toBe(false);
        expect(bonus.getIsBonusActive()).toBe(false);
        expect(bonus.getFreeSpins()).toBe(0);
    });

    it("decrements free spins and ends the bonus on the last spin", () => {
        bonus.buyBonus(1000, 0.10);

        for (let i = 0; i < 9; i++) {
            expect(bonus.decrementSpin()).toBe(false);
        }

        expect(bonus.decrementSpin()).toBe(true);
        expect(bonus.getIsBonusActive()).toBe(false);
        expect(bonus.getFreeSpins()).toBe(0);
    });

    it("updates the visible bonus UI state", () => {
        document.body.innerHTML = `
            <div id="freeSpinsText"></div>
            <div id="bonusActiveText"></div>
        `;

        bonus.buyBonus(1000, 0.10);
        bonus.updateUI();

        expect(document.getElementById("freeSpinsText")?.textContent).toContain("10");
        expect(document.getElementById("bonusActiveText")?.textContent).toBe("BONUS");
    });
});
