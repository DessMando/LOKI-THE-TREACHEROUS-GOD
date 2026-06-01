export class UIManager {
    private balanceElement: HTMLElement;
    private betElement: HTMLElement;
    private multiplierElement: HTMLElement;
    private freeSpinsElement: HTMLElement;
    private bonusStatusElement: HTMLElement;
    private currentWinElement: HTMLElement;
    private statusElement: HTMLElement;
    private spinButton: HTMLButtonElement;
    private buyBonusButton: HTMLButtonElement;
    private betMinusButton: HTMLButtonElement;
    private betPlusButton: HTMLButtonElement;

    constructor() {
        this.balanceElement = this.getElement("balanceText");
        this.betElement = this.getElement("betText");
        this.multiplierElement = this.getElement("multiplierText");
        this.freeSpinsElement = this.getElement("freeSpinsText");
        this.bonusStatusElement = this.getElement("bonusActiveText");
        this.currentWinElement = this.getElement("currentWinText") || this.createWinElement();
        this.statusElement = this.getElement("statusText") || this.createStatusElement();
        this.spinButton = this.getElement("spinBtn") as HTMLButtonElement;
        this.buyBonusButton = this.getElement("buyBonusBtn") as HTMLButtonElement;
        this.betMinusButton = this.getElement("betMinusBtn") as HTMLButtonElement;
        this.betPlusButton = this.getElement("betPlusBtn") as HTMLButtonElement
    }

    private getElement(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`UI Element not found: #${id}`);
        }
        return element!;
    }

    private createWinElement(): HTMLElement {
        const div = document.createElement("div");
        div.id = "currentWinText";
        div.className = "position-absolute top-50 start-50 translate-middle";
        div.style.cssText = "font-size: 48px; color: #fbbf24; display: none; z-index: 999;";
        document.body.appendChild(div);
        return div;
    }

    private createStatusElement(): HTMLElement {
        const div = document.createElement("div");
        div.id = "statusText";
        div.className = "position-absolute bottom-0 start-50 translate-middle-x mb-3";
        div.style.cssText = "color: white; font-size: 24px;";
        document.body.appendChild(div);
        return div;
    }

    public updateBalance(amount: number): void {
        if (!this.balanceElement) return;
        this.balanceElement.textContent = `Balance: €${amount.toFixed(2)}`;

        if (amount < 1) {
            this.balanceElement.style.color = "#ef4444";
        } else if (amount < 10) {
            this.balanceElement.style.color = "#f97316";
        } else {
            this.balanceElement.style.color = "#22c55e";
        }
    }

    public updateBet(amount: number): void {
        if (!this.betElement) return;
        this.betElement.textContent = `Bet: €${amount.toFixed(2)}`;
    }

    public updateMultiplier(mult: number): void {
        if (!this.multiplierElement) return;
        this.multiplierElement.textContent = `Multiplier: x${mult}`;
    }

    public updateCurrentWin(amount: number): void {
        if (!this.currentWinElement) return;

        if (amount > 0) {
            this.currentWinElement.textContent = `WIN: €${amount.toFixed(2)}`;
            this.currentWinElement.style.display = "block";
            this.addAnimation(this.currentWinElement, "pulse");
        } else {
            this.currentWinElement.style.display = "none";
            this.currentWinElement.classList.remove("pulse");
        }
    }

    public showBigWin(): void {
        if (!this.statusElement) return;

        this.statusElement.textContent = "🎉 BIG WIN! 🎉";
        this.statusElement.style.fontSize = "48px";
        this.statusElement.style.color = "#fbbf24";
        this.addAnimation(this.statusElement, "bounce");
    }

    public showMaxWin(): void {
        if (!this.statusElement) return;

        this.statusElement.textContent = "💎 MAX WIN! 💎";
        this.statusElement.style.fontSize = "64px";
        this.statusElement.style.color = "#dc2626";
        this.addAnimation(this.statusElement, "bounce");
    }

    public updateFreeSpins(count: number): void {
        if (!this.freeSpinsElement) return;

        if (count > 0 ) {
            this.freeSpinsElement.textContent = `🎁 ${count} FREE SPINS`;
            this.freeSpinsElement.style.color = "#34d399";
            this.freeSpinsElement.style.display = "block";
        } else {
            this.freeSpinsElement.style.display = "none";
        }
    }

    public updateBonusStatus(isActive: boolean): void {
        if (!this.bonusStatusElement) return;

        if (isActive) {
            this.bonusStatusElement.textContent = "🔥 BONUS ACTIVE";
            this.bonusStatusElement.style.color = "#ff6600";
            this.addAnimation(this.bonusStatusElement, "pulse");
        } else {
            this.bonusStatusElement.textContent = "⏸️ Bonus Inactive";
            this.bonusStatusElement.style.color = "#9ca3af";
            this.bonusStatusElement.classList.remove("pulse");
        }
    }

    public enableSpinButton(): void {
        if (!this.spinButton) return;
        this.spinButton.disabled = false;
        this.spinButton.classList.add("btn-secondary");
        this.spinButton.classList.remove("btn-success")
    }

    public disableSpinButton(): void {
        if (!this.spinButton) return;
        this.spinButton.disabled = true;
        this.spinButton.classList.add("btn-secondary");
        this.spinButton.classList.remove("btn-success");
    }

    public enableBetButtons(): void {
        if (this.betMinusButton) this.betMinusButton.disabled = false;
        if (this.betPlusButton) this.betPlusButton.disabled = true;
    }

    public disableBetButton(): void {
        if (this.betMinusButton) this.betMinusButton.disabled = true;
        if (this.betPlusButton) this.betPlusButton.disabled = true;
    }

    private addAnimation(element: HTMLElement, animationName: string): void {
        element.classList.remove(animationName);
        void element.offsetWidth;
        element.classList.add(animationName);
    }

    public onSpinButtonCLick(callback: () => void): void {
        if (this.spinButton) {
            this.spinButton.addEventListener("click", callback);
        }
    }

    public onBuyBonusClick(callback: () => void): void {
        if (this.buyBonusButton) {
            this.buyBonusButton.addEventListener("click", callback);
        }
    }

    public onBetIncrement(callback: () => void): void {
        if (this.betPlusButton) {
            this.betPlusButton.addEventListener("click", callback);
        }
    }

    public OnBetDecrement(callback: () => void): void {
        if (this.betMinusButton) {
            this.betMinusButton.addEventListener("click", callback);
        }
    }

    public updateAll(data: {
        balance?: number;
        bet?: number;
        multiplier?: number;
        freeSpins?: number;
        bonusActive?: boolean;
        currentWin?: number;
    }): void {
        if (data.balance !== undefined) this.updateBalance(data.balance);
        if (data.bet !== undefined) this.updateBet(data.bet);
        if (data.multiplier !== undefined) this.updateMultiplier(data.multiplier);
        if (data.freeSpins !== undefined) this.updateFreeSpins(data.freeSpins);
        if (data.bonusActive !== undefined) this.updateBonusStatus(data.bonusActive);
        if (data.currentWin !== undefined) this.updateCurrentWin(data.currentWin);
    }

    public lockUI(): void {
        this.disableSpinButton();
        this.disableBetButton();
    }

    public unlockUI(): void {
        this.enableSpinButton();
        this.enableBetButtons();
    }

    public showLoading(show: boolean): void {
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) {
            loadingScreen.style.display = show ? "flex" : "none";
        }
    }
}