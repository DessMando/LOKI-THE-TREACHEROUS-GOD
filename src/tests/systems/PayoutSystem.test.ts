import { describe, it, expect, beforeEach } from "vitest";
import { PayoutSystem } from "../../game/systems/PayoutSystem.ts";

describe("PayoutSystem", () => {
    let payout: PayoutSystem;

    beforeEach(() => {
        payout = new PayoutSystem();
    });

    describe("calculateClusterPayout", () => {
        it("returns a positive number for a known symbol", () => {
            expect(payout.calculateClusterPayout("crown", 4, 1, 0.10)).toBeGreaterThan(0);
        });

        it("returns 0 for an unknown symbol", () => {
            expect(payout.calculateClusterPayout("dragon", 4, 1, 0.10)).toBe(0);
        });

        it("larger cluster pays more than smaller cluster", () => {
            const small = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const large = payout.calculateClusterPayout("crown", 8, 1, 0.10);
            expect(large).toBeGreaterThan(small);
        });

        it("cluster of 5+ gets the 1.25x bonus", () => {
            const four = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const five = payout.calculateClusterPayout("crown", 5, 1, 0.10);
            expect(five).toBeGreaterThan(four * (5 / 4));
        });

        it("higher bet gives proportionally higher payout", () => {
            const low  = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const high = payout.calculateClusterPayout("crown", 4, 1, 1.00);
            expect(high).toBeCloseTo(low * 10, 1);
        });

        it("symbol multiplier scales the payout", () => {
            const x1 = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const x3 = payout.calculateClusterPayout("crown", 4, 3, 0.10);
            expect(x3).toBeCloseTo(x1 * 3, 1);
        });

        it("cascade level 2 applies 1.5x over level 1", () => {
            const l1 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1);
            const l2 = payout.calculateClusterPayout("crown", 4, 1, 0.10, 2);
            expect(l2).toBeCloseTo(l1 * 1.5, 2);
        });

        it("bonus active increases payout", () => {
            const normal = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
            const bonus  = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);
            expect(bonus).toBeGreaterThan(normal);
        });

        it("crown pays more than rune for same cluster", () => {
            const rune  = payout.calculateClusterPayout("rune",  4, 1, 0.10);
            const crown = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            expect(crown).toBeGreaterThan(rune);
        });

        it("wild pays more than crown", () => {
            const crown = payout.calculateClusterPayout("crown", 4, 1, 0.10);
            const wild  = payout.calculateClusterPayout("wild",  4, 1, 0.10);
            expect(wild).toBeGreaterThan(crown);
        });

        it("result is rounded to at most 2 decimal places", () => {
            const result = payout.calculateClusterPayout("rune", 4, 1, 0.10);
            const decimals = (result.toString().split(".")[1] ?? "").length;
            expect(decimals).toBeLessThanOrEqual(2);
        });
    });

    describe("getWinTier", () => {
        it("returns null when payout is less than 5x bet", () => {
            expect(payout.getWinTier(0.40, 0.10)).toBeNull();
        });

        it("returns 'small' for 5x–24x bet", () => {
            expect(payout.getWinTier(0.50, 0.10)).toBe("small");
            expect(payout.getWinTier(2.40, 0.10)).toBe("small");
        });

        it("returns 'big' for 25x–99x bet", () => {
            expect(payout.getWinTier(2.50, 0.10)).toBe("big");
            expect(payout.getWinTier(9.90, 0.10)).toBe("big");
        });

        it("returns 'max' for 100x bet or more", () => {
            expect(payout.getWinTier(10.00, 0.10)).toBe("max");
        });

        it("scales correctly with different bet sizes", () => {
            expect(payout.getWinTier(5.00, 1.00)).toBe("small");
            expect(payout.getWinTier(0.49, 1.00)).toBeNull();
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

        it("scatter has higher baseValue than crown", () => {
            const scatter = payout.getSymbolInfo("scatter");
            const crown   = payout.getSymbolInfo("crown");
            expect(scatter!.baseValue).toBeGreaterThan(crown!.baseValue);
        });
    });

    describe("setSymbolPayout", () => {
        it("updates the baseValue and returns true", () => {
            expect(payout.setSymbolPayout("rune", 99)).toBe(true);
            expect(payout.getSymbolInfo("rune")?.baseValue).toBe(99);
        });

        it("returns false for an unknown symbol", () => {
            expect(payout.setSymbolPayout("dragon", 5)).toBe(false);
        });
    });

    describe("getTheoreticalRTP", () => {
        it("returns a value between 90 and 100", () => {
            const rtp = payout.getTheoreticalRTP();
            expect(rtp).toBeGreaterThanOrEqual(90);
            expect(rtp).toBeLessThanOrEqual(100);
        });
    });

    describe("getAllSymbols", () => {
        it("returns an array with at least one entry", () => {
            expect(payout.getAllSymbols().length).toBeGreaterThan(0);
        });

        it("contains all 7 expected symbol names", () => {
            const names = payout.getAllSymbols().map(s => s.name);
            ["Rune", "Staff", "Wolf", "Orb", "Crown", "Wild", "Scatter"].forEach(n => {
                expect(names).toContain(n);
            });
        });
    });
});