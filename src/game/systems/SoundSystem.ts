export enum SoundType {
    SPIN_START = "spin_start",
    SPIN_END = "spin_end",
    WIN_SMALL = "win_small",
    WIN_BIG = "win_big",
    WIN_MAX = "win_max",
    BONUS_TRIGGER = "bonus_trigger",
    BONUS_RETRIGGER = "bonus_retrigger",
    CASCADE = "cascade",
    LOKI_MAGIC = "loki_magic",
    BUTTON_CLICK = "button_click"
}

export class SoundSystem {
    private audioPool: Map<SoundType, HTMLAudioElement[]> = new Map();
    private isMuted: boolean = false;
    private masterVolume: number = 0.7;          // 0-1
    private soundVolumes: Map<SoundType, number> = new Map([
        [SoundType.SPIN_START, 0.4],
        [SoundType.SPIN_END, 0.3],
        [SoundType.WIN_SMALL, 0.5],
        [SoundType.WIN_BIG, 0.8],
        [SoundType.WIN_MAX, 1.0],
        [SoundType.BONUS_TRIGGER, 1.0],
        [SoundType.BONUS_RETRIGGER, 0.9],
        [SoundType.CASCADE, 0.6],
        [SoundType.LOKI_MAGIC, 0.7],
        [SoundType.BUTTON_CLICK, 0.3]
    ]);

    private soundPaths: Map<SoundType, string> = new Map([
        [SoundType.SPIN_START, "/audio/spin_start.mp3"],
        [SoundType.SPIN_END, "/audio/spin_end.mp3"],
        [SoundType.WIN_SMALL, "/audio/win_small.mp3"],
        [SoundType.WIN_BIG, "/audio/win_big.mp3"],
        [SoundType.WIN_MAX, "/audio/win_max.mp3"],
        [SoundType.BONUS_TRIGGER, "/audio/bonus_trigger.mp3"],
        [SoundType.BONUS_RETRIGGER, "/audio/bonus_retrigger.mp3"],
        [SoundType.CASCADE, "/audio/cascade.mp3"],
        [SoundType.LOKI_MAGIC, "/audio/loki_magic.mp3"],
        [SoundType.BUTTON_CLICK, "/audio/button_click.mp3"]
    ]);

    constructor() {
        this.initializeAudioPool();
    }

    private initializeAudioPool(): void {
        Object.values(SoundType).forEach(soundType => {
            const poolSize = 3;
            const pool: HTMLAudioElement[] = [];

            for (let i = 0; i < poolSize; i++) {
                const audio = new Audio();
                audio.src = this.soundPaths.get(soundType as SoundType) || "";
                audio.preload = "auto";
                pool.push(audio);
            }
            this.audioPool.set(soundType as SoundType, pool);
        });
    }

    public play(soundType: SoundType): void {
        if (this.isMuted) return;

        const pool = this.audioPool.get(soundType);
        if (!pool || pool.length === 0) {
            console.warn(`Sound pool empty for: ${soundType}`);
            return;
        }

        const audio = pool.find(a => a.paused);
        if (!audio) {
            console.warn(`No available audio instance for: ${soundType}`);
            return;
        }

        const soundVolume = this.soundVolumes.get(soundType) ?? 0.5;
        audio.volume = this.masterVolume * soundVolume;

        audio.currentTime = 0;
        audio.play().catch(err => {
            console.warn(`Failed to play sound: ${soundType}`, err);
        });
    }

    public playSpin(): void {
        this.play(SoundType.SPIN_START);
    }

    public  playWin(tier: "small" | "big" | "max"): void {
        switch (tier) {
            case "small":
                this.play(SoundType.WIN_SMALL);
                break;
            case "big":
                this.play(SoundType.WIN_BIG);
                break;
            case "max":
                this.play(SoundType.WIN_MAX);
                break;
        }
    }

    public playBonus(): void {
        this.play(SoundType.BONUS_TRIGGER);
    }

    public playCascade(): void {
        this.play(SoundType.CASCADE);
    }

    public playLokiMagic(): void {
        this.play(SoundType.LOKI_MAGIC);
    }

    public playButtonClick(): void {
        this.play(SoundType.BUTTON_CLICK);
    }

    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    public getMasterVolume(): number {
        return this.masterVolume;
    }

    public setSoundVolume(soundType: SoundType, volume: number): void {
        this.soundVolumes.set(soundType, Math.max(0, Math.min(1, volume)));
    }

    public setMuted(muted: boolean): void {
        this.isMuted = muted;
        console.log(`🔊 Sound ${muted ? "muted" : "unmuted"}`);
    }

    public toggleMute(): void {
        this.setMuted(!this.isMuted)
    }

    public isSoundMuted(): boolean {
        return this.isMuted;
    }

    public async preloadAllSounds(): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const [soundType, pool] of this.audioPool.entries()) {
            for (const audio of pool) {
                promises.push(
                    new Promise((resolve) => {
                        audio.addEventListener("canplaythrough", () => resolve(), {once: true});
                        audio.addEventListener("error", () => resolve(), {once: true})
                    })
                );
            }
        }
        await Promise.all(promises);
        console.log("✅ All sounds preloaded");
    }

    public stopAll(): void {
        for (const pool of this.audioPool.values()) {
            for (const audio of pool) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }
}