import  * as PIXI from "pixi.js";
import {GAME_WIDTH, GAME_HEIGHT} from "../data/constants.ts";
import { Grid } from "./Grid.ts";

export class Game {
    public app!: PIXI.Application;
    private grid!: Grid;

    constructor() {
        this.init();
        this.grid = new Grid();
        this.app.stage.addChild(this.grid.container);
        this.initUI();
    }

    private initUI(): void {
        const btn = document.getElementById("spinBtn");

        btn?.addEventListener("click", () => {this.grid.spin();});
        const buyBonusBtn = document.getElementById("buyBonusBtn");
        buyBonusBtn?.addEventListener("click", () => {
            this.grid.buyBonus();
        });
    }

    private async init(): Promise<void> {
        this.app = new PIXI.Application();

        await this.app.init({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            backgroundColor: "#070b14"
        });

        document.body.appendChild(this.app.canvas);
        this.grid = new Grid();

        this.app.stage.addChild(this.grid.container);
    }

    public shakeScreen(): void {
        gsap.to(this.app.stage, {
            x: 10,
            duration: 0.05,
            repeat: 5,
            yoyo: true
        });
    }

    private playSound(path: string): void {
        const audio = new Audio(path);
        audio.volume = 0.4;
        audio.play();
        this.playSound("/audio/win.mp3");
    }
}