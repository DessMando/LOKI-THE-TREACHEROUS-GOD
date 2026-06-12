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

describe("BonusSystem", () => {
    let bonus: BonusSystem;

    beforeEach(() => {
        bonus = new BonusSystem();
    });

    describe("initial state", () => {
        it("starts inactive with zero free spins", () => {
            expect(bonus.getIsBonusActive()).toBe(false);
            expect(bonus.getFreeSpins()).toBe(0);
        });
    });

    describe("buyBonus", () => {
        it("activates the bonus when balance covers the buy price", () => {
            expect(bonus.buyBonus(1000, 0.10)).toBe(true);
            expect(bonus.getIsBonusActive()).toBe(true);
            expect(bonus.getFreeSpins()).toBe(10);
        });

        it("rejects the buy when balance is too low", () => {
            expect(bonus.buyBonus(5, 0.10)).toBe(false);
            expect(bonus.getIsBonusActive()).toBe(false);
            expect(bonus.getFreeSpins()).toBe(0);
        });
    });

    describe("checkScatterBonus", () => {
        it("returns false when fewer than 4 scatters are present", () => {
            const grid = makeGrid(5, 6, 3);
            expect(bonus.checkScatterBonus(grid)).toBe(false);
        });

        it("returns true and activates the bonus at 4 scatters", () => {
            const grid = makeGrid(5, 6, 4);
            expect(bonus.checkScatterBonus(grid)).toBe(true);
            expect(bonus.getIsBonusActive()).toBe(true);
            expect(bonus.getFreeSpins()).toBe(10);
        });

        it("does not activate with exactly 3 scatters", () => {
            const grid = makeGrid(3, 3, 3);
            expect(bonus.checkScatterBonus(grid)).toBe(false);
            expect(bonus.getIsBonusActive()).toBe(false);
        });
    });

    describe("decrementSpin", () => {
        it("returns false when bonus is inactive", () => {
            expect(bonus.decrementSpin()).toBe(false);
        });

        it("decrements free spins and ends on the last spin", () => {
            bonus.buyBonus(1000, 0.10);

            for (let i = 0; i < 9; i++) {
                expect(bonus.decrementSpin()).toBe(false);
            }

            expect(bonus.decrementSpin()).toBe(true);
            expect(bonus.getIsBonusActive()).toBe(false);
            expect(bonus.getFreeSpins()).toBe(0);
        });
    });

    describe("resetBonus", () => {
        it("deactivates the bonus and clears free spins", () => {
            bonus.buyBonus(1000, 0.10);
            bonus.resetBonus();

            expect(bonus.getIsBonusActive()).toBe(false);
            expect(bonus.getFreeSpins()).toBe(0);
        });
    });

    describe("getBonus", () => {
        it("returns the current state", () => {
            bonus.buyBonus(1000, 0.10);

            const state = bonus.getBonus();
            expect(state.isBonusActive).toBe(true);
            expect(state.freeSpins).toBe(10);
        });
    });

    describe("updateUI", () => {
        it("writes the bonus state into the DOM", () => {
            document.body.innerHTML = `
                <div id="freeSpinsText"></div>
                <div id="bonusActiveText"></div>
            `;

            bonus.buyBonus(1000, 0.10);
            bonus.updateUI();

            expect(document.getElementById("freeSpinsText")?.textContent).toContain("Free Spins");
            expect(document.getElementById("bonusActiveText")?.textContent).toBe("BONUS");
        });
    });
});
