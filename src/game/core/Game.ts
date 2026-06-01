import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { GAME_WIDTH, GAME_HEIGHT } from "../data/constants.ts";
import { Grid } from "./Grid.ts";

import { GameStateManager, GameState } from "../systems/GameStateManager.ts";
import { BettingSystem } from "../systems/BettingSystem.ts";
import { PayoutSystem } from "../systems/PayoutSystem.ts";
import { UIManager } from "../systems/UIManager.ts";
import { SoundSystem, SoundType } from "../systems/SoundSystem.ts";

export class Game {
    public app!: PIXI.Application;
    private grid!: Grid;

    private gameState!: GameStateManager;
    private betting!: BettingSystem;
    private payout!: PayoutSystem;
    private ui!: UIManager;
    private sound!: SoundSystem;

    constructor() {
        this.initSystems();
        this.init();
    }

    private initSystems(): void {
        this.gameState = new GameStateManager();
        this.betting = new BettingSystem(1000);
        this.payout = new PayoutSystem();
        this.ui = new UIManager();
        this.sound = new SoundSystem();
    }

    private async init(): Promise<void> {
        try {
            this.app = new PIXI.Application();

            await this.app.init({
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                backgroundColor: "#070b14",
            });

            document.body.appendChild(this.app.canvas);

            this.grid = new Grid();
            this.app.stage.addChild(this.grid.container);

            this.setupUIEvents();

            await this.sound.preloadAllSounds();

            this.ui.showLoading(false);
            this.updateUIDisplay();
        } catch (error) {
            console.error("Init fout:", error);
        }
    }

    private setupUIEvents(): void {
        this.ui.onSpinButtonClick(() => this.handleSpin());
        this.ui.onBuyBonusClick(() => {
            this.grid.buyBonus();
            this.sound.playButtonClick();
            this.updateUIDisplay();
        });

        this.ui.onBetIncrement(() => {
            this.betting.increaseBet();
            this.ui.updateBet(this.betting.getCurrentBet());
            this.sound.playButtonClick();
        });

        this.ui.OnBetDecrement(() => {
            this.betting.decreaseBet();
            this.ui.updateBet(this.betting.getCurrentBet());
            this.sound.playButtonClick();
        });
    }

    private async handleSpin(): Promise<void> {
        if (!this.gameState.setState(GameState.SPINNING)) {
            console.warn("Cannot spin while spinning");
            return;
        }

        if (!await this.betting.deductBet()) {
            this.gameState.setState(GameState.GAME_OVER);
            return;
        }

        this.ui.lockUI();
        this.sound.playSpin();

        try {
            await this.grid.spin();
        } catch (error) {
            console.error("❌ Spin error:", error);
        }

        const winAmount = this.grid.getTotalWin();

        if(winAmount > 0) {
            console.log(`🎉 WON: €${winAmount.toFixed(2)}`);

            this.betting.addWinnings(winAmount);
            this.sound.playWin("big");
            this.shakeScreen();
        }
        this.grid.resetWinAmount();

        this.gameState.setState(GameState.IDLE);
        this.ui.unlockUI();

        this.updateUIDisplay();
    }

    private updateUIDisplay(): void {
        this.ui.updateAll({
            balance: this.betting.getBalance(),
            bet: this.betting.getCurrentBet(),
            multiplier: this.grid.getMultiplier(),
            freeSpins: this.grid.getFreeSpins(),
            bonusActive: this.grid.isBonusActive()
        });
    }

    public shakeScreen(): void {
        gsap.to(this.app.stage, {
            x: 10,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                this.app.stage.x = 0;
            }
        });
    }

    public getSound(): SoundSystem {
        return this.sound;
    }

    public getUI(): UIManager {
        return this.ui;
    }

    public getPayout(): PayoutSystem {
        return this.payout;
    }

    public getBetting(): BettingSystem {
        return this.betting;
    }
}