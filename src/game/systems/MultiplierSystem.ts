import { Symbol } from "../core/Symbol.ts";

export class MultiplierSystem {
    private baseMultiplier: number = 1;

    public resetMultiplier(): void {
        this.baseMultiplier = 1;
    }

    public getMultiplier(): number {
        return this.baseMultiplier;
    }

    public calculatePayout(winSize: number, baseWinValue: number, currentBet: number, symbolMultipliers: number[]): number {
        let payout = winSize * baseWinValue * currentBet;
        const totalSymbolMultiplier = symbolMultipliers.reduce((a,b) => a + b, 0);
        return payout * totalSymbolMultiplier;
    }

    public applyMultiplierBoost(symbols: Symbol[][], isBonusActive: boolean): void {
        let symbol: Symbol | null = null;
        let attempts = 0;

        while (!symbol && attempts < 10) {
            const randomRow = Math.floor(Math.random() * symbols.length);
            const randomCol = Math.floor(Math.random() * symbols[0].length);
            symbol = symbols[randomRow][randomCol];
            attempts++;
        }

        if (!symbol) return;
        const boost = isBonusActive ? 2 : 1;
        symbol.multiplier += boost;
        symbol.multiplierText.text = `x${symbol.multiplier}`;
    }
}