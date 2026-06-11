import { describe, it, expect, beforeEach } from "vitest";
import { WinSystem } from "../../game/systems/WinSystem.ts";

function makeSymbol(type: string, row: number, col: number, multiplier = 1) {
    return {
        type,
        row,
        col,
        multiplier,
        multiplierText: { text: "" },
        changeType(_t: string) {},
        async magicEffect() {},
    } as any;
}

function emptyGrid(rows = 7, cols = 7) {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => makeSymbol("rune", r, c))
    );
}

describe("WinSystem", () => {
    let win: WinSystem;

    beforeEach(() => {
        win = new WinSystem();
    });

    describe("findAllClusters", () => {
        it("returns empty array when no cluster of 4+ exists", () => {
            const grid = emptyGrid(3, 3);
            grid[0][0] = makeSymbol("crown", 0, 0);
            grid[0][1] = makeSymbol("crown", 0, 1);
            grid[0][2] = makeSymbol("crown", 0, 2);
            expect(win.findAllClusters(grid)).toHaveLength(0);
        });

        it("detects a horizontal cluster of 4", () => {
            const grid = emptyGrid(3, 7);
            for (let c = 0; c < 4; c++) grid[0][c] = makeSymbol("crown", 0, c);
            const clusters = win.findAllClusters(grid);
            expect(clusters.length).toBeGreaterThanOrEqual(1);
            expect(clusters[0].length).toBeGreaterThanOrEqual(4);
        });

        it("detects a vertical cluster of 4", () => {
            const grid = emptyGrid(7, 3);
            for (let r = 0; r < 4; r++) grid[r][0] = makeSymbol("orb", r, 0);
            expect(win.findAllClusters(grid).length).toBeGreaterThanOrEqual(1);
        });

        it("detects two separate clusters of different types", () => {
            const grid = emptyGrid(2, 8);
            for (let c = 0; c < 4; c++) grid[0][c] = makeSymbol("crown", 0, c);
            for (let c = 0; c < 4; c++) grid[1][c] = makeSymbol("wolf",  1, c);
            expect(win.findAllClusters(grid).length).toBe(2);
        });

        it("counts each symbol only once across clusters", () => {
            const grid = emptyGrid(3, 4);
            for (let c = 0; c < 4; c++) grid[0][c] = makeSymbol("wild", 0, c);
            grid[1][0] = makeSymbol("wild", 1, 0);
            const clusters = win.findAllClusters(grid);
            const total = clusters.reduce((s, c) => s + c.length, 0);
            expect(total).toBe(5);
        });

        it("does not crash on null cells", () => {
            const grid = emptyGrid(3, 3);
            (grid[1][1] as any) = null;
            expect(() => win.findAllClusters(grid)).not.toThrow();
        });
    });

    describe("calculateTotalMultiplier", () => {
        it("returns 1 when all symbols have multiplier 1", () => {
            expect(win.calculateTotalMultiplier(emptyGrid(3, 3))).toBe(1);
        });

        it("adds extra multiplier points from boosted symbols", () => {
            const grid = emptyGrid(2, 2);
            grid[0][0] = makeSymbol("rune", 0, 0, 3); // +2
            grid[0][1] = makeSymbol("rune", 0, 1, 2); // +1
            expect(win.calculateTotalMultiplier(grid)).toBe(4);
        });

        it("handles null cells without crashing", () => {
            const grid = emptyGrid(2, 2);
            (grid[0][0] as any) = null;
            expect(() => win.calculateTotalMultiplier(grid)).not.toThrow();
        });
    });

    describe("checkBigWin", () => {
        it("returns null for a small payout", () => {
            expect(win.checkBigWin(100)).toBeNull();
        });

        it("returns 'big' for payout >= 500", () => {
            expect(win.checkBigWin(500)).toBe("big");
            expect(win.checkBigWin(1999)).toBe("big");
        });

        it("returns 'max' for payout >= 2000", () => {
            expect(win.checkBigWin(2000)).toBe("max");
            expect(win.checkBigWin(9999)).toBe("max");
        });
    });

    describe("applyRandomMultiplier", () => {
        it("increases at least one symbol's multiplier", () => {
            const grid = emptyGrid(3, 3);
            const before = grid.flat().map(s => s.multiplier);
            win.applyRandomMultiplier(grid, false);
            const after = grid.flat().map(s => s.multiplier);
            expect(after.some((v, i) => v > before[i])).toBe(true);
        });

        it("boosts by +2 when bonus is active", () => {
            const grid = emptyGrid(1, 1);
            const sym = grid[0][0];
            const orig = Math.random;
            Math.random = () => 0;
            win.applyRandomMultiplier(grid, true);
            Math.random = orig;
            expect(sym.multiplier).toBe(3);
        });

        it("boosts by +1 when bonus is not active", () => {
            const grid = emptyGrid(1, 1);
            const sym = grid[0][0];
            const orig = Math.random;
            Math.random = () => 0;
            win.applyRandomMultiplier(grid, false);
            Math.random = orig;
            expect(sym.multiplier).toBe(2);
        });

        it("does not crash on empty grid", () => {
            expect(() => win.applyRandomMultiplier([], false)).not.toThrow();
        });
    });
});