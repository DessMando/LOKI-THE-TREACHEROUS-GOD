import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => {
    const cluster = [
        { type: "crown", row: 0, col: 0, multiplier: 1, sprite: {}, destroyAnimation: vi.fn().mockResolvedValue(undefined) },
        { type: "crown", row: 0, col: 1, multiplier: 1, sprite: {}, destroyAnimation: vi.fn().mockResolvedValue(undefined) },
        { type: "crown", row: 0, col: 2, multiplier: 1, sprite: {}, destroyAnimation: vi.fn().mockResolvedValue(undefined) },
        { type: "crown", row: 0, col: 3, multiplier: 1, sprite: {}, destroyAnimation: vi.fn().mockResolvedValue(undefined) },
    ] as any[];

    return {
        cluster,
        containerAddChild: vi.fn(),
        containerRemoveChild: vi.fn(),
        containerRemoveChildren: vi.fn(),
        spinCreateGrid: vi.fn(),
        spinClearGrid: vi.fn((symbols: any[][]) => {
            symbols.length = 0;
        }),
        spinSettleSymbols: vi.fn(),
        findAllClusters: vi.fn(),
        calculateTotalMultiplier: vi.fn(() => 2),
        applyRandomMultiplier: vi.fn(),
        activateLokiMagic: vi.fn(),
        cascade: vi.fn().mockResolvedValue(undefined),
        decrementSpin: vi.fn(),
        checkScatterBonus: vi.fn(),
        updateUI: vi.fn(),
        buyBonus: vi.fn(() => true),
        calculateClusterPayout: vi.fn(() => 12.34),
        getIsBonusActive: vi.fn(() => false),
        getFreeSpins: vi.fn(() => 0),
        getMultiplier: vi.fn(() => 3),
    };
});

vi.mock("pixi.js", () => {
    class MockContainer {
        public addChild = state.containerAddChild;
        public removeChild = state.containerRemoveChild;
        public removeChildren = state.containerRemoveChildren;
    }

    return {
        Container: MockContainer,
    };
});

vi.mock("../../game/systems/SpinSystem.ts", () => {
    return {
        SpinSystem: class MockSpinSystem {
            constructor(_gridStartX: number, _gridStartY: number, _symbolSize: number) {}

            createGrid = state.spinCreateGrid.mockImplementation((symbols: any[][], _getRandomSymbol: () => any, container: any) => {
                symbols.length = 0;
                for (let row = 0; row < 5; row++) {
                    symbols[row] = [];
                    for (let col = 0; col < 6; col++) {
                        const symbol = row === 0 && col < 4
                            ? state.cluster[col]
                            : {
                                type: "rune",
                                row,
                                col,
                                multiplier: 1,
                                sprite: {},
                                destroyAnimation: vi.fn().mockResolvedValue(undefined),
                            };
                        if (row === 1 && col < 2) {
                            symbol.multiplier = 2;
                        }
                        symbols[row][col] = symbol;
                        container.addChild(symbol.sprite);
                    }
                }
            });

            clearGrid = state.spinClearGrid;
            settleSymbols = state.spinSettleSymbols;
        },
    };
});

vi.mock("../../game/systems/WinSystem.ts", () => {
    return {
        WinSystem: class MockWinSystem {
            findAllClusters = state.findAllClusters.mockImplementation((_symbols: any[][]) => {
                if (state.findAllClusters.mock.calls.length === 1) {
                    return [state.cluster];
                }
                return [];
            });

            calculateTotalMultiplier = state.calculateTotalMultiplier;
            applyRandomMultiplier = state.applyRandomMultiplier;
            activateLokiMagic = state.activateLokiMagic;
        },
    };
});

vi.mock("../../game/systems/CascadeSystem.ts", () => {
    return {
        CascadeSystem: class MockCascadeSystem {
            constructor(_gridStartX: number, _gridStartY: number, _symbolSize: number) {}

            cascade = state.cascade;
        },
    };
});

vi.mock("../../game/systems/BonusSystem.ts", () => {
    return {
        BonusSystem: class MockBonusSystem {
            buyBonus = state.buyBonus;
            decrementSpin = state.decrementSpin;
            checkScatterBonus = state.checkScatterBonus;
            updateUI = state.updateUI;
            getIsBonusActive = state.getIsBonusActive;
            getFreeSpins = state.getFreeSpins;
        },
    };
});

vi.mock("../../game/systems/PayoutSystem.ts", () => {
    return {
        PayoutSystem: class MockPayoutSystem {
            calculateClusterPayout = state.calculateClusterPayout;
        },
    };
});

import { Grid } from "../../game/core/Grid.ts";

function flush(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}

describe("Grid flow", () => {
    beforeEach(() => {
        state.containerAddChild.mockClear();
        state.containerRemoveChild.mockClear();
        state.containerRemoveChildren.mockClear();
        state.spinCreateGrid.mockClear();
        state.spinClearGrid.mockClear();
        state.spinSettleSymbols.mockClear();
        state.findAllClusters.mockClear();
        state.calculateTotalMultiplier.mockClear();
        state.applyRandomMultiplier.mockClear();
        state.activateLokiMagic.mockClear();
        state.cascade.mockClear();
        state.decrementSpin.mockClear();
        state.checkScatterBonus.mockClear();
        state.updateUI.mockClear();
        state.buyBonus.mockClear();
        state.calculateClusterPayout.mockClear();
        state.getIsBonusActive.mockClear();
        state.getFreeSpins.mockClear();
        state.getMultiplier.mockClear();
        state.cluster.forEach(symbol => symbol.destroyAnimation.mockClear());
    });

    it("creates a 5x6 grid immediately", () => {
        new Grid(() => 0.1);

        expect(state.spinCreateGrid).toHaveBeenCalled();
        expect(state.containerAddChild).toHaveBeenCalled();
    });

    it("resolves wins, cascades and updates bonus state during a spin", async () => {
        const grid = new Grid(() => 0.1);

        await grid.spin();
        await flush();

        expect(state.spinClearGrid).toHaveBeenCalledTimes(1);
        expect(state.spinCreateGrid).toHaveBeenCalledTimes(2);
        expect(state.findAllClusters).toHaveBeenCalled();
        expect(state.calculateClusterPayout).toHaveBeenCalledWith("crown", 4, 2, 0.1, 1, false);
        expect(state.cluster.every(symbol => symbol.destroyAnimation.mock.calls.length === 1)).toBe(true);
        expect(state.containerRemoveChild).toHaveBeenCalledTimes(4);
        expect(state.applyRandomMultiplier).toHaveBeenCalledTimes(1);
        expect(state.cascade).toHaveBeenCalledTimes(1);
        expect(state.activateLokiMagic).toHaveBeenCalledTimes(1);
        expect(state.decrementSpin).toHaveBeenCalledTimes(1);
        expect(state.checkScatterBonus).toHaveBeenCalledTimes(1);
        expect(state.updateUI).toHaveBeenCalledTimes(1);
        expect(grid.getTotalWin()).toBeCloseTo(12.34, 2);
    });

    it("delegates bonus buys to the bonus system", () => {
        const grid = new Grid(() => 0.1);

        grid.buyBonus();

        expect(state.buyBonus).toHaveBeenCalledTimes(1);
    });

    it("calculates the grid multiplier from symbol boosts", () => {
        const grid = new Grid(() => 0.1);

        expect(grid.getMultiplier()).toBe(3);
    });
});
