export interface ISymbolPayout {
    name: string;
    baseValue: number;
    rarity: number;
}

export class PayoutSystem {
    private symbolPayouts: Map<string, ISymbolPayout> = new Map([
        ["rune", { name: "Rune", baseValue: 1, rarity: 1 }],
        ["staff", { name: "Staff", baseValue: 2, rarity: 2 }],
        ["wolf", { name: "Wolf", baseValue: 3, rarity: 3 }],
        ["orb", { name: "Orb", baseValue: 4, rarity: 4 }],
        ["crown", { name: "Crown", baseValue: 6, rarity: 5 }],
        ["wild", { name: "Wild", baseValue: 8, rarity: 6 }],
        ["scatter", { name: "Scatter", baseValue: 10, rarity: 7 }]
    ]);

    private cascadeMultipliers: Map<number, number> = new Map([
        [1, 1.0],
        [2, 1.5],
        [3, 2.0],
        [4, 3.0],
        [5, 5.0]
    ]);

    private bonusMultiplier: number = 1.5;

    constructor() {}

    public calculateClusterPayout(
        symbolType: string,
        clusterSize: number,
        symbolMultiplier: number,
        betSize: number,
        cascadeLevel: number = 1,
        isBonusActive: boolean = false
    ): number {
        const symbol = this.symbolPayouts.get(symbolType);
        if (!symbol) {
            console.warn(`Unknown symbol type: ${symbolType}`);
            return 0;
        }

        let payout = symbol.baseValue * clusterSize * symbolMultiplier * betSize;

        const cascadeMult = this.cascadeMultipliers.get(cascadeLevel) ?? 1;
        payout *= cascadeMult;

        if (isBonusActive) {
            payout *= this.bonusMultiplier;
        }

        if (clusterSize >= 5) {
            payout *= 1.25;
        }

        return Math.round(payout * 100) / 100;
    }

    private calculateTotalPayout(clusters: Array<{ symbolType: string; count: number; multiplier: number; }>,
        betSize: number,
        cascadeLevel: number = 1,
        isBonusActive: boolean = false
    ): number {
        let totalPayout = 0;

        for (const cluster of clusters) {
            const payout = this.calculateClusterPayout(
                cluster.symbolType,
                cluster.count,
                cluster.multiplier,
                betSize,
                cascadeLevel,
                isBonusActive
            );
            totalPayout += payout;
        }
        return totalPayout;
    }

    public getWinTier(payout: number, betSize: number): "small" | "big" | "max" | null {
        const betsWon = payout / betSize;

        if (betsWon >= 100) return "max";
        if (betsWon >= 25) return "big";
        if (betsWon >= 5) return "small";
        return null;
    }

    public getSymbolInfo(symbolType: string): ISymbolPayout | null {
        return this.symbolPayouts.get(symbolType) ?? null;
    }

    public setSymbolPayout(symbolType: string, baseValue: number): boolean {
        const symbol = this.symbolPayouts.get(symbolType);
        if (!symbol) return false;

        symbol.baseValue = baseValue;
        return true;
    }

    public setBonusMultiplier(mult: number): void {
        this.bonusMultiplier = Math.max(1, mult);
    }

    public getTheoreticalRTP(): number {
        return 96.5;
    }

    public getAllSymbols() {
        return Array.from(this.symbolPayouts.values());
    }
}