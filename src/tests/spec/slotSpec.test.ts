import { describe, it } from "vitest";

describe("Casino slot spec", () => {
    describe("math model", () => {
        it.todo("keeps RTP within the configured target band over a large simulation");
        it.todo("keeps hit rate within the configured target band over a large simulation");
        it.todo("keeps volatility within the configured band for small, medium and large wins");
        it.todo("caps the maximum payout at the configured max win");
    });

    describe("spin contract", () => {
        it.todo("moves through idle -> spinning -> resolving -> idle in a single spin");
        it.todo("blocks duplicate spin starts while a spin is already running");
        it.todo("does not deduct a normal bet during free spins");
        it.todo("rejects a normal spin when balance is below the current bet");
    });

    describe("tumble contract", () => {
        it.todo("removes winning symbols before cascade starts");
        it.todo("drops symbols into the lowest available cells");
        it.todo("refills empty cells from the top after each cascade");
        it.todo("continues tumbling until no more wins remain");
    });

    describe("bonus contract", () => {
        it.todo("triggers the bonus only after the configured scatter threshold");
        it.todo("activates bonus buy only after deducting the buy cost");
        it.todo("adds retrigger free spins according to the configured rule");
        it.todo("keeps bonus state visible in the HUD during free spins");
    });

    describe("account contract", () => {
        it.todo("persists balance updates through the account layer");
        it.todo("stores the settled payout after each completed spin");
        it.todo("never allows the wallet balance to drift out of sync with the client");
        it.todo("restores the session correctly after reload");
    });

    describe("determinism contract", () => {
        it.todo("produces the same outcome for the same seeded RNG input");
        it.todo("produces the same payout for the same board state");
        it.todo("logs the state transition chain for every completed spin");
    });
});
