import { describe, it, expect, beforeEach } from "vitest";
import { Grid } from "../game/core/Grid";

describe("Grid", () => {

    let grid: any;

    beforeEach(() => {
        grid = new Grid();
    });

    it("maakt grid", () => {
        expect(grid).toBeDefined();
    });

});