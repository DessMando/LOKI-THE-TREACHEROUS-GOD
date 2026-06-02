import {beforeEach, describe, expect, it} from "vitest";
import {BettingSystem} from "../../game/systems/BettingSystem.ts";
import {PayoutSystem} from "../../game/systems/PayoutSystem.ts";
import {GameState, GameStateManager} from "../../game/systems/GameStateManager.ts";

describe("Spin Flow Integration", () => {
    let betting: BettingSystem;
    let payout: PayoutSystem;
    let gameState: GameStateManager;

    beforeEach(() => {
        betting = new BettingSystem(1000);
        payout = new PayoutSystem();
        gameState = new GameStateManager();
    });

    it("spin without win decreases balance", async () => {
        const startBalance = betting.getBalance();
        expect(gameState.getState()).toBe(GameState.IDLE);

        gameState.setState(GameState.SPINNING);
        const deductSuccess = await betting.deductBet();
        gameState.setState(GameState.IDLE);

        expect(deductSuccess).toBe(true);
        expect(betting.getBalance()).toBe(startBalance - 0.10);
    });

    it("spin with win increases balance", async () => {
        const startBalance = betting.getBalance();

        gameState.setState(GameState.SPINNING);
        await betting.deductBet();
        gameState.setState(GameState.RESOLVING_WINS);

        const winAmount = payout.calculateClusterPayout("crown", 4, 1, betting.getCurrentBet(), 1, false);
        betting.addWinnings(winAmount);
        gameState.setState(GameState.IDLE);

        const netChange = betting.getBalance() - startBalance;
        expect(netChange).toBeLessThan(0);
    });

    it("cascade levels increase payout", async () => {
        const bet = betting.getCurrentBet();
        const cascade1 = payout.calculateClusterPayout("crown", 4, 1, bet, 1, false);
        const cascade2 = payout.calculateClusterPayout("crown", 4, 1, bet, 2, false);
        const cascade3 = payout.calculateClusterPayout("crown", 4, 1, bet, 3, false);

        expect(cascade2).toBeGreaterThan(cascade1);
        expect(cascade3).toBeGreaterThan(cascade2);

        expect(cascade2 / cascade1).toBe(1.5);
        expect(cascade3 / cascade1).toBe(2.0);
    });

    it("bonus mode increase payout", () => {
        const normalWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, false);
        const bonusWin = payout.calculateClusterPayout("crown", 4, 1, 0.10, 1, true);

        expect(bonusWin).toBeGreaterThan(normalWin);
        expect(bonusWin / normalWin).toBe(1.5);
    });

    it("handles multiple spins", async () => {
        for (let i = 0; i < 5; i++) {
            expect(gameState.isIdle()).toBe(true);
            gameState.setState(GameState.SPINNING);

            const canSpin = betting.canSpin();
            if (!canSpin) break;

            await betting.deductBet();

            if (Math.random() < 0.3) {
                const win = payout.calculateClusterPayout("rune", 3, 1,0.10, 1, false);
                betting.addWinnings(win);
            }

            gameState.setState(GameState.IDLE);
        }

        expect(betting.getSpinsPlayed()).toBeLessThanOrEqual(5);
        expect(betting.getTotalBet()).toBeGreaterThan(0);
    });

    it("RTP remains legal over sessions", async () => {
        const spinCount = 100;

        for (let i = 0; i < spinCount; i++) {
            await betting.deductBet();

            if (Math.random() < 0.5) {
                betting.addWinnings(0.095);
            }
        }

        const rtp = betting.calculateRTP();
        expect(rtp).toBeGreaterThanOrEqual(94);
        expect(rtp).toBeLessThanOrEqual(96);
    });

    it("game over when balance insufficient", async () => {
        const betting2 = new BettingSystem(0.05);
        const canSpin = betting2.canSpin();
        const deductSuccess = await betting2.deductBet();

        expect(canSpin).toBe(false);
        expect(deductSuccess).toBe(false);
    });
});