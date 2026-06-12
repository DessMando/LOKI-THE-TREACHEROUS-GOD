export class SeededRandom {
    private state: number;

    constructor(seed: number | string) {
        this.state = SeededRandom.normalizeSeed(seed);
    }

    private static normalizeSeed(seed: number | string): number {
        if (typeof seed === "number" && Number.isFinite(seed)) {
            return (seed >>> 0) || 1;
        }

        const input = String(seed);
        let hash = 2166136261;

        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        return (hash >>> 0) || 1;
    }

    public next(): number {
        this.state = (1664525 * this.state + 1013904223) >>> 0;
        return this.state / 0x100000000;
    }

    public nextInt(maxExclusive: number): number {
        if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
            throw new Error("maxExclusive must be a positive finite number");
        }

        return Math.floor(this.next() * maxExclusive);
    }

    public nextRange(minInclusive: number, maxInclusive: number): number {
        if (!Number.isFinite(minInclusive) || !Number.isFinite(maxInclusive)) {
            throw new Error("range bounds must be finite numbers");
        }

        if (maxInclusive < minInclusive) {
            throw new Error("maxInclusive must be greater than or equal to minInclusive");
        }

        if (maxInclusive === minInclusive) {
            return minInclusive;
        }

        return minInclusive + this.next() * (maxInclusive - minInclusive);
    }
}
