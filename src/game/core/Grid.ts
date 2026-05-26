import * as PIXI from "pixi.js"
import { SYMBOLS } from "../data/symbolData.ts";
import { Symbol } from "./Symbol.ts";

import {
    ROWS,
    COLS,
    SYMBOL_SIZE,
    GRID_START_X,
    GRID_START_Y
} from "../data/constants.ts";

export class Grid {
    private isSpinning: boolean = false;
    private totalMultiplier: number = 1;
    private freeSpins: number = 0;
    private isBonusActive: boolean = false;
    private currentBet: number = 0.10;
    public container: PIXI.Container;
    private  symbols: Symbol[][] = [];

    constructor() {
        this.container = new PIXI.Container;
        this.createGrid();
    }

    private createGrid(): void {
        for (let row = 0; row < ROWS; row++) {
            this.symbols[row] = [];

            for (let col = 0; col < COLS; col++) {
                const type = this.getRandomSymbol();

                const symbol = new Symbol(type, row, col);

                const x = GRID_START_X + col * SYMBOL_SIZE;
                const y = GRID_START_Y + row * SYMBOL_SIZE;

                symbol.setPosition(x, y);

                this.container.addChild(symbol.sprite);
                this.symbols[row][col] = symbol;
            }
        }
    }

    public async spin(): Promise<void> {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.clearGrid();
        this.createGrid();

        await this.checkWins();
        if (this.isBonusActive) {
            this.freeSpins--;

            console.log("FREE SPINS LEFT:", this.freeSpins);
            if (this.freeSpins <= 0) {
                this.isBonusActive = false

                console.log("BONUS ENDED");
            }
        }
        this.checkScatterBonus();


        this.dropSymbols();

        this.updateUI();
        this.isSpinning = false;
    }

    public buyBonus(): void {
        this.startBonusGame();
        console.log("BONUS PURCHASED");
    }

    private clearGrid(): void {
        this.container.removeChildren();
        this.symbols = [];
    }

    private dropSymbols(): void {
        for (let row = 0; row < this.symbols.length; row++) {
            for (let col = 0; col < this.symbols[row].length; col++) {
                const symbol = this.symbols[row][col];
                const x = 304 + col * 96;
                const y = 24 + row * 96;

                symbol.moveTo(x, y);
            }
        }
    }

    private async checkWins(): Promise<void> {
        const visited: Set<string> = new Set();

        for (let row = 0; row < this.symbols.length; row++) {
            for (let col = 0; col < this.symbols[row].length; col++) {

                const symbol = this.symbols[row][col];

                if (!symbol) continue;

                const key = `${row}-${col}`;

                if (visited.has(key)) continue;

                const cluster = this.findCluster(
                    row,
                    col,
                    symbol.type,
                    visited
                );

                if (cluster.length >= 4) {
                    console.log("WIN:", cluster);
                    console.log("TOTAL MULTIPLIER:", this.calculateTotalMultiplier());
                    await this.removeCluster(cluster);
                    this.applyRandomMultiplier();
                    await this.resolveCascade();
                    this.activateLokiMagic();
                }
            }
        }
    }

    private findCluster(
        row: number,
        col: number,
        type: any,
        visited: Set<string>
    ): any[] {

        const stack = [[row, col]];
        const cluster: any[] = [];

        while (stack.length) {

            const [r, c] = stack.pop()!;

            const key = `${r}-${c}`;

            if (visited.has(key)) continue;

            if (!this.symbols[r]?.[c]) continue;

            if (this.symbols[r][c].type !== type) continue;

            visited.add(key);
            cluster.push(this.symbols[r][c]);

            stack.push([r + 1, c]);
            stack.push([r - 1, c]);
            stack.push([r, c + 1]);
            stack.push([r, c - 1]);
        }

        return cluster;
    }

    private async removeCluster(cluster: any[]): Promise<void> {
        for (const symbol of cluster) {
            await symbol.destroyAnimation();
            this.container.removeChild(symbol.sprite);
            this.symbols[symbol.row][symbol.col] = null as any;
        }
    }

    private async startCascade(): Promise<void> {
        for (let col = 0; col < this.symbols[0].length; col++) {
            let emptySpaces = 0;

            for (let row = this.symbols.length - 1; row >= 0; row--) {
                const symbol = this.symbols[row][col];

                if (symbol === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    const newRow = row + emptySpaces;

                    this.symbols[newRow][col] = symbol;
                    this.symbols[row][col] = null as any;

                    symbol.row = newRow;

                    const x = 304 + col * 96;
                    const y = 24 + newRow * 96;

                    await symbol.moveTo(x, y)
                }
            }
        }
    }

    private refillGrid(): void {
        for (let row = 0; row < this.symbols.length; row++) {
            for (let col = 0; col < this.symbols[row].length; col++) {
                if (this.symbols[row][col] === null) {
                    const type = this.getRandomSymbol();
                    const symbol = new Symbol(type, row, col);

                    const x = 304 + col * 96;
                    const y = 24 + row * 96;

                    symbol.setPosition(x, y - 300);
                    symbol.moveTo(x, y, 0.5);
                    this.container.addChild(symbol.sprite)
                    this.symbols[row][col] = symbol;
                }
            }
        }
    }

    private async resolveCascade(): Promise<void> {
        await this.startCascade();
        this.refillGrid();
        await this.checkWins();
    }

    private applyRandomMultiplier(): void {
        const randomRow = Math.floor(Math.random() * this.symbols.length);
        const randomCol = Math.floor(Math.random() * this.symbols[0].length);
        const symbol = this.symbols[randomRow][randomCol];

        if (!symbol) return;

        if (this.isBonusActive) {
            symbol.multiplier += 2;
        } else {
            symbol.multiplier += 1;
        }
        symbol.multiplierText.text = `x${symbol.multiplier}`
    }

    private calculateTotalMultiplier(): number {
        let total = 1;

        for (let row = 0; row < this.symbols.length; row++) {
            for (let col = 0; col < this.symbols[row].length; col++) {
                const symbol = this.symbols[row][col];

                if (!symbol) continue;
                total += (symbol.multiplier - 1);
            }
        }
        return total;
    }

    private checkScatterBonus(): void {
        let scatterCount = 0;
        for (let row = 0; row < this.symbols.length; row++) {
            for (let col = 0; col < this.symbols[row].length; col++) {
                const symbol = this.symbols[row][col];
                if (!symbol) continue;
                if (symbol.type === "scatter") {
                    scatterCount++;
                }
            }
        }
        if (scatterCount >= 4) {
            this.startBonusGame();
        }
    }

    private startBonusGame(): void {
        this.isBonusActive = true;
        this.freeSpins = 10
        console.log("FREE SPINS STARTED");
    }

    private activateLokiMagic(): void {
        const chance = Math.random();

        if (chance > 0.35) return;

        const row1 = Math.floor(Math.random() * this.symbols.length);
        const col1 = Math.floor(Math.random() * this.symbols[0].length);
        const row2 = Math.floor(Math.random() * this.symbols.length);
        const col2 = Math.floor(Math.random() * this.symbols[0].length);

        const symbol1 = this.symbols[row1][col1];
        const symbol2 = this.symbols[row2][col2];

        if (!symbol1 || !symbol2) return;

        symbol2.changeType(symbol1.type);
        symbol2.magicEffect();
        console.log("LOKI MAGIC ACTIVATED");
    }

    private getRandomSymbol(): any {
        const randomIndex = Math.floor(Math.random() * SYMBOLS.length);

        return SYMBOLS[randomIndex];
    }

    private updateUI(): void {
        const freeSpinsText = document.getElementById("freeSpinsText");
        const bonusActivateText = document.getElementById("bonusActiveText");

        if (freeSpinsText) {
            freeSpinsText.innerHTML = `Free Spins: ${this.freeSpins}`;
        }

        if (bonusActivateText) {
            bonusActivateText.innerHTML = this.isBonusActive ? "BONUS ACTIVE" : "BONUS INACTIVE";
        }
    }

    private checkBigWin(payout: number): void {
        if (payout >= 500) {
             console.log("BIG WIN");
        }

        if (payout >= 2000) {
            console.log("MAX WIN");
        }
    }
}