import { describe, it, expect, beforeEach } from "vitest";
import { BonusSystem } from "../../game/systems/BonusSystem.ts";

function makeSymbol(type: string) {
    return { type } as any;
}

function makeGrid(rows: number, cols: number, fill = "rune") {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => makeSymbol(fill))
    );
}

describe("BonusSystem", () => {
    let bonus: BonusSystem;

    beforeEach(() => {
        bonus = new BonusSystem();
    });

    describe("initial state", () => {
        it("bonus is not active at start", () => {
            expect(bonus.getIsBonusActive()).toBe(false);
        });

        it("free spins is 0 at start", () => {
            expect(bonus.getFreeSpins()).toBe(0);
        });
    });

    describe("buyBonus", () => {
        it("activates the bonus", () => {
            bonus.buyBonus();
            expect(bonus.getIsBonusActive()).toBe(true);
        });

        it("grants 10 free spins", () => {
            bonus.buyBonus();
            expect(bonus.getFreeSpins()).toBe(10);
        });
    });

    describe("checkScatterBonus", () => {
        it("returns false when fewer than 4 scatters", () => {
            const grid = makeGrid(7, 7);
            grid[0][0] = makeSymbol("scatter");
            grid[0][1] = makeSymbol("scatter");
            grid[0][2] = makeSymbol("scatter");
            expect(bonus.checkScatterBonus(grid)).toBe(false);
        });

        it("returns true and activates bonus when 4+ scatters present", () => {
            const grid = makeGrid(7, 7);
            grid[0][0] = makeSymbol("scatter");
            grid[0][1] = makeSymbol("scatter");
            grid[0][2] = makeSymbol("scatter");
            grid[0][3] = makeSymbol("scatter");
            expect(bonus.checkScatterBonus(grid)).toBe(true);
            expect(bonus.getIsBonusActive()).toBe(true);
            expect(bonus.getFreeSpins()).toBe(10);
        });

        it("does not activate with exactly 3 scatters", () => {
            const grid = makeGrid(3, 3);
            grid[0][0] = makeSymbol("scatter");
            grid[0][1] = makeSymbol("scatter");
            grid[1][0] = makeSymbol("scatter");
            bonus.checkScatterBonus(grid);
            expect(bonus.getIsBonusActive()).toBe(false);
        });
    });

    describe("decrementSpin", () => {
        it("returns false when bonus is not active", () => {
            expect(bonus.decrementSpin()).toBe(false);
        });

        it("decrements free spins by 1 each call", () => {
            bonus.buyBonus();
            bonus.decrementSpin();
            expect(bonus.getFreeSpins()).toBe(9);
        });

        it("deactivates bonus when free spins reach 0", () => {
            bonus.buyBonus();
            for (let i = 0; i < 10; i++) bonus.decrementSpin();
            expect(bonus.getIsBonusActive()).toBe(false);
            expect(bonus.getFreeSpins()).toBe(0);
        });

        it("returns true (bonus ended) on the last decrement", () => {
            bonus.buyBonus();
            for (let i = 0; i < 9; i++) bonus.decrementSpin();
            expect(bonus.decrementSpin()).toBe(true);
        });

        it("returns false while free spins still remain", () => {
            bonus.buyBonus();
            expect(bonus.decrementSpin()).toBe(false);
        });
    });

    describe("resetBonus", () => {
        it("deactivates the bonus", () => {
            bonus.buyBonus();
            bonus.resetBonus();
            expect(bonus.getIsBonusActive()).toBe(false);
        });

        it("resets free spins to 0", () => {
            bonus.buyBonus();
            bonus.resetBonus();
            expect(bonus.getFreeSpins()).toBe(0);
        });
    });

    describe("getBonus", () => {
        it("returns correct state when active", () => {
            bonus.buyBonus();
            const state = bonus.getBonus();
            expect(state.isBonusActive).toBe(true);
            expect(state.freeSpins).toBe(10);
        });

        it("returns correct state after reset", () => {
            bonus.buyBonus();
            bonus.resetBonus();
            const state = bonus.getBonus();
            expect(state.isBonusActive).toBe(false);
            expect(state.freeSpins).toBe(0);
        });
    });
});