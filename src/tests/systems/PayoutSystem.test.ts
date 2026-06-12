import { beforeEach, describe, expect, it } from "vitest";
import { PayoutSystem } from "../../game/systems/PayoutSystem.ts";

describe("PayoutSystem", () => {
    let payout: PayoutSystem;

    beforeEach(() => {
        payout = new PayoutSystem();
    });

    describe("calculateClusterPayout", () => {
        it("returns a positive payout for a known symbol", () => {
            expect(payout.calculateClusterPayout("crown", 4, 1, 0.10)).toBeGreaterThan(0);
        });

        it("returns 0 for an unknown symbol", () => {
            expect(payout.calculateClusterPayout("dragon", 4, 1, 0.10)).toBe(0);
        });

        it("larger clusters pay more than smaller clusters", () => {
            const small = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const large = payout.calculateClusterPayout("crown", 8, 1, 0.10);
            expect(large).toBeGreaterThan(small);
        });

        it("applies the 1.25x cluster bonus for 5 or more symbols", () => {
            const four = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const five = payout.calculateClusterPayout("crown", 5, 1, 0.10);
            expect(five).toBeGreaterThan(four * (5 / 4));
        });

        it("scales proportionally with bet size", () => {
            const low = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const high = payout.calculateClusterPayout("crown", 4, 1, 1.00);
            expect(high).toBeCloseTo(low * 10, 2);
        });

        it("scales proportionally with symbol multiplier", () => {
            const x1 = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const x3 = payout.calculateClusterPayout("crown", 4, 3, 0.10);
            expect(x3).toBeCloseTo(x1 * 3, 2);
        });

        it("applies cascade level multipliers", () => {
            const l1 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1);
            const l2 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 2);
            const l3 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 3);

            expect(l2).toBeCloseTo(l1 * 2, 2);
            expect(l3).toBeCloseTo(l1 * 3, 2);
        });

        it("applies the bonus multiplier", () => {
            const normal = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
            const bonus = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);
            expect(bonus).toBeCloseTo(normal * 2, 2);
        });

        it("keeps the result rounded to two decimals", () => {
            const result = payout.calculateClusterPayout("rune", 4, 1, 0.10);
            const decimals = (result.toString().split(".")[1] ?? "").length;
            expect(decimals).toBeLessThanOrEqual(2);
        });
    });

    describe("getWinTier", () => {
        it("returns null below the small win threshold", () => {
            expect(payout.getWinTier(0.40, 0.10)).toBeNull();
        });

        it("returns small from 10x up to 49x bet", () => {
            expect(payout.getWinTier(1.00, 0.10)).toBe("small");
            expect(payout.getWinTier(4.90, 0.10)).toBe("small");
        });

        it("returns big from 50x up to 249x bet", () => {
            expect(payout.getWinTier(5.00, 0.10)).toBe("big");
            expect(payout.getWinTier(24.90, 0.10)).toBe("big");
        });

        it("returns max from 250x bet or more", () => {
            expect(payout.getWinTier(25.00, 0.10)).toBe("max");
        });

        it("scales with different bet sizes", () => {
            expect(payout.getWinTier(10.00, 1.00)).toBe("small");
            expect(payout.getWinTier(50.00, 1.00)).toBe("big");
        });
    });

    describe("getSymbolInfo", () => {
        it("returns info for a known symbol", () => {
            const info = payout.getSymbolInfo("crown");
            expect(info).not.toBeNull();
            expect(info?.name).toBe("Crown");
        });

        it("returns null for an unknown symbol", () => {
            expect(payout.getSymbolInfo("dragon")).toBeNull();
        });

        it("scatter has the highest base value", () => {
            const scatter = payout.getSymbolInfo("scatter");
            const crown = payout.getSymbolInfo("crown");
            expect(scatter!.baseValue).toBeGreaterThan(crown!.baseValue);
        });
    });

    describe("setSymbolPayout", () => {
        it("updates a symbol payout and returns true", () => {
            expect(payout.setSymbolPayout("rune", 99)).toBe(true);
            expect(payout.getSymbolInfo("rune")?.baseValue).toBe(99);
        });

        it("returns false for an unknown symbol", () => {
            expect(payout.setSymbolPayout("dragon", 5)).toBe(false);
        });
    });

    describe("getTheoreticalRTP", () => {
        it("returns a stable target RTP", () => {
            expect(payout.getTheoreticalRTP()).toBe(96.5);
        });
    });

    describe("getAllSymbols", () => {
        it("returns all configured symbols", () => {
            const names = payout.getAllSymbols().map(symbol => symbol.name);
            expect(names).toEqual(["Rune", "Staff", "Wolf", "Orb", "Crown", "Wild", "Scatter"]);
        });
    });
});
