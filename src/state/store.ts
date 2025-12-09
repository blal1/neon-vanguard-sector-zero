import { create } from 'zustand';
import { PlayerProfile, GameSettings } from '../../types';

interface GameState {
  profile: PlayerProfile;
  settings: GameSettings;
  addXp: (amount: number) => void;
  addKill: () => void;
  toggleSetting: (setting: keyof GameSettings) => void;
  updateSettings: (updates: Partial<GameSettings>) => void;
  setProfile: (profile: PlayerProfile) => void;
  setSettings: (settings: GameSettings) => void;
}

const defaultProfile: PlayerProfile = {
  xp: 0,
  level: 1,
  missionsCompleted: 0,
  totalKills: 0,
};

const defaultSettings: GameSettings = {
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
  tutorialCompleted: false,
};

export const useGameStore = create<GameState>((set) => ({
  profile: defaultProfile,
  settings: defaultSettings,

  addXp: (amount: number) =>
    set((state) => {
      const newXp = state.profile.xp + amount;
      const xpReq = state.profile.level * 100;
      let newLevel = state.profile.level;
      let finalXp = newXp;

      if (finalXp >= xpReq) {
        finalXp -= xpReq;
        newLevel += 1;
      }

      return {
        profile: {
          ...state.profile,
          xp: finalXp,
          level: newLevel,
        },
      };
    }),

  addKill: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        totalKills: (state.profile.totalKills || 0) + 1,
      },
    })),

  toggleSetting: (setting: keyof GameSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [setting]: !state.settings[setting],
      },
    })),

  updateSettings: (updates: Partial<GameSettings>) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...updates,
      },
    })),

  setProfile: (profile: PlayerProfile) => set({ profile }),
  setSettings: (settings: GameSettings) => set({ settings }),
}));
