import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { GAME_WIDTH, GAME_HEIGHT } from "../data/constants.ts";
import { Grid } from "./Grid.ts";

import { GameStateManager, GameState } from "../data/constants.ts";
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
        this.app = new PIXI.Application();

        await this.app.init({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            backgroundColor: "#070b14";
        });

        document.body.appendChild(this.app.canvas);

        this.grid = new Grid();
        this.app.stage.addChild(this.grid.container);

        this.setupUIEvents();

        await this.sound.preloadAllSoubds();

        this.ui.showLoading(false);
    }

    private setupUIEvents(): void {
        this.ui.onSpinButtonClick(() => this.handleSpin());
        this.ui.onBuyBonusClick(() => {
            this.grid.buyBonus();
            this.sound.playButtonClick();
        });

        this.ui.onBetIncrement(() => {
            this.betting.increaseBet();
            this.ui.updateBet(this.betting.getCurrentBet());
            this.sound.playButtonClick();
        });

        this.updateUIDisplay();
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

        await this.grid.spin();

        this.gameState.setState(GameState.IDLE);
        this.ui.unlockUI();

        this.updateUIDisplay();
    }

    private updateUIDisplay(): void {
        this.ui.updateAll({
            balance: this.betting.getBalance(),
            bet: this.betting.getCurrentBet(),
            multiplier: 1,
            freeSpins: 0,
            bonusActive: false
        });
    }

    public shakeScreen(): void {
        gsap.to(this.app.stage, {
            x: 10,
            duration: 0.05,
            repeat: 5,
            yoyo: true
        });
    }
}