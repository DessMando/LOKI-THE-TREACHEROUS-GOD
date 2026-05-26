import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import {SYMBOL_SIZE } from "../data/constants.ts";
import { SYMBOL_DATA } from "../data/symbolData.ts"
import type { SymbolType } from "../types/types.ts";

export class Symbol {
    public sprite: PIXI.Graphics;
    public multiplierText!: PIXI.Text;
    public type: SymbolType;
    public multiplier: number = 1;
    public row: number;
    public col: number;

    constructor(type: SymbolType, row: number, col: number) {
        this.type = type;
        this.row = row;
        this.col = col;
        this.sprite = new PIXI.Graphics();
        this.draw();
    }

    public changeType(newType: SymbolType): void {
        this.type = newType;
        this.sprite.clear();
        this.sprite.beginFill(SYMBOL_DATA[newType].color);
        this.sprite.drawRoundedRect(0, 0, 90, 90, 12);
        this.sprite.endFill();
        this.sprite.addChild(this.multiplierText);
    }

    private draw(): void {

        let color = 0xffffff;

        switch (this.type) {

            case "rune":
                color = 0x94a3b8;
                break;

            case "orb":
                color = 0xa855f7;
                break;

            case "staff":
                color = 0x22c55e;
                break;

            case "wolf":
                color = 0x4b5563;
                break;

            case "crown":
                color = 0xfacc15;
                break;

            case "wild":
                color = 0x00ff99;
                break;

            case "scatter":
                color = 0xff6600;
                break;
        }

        this.sprite.beginFill(color);

        this.sprite.drawRoundedRect(0, 0, SYMBOL_SIZE, SYMBOL_SIZE, 16);

        this.sprite.endFill();
        this.multiplierText = new PIXI.Text({
            text: "",
            style: {
                fill: "#ffffff",
                fontSize: 24,
                fontWeight: "bold"
            }
        });

        this.multiplierText.x = 28;
        this.multiplierText.y = 28;

        this.sprite.addChild(this.multiplierText);
    }

    public setPosition(x: number, y: number): void {
        this.sprite.x = x;
        this.sprite.y = y;
    }

    public moveTo(x: number, y: number, duration: number = 0.35): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this.sprite, {
                x,
                y,
                duration,
                ease: "bounce.out",
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    public destroyAnimation(): Promise<void> {
        return new Promise((resolve) => {
           gsap.to(this.sprite.scale, {
              x: 0,
              y: 0,

              duration: 0.2,

              ease: "back.in",

              onComplete: () => {
                  resolve();
              }
           });
        });
    }

    public async magicEffect(): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this.sprite.scale, {
                x: 1.2,
                y: 1.2,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }
}