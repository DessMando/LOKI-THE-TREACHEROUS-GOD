import { Symbol } from "../core/Symbol.ts";

export class BonusSystem {
    private  isBonusActive: boolean = false;
    private freeSpins: number = 0;
    private SCATTER_THRESHOLD: number = 4;

    public getIsBonusActive(): boolean {
        return this.isBonusActive;
    }

    public getFreeSpins(): number {
        return this.freeSpins;
    }

    public checkScatterBonus(symbols: Symbol[][]): boolean {
        let scatterCount = 0;

        for (let row = 0; row < symbols.length; row++) {
            for (let col = 0; col < symbols[row].length; col++) {
                const symbol = symbols[row][col];
                if (symbol && symbol.type === "scatter") {
                    scatterCount++
                }
            }
        }

        if (scatterCount >= this.SCATTER_THRESHOLD) {
            this.startBonus();
            return true;
        }
        return false;
    }

    private startBonus(): void {
        this.isBonusActive = true;
        this.freeSpins = 10;
        console.log("U HAVE 10 FREE SPINS");
    }

    public decrementSpin(): boolean {
        if (!this.isBonusActive) return false;

        this.freeSpins--;
        console.log(`FREE SPINS LEFT: ${this.freeSpins}`);

        if (this.freeSpins <= 0) {
            this.isBonusActive = false;
            console.log("BONUS ENDED");
            return true;
        }
        return false;
    }

    public buyBonus(): void {
        this.startBonus();
        console.log("U HAVE 10 FREE SPINS");
    }

    public updateUI(): void {
        const freeSpinsText = document.getElementById("freeSpinsText");
        const bonusActivateText = document.getElementById("bonusActiveText");

        if (freeSpinsText) {
            freeSpinsText.innerHTML = `Free Spins: ${this.freeSpins}`
        }

        if (bonusActivateText) {
            bonusActivateText.innerHTML = this.isBonusActive ? "BONUS" : "";
        }
    }
}