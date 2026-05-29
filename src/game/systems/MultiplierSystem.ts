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
}