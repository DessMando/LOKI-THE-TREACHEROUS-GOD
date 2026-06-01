export const SYMBOLS = [
    "rune",
    "orb",
    "staff",
    "wolf",
    "crown",
    "wild",
    "scatter"
];

export const SYMBOL_DATA = {
    rune: {
        color: 0x94a3b8,
        baseValue: 1,
        rarity: 1
    },

    orb: {
        color: 0xa855f7,
        baseValue: 3,
        rarity: 2
    },

    staff: {
        color: 0x22c55e,
        baseValue: 4,
        rarity: 2
    },

    wolf: {
        color: 0x4b5563,        // Donker grijs
        baseValue: 5,
        rarity: 3               // Rarer
    },

    crown: {
        color: 0xfacc15,        // Geel/goud
        baseValue: 6,           // Betere payout
        rarity: 4               // Zeldzaam
    },

    wild: {
        color: 0x00ff99,        // Neon groen
        baseValue: 8,           // Hoge payout
        rarity: 5               // Zeer zeldzaam
    },

    scatter: {
        color: 0xff6600,        // Oranje
        baseValue: 10,          // Hoogste payout
        rarity: 6,              // Meest zeldzaam
        isBonusTrigger: true    // Dit symbol triggert bonus!
    }
};
