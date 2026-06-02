export enum GameState {
    IDLE = "idle",
    SPINNING = "spinning",
    RESOLVING_WINS = "resolving_wins",
    BONUS_ACTIVE = "bonus_active",
    GAME_OVER = "game_over"
}

export class GameStateManager {
    private currentState: GameState = GameState.IDLE;
    private stateHistory: GameState[] = [];
    private listeners: Map<GameState, Set<() => void>> = new Map();

    constructor() {
        Object.values(GameState).forEach(state => {
            this.listeners.set(state as GameState, new Set());
        });
    }

    private canTransitionTo(newState: GameState): boolean {
        const allowTransitions: Record<GameState, GameState[]> = {
            [GameState.IDLE]: [GameState.SPINNING, GameState.GAME_OVER],
            [GameState.SPINNING]: [GameState.RESOLVING_WINS, GameState.IDLE],
            [GameState.RESOLVING_WINS]: [GameState.BONUS_ACTIVE, GameState.IDLE],
            [GameState.BONUS_ACTIVE]: [GameState.SPINNING, GameState.IDLE],
            [GameState.GAME_OVER]: [GameState.IDLE]
        };
        return allowTransitions[this.currentState]?.includes(newState) ?? false;
    }

    public setState(newState: GameState): boolean {
        if (newState === this.currentState) {
            console.warn(`Already in state: ${newState}`);
            return false;
        }

        if (!this.canTransitionTo(newState)) {
            console.warn(`Invalid transition: ${this.currentState} → ${newState}`);
            return false;
        }

        this.stateHistory.push(this.currentState);
        this.currentState = newState;
        console.log(`✅ State changed: ${newState}`);

        this.listeners.get(newState)?.forEach(callback => callback());

        return true;
    }

    public onStateChange(state: GameState, callback: () => void): void {
        if (!this.listeners.has(state)) {
            this.listeners.set(state, new Set());
        }
        this.listeners.get(state)!.add(callback);
    }

    public getState(): GameState {
        return this.currentState;
    }

    public isState(state: GameState): boolean {
        return this.currentState === state;
    }

    public isSpinning(): boolean {
        return this.currentState === GameState.SPINNING;
    }

    public isIdle(): boolean {
        return this.currentState === GameState.IDLE;
    }

    public isBonusActive(): boolean {
        return this.currentState === GameState.BONUS_ACTIVE;
    }

    public isGameOver(): boolean {
        return this.currentState === GameState.GAME_OVER;
    }

    public getHistory(): GameState[] {
        return [...this.stateHistory];
    }

    public getLastState(): GameState | null {
        return this.stateHistory[this.stateHistory.length - 1] ?? null;
    }
}