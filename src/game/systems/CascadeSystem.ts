import {Symbol} from "../core/Symbol.ts";

export class CascadeSystem {
    private GRID_START_X: number = 304;
    private GRID_START_Y: number = 24;
    private SYMBOL_SIZE: number = 96;

    constructor(gridStartX: number, gridStartY: number, symbolSize: number) {
        this.GRID_START_X = gridStartX;
        this.GRID_START_Y = gridStartY;
        this.SYMBOL_SIZE = symbolSize;

    }

    public async cascade(symbols: Symbol[][], getRandomSymbol: () => any, container: any): Promise<void> {
        await  this.dropSymbols(symbols);
        this.refillGrid(symbols, getRandomSymbol, container);
    }

    private async dropSymbols(symbols: Symbol[][]): Promise<void> {
        const promises: Promise<void>[] = [];

        for (let col = 0; col < symbols[0].length; col++) {
            let emptySpaces = 0;

            for (let row = symbols.length - 1; row >= 0; row--) {
                const symbol = symbols[row][col];

                if (symbol === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    const newRow = row + emptySpaces;

                    symbols[newRow][col] = symbol;
                    symbols[row][col] = null as any;
                    symbol.row = newRow;

                    const x = this.GRID_START_X + col * this.SYMBOL_SIZE;
                    const y = this.GRID_START_Y + newRow * this.SYMBOL_SIZE;

                    promises.push(symbol.moveTo(x, y));
                }
            }
        }
        await  Promise.all(promises);
    }

    private refillGrid(symbols: Symbol[][], getRandomSymbol: () => any, container: any): void {
        const { Symbol: SymbolClass } = require("../core/Symbol.ts");

        for (let row = 0; row < symbols.length; row++) {
            for (let col = 0; col < symbols[row].length; col++) {
                if (symbols[row][col] === null) {
                    const type = getRandomSymbol();
                    const symbol = new SymbolClass(type, row, col);

                    const x = this.GRID_START_X + col * this.SYMBOL_SIZE;
                    const y = this.GRID_START_Y + row * this.SYMBOL_SIZE;

                    symbol.setPosition(x, y - 300);
                    symbol.moveTo(x, y, 0.5);

                    container.addChild(symbol.sprite);
                    symbols[row][col] = symbol;
                }
            }
        }
    }
}




