import { beforeEach, describe, expect, it } from "vitest";
import { BettingSystem } from "../../game/systems/BettingSystem.ts";
import { PayoutSystem } from "../../game/systems/PayoutSystem.ts";
import { GameState, GameStateManager } from "../../game/systems/GameStateManager.ts";

describe("Spin flow integration", () => {
    let betting: BettingSystem;
    let payout: PayoutSystem;
    let gameState: GameStateManager;

    beforeEach(() => {
        betting = new BettingSystem(1000);
        payout = new PayoutSystem();
        gameState = new GameStateManager();
    });

    it("moves from idle to spinning and back during a normal spin", async () => {
        const startBalance = betting.getBalance();

        expect(gameState.getState()).toBe(GameState.IDLE);
        expect(gameState.setState(GameState.SPINNING)).toBe(true);

        const deducted = await betting.deductBet();
        expect(deducted).toBe(true);

        expect(gameState.setState(GameState.RESOLVING_WINS)).toBe(true);
        expect(gameState.setState(GameState.IDLE)).toBe(true);
        expect(betting.getBalance()).toBeCloseTo(startBalance - betting.getCurrentBet(), 2);
    });

    it("cascades increase payout step by step", () => {
        const bet = betting.getCurrentBet();
        const first = payout.calculateClusterPayout("crown", 4, 1, bet, 1, false);
        const second = payout.calculateClusterPayout("crown", 4, 1, bet, 2, false);
        const third = payout.calculateClusterPayout("crown", 4, 1, bet, 3, false);

        expect(second).toBeCloseTo(first * 2, 2);
        expect(third).toBeCloseTo(first * 3, 2);
    });

    it("bonus mode increases the same win by the bonus multiplier", () => {
        const normal = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const bonus = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);

        expect(bonus).toBeCloseTo(normal * 2, 2);
    });

    it("produces a stable RTP over a deterministic session", async () => {
        for (let i = 0; i < 10; i++) {
            await betting.deductBet();

            if (i % 2 === 0) {
                betting.addWinnings(0.10);
            }
        }

        expect(betting.getTotalBet()).toBeCloseTo(1.00, 2);
        expect(betting.getTotalWon()).toBeCloseTo(0.50, 2);
        expect(betting.calculateRTP()).toBeCloseTo(50, 2);
    });

    it("enters game over logic when balance is too low", async () => {
        const tinyBankroll = new BettingSystem(0.05);

        expect(tinyBankroll.canSpin()).toBe(false);
        expect(await tinyBankroll.deductBet()).toBe(false);
    });
});
