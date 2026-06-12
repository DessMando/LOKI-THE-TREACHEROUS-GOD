export class BettingSystem {
    private balance: number = 1000;
    private currentBet: number = 0.10;
    private minBet: number = 0.10;
    private maxBet: number = 150;

    private totalBet: number = 0;
    private totalWon: number = 0;

    private spins: number = 0;

    constructor(startingBalance: number = 1000) {
        this.balance = startingBalance;
    }

    public canSpin(): boolean {
        return this.balance >= this.currentBet;
    }

    public async deductBet(): Promise<boolean> {
        if(!this.canSpin()) {
            console.warn(`Insufficient balance. Have: €${this.balance}, Need: €${this.currentBet}`);
            return false;
        }

        this.balance -= this.currentBet;
        this.totalBet += this.currentBet;
        this.spins++;

        console.log(`Bet deducted: €${this.currentBet}, Balance: €${this.balance.toFixed(2)}`);
        return true;
    }

    public addWinnings(amount: number): void {
        this.balance += amount;
        this.totalWon += amount;
        console.log(`Winnings added: €${amount.toFixed(2)}, Balance: €${this.balance.toFixed(2)}`);
    }

    public increaseBet(): void {
        const newBet = this.currentBet + 0.10;
        this.currentBet = Number(Math.min(newBet, this.maxBet).toFixed(2));
        console.log(`Bet increased to: €${this.currentBet.toFixed(2)}`);
    }

    public decreaseBet(): void {
        const newBet = this.currentBet - 0.10;
        this.currentBet = Number(Math.max(newBet, this.minBet).toFixed(2));
        console.log(`Bet decreased to: €${this.currentBet.toFixed(2)}`);
    }

    public setBet(amount: number): boolean {
        if (amount < this.minBet || amount > this.maxBet) {
            console.warn(`Invalid bet: ${amount}. Range: €${this.minBet} - €${this.maxBet}`);
            return false;
        }
        this.currentBet = amount;
        return true;
    }

    public getBalance(): number {
        return this.balance;
    }

    public getCurrentBet(): number {
        return this.currentBet;
    }

    public getSpinsPlayed(): number {
        return this.spins;
    }

    public getTotalBet(): number {
        return this.totalBet;
    }

    public getTotalWon(): number {
        return this.totalWon;
    }

    public calculateRTP(): number {
        if (this.totalBet === 0) return 0;
        return (this.totalWon / this.totalBet) * 100;
    }

    public getProfit(): number {
        return this.totalBet - this.totalWon;
    }

    public formatCurrency(amount: number): string {
        return `${amount.toFixed(2)}`;
    }

    public getStats() {
        return {
            balance: this.balance,
            currentBet: this.currentBet,
            spinsPlayed: this.spins,
            totalBet: this.totalBet,
            totalWon: this.totalWon,
            rtp: this.calculateRTP(),
            profit: this.getProfit()
        };
    }
}