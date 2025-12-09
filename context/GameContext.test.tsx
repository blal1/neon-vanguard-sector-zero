import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/state/store';
import { defaultProfile, defaultSettings } from '../src/types'; // Assuming these are exported from types.ts or constants.ts

// Mock defaultProfile and defaultSettings if they are not directly exported
const mockDefaultProfile = {
    xp: 0,
    level: 1,
    missionsCompleted: 0,
    totalKills: 0
};

const mockDefaultSettings = {
    reduceMotion: false,
    slowLogs: false,
    volume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    isMuted: false,
    voiceLinesEnabled: true,
    showDamageNumbers: true,
    screenShake: true,
    combatSpeed: 'normal',
    tutorialCompleted: false
};

describe('GameStore (Zustand)', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useGameStore.setState({
      profile: mockDefaultProfile,
      settings: mockDefaultSettings,
    }); // Do not replace the state, just merge it
  });

  it('should initialize with default profile and settings', () => {
    const { profile, settings } = useGameStore.getState();
    expect(profile).toEqual(mockDefaultProfile);
    expect(settings).toEqual(mockDefaultSettings);
  });

  it('should add XP and level up correctly', () => {
    const { addXp } = useGameStore.getState();
    
    // Add XP, should not level up yet
    addXp(50);
    let { profile } = useGameStore.getState();
    expect(profile.xp).toBe(50);
    expect(profile.level).toBe(1);

    // Add more XP, should level up
    addXp(70); // 50 + 70 = 120. Level 1 requires 100 XP to level up.
    profile = useGameStore.getState().profile;
    expect(profile.xp).toBe(20); // 120 - 100 = 20 remaining XP
    expect(profile.level).toBe(2);
  });

  it('should add kills correctly', () => {
    const { addKill } = useGameStore.getState();
    addKill();
    const { profile } = useGameStore.getState();
    expect(profile.totalKills).toBe(1);
    addKill();
    expect(useGameStore.getState().profile.totalKills).toBe(2);
  });

  it('should toggle a setting correctly', () => {
    const { toggleSetting } = useGameStore.getState();
    let { settings } = useGameStore.getState();
    expect(settings.reduceMotion).toBe(false);

    toggleSetting('reduceMotion');
    settings = useGameStore.getState().settings;
    expect(settings.reduceMotion).toBe(true);

    toggleSetting('reduceMotion');
    settings = useGameStore.getState().settings;
    expect(settings.reduceMotion).toBe(false);
  });

  it('should update multiple settings correctly', () => {
    const { updateSettings } = useGameStore.getState();
    updateSettings({ volume: 0.5, combatSpeed: 'fast' });
    const { settings } = useGameStore.getState();
    expect(settings.volume).toBe(0.5);
    expect(settings.combatSpeed).toBe('fast');
    expect(settings.reduceMotion).toBe(false); // Other settings should be unchanged
  });

  it('should set profile directly', () => {
    const { setProfile } = useGameStore.getState();
    const newProfile = { ...mockDefaultProfile, level: 5, xp: 25 };
    setProfile(newProfile);
    expect(useGameStore.getState().profile).toEqual(newProfile);
  });

  it('should set settings directly', () => {
    const { setSettings } = useGameStore.getState();
    const newSettings = { ...mockDefaultSettings, isMuted: true, volume: 0 };
    setSettings(newSettings);
    expect(useGameStore.getState().settings).toEqual(newSettings);
  });
});