# Slot Spec

This file defines the contract the game should satisfy before the account/backend layer is connected.

## Math Model

- Target RTP: set one fixed target in the math model and keep it stable across sessions.
- Volatility band: define the allowed win distribution for small, medium, and large wins.
- Hit rate: define the percentage of spins that should return any win.
- Max win: define the maximum allowed multiplier and absolute payout.

## Spin Flow

- Idle -> spinning -> resolving -> idle.
- If bonus is active, free spins must be consumed without deducting a normal bet.
- If balance is too low, normal spins must be blocked.
- Rapid clicks must not create duplicate spins or duplicate deductions.

## Tumble Flow

- Wins must remove the winning symbols.
- Symbols above must fall into the empty space.
- New symbols must refill from the top.
- Cascades must continue until no new wins remain.

## Bonus Flow

- Scatter count must trigger bonus only when the configured threshold is met.
- Bonus buy must deduct the configured bonus cost before activation.
- Retriggers must add free spins according to the math model.

## Account Flow

- Balance must never go below zero unless the design explicitly allows it.
- Winnings must be settled after the spin flow completes.
- Session state must be recoverable from a backend wallet record.

## Acceptance Criteria

- The game must be deterministic under seeded RNG.
- The same seed must produce the same spin outcome.
- The same input state must produce the same payout.
- All public states must be observable from tests or exposed diagnostics.
