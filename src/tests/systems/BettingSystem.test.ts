import { describe, it, expect } from "vitest";
import { BettingSystem } from "../../game/systems/BettingSystem.ts";

describe("BettingSystem", () => {
    it("deductBet decrease balance correctly", async () => {
        const betting = new BettingSystem(100);
        await betting.deductBet();
        expect(betting.getBalance()).toBe(99.90);
    });

    it("canSpin returns false when no balance", () => {
        const betting = new BettingSystem(0);
        expect(betting.canSpins()).toBe(false);
    });

    it("increaseBet works correctly", () => {
        const betting = new BettingSystem(100);
        betting.increaseBet();
        expect(betting.getCurrentBet()).toBe(0.20);
    });

    it('calculateRTP returns correct percentage', async () => {
        const betting = new BettingSystem(100);
        await betting.deductBet();
        betting.addWinnings(0.09);
        expect(betting.calculateRTP()).toBe(90)
    });
});