// This file is used to set up the test environment for vitest.
import '@testing-library/jest-dom';
import React from 'react';
import { initializeDataManager } from '../../data/dataManager';
import { beforeAll, vi } from 'vitest';

// ============================================
// Mock react-i18next BEFORE any imports use it
// ============================================
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: any }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  I18nextProvider: ({ children }: { children: any }) => children,
}));

// ============================================
// Mock audio service globally (with multiple path variations)
// ============================================
const audioServiceMock = {
  audio: {
    playBlip: vi.fn(),
    playAlarm: vi.fn(),
    playSound: vi.fn(),
    playStageMusic: vi.fn(),
    playBossMusic: vi.fn(),
    stopMusic: vi.fn(),
    playAmbientDrone: vi.fn(),
    stopAmbientDrone: vi.fn(),
    playHit: vi.fn(),
    playMiss: vi.fn(),
    playCritical: vi.fn(),
    playSelect: vi.fn(),
    playConfirm: vi.fn(),
    playAchievement: vi.fn(),
    playUnlock: vi.fn(),
    playHover: vi.fn(),
    playError: vi.fn(),
    playBossIntro: vi.fn(),
    setMasterVolume: vi.fn(),
    setMusicVolume: vi.fn(),
    setSfxVolume: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    isMuted: false,
  },
};

vi.mock('@/services/audioService', () => audioServiceMock);
vi.mock('services/audioService', () => audioServiceMock);

// ============================================
// Mock TTS service  
// ============================================
const ttsObject = {
  speak: vi.fn(),
  stop: vi.fn(),
  getVoices: vi.fn(() => []),
  setVoice: vi.fn(),
  setRate: vi.fn(),
  setPitch: vi.fn(),
  setVolume: vi.fn(),
  isSpeaking: vi.fn(() => false),
  announceToScreenReader: vi.fn(),
};

const ttsServiceMock = {
  ttsService: ttsObject,
  tts: ttsObject, // Alias for components that import { tts }
};

vi.mock('@/services/ttsService', () => ttsServiceMock);
vi.mock('services/ttsService', () => ttsServiceMock);

// ============================================
// Mock Web Audio API
// ============================================
class MockAudioContext {
  createOscillator() { return { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { setValueAtTime: vi.fn() }, type: '' }; }
  createGain() { return { connect: vi.fn(), gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), value: 1 } }; }
  createBiquadFilter() { return { connect: vi.fn(), frequency: { setValueAtTime: vi.fn() }, Q: { setValueAtTime: vi.fn() }, type: '' }; }
  get destination() { return {}; }
  get currentTime() { return 0; }
  decodeAudioData() { return Promise.resolve({ duration: 1 }); }
  resume() { return Promise.resolve(); }
}

// @ts-ignore
global.AudioContext = MockAudioContext;
// @ts-ignore
global.webkitAudioContext = MockAudioContext;

// ============================================
// Mock SpeechSynthesis
// ============================================
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onvoiceschanged: null,
  pending: false,
  speaking: false,
  paused: false
};

// @ts-ignore
global.speechSynthesis = mockSpeechSynthesis;
// @ts-ignore
global.SpeechSynthesisUtterance = class {
  text = '';
  voice = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onend = null;
  onerror = null;
};

// ============================================
// Mock HTMLMediaElement
// ============================================
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: vi.fn().mockResolvedValue(undefined)
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  writable: true,
  value: vi.fn()
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  writable: true,
  value: vi.fn()
});

// ============================================
// Mock localStorage with working implementation
// ============================================
const localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageData[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageData[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }),
  length: 0,
  key: vi.fn(() => null)
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// ============================================
// Mock matchMedia
// ============================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// ============================================
// Initialize data manager before all tests
// ============================================
beforeAll(async () => {
  await initializeDataManager();
});

