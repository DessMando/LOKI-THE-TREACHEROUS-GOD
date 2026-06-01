import * as PIXI from "pixi.js";
import { SYMBOLS } from "../data/symbolData.ts";
import { Symbol } from "./Symbol.ts";
import { SYMBOL_SIZE, GRID_START_X, GRID_START_Y } from "../data/constants.ts";
import { WinSystem } from "../systems/WinSystem.ts";
import { CascadeSystem } from "../systems/CascadeSystem.ts";
import { BonusSystem } from "../systems/BonusSystem.ts";
import { SpinSystem } from "../systems/SpinSystem.ts";

export class Grid {
    private isSpinning: boolean = false;

    private winSystem: WinSystem;
    private cascadeSystem: CascadeSystem;
    private bonusSystem: BonusSystem;
    private spinSystem: SpinSystem;

    public container: PIXI.Container;
    private symbols: Symbol[][] = [];
    private totalWinThisSpin: number = 0;

    constructor() {
        this.container = new PIXI.Container();

        this.winSystem = new WinSystem();
        this.cascadeSystem = new CascadeSystem(GRID_START_X, GRID_START_Y, SYMBOL_SIZE);
        this.bonusSystem = new BonusSystem();
        this.spinSystem = new SpinSystem(GRID_START_X, GRID_START_Y, SYMBOL_SIZE);

        this.createGrid();
    }

    private createGrid(): void {
        this.spinSystem.createGrid(this.symbols, () => this.getRandomSymbol(), this.container);
    }

    public async spin(): Promise<void> {
        if (this.isSpinning) return;

        this.isSpinning = true;

        this.totalWinThisSpin = 0;

        try {
            this.spinSystem.clearGrid(this.symbols, this.container);
            this.createGrid();
            await this.resolveWins();
            this.bonusSystem.decrementSpin();
            this.bonusSystem.checkScatterBonus(this.symbols);
            this.spinSystem.settleSymbols(this.symbols);
            this.bonusSystem.updateUI();
        } finally {
            this.isSpinning = false;
        }
    }

    private async resolveWins(): Promise<void> {
        let hasWins = true;
        let cascadeLevel = 1;

        while (hasWins) {
            const clusters = this.winSystem.findAllClusters(this.symbols);

            if (clusters.length === 0) {
                hasWins = false;
                break;
            }

            for (const cluster of clusters) {
                const multiplier = this.winSystem.calculateTotalMultiplier(this.symbols);
                const clusterPayout = cluster.length * 6 * multiplier * 0.10;
                this.totalWinThisSpin += clusterPayout;

                console.log(`WIN: ${cluster.length}symbols, payout: €${clusterPayout.toFixed(2)} , Total this spin: €${this.totalWinThisSpin.toFixed(2)}`);

                await this.removeCluster(cluster);
                this.winSystem.applyRandomMultiplier(this.symbols, this.bonusSystem.getIsBonusActive());
            }

            await this.cascadeSystem.cascade(this.symbols, () => this.getRandomSymbol(), this.container);
            this.winSystem.activateLokiMagic(this.symbols);

            cascadeLevel++;
        }
    }

    private async removeCluster(cluster: Symbol[]): Promise<void> {
        for (const symbol of cluster) {
            await symbol.destroyAnimation();
            this.container.removeChild(symbol.sprite);
            this.symbols[symbol.row][symbol.col] = null as any;
        }
    }

    public buyBonus(): void {
        this.bonusSystem.buyBonus();
    }

    private getRandomSymbol(): any {
        const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
        return SYMBOLS[randomIndex];
    }

    public getTotalWin(): number {
        return this.totalWinThisSpin
    }

    public getFreeSpins(): number {
        return this.bonusSystem.getFreeSpins();
    }

    public isBonusActive() {
        return this.bonusSystem.getIsBonusActive();
    }

    public getMultiplier(): number {
        let totalMultiplier = 1;

        for (let row = 0; row < this.symbols.length; row++) {
            for (let col = 0; col < this.symbols[row].length; col++) {
                const symbol = this.symbols[row][col];
                if (symbol) {
                    totalMultiplier += (symbol.multiplier - 1);
                }
            }
        }
        return totalMultiplier
    }

    public resetWinAmount(): void {
        this.totalWinThisSpin = 0;
    }
}