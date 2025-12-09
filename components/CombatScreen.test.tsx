import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameContext } from '../context/GameContext';
import { CombatScreen } from './CombatScreen';
import { PilotConfig, PilotId, PilotModule, RunState } from '../types';
import { PILOTS, MODULES } from '../constants';

window.HTMLDivElement.prototype.scrollIntoView = vi.fn();


vi.mock('../services/audioService', () => ({
  audio: {
    playStageMusic: vi.fn(),
    playVictoryMusic: vi.fn(),
    playDefeatMusic: vi.fn(),
    stopMusic: vi.fn(),
    updateDroneIntensity: vi.fn(),
    playBlip: vi.fn(),
    playHover: vi.fn(),
    playShoot: vi.fn(),
    playEnemyHit: vi.fn(),
    playAlarm: vi.fn(),
    playHazardWarning: vi.fn(),
    startAmbientDrone: vi.fn(),
    stopAmbientDrone: vi.fn(),
  },
}));

const mockGameContext = {
  runState: {
    currentStage: 1,
    currentHp: 100,
    consumables: [],
    maxHpUpgrade: 0,
    damageUpgrade: 0,
    augmentations: [],
  } as RunState,
  settings: {
    voiceLinesEnabled: false,
    reduceMotion: false,
    showDamageNumbers: true,
    slowLogs: false,
  },
  difficulty: 'VETERAN',
  dailyModifier: 'NONE',
  addXp: vi.fn(),
  addKill: vi.fn(),
  addScrap: vi.fn(),
  updateRunHp: vi.fn(),
  updateRunConsumables: vi.fn(),
  recordDamageDealt: vi.fn(),
  recordEnemyKill: vi.fn(),
  recordHazardSurvival: vi.fn(),
  recordItemUsage: vi.fn(),
  recordCodexEnemyKill: vi.fn(),
  saveReplay: vi.fn(),
      updateRunState: vi.fn(),
      getDailyModifier: () => 'NONE',
      talentState: {
          vanguard: { unlockedTalents: [], totalPointsSpent: 0 },
          solaris: { unlockedTalents: [], totalPointsSpent: 0 },
          hydra: { unlockedTalents: [], totalPointsSpent: 0 },
          wyrm: { unlockedTalents: [], totalPointsSpent: 0 },
          availablePoints: 0,
          totalPointsEarned: 0
      },};

const vanguardPilot = PILOTS.find(p => p.id === PilotId.VANGUARD) as PilotConfig;

describe('CombatScreen', () => {
  it('renders without crashing', () => {
    render(
      <GameContext.Provider value={mockGameContext as any}>
        <CombatScreen
          pilot={vanguardPilot}
          module={MODULES[0]}
          onVictory={vi.fn()}
          onDefeat={vi.fn()}
        />
      </GameContext.Provider>
    );

    expect(screen.getByText('IRON VANGUARD')).toBeInTheDocument();
    expect(screen.getByText('ENVIRONMENT STABLE')).toBeInTheDocument();
  });
});