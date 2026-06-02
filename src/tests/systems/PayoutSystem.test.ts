import {describe, it, expect, beforeEach} from "vitest";
import { PayoutSystem } from "../../game/systems/PayoutSystem.ts";

describe("PayoutSystem", () => {
    let payout: PayoutSystem;
    beforeEach(() => {
        payout = new PayoutSystem();
    });

    it("calculateClusterPayout basic calculation", () => {
        const payout1 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        expect(payout1).toBe(2.40);
    });

    it("different symbols have different payouts", () => {
        const runePayout = payout.calculateClusterPayout("rune", 4, 1, 0.10, 1, false);
        const crownPayout = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);

        expect(crownPayout).toBeGreaterThan(runePayout);
        expect(crownPayout / runePayout);
    });

    it("all symbols have correct base values", () => {
        const symbolValues = [
            { symbol: "rune", expectedMultiplier: 1 },
            { symbol: "staff", expectedMultiplier: 2 },
            { symbol: "wolf", expectedMultiplier: 3 },
            { symbol: "orb", expectedMultiplier: 4 },
            { symbol: "crown", expectedMultiplier: 6 },
            { symbol: "wild", expectedMultiplier: 8 },
            { symbol: "scatter", expectedMultiplier: 10 }
        ];

        symbolValues.forEach(({ symbol, expectedMultiplier }) => {
            const payout1 = payout.calculateClusterPayout(symbol, 1, 1, 0.10, 1, false);
            const expectedPayout = expectedMultiplier * 0.10;
            expect(payout1).toBe(expectedPayout);
        });
    });

    it('symbol multiplier doubles payout', () => {
        const noMultiplier = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const withMultiplier = payout.calculateClusterPayout("crown", 4, 2, 0.10, 1, false);

        expect(withMultiplier).toBe(noMultiplier * 2);
    });

    it("symbol multiplier scales linearly", () => {
        const mult1 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const mult2 = payout.calculateClusterPayout("crown", 4, 2, 0.10, 1, false);
        const mult3 = payout.calculateClusterPayout("crown", 4, 3, 0.10, 1, false);

        // Lineair: mult2 = mult1 * 2, mult3 = mult1 * 3
        expect(mult2 / mult1).toBe(2);
        expect(mult3 / mult1).toBe(3);
    });

    it("cascade multiplier increase exponentially", () => {
        const cascade1 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const cascade2 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 2, false);
        const cascade3 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 3, false);
        const cascade5 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 5, false);

        expect(cascade2).toBe(cascade1 * 1.5);
        expect(cascade3).toBe(cascade1 * 2.0);
        expect(cascade5).toBe(cascade1 * 5.0);
    });

    it("cascade multipliers increase progressively", () => {
        const cascade1 = payout.calculateClusterPayout("rune", 3, 1, 1.0, 1, false);
        const cascade2 = payout.calculateClusterPayout("rune", 3, 1, 1.0, 2, false);
        const cascade3 = payout.calculateClusterPayout("rune", 3, 1, 1.0, 3, false);
        const cascade4 = payout.calculateClusterPayout("rune", 3, 1, 1.0, 4, false);

        // Each cascade should be better than previous
        expect(cascade2).toBeGreaterThan(cascade1);
        expect(cascade3).toBeGreaterThan(cascade2);
        expect(cascade4).toBeGreaterThan(cascade3);
    });

    it("bonus mode multiplies payout by 1.5x", () => {
        const normalWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const bonusWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);

        expect(bonusWin).toBe(normalWin * 1.5);
    });

    it('bonus mode works with cascade', () => {
        const cascade3Normal = payout.calculateClusterPayout("crown", 4, 1, 0.10, 3, false);
        const cascade3Bonus = payout.calculateClusterPayout("crown", 4, 1, 0.10, 3, true);

        expect(cascade3Bonus).toBe(cascade3Normal * 1.5);
    });

    it("bonus mode works with all symbols", () => {
        const symbols = ["rune", "staff", "wolf", "orb", "crown", "wild", "scatter"];

        symbols.forEach(symbol => {
            const normal = payout.calculateClusterPayout(symbol, 3, 1, 0.10, 1, false);
            const bonus = payout.calculateClusterPayout(symbol, 3, 1, 0.10, 1, true);

            expect(bonus).toBe(normal * 1.5);
        });
    });

    it('clusters of 5+ get 25% bonus', () => {
        const cluster4 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const cluster5 = payout.calculateClusterPayout("crown", 5, 1, 0.10, 1, false);

        expect(cluster5).toBe(cluster4 * 1.25);
    });

    it("clusters of 6+ also get 25% bonus", () => {
        const cluster5 = payout.calculateClusterPayout("crown", 5, 1, 0.10, 1, false);
        const cluster6 = payout.calculateClusterPayout("crown", 6, 1, 0.10, 1, false);

        expect(cluster6 / cluster5).toBeCloseTo(1.2);
    });

    it("getWinTier classifies wins correctly", () => {
        expect(payout.getWinTier(0.50, 0.10)).toBe("small");
        expect(payout.getWinTier(2.50, 0.10)).toBe("big");
        expect(payout.getWinTier(10.00, 0.10)).toBe("max");
        expect(payout.getWinTier(0.20, 0.10)).toBe(null);
    });

    it("getWinTier handles edge cases", () => {
        // Exactly 5x
        expect(payout.getWinTier(0.50, 0.10)).toBe("small");

        // Just under 25x
        expect(payout.getWinTier(2.49, 0.10)).toBe("small");

        // Exactly 25x
        expect(payout.getWinTier(2.50, 0.10)).toBe("big");

        // Just under 100x
        expect(payout.getWinTier(9.99, 0.10)).toBe("big");

        // Exactly 100x
        expect(payout.getWinTier(10.00, 0.10)).toBe("max");
    });

    it("getSymbolInfo returns symbol data", () => {
        const crownInfo = payout.getSymbolInfo("crown");

        expect(crownInfo).toBeDefined();
        expect(crownInfo?.baseValue).toBe(6);
        expect(crownInfo?.rarity).toBe(5);
    });

    it("getSymbolInfo returns null for unknown symbol", () => {
        const unknownInfo = payout.getSymbolInfo("nonexistent");
        expect(unknownInfo).toBe(null);
    });

    it("getSymbolInfo returns all 7 symbols", () => {
        const symbols = ["rune", "staff", "wolf", "orb", "crown", "wild", "scatter"];

        symbols.forEach(symbol => {
            const info = payout.getSymbolInfo(symbol);
            expect(info).not.toBeNull();
            expect(info?.baseValue).toBeGreaterThan(0);
            expect(info?.rarity).toBeGreaterThan(0);
        });
    });

    it("setSymbolPayout modifies payout values", () => {
        const originalPayout = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const success = payout.setSymbolPayout("crown", 12);  // Double it
        const newPayout = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);

        expect(success).toBe(true);
        expect(newPayout).toBe(originalPayout * 2);
    });

    it("setSymbolPayout returns false for unknown symbol", () => {
        const success = payout.setSymbolPayout("nonexistent", 10);
        expect(success).toBe(false);
    });

    it("setBonusMultiplier affects bonus payout", () => {
        const normalBonus = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);
        payout.setBonusMultiplier(2.0);

        const doubledBonus = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);
        expect(doubledBonus).toBe(normalBonus * (2.0 / 1.5));
    });

    it("setBonusMultiplier clamps to minimum 1.0", () => {
        payout.setBonusMultiplier(0.5);  // Try to set below 1.0

        const normalWin = payout.calculateClusterPayout("rune", 3, 1, 0.10, 1, false);
        const bonusWin = payout.calculateClusterPayout("rune", 3, 1, 0.10, 1, true);

        // Bonus should still be >= normal (1.0x minimum)
        expect(bonusWin).toBeGreaterThanOrEqual(normalWin);
    });

    it("getTheoreticalRTP returns safe value", () => {
        const rtp = payout.getTheoreticalRTP();
        expect(rtp).toBeGreaterThanOrEqual(95);
        expect(rtp).toBeLessThanOrEqual(100);
    });

    it("getAllSymbols returns all 7 symbols", () => {
        const symbols = payout.getAllSymbols();
        expect(symbols.length).toBe(7);
        expect(symbols.every(s => s.baseValue > 0)).toBe(true);
    });
});