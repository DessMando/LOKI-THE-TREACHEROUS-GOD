import { describe, it, expect, beforeEach } from "vitest";
import { BettingSystem } from "../../game/systems/BettingSystem.ts";
import { PayoutSystem } from "../../game/systems/PayoutSystem.ts";

describe("Spin integration", () => {
    let betting: BettingSystem;
    let payout: PayoutSystem;

    beforeEach(() => {
        betting = new BettingSystem(100);
        payout = new PayoutSystem();
    });

    it("deducts the bet and adds the win back into the balance", async () => {
        const startBalance = betting.getBalance();
        const bet = betting.getCurrentBet();

        await betting.deductBet();
        const winAmount = payout.calculateClusterPayout("crown", 4, 1, bet, 1, false);
        betting.addWinnings(winAmount);

        expect(betting.getBalance()).toBeCloseTo(startBalance - bet + winAmount, 2);
        expect(betting.getBalance()).toBeCloseTo(102.30, 2);
    });

    it("bonus mode pays more than normal mode", () => {
        const normalWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const bonusWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);

        expect(bonusWin).toBeGreaterThan(normalWin);
        expect(bonusWin).toBeCloseTo(normalWin * 2, 2);
    });
});
