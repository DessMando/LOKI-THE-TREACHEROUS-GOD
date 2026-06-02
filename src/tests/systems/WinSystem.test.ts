import { describe, it, expect, beforeEach } from "vitest";
import { WinSystem } from "../../game/systems/WinSystem.ts";

describe("WinSystem", () => {
    let winSystem: WinSystem;

    beforeEach(() => {
        winSystem = new WinSystem();
    });

    it("calculateTotalMultiplier sums all symbol multipliers", () => {
        const symbols = [
            [
                { multiplier: 1 },
                { multiplier: 2 },
                { multiplier: 1 }
            ],
            [
                { multiplier: 1 },
                { multiplier: 3 },
                null
            ]
        ]as any;

        const total = winSystem.calculateTotalMultiplier(symbols);
        expect(total).toBe(8);
    });

    it("calculateTotalMultiplier handels null symbols", () => {
        const symbols = [
            [{ multiplier: 1 }, null, { multiplier: 2 }],
            [null, { multiplier: 1 }, null]
        ]as any;

        const total = winSystem.calculateTotalMultiplier(symbols);
        expect(total).toBe(4);
    });

    it("calculateTotalMultiplier returns minimum 1", () => {
        const symbols = [[null, null]] as any;
        const total = winSystem.calculateTotalMultiplier(symbols);
        expect(total).toBeGreaterThanOrEqual(1);
    });

    it("applyRandomMultiplier increase a symbol", () => {
        const symbols = [
            [{ multiplier: 1 }, { multiplier: 1 }],
            [{ multiplier: 1 }, { multiplier: 1 }]
        ] as any;

        const originalSum = symbols.flat().reduce((sum: number, s: any) => sum + (s?.multiplier || 0), 0);
        winSystem.applyRandomMultiplier(symbols, false);

        const newSum = symbols.flat().reduce((sum: number, s: any) => sum + (s?.multiplier || 0), 0);
        expect(newSum).toBeGreaterThan(originalSum);
    });

    it("applyRandomMultiplier adds more in bonus mode", () => {
        const symbols1 = [[{ multiplier: 1 }]] as any;
        const symbols2 = [[{ multiplier: 1 }]] as any;

        winSystem.applyRandomMultiplier(symbols1, false);
        winSystem.applyRandomMultiplier(symbols2, true);

        const mult1 = symbols1[0][0].multiplier;
        const mult2 = symbols2[0][0].multiplier;

        expect(mult2).toBeGreaterThanOrEqual(mult1);
    });

    it("activateLokiMagic can change symbols", () => {
        let magicOccured = false;

        for(let i = 0; i < 100; i++) {
            const symbols = [
                [{ type: "rune", changeType: (t: any) => { symbols[0][0].type = t; } }, { type: "crown" }]
            ] as any;

            const originalType = symbols[0][0].type;
            winSystem.activateLokiMagic(symbols);

            if (symbols[0][0].type !== originalType) {
                magicOccured = true;
                break;
            }
        }

        expect(magicOccured).toBe(true);
    });

    it("checkBigWin classifies wins correctly", () => {
        expect(winSystem.checkBigWin(100)).toBe("big");
        expect(winSystem.checkBigWin(500)).toBe("big");
        expect(winSystem.checkBigWin(2000)).toBe("max");
        expect(winSystem.checkBigWin(5000)).toBe("max");
        expect(winSystem.checkBigWin(50)).toBe(null);
        expect(winSystem.checkBigWin(250)).toBe("big");
    });

    it("checkBigWin boundary values", () => {
        expect(winSystem.checkBigWin(500)).toBe("big");
        expect(winSystem.checkBigWin(499)).toBe(null);
        expect(winSystem.checkBigWin(2000)).toBe("max");
        expect(winSystem.checkBigWin(1999)).toBe("big");
    })
});