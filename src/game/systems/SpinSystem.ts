import { Symbol } from "../core/Symbol.ts";
import { ROWS, COLS } from "../data/constants.ts";

export class SpinSystem {
    private GRID_START_X: number;
    private GRID_START_Y: number;
    private SYMBOL_SIZE: number;

    constructor(gridStartX: number, gridStartY: number, symbolSize: number) {
        this.GRID_START_X = gridStartX;
        this.GRID_START_Y = gridStartY;
        this.SYMBOL_SIZE = symbolSize;
    }

    public createGrid(symbols: Symbol[][], getRandomSymbol: () => any, container: any): void {
        const { Symbol: SymbolClass } = require("../core/Symbol.ts");

        for (let row = 0; row < ROWS; row++) {
            if (!symbols[row]) symbols[row] = [];

            for (let col = 0; col < COLS; col++) {
                const type = getRandomSymbol();
                const symbol = new SymbolClass(type, row, col);

                const x = this.GRID_START_X + col * this.SYMBOL_SIZE;
                const y = this.GRID_START_Y + row * this.SYMBOL_SIZE;

                symbol.setPosition(x, y);

                container.addChild(symbol.sprite);
                symbol[row][col] = symbol;
            }
        }
    }

    public clearGrid(symbols: Symbol[][], container: any): void {
        container.removeChild();
        symbols.length = 0;
    }

    public settleSymbols(symbols: Symbol[][]): void {
        for (let row = 0; row < symbols.length; row++) {
            for (let col = 0; col < symbols[row].length; col++) {
                const symbol = symbols[row][col];

                if (!symbol) continue;

                const x = this.GRID_START_X + col * this.SYMBOL_SIZE;
                const y = this.GRID_START_Y + row * this.SYMBOL_SIZE;
                symbol.setPosition(x, y);
            }
        }
    }
}