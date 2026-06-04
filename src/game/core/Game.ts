import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import {GAME_HEIGHT, GAME_WIDTH} from "../data/constants.ts";
import {Grid} from "./Grid.ts";
import {GameState, GameStateManager} from "../systems/GameStateManager.ts";
import {BettingSystem} from "../systems/BettingSystem.ts";
import {PayoutSystem} from "../systems/PayoutSystem.ts";
import {UIManager} from "../systems/UIManager.ts";
import {SoundSystem} from "../systems/SoundSystem.ts";

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
        console.log("🎮 Systems initialiseren...");

        this.gameState = new GameStateManager();
        this.betting = new BettingSystem(1000);
        this.payout = new PayoutSystem();
        this.ui = new UIManager();
        this.sound = new SoundSystem();

        console.log("✅ Systems gereed!");
    }

    private async init(): Promise<void> {
        try {
            console.log("🎨 PIXI app maken...");

            this.app = new PIXI.Application();

            await this.app.init({
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                backgroundColor: "#070b14"
            });

            document.body.appendChild(this.app.canvas);
            console.log("🎲 Grid maken...");

            this.grid = new Grid();
            this.app.stage.addChild(this.grid.container);

            this.setupUIEvents();
            console.log("🔊 Sounds laden...");
            await this.sound.preloadAllSounds();

            this.ui.showLoading(false);
            this.updateUIDisplay();

            console.log("🎉 Spel klaar!");
        } catch (error) {
            console.error("❌ Init fout:", error);
        }
    }

    private setupUIEvents(): void {
        console.log("📌 UI events binden...");

        this.ui.onSpinButtonClick(() => {
            this.handleSpin();
        });

        this.ui.onBetIncrement(() => {
            this.betting.increaseBet();
            this.ui.updateBet(this.betting.getCurrentBet());
            this.sound.playButtonClick();
        });

        this.ui.onBetDecrement(() => {
            this.betting.decreaseBet();
            this.ui.updateBet(this.betting.getCurrentBet());
            this.sound.playButtonClick();
        });

        this.ui.onBuyBonusClick(() => {
            this.grid.buyBonus();
            this.sound.playButtonClick();
            this.updateUIDisplay();
        });

        console.log("✅ UI events gebonden!");
    }

    private async handleSpin(): Promise<void> {
        console.log("🎲 Spin gestart...");

        if (!this.gameState.setState(GameState.SPINNING)) {
            console.warn("❌ Kan niet spinnen!");
            return;
        }

        const deductSuccess = await this.betting.deductBet();
        if (!deductSuccess) {
            console.error("❌ Onvoldoende saldo!");
            this.gameState.setState(GameState.GAME_OVER);
            this.ui.lockUI();
            return;
        }

        this.ui.lockUI();
        this.sound.playSpin();

        try {
            await this.grid.spin();
            const winAmount =this.grid.getTotalWin();

            if (winAmount > 0) {
                console.log(`🎉 WON: €${winAmount.toFixed(2)}`);
                this.betting.addWinnings(winAmount);
                const winTier = this.payout.getWinTier(winAmount, this.betting.getCurrentBet());
                if(winTier) {
                    this.sound.playWin(winTier);
                    this.shakeScreen();
                }
            }

            this.grid.resetWinAmount();
        } catch (error) {
            console.error("❌ Spin error:", error);
        }

        this.gameState.setState(GameState.IDLE);
        this.ui.unlockUI();
        this.updateUIDisplay();

        console.log("✅ Spin voltooid!");
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

    public getSound() { return this.sound; }
    public getUI() { return this.ui; }
    public getGrid() { return this.grid; }
}