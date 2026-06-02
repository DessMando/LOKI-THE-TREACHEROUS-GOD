import {beforeEach, describe, expect, it} from "vitest";
import {GameState, GameStateManager} from "../../game/systems/GameStateManager.ts";

describe("GameStateManager", () => {
    let stateManager: GameStateManager;

    beforeEach(() => {
        stateManager = new GameStateManager();
    });

    it("initializes in IDLE state", () => {
        expect(stateManager.getState()).toBe(GameState.IDLE);
    })

    it("isState checks current state", () => {
        expect(stateManager.isState(GameState.IDLE)).toBe(true);
        expect(stateManager.isState(GameState.SPINNING)).toBe(false);
    })

    it("isSpinning is convenience method", () => {
        expect(stateManager.isSpinning()).toBe(false);
        expect(stateManager.isIdle()).toBe(true);
    })

    it("IDLE -> SPINNING transition is valid", () => {
        const success = stateManager.setState(GameState.SPINNING);
        expect(success).toBe(true);
        expect(stateManager.getState()).toBe(GameState.SPINNING);
    });

    it("SPINNING -> RESOLVING_WINS transition is valid", () => {
        stateManager.setState(GameState.SPINNING);
        const success = stateManager.setState(GameState.RESOLVING_WINS);
        expect(success).toBe(true);
    });

    it("RESOLVING_ACTIVE -> SPINNING transition is valid", () => {
        stateManager.setState(GameState.SPINNING);
        stateManager.setState(GameState.RESOLVING_WINS);
        stateManager.setState(GameState.BONUS_ACTIVE);
        const success =stateManager.setState(GameState.SPINNING);
        expect(success).toBe(true);
    });

    it("SPINNING -> SPINNING is invalid", () => {
        stateManager.setState(GameState.SPINNING);
        const success = stateManager.setState(GameState.SPINNING);
        expect(success).toBe(false);
    });

    it("SPINNING -> IDLE skips RESOLVING_WINS", () => {
        stateManager.setState(GameState.SPINNING);
        const success = stateManager.setState(GameState.IDLE);
        expect(success).toBe(true);
    });

    it("BONUS_ACTIVE -> IDLE is valid", () => {
        stateManager.setState(GameState.SPINNING);
        stateManager.setState(GameState.RESOLVING_WINS);
        stateManager.setState(GameState.BONUS_ACTIVE);
        const success = stateManager.setState(GameState.IDLE);
        expect(success).toBe(true);
    });

    it("GAME_OVER -> any non-IDLE is invalid", () => {
        stateManager.setState(GameState.SPINNING);
        stateManager.setState(GameState.GAME_OVER);
        expect(stateManager.setState(GameState.SPINNING)).toBe(false);
        expect(stateManager.setState(GameState.IDLE)).toBe(true);
    });

    it("tracks state history", () => {
        stateManager.setState(GameState.SPINNING);
        stateManager.setState(GameState.RESOLVING_WINS);
        stateManager.setState(GameState.IDLE);

        const history = stateManager.getHistory();
        expect(history).toContain(GameState.IDLE);
        expect(history).toContain(GameState.SPINNING);
        expect(history).toContain(GameState.RESOLVING_WINS);
    });

    it("getLastState returns previous state", () => {
        stateManager.setState(GameState.SPINNING);
        const last1 = stateManager.getLastState();

        stateManager.setState(GameState.RESOLVING_WINS);
        const last2 = stateManager.getLastState();

        expect(last1).toBe(GameState.IDLE);
        expect(last2).toBe(GameState.SPINNING);
    });

    it("onStateChange callback fires when state changes", () => {
        let callCount = 0;
        stateManager.onStateChange(GameState.SPINNING, () => {
            callCount++;
        });

        expect(callCount).toBe(0);
        stateManager.setState(GameState.SPINNING);
        expect(callCount).toBe(1);
    });

    it("multiple listeners can be registered", () => {
        let count1 = 0;
        let count2 = 0;

        stateManager.onStateChange(GameState.IDLE, () => count1++);
        stateManager.onStateChange(GameState.IDLE, () => count2++);

        stateManager.setState(GameState.SPINNING);
        stateManager.setState(GameState.IDLE);

        expect(count1).toBe(1);
        expect(count2).toBe(1);
    });

    it("listeners only fire for their registered state", () => {
        let idleCount = 0;
        let spinCount = 0;

        stateManager.onStateChange(GameState.IDLE, () => idleCount++);
        stateManager.onStateChange(GameState.SPINNING, () => spinCount++);

        stateManager.setState(GameState.SPINNING);
        expect(idleCount).toBe(0);
        expect(spinCount).toBe(1);

        stateManager.setState(GameState.IDLE);
        expect(idleCount).toBe(1);
        expect(spinCount).toBe(1);
    });

    it("supports complete game flow", () => {
        expect(stateManager.isIdle()).toBe(true);
        expect(stateManager.setState(GameState.SPINNING)).toBe(true);
        expect(stateManager.isSpinning()).toBe(true);
        expect(stateManager.setState(GameState.RESOLVING_WINS)).toBe(true);
        expect(stateManager.setState(GameState.BONUS_ACTIVE)).toBe(true);
        expect(stateManager.setState(GameState.SPINNING)).toBe(true);
        expect(stateManager.setState(GameState.IDLE)).toBe(true);
        expect(stateManager.isIdle()).toBe(true)
    });

    it("supports multiple spins in a row ", () => {
        for(let i = 0; i < 5; i++) {
            expect(stateManager.setState(GameState.SPINNING)).toBe(true);
            expect(stateManager.setState(GameState.IDLE)).toBe(true);
        }

        expect(stateManager.getHistory().length).toBeGreaterThan(5);
    })
});