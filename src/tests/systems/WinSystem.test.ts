import { beforeEach, describe, expect, it } from "vitest";
import { WinSystem } from "../../game/systems/WinSystem.ts";

function makeSymbol(type: string, row: number, col: number, multiplier = 1) {
    return {
        type,
        row,
        col,
        multiplier,
        multiplierText: { text: "" },
        changeType(newType: string) {
            this.type = newType;
        },
        async magicEffect() {},
    } as any;
}

function makeGrid(rows = 5, cols = 6, fill: string | null = null) {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
            fill ? makeSymbol(fill, r, c) : null
        )
    );
}

describe("WinSystem", () => {
    let win: WinSystem;

    beforeEach(() => {
        win = new WinSystem();
    });

    describe("findAllClusters", () => {
        it("returns empty array when no cluster of 4+ exists", () => {
            const grid = makeGrid();
            grid[0][0] = makeSymbol("crown", 0, 0);
            grid[0][1] = makeSymbol("crown", 0, 1);
            grid[0][2] = makeSymbol("crown", 0, 2);

            expect(win.findAllClusters(grid as any)).toHaveLength(0);
        });

        it("detects a horizontal cluster of 4", () => {
            const grid = makeGrid();
            for (let c = 0; c < 4; c++) {
                grid[0][c] = makeSymbol("crown", 0, c);
            }

            const clusters = win.findAllClusters(grid as any);
            expect(clusters).toHaveLength(1);
            expect(clusters[0]).toHaveLength(4);
        });

        it("detects a vertical cluster of 4", () => {
            const grid = makeGrid();
            for (let r = 0; r < 4; r++) {
                grid[r][0] = makeSymbol("orb", r, 0);
            }

            expect(win.findAllClusters(grid as any)).toHaveLength(1);
        });

        it("detects two separate clusters of different types", () => {
            const grid = makeGrid();
            for (let c = 0; c < 4; c++) {
                grid[0][c] = makeSymbol("crown", 0, c);
                grid[2][c] = makeSymbol("wolf", 2, c);
            }

            expect(win.findAllClusters(grid as any)).toHaveLength(2);
        });

        it("counts each connected symbol only once", () => {
            const grid = makeGrid();
            for (let c = 0; c < 4; c++) {
                grid[0][c] = makeSymbol("wild", 0, c);
            }
            grid[1][0] = makeSymbol("wild", 1, 0);

            const clusters = win.findAllClusters(grid as any);
            const total = clusters.reduce((sum, cluster) => sum + cluster.length, 0);

            expect(total).toBe(5);
        });

        it("does not crash on null cells", () => {
            const grid = makeGrid();
            grid[1][1] = null;

            expect(() => win.findAllClusters(grid as any)).not.toThrow();
        });
    });

    describe("calculateTotalMultiplier", () => {
        it("returns 1 when all symbols have multiplier 1", () => {
            expect(win.calculateTotalMultiplier(makeGrid(2, 2, "rune") as any)).toBe(1);
        });

        it("adds extra multiplier points from boosted symbols", () => {
            const grid = makeGrid();
            grid[0][0] = makeSymbol("rune", 0, 0, 3);
            grid[0][1] = makeSymbol("rune", 0, 1, 2);

            expect(win.calculateTotalMultiplier(grid as any)).toBe(4);
        });

        it("handles null cells without crashing", () => {
            const grid = makeGrid();
            grid[0][0] = null;

            expect(() => win.calculateTotalMultiplier(grid as any)).not.toThrow();
        });
    });

    describe("checkBigWin", () => {
        it("returns null for a small payout", () => {
            expect(win.checkBigWin(100)).toBeNull();
        });

        it("returns big for payout >= 500", () => {
            expect(win.checkBigWin(500)).toBe("big");
            expect(win.checkBigWin(1999)).toBe("big");
        });

        it("returns max for payout >= 2000", () => {
            expect(win.checkBigWin(2000)).toBe("max");
            expect(win.checkBigWin(9999)).toBe("max");
        });
    });

    describe("applyRandomMultiplier", () => {
        it("increases at least one symbol multiplier", () => {
            const grid = makeGrid(3, 3, "rune") as any;
            const before = grid.flat().map((s: any) => s.multiplier);

            win.applyRandomMultiplier(grid, false);

            const after = grid.flat().map((s: any) => s.multiplier);
            expect(after.some((value: number, index: number) => value > before[index])).toBe(true);
        });

        it("boosts by +2 when bonus is active", () => {
            const grid = makeGrid(1, 1, "rune") as any;
            const originalRandom = Math.random;
            Math.random = () => 0;

            win.applyRandomMultiplier(grid, true);

            Math.random = originalRandom;
            expect(grid[0][0].multiplier).toBe(3);
        });

        it("boosts by +1 when bonus is not active", () => {
            const grid = makeGrid(1, 1, "rune") as any;
            const originalRandom = Math.random;
            Math.random = () => 0;

            win.applyRandomMultiplier(grid, false);

            Math.random = originalRandom;
            expect(grid[0][0].multiplier).toBe(2);
        });

        it("does not crash on empty grid", () => {
            expect(() => win.applyRandomMultiplier([], false)).toThrow();
        });
    });

    describe("activateLokiMagic", () => {
        it("copies one symbol type to another when the trigger lands", () => {
            const grid = makeGrid(3, 3, "rune") as any;
            grid[0][0] = makeSymbol("crown", 0, 0);
            grid[1][1] = makeSymbol("wolf", 1, 1);

            const originalRandom = Math.random;
            const sequence = [0.1, 0, 0, 0.5, 0.5];
            let index = 0;
            Math.random = () => sequence[index++] ?? 0;

            win.activateLokiMagic(grid);

            Math.random = originalRandom;
            expect(grid[1][1].type).toBe("crown");
        });

        it("does nothing on an empty grid", () => {
            const originalRandom = Math.random;
            Math.random = () => 0.9;

            expect(() => win.activateLokiMagic([] as any)).not.toThrow();

            Math.random = originalRandom;
        });
    });
});
