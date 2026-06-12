import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../game/core/Symbol.ts", () => {
    return {
        Symbol: class MockSymbol {
            public type: string;
            public row: number;
            public col: number;
            public multiplier = 1;
            public multiplierText = { text: "" };
            public sprite = {};

            constructor(type: string, row: number, col: number) {
                this.type = type;
                this.row = row;
                this.col = col;
            }

            setPosition(): void {}

            moveTo(): Promise<void> {
                return Promise.resolve();
            }
        }
    };
});

import { CascadeSystem } from "../../game/systems/CascadeSystem.ts";
import { Symbol } from "../../game/core/Symbol.ts";

function makeGrid(rows: number, cols: number): any[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function makeSymbol(type: string, row: number, col: number) {
    return new Symbol(type as any, row, col) as any;
}

describe("CascadeSystem integration", () => {
    let cascade: CascadeSystem;

    beforeEach(() => {
        cascade = new CascadeSystem(0, 0, 96);
    });

    it("drops symbols into empty spaces", async () => {
        const grid = makeGrid(4, 1);
        const falling = makeSymbol("crown", 0, 0);
        grid[0][0] = falling;

        const container = {
            addChild: vi.fn(),
        };

        await cascade.cascade(grid as any, () => "rune", container);

        expect(grid[3][0]).toBe(falling);
        expect(grid[3][0].row).toBe(3);
        expect(grid[0][0]).not.toBeNull();
        expect(container.addChild).toHaveBeenCalledTimes(3);
    });

    it("refills an empty board", async () => {
        const grid = makeGrid(2, 2);
        const container = {
            addChild: vi.fn(),
        };

        await cascade.cascade(grid as any, () => "orb", container);

        expect(grid[0][0]).not.toBeNull();
        expect(grid[1][1]).not.toBeNull();
        expect(container.addChild).toHaveBeenCalledTimes(4);
    });

    it("returns immediately for an empty grid", async () => {
        const container = {
            addChild: vi.fn(),
        };

        await expect(cascade.cascade([], () => "rune", container)).rejects.toThrow();
        expect(container.addChild).not.toHaveBeenCalled();
    });
});
