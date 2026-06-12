import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../game/utils/SeededRandom.ts";

describe("SeededRandom", () => {
    it("produces the same sequence for the same numeric seed", () => {
        const a = new SeededRandom(12345);
        const b = new SeededRandom(12345);

        expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
    });

    it("produces the same sequence for the same string seed", () => {
        const a = new SeededRandom("loki");
        const b = new SeededRandom("loki");

        expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
    });

    it("keeps values inside the 0..1 range", () => {
        const rng = new SeededRandom(42);

        for (let i = 0; i < 20; i++) {
            const value = rng.next();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });

    it("returns bounded integers", () => {
        const rng = new SeededRandom(42);

        for (let i = 0; i < 20; i++) {
            const value = rng.nextInt(7);
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(7);
        }
    });

    it("returns bounded ranges", () => {
        const rng = new SeededRandom(42);

        for (let i = 0; i < 20; i++) {
            const value = rng.nextRange(10, 20);
            expect(value).toBeGreaterThanOrEqual(10);
            expect(value).toBeLessThanOrEqual(20);
        }
    });

    it("throws on invalid integer bounds", () => {
        const rng = new SeededRandom(42);
        expect(() => rng.nextInt(0)).toThrow();
    });

    it("throws on reversed range bounds", () => {
        const rng = new SeededRandom(42);
        expect(() => rng.nextRange(20, 10)).toThrow();
    });
});
