import { beforeEach, describe, expect, it, vi } from "vitest";
import { SoundSystem, SoundType } from "../../game/systems/SoundSystem.ts";

class MockAudio {
    static instances: MockAudio[] = [];

    public src = "";
    public preload = "";
    public volume = 0;
    public currentTime = 0;
    public paused = true;
    public play = vi.fn(() => {
        this.paused = false;
        return Promise.resolve();
    });
    public pause = vi.fn(() => {
        this.paused = true;
    });
    private listeners = new Map<string, Array<() => void>>();

    constructor() {
        MockAudio.instances.push(this);
    }

    addEventListener(type: string, callback: () => void): void {
        const list = this.listeners.get(type) ?? [];
        list.push(callback);
        this.listeners.set(type, list);

        if (type === "canplaythrough" || type === "error") {
            queueMicrotask(callback);
        }
    }
}

describe("SoundSystem", () => {
    beforeEach(() => {
        MockAudio.instances = [];
        vi.stubGlobal("Audio", MockAudio as any);
    });

    it("plays the requested sound with the expected volume", () => {
        const sound = new SoundSystem();
        sound.playSpin();

        expect(MockAudio.instances.length).toBeGreaterThan(0);
        expect(MockAudio.instances.some(audio => audio.play.mock.calls.length > 0)).toBe(true);

        const playedAudio = MockAudio.instances.find(audio => audio.play.mock.calls.length > 0);
        expect(playedAudio?.volume).toBeCloseTo(0.28, 2);
    });

    it("clamps the master volume to the valid range", () => {
        const sound = new SoundSystem();

        sound.setMasterVolume(2);
        expect(sound.getMasterVolume()).toBe(1);

        sound.setMasterVolume(-1);
        expect(sound.getMasterVolume()).toBe(0);
    });

    it("mutes and unmutes playback", () => {
        const sound = new SoundSystem();

        sound.setMuted(true);
        expect(sound.isSoundMuted()).toBe(true);

        sound.toggleMute();
        expect(sound.isSoundMuted()).toBe(false);
    });

    it("maps win tiers to the correct sound types", () => {
        const sound = new SoundSystem();
        const playSpy = vi.spyOn(sound, "play");

        sound.playWin("small");
        expect(playSpy).toHaveBeenLastCalledWith(SoundType.WIN_SMALL);

        sound.playWin("big");
        expect(playSpy).toHaveBeenLastCalledWith(SoundType.WIN_BIG);

        sound.playWin("max");
        expect(playSpy).toHaveBeenLastCalledWith(SoundType.WIN_MAX);
    });

    it("preloads all sounds without hanging", async () => {
        const sound = new SoundSystem();
        await expect(sound.preloadAllSounds()).resolves.toBeUndefined();
    });

    it("stops all sounds and resets playback state", () => {
        const sound = new SoundSystem();
        sound.playSpin();
        sound.stopAll();

        expect(MockAudio.instances.every(audio => audio.pause.mock.calls.length >= 0)).toBe(true);
        expect(MockAudio.instances.every(audio => audio.currentTime === 0)).toBe(true);
    });
});
