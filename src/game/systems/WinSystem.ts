import { Symbol } from "../core/Symbol.ts";

export class WinSystem {
    private totalMultiplier: number = 1;

    public findAllClusters(symbols: Symbol[][], visited: Set<string> = new Set()): Symbol[][] {
        const clusters: Symbol[][] = [];

        for (let row = 0; row < symbols.length; row++) {
            for (let col = 0; col < symbols[row].length; col++) {
                const symbol = symbols[row][col];
                if (!symbol) continue;

                const key = `${row}-${col}`;
                if (visited.has(key)) continue;

                const cluster = this.findCluster(row, col, symbol.type, symbols, visited);
                if (cluster.length >= 4) {
                    clusters.push(cluster);
                }
            }
        }
        return clusters;
    }

    private findCluster(row: number, col: number, type: any, symbols: Symbol[][], visited: Set<string>): Symbol[] {
        const stack = [[row, col]];
        const cluster: Symbol[] = [];

        while (stack.length) {
            const [r, c] = stack.pop()!;
            const key = `${r}-${c}`;

            if (visited.has(key)) continue;
            if (!symbols[r]?.[c]) continue;
            if (symbols[r][c].type !== type) continue;

            visited.add(key);
            cluster.push(symbols[r][c]);

            stack.push([r + 1, c]);
            stack.push([r - 1, c]);
            stack.push([r, c + 1]);
            stack.push([r, c - 1]);
        }
        return cluster;
    }
    public calculateTotalMultiplier(symbols: Symbol[][]): number {
        let total = 1;

        for (let row = 0; row < symbols.length; row++) {
            for (let col = 0; col < symbols[row].length; col++) {
                const symbol = symbols[row][col];

                if (!symbol) continue;
                total += (symbol.multiplier - 1);
            }
        }
        return total;
    }

    public activateLokiMagic(symbols: Symbol[][]): void {
        const chance = Math.random();
        if (chance > 0.35) return;

        const row1 = Math.floor(Math.random() * symbols.length);
        const col1 = Math.floor(Math.random() * symbols[0].length);
        const row2 = Math.floor(Math.random() * symbols.length);
        const col2 = Math.floor(Math.random() * symbols[0].length);

        const symbol1 = symbols[row1][col1];
        const symbol2 = symbols[row2][col2];

        if (!symbol1 || !symbol2) return;

        symbol2.changeType(symbol1.type);
        symbol2.magicEffect();
        console.log("🔮 LOKI MAGIC ACTIVATED")
    }

    public applyRandomMultiplier(symbols: Symbol[][], isBonusActive: boolean): void {
        let symbol: Symbol | null = null;
        let attempts = 0;

        while (!symbol && attempts < 10) {
            const randomRow = Math.floor(Math.random() * symbols.length);
            const randomCol = Math.floor(Math.random() * symbols[0].length);
            symbol = symbols[randomRow][randomCol];
            attempts++
        }

        if (!symbol) return;

        const boost = isBonusActive ? 2 : 1;
        symbol.multiplier += boost;
        symbol.multiplierText.text = `x${symbol.multiplier}`;
    }
    public checkBigWin(payout: number): "big" | "max" | null {
        if (payout >= 2000) return "max";
        if (payout >= 500) return "big";
        return null;
    }
}