import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameStateManager, GameState } from "../../game/systems/GameStateManager.ts";

describe("GameStateManager", () => {
    let manager: GameStateManager;

    beforeEach(() => {
        manager = new GameStateManager();
    });

    describe("initial state", () => {
        it("starts in IDLE", () => {
            expect(manager.getState()).toBe(GameState.IDLE);
        });

        it("isIdle() returns true at start", () => {
            expect(manager.isIdle()).toBe(true);
        });

        it("isSpinning() returns false at start", () => {
            expect(manager.isSpinning()).toBe(false);
        });

        it("history is empty at start", () => {
            expect(manager.getHistory()).toHaveLength(0);
        });

        it("getLastState() returns null at start", () => {
            expect(manager.getLastState()).toBeNull();
        });
    });

    describe("valid transitions", () => {
        it("IDLE → SPINNING", () => {
            expect(manager.setState(GameState.SPINNING)).toBe(true);
            expect(manager.getState()).toBe(GameState.SPINNING);
        });

        it("IDLE → GAME_OVER", () => {
            expect(manager.setState(GameState.GAME_OVER)).toBe(true);
        });

        it("SPINNING → RESOLVING_WINS", () => {
            manager.setState(GameState.SPINNING);
            expect(manager.setState(GameState.RESOLVING_WINS)).toBe(true);
        });

        it("SPINNING → IDLE", () => {
            manager.setState(GameState.SPINNING);
            expect(manager.setState(GameState.IDLE)).toBe(true);
        });

        it("RESOLVING_WINS → IDLE", () => {
            manager.setState(GameState.SPINNING);
            manager.setState(GameState.RESOLVING_WINS);
            expect(manager.setState(GameState.IDLE)).toBe(true);
        });

        it("RESOLVING_WINS → BONUS_ACTIVE", () => {
            manager.setState(GameState.SPINNING);
            manager.setState(GameState.RESOLVING_WINS);
            expect(manager.setState(GameState.BONUS_ACTIVE)).toBe(true);
        });

        it("BONUS_ACTIVE → SPINNING", () => {
            manager.setState(GameState.SPINNING);
            manager.setState(GameState.RESOLVING_WINS);
            manager.setState(GameState.BONUS_ACTIVE);
            expect(manager.setState(GameState.SPINNING)).toBe(true);
        });

        it("GAME_OVER → IDLE", () => {
            manager.setState(GameState.GAME_OVER);
            expect(manager.setState(GameState.IDLE)).toBe(true);
        });
    });

    describe("invalid transitions", () => {
        it("returns false when already in the same state", () => {
            expect(manager.setState(GameState.IDLE)).toBe(false);
        });

        it("IDLE cannot go directly to RESOLVING_WINS", () => {
            expect(manager.setState(GameState.RESOLVING_WINS)).toBe(false);
        });

        it("IDLE cannot go directly to BONUS_ACTIVE", () => {
            expect(manager.setState(GameState.BONUS_ACTIVE)).toBe(false);
        });

        it("SPINNING cannot go directly to BONUS_ACTIVE", () => {
            manager.setState(GameState.SPINNING);
            expect(manager.setState(GameState.BONUS_ACTIVE)).toBe(false);
        });

        it("GAME_OVER cannot go directly to SPINNING", () => {
            manager.setState(GameState.GAME_OVER);
            expect(manager.setState(GameState.SPINNING)).toBe(false);
        });

        it("state does not change on invalid transition", () => {
            manager.setState(GameState.RESOLVING_WINS);
            expect(manager.getState()).toBe(GameState.IDLE);
        });
    });

    describe("history", () => {
        it("records the previous state after a valid transition", () => {
            manager.setState(GameState.SPINNING);
            expect(manager.getHistory()).toContain(GameState.IDLE);
        });

        it("builds up history across multiple transitions", () => {
            manager.setState(GameState.SPINNING);
            manager.setState(GameState.IDLE);
            expect(manager.getHistory()).toHaveLength(2);
        });

        it("getLastState() returns the most recent previous state", () => {
            manager.setState(GameState.SPINNING);
            expect(manager.getLastState()).toBe(GameState.IDLE);
        });

        it("returns a copy so history cannot be mutated from outside", () => {
            manager.setState(GameState.SPINNING);
            const history = manager.getHistory();
            history.push(GameState.GAME_OVER);
            expect(manager.getHistory()).toHaveLength(1);
        });

        it("does not add to history on a failed transition", () => {
            manager.setState(GameState.BONUS_ACTIVE);
            expect(manager.getHistory()).toHaveLength(0);
        });
    });

    describe("helper methods", () => {
        it("isState() returns true for the current state", () => {
            expect(manager.isState(GameState.IDLE)).toBe(true);
        });

        it("isState() returns false for a different state", () => {
            expect(manager.isState(GameState.SPINNING)).toBe(false);
        });

        it("isSpinning() returns true when spinning", () => {
            manager.setState(GameState.SPINNING);
            expect(manager.isSpinning()).toBe(true);
        });

        it("isBonusActive() returns true in bonus state", () => {
            manager.setState(GameState.SPINNING);
            manager.setState(GameState.RESOLVING_WINS);
            manager.setState(GameState.BONUS_ACTIVE);
            expect(manager.isBonusActive()).toBe(true);
        });

        it("isGameOver() returns true in game over state", () => {
            manager.setState(GameState.GAME_OVER);
            expect(manager.isGameOver()).toBe(true);
        });

        it("isResolvingWins() returns true when resolving", () => {
            manager.setState(GameState.SPINNING);
            manager.setState(GameState.RESOLVING_WINS);
            expect(manager.isResolvingWins()).toBe(true);
        });
    });

    describe("onStateChange listeners", () => {
        it("fires the callback when entering the subscribed state", () => {
            const cb = vi.fn();
            manager.onStateChange(GameState.SPINNING, cb);
            manager.setState(GameState.SPINNING);
            expect(cb).toHaveBeenCalledOnce();
        });

        it("does not fire for a different state", () => {
            const cb = vi.fn();
            manager.onStateChange(GameState.GAME_OVER, cb);
            manager.setState(GameState.SPINNING);
            expect(cb).not.toHaveBeenCalled();
        });

        it("fires multiple callbacks for the same state", () => {
            const cb1 = vi.fn();
            const cb2 = vi.fn();
            manager.onStateChange(GameState.SPINNING, cb1);
            manager.onStateChange(GameState.SPINNING, cb2);
            manager.setState(GameState.SPINNING);
            expect(cb1).toHaveBeenCalledOnce();
            expect(cb2).toHaveBeenCalledOnce();
        });

        it("does not fire on an invalid transition", () => {
            const cb = vi.fn();
            manager.onStateChange(GameState.BONUS_ACTIVE, cb);
            manager.setState(GameState.BONUS_ACTIVE);
            expect(cb).not.toHaveBeenCalled();
        });
    });
});