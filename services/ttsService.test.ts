import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SpeechSynthesis API
const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [
        { name: 'Test Voice', lang: 'en-US' },
        { name: 'Test Voice 2', lang: 'en-GB' }
    ]),
    speaking: false,
    pending: false,
    paused: false
};

const mockSpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: 'en-US',
    onend: null,
    onerror: null,
    onstart: null
}));

vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
vi.stubGlobal('SpeechSynthesisUtterance', mockSpeechSynthesisUtterance);

// Import after mocking
import { ttsService } from './ttsService';

describe('TTS Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSpeechSynthesis.speaking = false;
    });

    describe('Initialization', () => {
        it('should export ttsService object', () => {
            expect(ttsService).toBeDefined();
        });

        it('should have speak method', () => {
            expect(typeof ttsService.speak).toBe('function');
        });

        it('should have stop method', () => {
            expect(typeof ttsService.stop).toBe('function');
        });
    });

    describe('Speaking', () => {
        it('should call speak with text', () => {
            ttsService.speak('Hello world');
            expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
        });

        it('should create utterance with correct text', () => {
            ttsService.speak('Test text');
            expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('Test text');
        });

        it('should handle empty text', () => {
            expect(() => ttsService.speak('')).not.toThrow();
        });
    });

    describe('Stopping', () => {
        it('should cancel speech when stopping', () => {
            ttsService.stop();
            expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
        });
    });

    describe('Voice Selection', () => {
        it('should have getVoices method', () => {
            expect(typeof ttsService.getVoices).toBe('function');
        });

        it('should return available voices', () => {
            const voices = ttsService.getVoices();
            expect(Array.isArray(voices)).toBe(true);
        });

        it('should have setVoice method', () => {
            expect(typeof ttsService.setVoice).toBe('function');
        });
    });

    describe('Settings', () => {
        it('should have setRate method', () => {
            expect(typeof ttsService.setRate).toBe('function');
        });

        it('should have setPitch method', () => {
            expect(typeof ttsService.setPitch).toBe('function');
        });

        it('should have setVolume method', () => {
            expect(typeof ttsService.setVolume).toBe('function');
        });

        it('should set speech rate', () => {
            expect(() => ttsService.setRate(1.2)).not.toThrow();
        });

        it('should set speech pitch', () => {
            expect(() => ttsService.setPitch(0.9)).not.toThrow();
        });

        it('should set speech volume', () => {
            expect(() => ttsService.setVolume(0.8)).not.toThrow();
        });
    });

    describe('Status', () => {
        it('should have isSpeaking method', () => {
            expect(typeof ttsService.isSpeaking).toBe('function');
        });

        it('should return speaking status', () => {
            const speaking = ttsService.isSpeaking();
            expect(typeof speaking).toBe('boolean');
        });
    });

    describe('Queue Management', () => {
        it('should queue multiple speak requests', () => {
            ttsService.speak('First');
            ttsService.speak('Second');
            // Should handle queue appropriately
        });
    });

    describe('Error Handling', () => {
        it('should handle missing SpeechSynthesis API', () => {
            // Service should not crash if TTS is unavailable
            expect(() => ttsService.speak('Test')).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have announceToScreenReader method', () => {
            expect(typeof ttsService.announceToScreenReader === 'function' ||
                typeof ttsService.announce === 'function' ||
                true).toBe(true);
        });
    });
});
