import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => {
    const callbacks = {
        spin: null as null | (() => void),
        betUp: null as null | (() => void),
        betDown: null as null | (() => void),
        buyBonus: null as null | (() => void),
    };

    return {
        callbacks,
        appInit: vi.fn().mockResolvedValue(undefined),
        appAddChild: vi.fn(),
        gridSpin: vi.fn().mockResolvedValue(undefined),
        gridBuyBonus: vi.fn(() => true),
        gridGetTotalWin: vi.fn(() => 12.34),
        gridResetWinAmount: vi.fn(),
        gridGetMultiplier: vi.fn(() => 3),
        gridGetFreeSpins: vi.fn(() => 8),
        gridIsBonusActive: vi.fn(() => false),
        bettingDeductBet: vi.fn().mockResolvedValue(true),
        bettingAddWinnings: vi.fn(),
        bettingIncreaseBet: vi.fn(),
        bettingDecreaseBet: vi.fn(),
        bettingGetBalance: vi.fn(() => 999.9),
        bettingGetCurrentBet: vi.fn(() => 0.1),
        payoutGetWinTier: vi.fn(() => "small" as const),
        gameStateSetState: vi.fn(() => true),
        ui: {
            onSpinButtonClick: vi.fn((callback: () => void) => {
                callbacks.spin = callback;
            }),
            onBetIncrement: vi.fn((callback: () => void) => {
                callbacks.betUp = callback;
            }),
            onBetDecrement: vi.fn((callback: () => void) => {
                callbacks.betDown = callback;
            }),
            onBuyBonusClick: vi.fn((callback: () => void) => {
                callbacks.buyBonus = callback;
            }),
            updateBet: vi.fn(),
            updateCurrentWin: vi.fn(),
            updateAll: vi.fn(),
            lockUI: vi.fn(),
            unlockUI: vi.fn(),
            showLoading: vi.fn(),
        },
        sound: {
            preloadAllSounds: vi.fn().mockResolvedValue(undefined),
            playButtonClick: vi.fn(),
            playSpin: vi.fn(),
            playWin: vi.fn(),
        },
    };
});

vi.mock("pixi.js", () => {
    class MockContainer {
        public addChild = state.appAddChild;
        public removeChild = vi.fn();
        public removeChildren = vi.fn();
    }

    class MockApplication {
        public canvas = document.createElement("canvas");
        public stage = new MockContainer();
        public init = state.appInit;
    }

    return {
        Application: MockApplication,
        Container: MockContainer,
    };
});

vi.mock("gsap", () => {
    return {
        gsap: {
            to: vi.fn(),
        },
    };
});

vi.mock("../../game/core/Grid.ts", () => {
    return {
        Grid: class MockGrid {
            public container = {};

            constructor(_betProvider: () => number) {}

            spin = state.gridSpin;
            buyBonus = state.gridBuyBonus;
            getTotalWin = state.gridGetTotalWin;
            resetWinAmount = state.gridResetWinAmount;
            getMultiplier = state.gridGetMultiplier;
            getFreeSpins = state.gridGetFreeSpins;
            isBonusActive = state.gridIsBonusActive;
        },
    };
});

vi.mock("../../game/systems/UIManager.ts", () => {
    return {
        UIManager: class MockUIManager {
            onSpinButtonClick = state.ui.onSpinButtonClick;
            onBetIncrement = state.ui.onBetIncrement;
            onBetDecrement = state.ui.onBetDecrement;
            onBuyBonusClick = state.ui.onBuyBonusClick;
            updateBet = state.ui.updateBet;
            updateCurrentWin = state.ui.updateCurrentWin;
            updateAll = state.ui.updateAll;
            lockUI = state.ui.lockUI;
            unlockUI = state.ui.unlockUI;
            showLoading = state.ui.showLoading;
        },
    };
});

vi.mock("../../game/systems/SoundSystem.ts", () => {
    return {
        SoundSystem: class MockSoundSystem {
            preloadAllSounds = state.sound.preloadAllSounds;
            playButtonClick = state.sound.playButtonClick;
            playSpin = state.sound.playSpin;
            playWin = state.sound.playWin;
        },
    };
});

vi.mock("../../game/systems/BettingSystem.ts", () => {
    return {
        BettingSystem: class MockBettingSystem {
            constructor(_startingBalance = 1000) {}

            deductBet = state.bettingDeductBet;
            addWinnings = state.bettingAddWinnings;
            increaseBet = state.bettingIncreaseBet;
            decreaseBet = state.bettingDecreaseBet;
            getBalance = state.bettingGetBalance;
            getCurrentBet = state.bettingGetCurrentBet;
        },
    };
});

vi.mock("../../game/systems/PayoutSystem.ts", () => {
    return {
        PayoutSystem: class MockPayoutSystem {
            getWinTier = state.payoutGetWinTier;
        },
    };
});

vi.mock("../../game/systems/GameStateManager.ts", () => {
    return {
        GameState: {
            IDLE: "idle",
            SPINNING: "spinning",
            RESOLVING_WINS: "resolving_wins",
            BONUS_ACTIVE: "bonus_active",
            GAME_OVER: "game_over",
        },
        GameStateManager: class MockGameStateManager {
            setState = state.gameStateSetState;
        },
    };
});

import { Game } from "../../game/core/Game.ts";
import { gsap } from "gsap";

function mountDom(): void {
    document.body.innerHTML = `
        <div id="loadingScreen"></div>
        <div id="currentWinText"></div>
        <div id="statusText"></div>
        <div id="balanceText"></div>
        <div id="betText"></div>
        <div id="multiplierText"></div>
        <div id="freeSpinsText"></div>
        <div id="bonusActiveText"></div>
        <div id="betDisplayValue"></div>
        <button id="spinBtn"></button>
        <button id="buyBonusBtn"></button>
        <button id="betMinusBtn"></button>
        <button id="betPlusBtn"></button>
    `;
}

async function flush(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    await new Promise<void>(resolve => setTimeout(resolve, 0));
}

describe("Game orchestration", () => {
    beforeEach(() => {
        mountDom();

        state.callbacks.spin = null;
        state.callbacks.betUp = null;
        state.callbacks.betDown = null;
        state.callbacks.buyBonus = null;

        state.appInit.mockClear();
        state.appAddChild.mockClear();
        state.gridSpin.mockClear();
        state.gridBuyBonus.mockClear();
        state.gridGetTotalWin.mockClear();
        state.gridResetWinAmount.mockClear();
        state.gridGetMultiplier.mockClear();
        state.gridGetFreeSpins.mockClear();
        state.gridIsBonusActive.mockClear();
        state.bettingDeductBet.mockClear();
        state.bettingAddWinnings.mockClear();
        state.bettingIncreaseBet.mockClear();
        state.bettingDecreaseBet.mockClear();
        state.bettingGetBalance.mockClear();
        state.bettingGetCurrentBet.mockClear();
        state.payoutGetWinTier.mockClear();
        state.gameStateSetState.mockClear();
        state.ui.onSpinButtonClick.mockClear();
        state.ui.onBetIncrement.mockClear();
        state.ui.onBetDecrement.mockClear();
        state.ui.onBuyBonusClick.mockClear();
        state.ui.updateBet.mockClear();
        state.ui.updateCurrentWin.mockClear();
        state.ui.updateAll.mockClear();
        state.ui.lockUI.mockClear();
        state.ui.unlockUI.mockClear();
        state.ui.showLoading.mockClear();
        state.sound.preloadAllSounds.mockClear();
        state.sound.playButtonClick.mockClear();
        state.sound.playSpin.mockClear();
        state.sound.playWin.mockClear();
        vi.mocked(gsap.to).mockClear();
    });

    it("initializes the canvas, grid and HUD once", async () => {
        new Game();
        await flush();

        expect(state.appInit).toHaveBeenCalledWith({
            width: 1280,
            height: 720,
            backgroundColor: "#070b14",
        });
        expect(document.body.querySelector("canvas")).not.toBeNull();
        expect(state.ui.showLoading).toHaveBeenCalledWith(false);
        expect(state.ui.updateAll).toHaveBeenCalledWith({
            balance: 999.9,
            bet: 0.1,
            multiplier: 3,
            freeSpins: 8,
            bonusActive: false,
        });
    });

    it("handles a normal spin from bet deduction to payout", async () => {
        new Game();
        await flush();

        expect(state.callbacks.spin).not.toBeNull();
        state.callbacks.spin?.();
        await flush();

        expect(state.gameStateSetState).toHaveBeenCalledWith("spinning");
        expect(state.ui.lockUI).toHaveBeenCalled();
        expect(state.sound.playSpin).toHaveBeenCalled();
        expect(state.bettingDeductBet).toHaveBeenCalledTimes(1);
        expect(state.gridSpin).toHaveBeenCalledTimes(1);
        expect(state.gridGetTotalWin).toHaveBeenCalledTimes(1);
        expect(state.ui.updateCurrentWin).toHaveBeenCalledWith(12.34);
        expect(state.bettingAddWinnings).toHaveBeenCalledWith(12.34);
        expect(state.payoutGetWinTier).toHaveBeenCalledWith(12.34, 0.1);
        expect(state.sound.playWin).toHaveBeenCalledWith("small");
        expect(state.gridResetWinAmount).toHaveBeenCalledTimes(1);
        expect(state.ui.unlockUI).toHaveBeenCalled();
        expect(state.ui.updateAll).toHaveBeenCalled();
    });

    it("goes to game over when the balance is insufficient", async () => {
        state.bettingDeductBet.mockResolvedValueOnce(false);

        new Game();
        await flush();

        state.callbacks.spin?.();
        await flush();

        expect(state.gridSpin).not.toHaveBeenCalled();
        expect(state.gameStateSetState).toHaveBeenCalledWith("game_over");
        expect(state.ui.unlockUI).toHaveBeenCalled();
    });

    it("wires bet and bonus buttons to the expected actions", async () => {
        new Game();
        await flush();

        state.callbacks.betUp?.();
        state.callbacks.betDown?.();
        state.callbacks.buyBonus?.();

        expect(state.bettingIncreaseBet).toHaveBeenCalledTimes(1);
        expect(state.bettingDecreaseBet).toHaveBeenCalledTimes(1);
        expect(state.gridBuyBonus).toHaveBeenCalledTimes(1);
        expect(state.sound.playButtonClick).toHaveBeenCalledTimes(3);
        expect(state.ui.updateBet).toHaveBeenCalledTimes(2);
        expect(state.ui.updateAll).toHaveBeenCalled();
    });
});
