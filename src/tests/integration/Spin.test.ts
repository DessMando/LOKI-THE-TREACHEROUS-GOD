import { describe, it, expect, beforeEach } from "vitest";
import { BettingSystem } from "../../game/systems/BettingSystem.ts";
import { PayoutSystem } from "../../game/systems/PayoutSystem.ts";

describe("Spin Integration", () => {
    let betting: BettingSystem;
    let payout: PayoutSystem;

    beforeEach(() => {
        betting = new BettingSystem(100);
        payout = new PayoutSystem();
    });

    it("win flow: deduct bet, add winnings, update balance", async () => {
        const startBalance = betting.getBalance();

        await betting.deductBet();
        const winAmount = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        betting.addWinnings(winAmount);

        expect(betting.getBalance()).toBeLessThan(startBalance);
        expect(betting.getBalance()).toBeGreaterThan(startBalance - 0.10);
    });

    it("bonus increase multiplier effect", () => {
        const normalWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const bonusWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);
        expect(bonusWin).toBeGreaterThan(normalWin);
    });
});