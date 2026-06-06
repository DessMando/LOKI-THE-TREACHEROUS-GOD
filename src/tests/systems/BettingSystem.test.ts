import { describe, it, expect, beforeEach } from "vitest";
import { BettingSystem } from "../../game/systems/BettingSystem.ts";

describe("BettingSystem", () => {
    let betting: BettingSystem;

    beforeEach(() => {
        betting = new BettingSystem(1000);
    });

    describe("constructor", () => {
        it("starts with the given balance", () => {
            expect(betting.getBalance()).toBe(1000);
        });

        it("starts with default bet of €0.10", () => {
            expect(betting.getCurrentBet()).toBeCloseTo(0.10, 2);
        });

        it("starts with 0 spins played", () => {
            expect(betting.getSpinsPlayed()).toBe(0);
        });

        it("uses 1000 as default balance when none provided", () => {
            const b = new BettingSystem();
            expect(b.getBalance()).toBe(1000);
        });
    });

    describe("canSpin", () => {
        it("returns true when balance is greater than the bet", () => {
            expect(betting.canSpin()).toBe(true);
        });

        it("returns true when balance exactly equals the bet", () => {
            const b = new BettingSystem(0.10);
            expect(b.canSpin()).toBe(true);
        });

        it("returns false when balance is 0", () => {
            const b = new BettingSystem(0);
            expect(b.canSpin()).toBe(false);
        });

        it("returns false when balance is less than the bet", () => {
            const b = new BettingSystem(0.05);
            expect(b.canSpin()).toBe(false);
        });
    });

    describe("deductBet", () => {
        it("returns true when there is enough balance", async () => {
            expect(await betting.deductBet()).toBe(true);
        });

        it("deducts the current bet from the balance", async () => {
            await betting.deductBet();
            expect(betting.getBalance()).toBeCloseTo(999.90, 2);
        });

        it("increments spins played by 1", async () => {
            await betting.deductBet();
            expect(betting.getSpinsPlayed()).toBe(1);
        });

        it("returns false when balance is insufficient", async () => {
            const b = new BettingSystem(0);
            expect(await b.deductBet()).toBe(false);
        });

        it("does not change balance when deduct fails", async () => {
            const b = new BettingSystem(0);
            await b.deductBet();
            expect(b.getBalance()).toBe(0);
        });

        it("does not increment spins when deduct fails", async () => {
            const b = new BettingSystem(0);
            await b.deductBet();
            expect(b.getSpinsPlayed()).toBe(0);
        });

        it("tracks totalBet correctly across multiple deductions", async () => {
            await betting.deductBet();
            await betting.deductBet();
            await betting.deductBet();
            expect(betting.getTotalBet()).toBeCloseTo(0.30, 2);
        });
    });

    describe("addWinnings", () => {
        it("adds the win amount to the balance", () => {
            betting.addWinnings(50);
            expect(betting.getBalance()).toBe(1050);
        });

        it("tracks totalWon correctly across multiple wins", () => {
            betting.addWinnings(10);
            betting.addWinnings(25);
            expect(betting.getTotalWon()).toBe(35);
        });

        it("does not change spins played", () => {
            betting.addWinnings(100);
            expect(betting.getSpinsPlayed()).toBe(0);
        });
    });

    describe("increaseBet", () => {
        it("increases the bet by €0.10", () => {
            betting.increaseBet();
            expect(betting.getCurrentBet()).toBeCloseTo(0.20, 2);
        });

        it("does not exceed the max bet of €150", () => {
            betting.setBet(150);
            betting.increaseBet();
            expect(betting.getCurrentBet()).toBe(150);
        });
    });

    describe("decreaseBet", () => {
        it("decreases the bet by €0.10", () => {
            betting.setBet(1.00);
            betting.decreaseBet();
            expect(betting.getCurrentBet()).toBeCloseTo(0.90, 2);
        });

        it("does not go below the min bet of €0.10", () => {
            betting.decreaseBet();
            expect(betting.getCurrentBet()).toBeCloseTo(0.10, 2);
        });
    });

    describe("setBet", () => {
        it("sets a valid bet and returns true", () => {
            expect(betting.setBet(5.00)).toBe(true);
            expect(betting.getCurrentBet()).toBe(5.00);
        });

        it("returns false for a bet below minimum", () => {
            expect(betting.setBet(0.05)).toBe(false);
        });

        it("returns false for a bet above maximum", () => {
            expect(betting.setBet(200)).toBe(false);
        });

        it("does not change the bet on invalid input", () => {
            betting.setBet(200);
            expect(betting.getCurrentBet()).toBeCloseTo(0.10, 2);
        });
    });

    describe("calculateRTP", () => {
        it("returns 0 when no bets have been placed yet", () => {
            expect(betting.calculateRTP()).toBe(0);
        });

        it("returns 100 when total won equals total bet", async () => {
            await betting.deductBet();
            betting.addWinnings(0.10);
            expect(betting.calculateRTP()).toBe(100);
        });

        it("returns more than 100 when the player is ahead", async () => {
            await betting.deductBet();
            betting.addWinnings(1.00);
            expect(betting.calculateRTP()).toBeGreaterThan(100);
        });

        it("returns less than 100 when the house is winning", async () => {
            await betting.deductBet();
            betting.addWinnings(0.05);
            expect(betting.calculateRTP()).toBeLessThan(100);
        });
    });

    describe("getStats", () => {
        it("returns an object with all expected keys", async () => {
            await betting.deductBet();
            betting.addWinnings(0.50);
            const stats = betting.getStats();
            expect(stats).toHaveProperty("balance");
            expect(stats).toHaveProperty("currentBet");
            expect(stats).toHaveProperty("spinsPlayed");
            expect(stats).toHaveProperty("totalBet");
            expect(stats).toHaveProperty("totalWon");
            expect(stats).toHaveProperty("rtp");
            expect(stats).toHaveProperty("profit");
        });

        it("stats.spinsPlayed matches actual spin count", async () => {
            await betting.deductBet();
            await betting.deductBet();
            expect(betting.getStats().spinsPlayed).toBe(2);
        });
    });

    describe("formatCurrency", () => {
        it("formats a decimal to 2 places", () => {
            expect(betting.formatCurrency(1.5)).toBe("1.50");
        });

        it("formats a whole number with .00", () => {
            expect(betting.formatCurrency(100)).toBe("100.00");
        });
    });
});