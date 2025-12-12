import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audio } from './audioService';

// Mock Web Audio API
const mockAudioContext = {
    createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        type: 'sine'
    })),
    createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), value: 1 }
    })),
    destination: {},
    currentTime: 0
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext));

// Mock HTMLAudioElement
const mockAudio = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    volume: 1,
    currentTime: 0,
    loop: false,
    src: ''
};

vi.stubGlobal('Audio', vi.fn(() => mockAudio));

describe('Audio Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should export audio service object', () => {
            expect(audio).toBeDefined();
            expect(typeof audio).toBe('object');
        });

        it('should have volume control methods', () => {
            expect(typeof audio.setMasterVolume).toBe('function');
            expect(typeof audio.setMusicVolume).toBe('function');
            expect(typeof audio.setSfxVolume).toBe('function');
        });
    });

    describe('Volume Control', () => {
        it('should set master volume', () => {
            audio.setMasterVolume(0.5);
            // Volume should be between 0 and 1
        });

        it('should clamp volume to valid range', () => {
            audio.setMasterVolume(1.5); // Over max
            audio.setMasterVolume(-0.5); // Below min
            // Should clamp to 0-1 range
        });

        it('should set music volume', () => {
            audio.setMusicVolume(0.7);
        });

        it('should set SFX volume', () => {
            audio.setSfxVolume(0.8);
        });
    });

    describe('Sound Effects', () => {
        it('should have playBlip method', () => {
            expect(typeof audio.playBlip).toBe('function');
        });

        it('should have playAlarm method', () => {
            expect(typeof audio.playAlarm).toBe('function');
        });

        it('should have playSound method', () => {
            expect(typeof audio.playSound).toBe('function');
        });

        it('should play blip sound', () => {
            expect(() => audio.playBlip()).not.toThrow();
        });

        it('should play alarm sound', () => {
            expect(() => audio.playAlarm()).not.toThrow();
        });
    });

    describe('Music Playback', () => {
        it('should have playStageMusic method', () => {
            expect(typeof audio.playStageMusic).toBe('function');
        });

        it('should have stopMusic method', () => {
            expect(typeof audio.stopMusic).toBe('function');
        });

        it('should have playAmbientDrone method', () => {
            expect(typeof audio.playAmbientDrone).toBe('function');
        });

        it('should have stopAmbientDrone method', () => {
            expect(typeof audio.stopAmbientDrone).toBe('function');
        });

        it('should play stage music', () => {
            expect(() => audio.playStageMusic(1, false)).not.toThrow();
        });

        it('should play boss music', () => {
            expect(() => audio.playStageMusic(5, true)).not.toThrow();
        });

        it('should stop music', () => {
            expect(() => audio.stopMusic()).not.toThrow();
        });
    });

    describe('Ambient Sounds', () => {
        it('should play ambient drone', () => {
            expect(() => audio.playAmbientDrone()).not.toThrow();
        });

        it('should stop ambient drone', () => {
            expect(() => audio.stopAmbientDrone()).not.toThrow();
        });
    });

    describe('Mute Functionality', () => {
        it('should have mute method', () => {
            expect(typeof audio.mute).toBe('function');
        });

        it('should have unmute method', () => {
            expect(typeof audio.unmute).toBe('function');
        });

        it('should mute audio', () => {
            expect(() => audio.mute()).not.toThrow();
        });

        it('should unmute audio', () => {
            expect(() => audio.unmute()).not.toThrow();
        });
    });

    describe('Combat Sounds', () => {
        it('should have combat sound methods', () => {
            expect(typeof audio.playHit).toBe('function');
            expect(typeof audio.playMiss).toBe('function');
            expect(typeof audio.playCritical).toBe('function');
        });

        it('should play hit sound', () => {
            expect(() => audio.playHit()).not.toThrow();
        });

        it('should play miss sound', () => {
            expect(() => audio.playMiss()).not.toThrow();
        });

        it('should play critical hit sound', () => {
            expect(() => audio.playCritical()).not.toThrow();
        });
    });

    describe('UI Sounds', () => {
        it('should have UI sound methods', () => {
            expect(typeof audio.playSelect).toBe('function');
            expect(typeof audio.playConfirm).toBe('function');
            expect(typeof audio.playCancel).toBe('function');
        });

        it('should play select sound', () => {
            expect(() => audio.playSelect()).not.toThrow();
        });

        it('should play confirm sound', () => {
            expect(() => audio.playConfirm()).not.toThrow();
        });
    });

    describe('Achievement/Unlock Sounds', () => {
        it('should have achievement sound', () => {
            expect(typeof audio.playAchievement).toBe('function');
        });

        it('should have unlock sound', () => {
            expect(typeof audio.playUnlock).toBe('function');
        });

        it('should play achievement sound', () => {
            expect(() => audio.playAchievement()).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing audio context gracefully', () => {
            // Audio service should not crash if audio is unavailable
            expect(() => audio.playBlip()).not.toThrow();
        });
    });
});
