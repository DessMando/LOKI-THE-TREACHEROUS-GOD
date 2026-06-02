import { describe, it, expect, beforeEach } from "vitest";
import { BettingSystem } from "../../game/systems/BettingSystem.ts";

describe("BettingSystem", () => {

    let betting: BettingSystem;

    // VOOR ELKE TEST: Fresh BettingSystem
    beforeEach(() => {
        betting = new BettingSystem(1000);  // Start €1000
    });

    it("canSpins returns true when balance >= bet", () => {
        // Act: checken
        const canSpin = betting.canSpin();
        // Assert: moet true zijn
        expect(canSpin).toBe(true);
    });

    it("canSpins returns false when balance < bet", () => {
        // Arrange
        const betting = new BettingSystem(0.05);  // Minder dan €0.10
        // Act
        const canSpin = betting.canSpin();
        // Assert
        expect(canSpin).toBe(false);
    });

    it("deductBet decreases balance correctly", async () => {
        // Arrange: Balance is € 1000
        const startBalance = betting.getBalance();

        // Act: Deducteer bet
        const success = await betting.deductBet();

        // Assert:
        // 1. Success is true
        expect(success).toBe(true);

        // 2. Balance decreased by exactly €0.10
        expect(betting.getBalance()).toBe(startBalance - 0.10);
    });

    it("deductBet returns false when insufficient balance", async () => {
        // Arrange
        const betting = new BettingSystem(0.05);  // Minder dan €0.10

        // Act
        const success = await betting.deductBet();

        // Assert
        expect(success).toBe(false);
        expect(betting.getBalance()).toBe(0.05);  // Balance onveranderd!
    });

    it("deductBet increments totalBet", async () => {
        // Arrange
        expect(betting.getTotalBet()).toBe(0);

        // Act
        await betting.deductBet();
        await betting.deductBet();

        // Assert: totalBet = 0.20
        expect(betting.getTotalBet()).toBe(0.20);
    });

    it("deductBet increments spin counter", async () => {
        // Arrange
        expect(betting.getSpinsPlayed()).toBe(0);

        // Act
        await betting.deductBet();
        await betting.deductBet();

        // Assert
        expect(betting.getSpinsPlayed()).toBe(2);
    });

    it("addWinnings increases balance", () => {
        // Arrange
        const startBalance = betting.getBalance();

        // Act: Speler wint €50
        betting.addWinnings(50);

        // Assert
        expect(betting.getBalance()).toBe(startBalance + 50);
    });

    it("addWinnings tracks total won", () => {
        // Arrange: Nog geen winningen
        expect(betting.getTotalWon()).toBe(0);

        // Act: Win €30
        betting.addWinnings(30);
        betting.addWinnings(20);  // Win €20 meer

        // Assert: Totaal €50
        expect(betting.getTotalWon()).toBe(50);
    });

    it("addWinnings handles decimal values", () => {
        // Arrange
        betting.addWinnings(10.75);
        betting.addWinnings(5.25);

        // Assert
        expect(betting.getTotalWon()).toBe(16);  // 10.75 + 5.25
    });

    it("increaseBet increases current bet", () => {
        // Arrange: Start bet €0.10
        expect(betting.getCurrentBet()).toBe(0.10);

        // Act
        betting.increaseBet();

        // Assert: Bet is now €0.20
        expect(betting.getCurrentBet()).toBe(0.20);
    });

    it("decreaseBet decreases current bet", () => {
        // Arrange
        betting.increaseBet();  // €0.10 → €0.20

        // Act
        betting.decreaseBet();

        // Assert
        expect(betting.getCurrentBet()).toBe(0.10);
    });

    it("increaseBet cannot exceed maxBet", () => {
        // Arrange: Keep increasing
        for (let i = 0; i < 1000; i++) {
            betting.increaseBet();
        }

        // Assert: Stopped at €150
        expect(betting.getCurrentBet()).toBeLessThanOrEqual(150);
    });

    it("decreaseBet cannot go below minBet", () => {
        // Arrange: Keep decreasing
        for (let i = 0; i < 1000; i++) {
            betting.decreaseBet();
        }

        // Assert: Stopped at €0.10
        expect(betting.getCurrentBet()).toBeGreaterThanOrEqual(0.10);
    });

    it("setBet validates bet range", () => {
        // Test valid bet
        expect(betting.setBet(50)).toBe(true);
        expect(betting.getCurrentBet()).toBe(50);

        // Test too low
        expect(betting.setBet(0.05)).toBe(false);

        // Test too high
        expect(betting.setBet(200)).toBe(false);
    });

    it("calculateRTP returns correct percentage", async () => {
        // Arrange
        await betting.deductBet();      // Bet €0.10
        betting.addWinnings(0.09);      // Win €0.09

        // RTP = winnings / bets * 100
        // = 0.09 / 0.10 * 100 = 90%

        // Act & Assert
        expect(betting.calculateRTP()).toBe(90);
    });

    it("calculateRTP handles multiple bets", async () => {
        // Arrange: Simulate 10 spins
        for (let i = 0; i < 10; i++) {
            await betting.deductBet();  // Bet €0.10 × 10 = €1.00
        }

        // Speler wint €0.95 (95% return)
        betting.addWinnings(0.95);

        // Act & Assert
        expect(betting.calculateRTP()).toBe(95);
    });

    it("calculateRTP returns 0 when no bets placed", () => {
        // Arrange: Geen bets
        // Act & Assert
        expect(betting.calculateRTP()).toBe(0);
    });

    it("calculateRTP is always >= 0 and <= 100", async () => {
        // Arrange
        for (let i = 0; i < 5; i++) {
            await betting.deductBet();
        }
        betting.addWinnings(1.5);

        // Act & Assert
        const rtp = betting.calculateRTP();
        expect(rtp).toBeGreaterThanOrEqual(0);
        expect(rtp).toBeLessThanOrEqual(100);
    });

    it("getStats returns complete statistics", async () => {
        // Arrange
        await betting.deductBet();      // Bet 1
        betting.addWinnings(10);        // Win 1
        await betting.deductBet();      // Bet 2

        // Act
        const stats = betting.getStats();

        // Assert: All fields present
        expect(stats).toHaveProperty('balance');
        expect(stats).toHaveProperty('currentBet');
        expect(stats).toHaveProperty('spinsPlayed');
        expect(stats).toHaveProperty('totalBet');
        expect(stats).toHaveProperty('totalWon');
        expect(stats).toHaveProperty('rtp');
        expect(stats).toHaveProperty('profit');

        // Assert: Values correct
        expect(stats.spinsPlayed).toBe(2);
        expect(stats.totalBet).toBe(0.20);
        expect(stats.totalWon).toBe(10);
    });

    it("getProfit calculates correctly", async () => {
        // Arrange
        await betting.deductBet();
        await betting.deductBet();
        betting.addWinnings(0.15);

        expect(betting.getProfit()).toBe(0.05);
    });

    it("formatCurrency formats correctly", () => {
        // Act & Assert
        expect(betting.formatCurrency(10.5)).toBe("10.50");
        expect(betting.formatCurrency(0.1)).toBe("0.10");
        expect(betting.formatCurrency(1234.567)).toBe("1234.57");
    });
});