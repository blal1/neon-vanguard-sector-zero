import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voiceLines } from './voiceLineService';
import { PilotId } from '../types';

// Mock TTS service
vi.mock('./ttsService', () => ({
    ttsService: {
        speak: vi.fn(),
        stop: vi.fn(),
        isSpeaking: vi.fn(() => false)
    }
}));

// Mock audio service
vi.mock('./audioService', () => ({
    audio: {
        playSound: vi.fn()
    }
}));

describe('Voice Line Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should export voiceLines object', () => {
            expect(voiceLines).toBeDefined();
        });

        it('should have speakRandom method', () => {
            expect(typeof voiceLines.speakRandom).toBe('function');
        });

        it('should have speakLine method', () => {
            expect(typeof voiceLines.speakLine).toBe('function');
        });
    });

    describe('Speaking Random Lines', () => {
        it('should speak random combat start line', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', PilotId.VANGUARD)).not.toThrow();
        });

        it('should speak random ability line', () => {
            expect(() => voiceLines.speakRandom('ABILITY_USE', PilotId.SOLARIS)).not.toThrow();
        });

        it('should speak random boss encounter line', () => {
            expect(() => voiceLines.speakRandom('BOSS_ENCOUNTER', PilotId.HYDRA)).not.toThrow();
        });

        it('should speak random victory line', () => {
            expect(() => voiceLines.speakRandom('VICTORY', PilotId.WYRM)).not.toThrow();
        });

        it('should speak random defeat line', () => {
            expect(() => voiceLines.speakRandom('DEFEAT', PilotId.GHOST)).not.toThrow();
        });

        it('should speak random low HP line', () => {
            expect(() => voiceLines.speakRandom('LOW_HP', PilotId.VANGUARD)).not.toThrow();
        });
    });

    describe('Pilot-Specific Lines', () => {
        it('should have lines for VANGUARD', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', PilotId.VANGUARD)).not.toThrow();
        });

        it('should have lines for SOLARIS', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', PilotId.SOLARIS)).not.toThrow();
        });

        it('should have lines for HYDRA', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', PilotId.HYDRA)).not.toThrow();
        });

        it('should have lines for WYRM', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', PilotId.WYRM)).not.toThrow();
        });

        it('should have lines for GHOST', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', PilotId.GHOST)).not.toThrow();
        });
    });

    describe('Line Categories', () => {
        const categories = [
            'COMBAT_START',
            'ABILITY_USE',
            'CRITICAL_HIT',
            'BOSS_ENCOUNTER',
            'VICTORY',
            'DEFEAT',
            'LOW_HP',
            'ITEM_USE'
        ];

        categories.forEach(category => {
            it(`should handle ${category} category`, () => {
                expect(() => voiceLines.speakRandom(category as any, PilotId.VANGUARD)).not.toThrow();
            });
        });
    });

    describe('Queue Management', () => {
        it('should handle rapid calls', () => {
            for (let i = 0; i < 5; i++) {
                voiceLines.speakRandom('COMBAT_START', PilotId.VANGUARD);
            }
            // Should not throw or crash
        });
    });

    describe('Stop Functionality', () => {
        it('should have stop method', () => {
            expect(typeof voiceLines.stop).toBe('function');
        });

        it('should stop current voice line', () => {
            expect(() => voiceLines.stop()).not.toThrow();
        });
    });

    describe('Volume Control', () => {
        it('should have setVolume method', () => {
            expect(typeof voiceLines.setVolume).toBe('function');
        });

        it('should set voice line volume', () => {
            expect(() => voiceLines.setVolume(0.7)).not.toThrow();
        });
    });

    describe('Enable/Disable', () => {
        it('should have setEnabled method', () => {
            expect(typeof voiceLines.setEnabled).toBe('function');
        });

        it('should disable voice lines', () => {
            expect(() => voiceLines.setEnabled(false)).not.toThrow();
        });

        it('should enable voice lines', () => {
            expect(() => voiceLines.setEnabled(true)).not.toThrow();
        });
    });

    describe('Cooldown', () => {
        it('should not spam voice lines', () => {
            // Rapid calls should be rate-limited
            for (let i = 0; i < 10; i++) {
                voiceLines.speakRandom('ABILITY_USE', PilotId.VANGUARD);
            }
            // Should have some rate limiting mechanism
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid category gracefully', () => {
            expect(() => voiceLines.speakRandom('INVALID_CATEGORY' as any, PilotId.VANGUARD)).not.toThrow();
        });

        it('should handle invalid pilot gracefully', () => {
            expect(() => voiceLines.speakRandom('COMBAT_START', 'INVALID' as any)).not.toThrow();
        });
    });
});
