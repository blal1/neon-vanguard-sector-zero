import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterSelect } from './CharacterSelect';
import { PILOTS } from '../constants';
import { useGame } from '../context/GameContext';

// Mock the useGame hook
vi.mock('../context/GameContext', () => ({
  useGame: vi.fn(),
}));

const mockOnSelect = vi.fn();
const mockOnRunTests = vi.fn();

const defaultMockContext = {
  profile: { level: 5, xp: 50, totalKills: 100, missionsCompleted: 10 },
  settings: { reduceMotion: false, slowLogs: false },
  isPilotUnlocked: (pilot) => pilot.unlockLevel ? 5 >= pilot.unlockLevel : true,
  applyLoadout: vi.fn(),
  difficulty: 'VETERAN',
  dailyModifier: 'NONE',
  toggleSetting: vi.fn(),
  runState: {
    isActive: false,
    currentStage: 1,
    scrap: 0,
    currentHp: 0,
    maxHpUpgrade: 0,
    damageUpgrade: 0,
    consumables: [],
    augmentations: [],
  },
  hasActiveRun: false,
  stats: {},
  achievements: [],
  loadouts: [],
  addXp: vi.fn(),
  addKill: vi.fn(),
  addScrap: vi.fn(),
  startRun: vi.fn(),
  endRun: vi.fn(),
  updateRunHp: vi.fn(),
  updateRunConsumables: vi.fn(),
  updateRunState: vi.fn(),
  purchaseUpgrade: vi.fn(),
  purchaseAugmentation: vi.fn(),
  checkAchievements: vi.fn(),
  recordStat: vi.fn(),
  incrementStat: vi.fn(),
  startRunTimer: vi.fn(),
  endRunTimer: vi.fn(),
  recordDamageDealt: vi.fn(),
  recordDamageTaken: vi.fn(),
  recordCriticalHit: vi.fn(),
  recordRunOutcome: vi.fn(),
  recordPilotUsage: vi.fn(),
  recordEnemyKill: vi.fn(),
  recordHazardSurvival: vi.fn(),
  recordItemUsage: vi.fn(),
  createLoadout: vi.fn(),
  updateLoadout: vi.fn(),
  deleteLoadout: vi.fn(),
  lives: 999,
  setDifficulty: vi.fn(),
  getDailyModifier: () => 'NONE',
  loseLife: vi.fn(),
  craftedItems: [],
  craftItem: vi.fn(),
  canCraft: vi.fn(),
  endlessState: {},
  leaderboard: [],
  startEndlessRun: vi.fn(),
  endEndlessRun: vi.fn(),
  advanceEndlessWave: vi.fn(),
  applyEndlessUpgrade: vi.fn(),
  getLeaderboard: vi.fn(),
  calculateEndlessScore: vi.fn(),
  updateEndlessState: vi.fn(),
  codex: {},
  unlockCodexPilot: vi.fn(),
  unlockCodexLore: vi.fn(),
  unlockCodexAudioLog: vi.fn(),
  recordCodexEnemyKill: vi.fn(),
  markCodexEntryRead: vi.fn(),
  getCodexProgress: vi.fn(),
  replayState: {},
  saveReplay: vi.fn(),
  deleteReplay: vi.fn(),
  clearAllReplays: vi.fn(),
  getReplayById: vi.fn(),
  talentState: {},
  unlockTalent: vi.fn(),
  resetTalents: vi.fn(),
};

describe('CharacterSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useGame as any).mockReturnValue(defaultMockContext);
  });

  it('renders the list of pilots', () => {
    render(<CharacterSelect onSelect={mockOnSelect} onRunTests={mockOnRunTests} />);

    PILOTS.forEach(pilot => {
      expect(screen.getByText(pilot.name)).toBeInTheDocument();
    });
  });

  it('displays the details of the initially selected pilot', () => {
    render(<CharacterSelect onSelect={mockOnSelect} onRunTests={mockOnRunTests} />);
    expect(screen.getByText(PILOTS[0].mechName)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(PILOTS[0].flavor))).toBeInTheDocument();
  });

  it('switches to a different pilot on click', () => {
    render(<CharacterSelect onSelect={mockOnSelect} onRunTests={mockOnRunTests} />);
    const solarisButton = screen.getByText(PILOTS[1].name);
    fireEvent.click(solarisButton);

    expect(screen.getByText(PILOTS[1].mechName)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(PILOTS[1].flavor))).toBeInTheDocument();
  });

  it('disables the launch button for a locked pilot', () => {
    (useGame as any).mockReturnValue({
      ...defaultMockContext,
      isPilotUnlocked: () => false,
    });
    render(<CharacterSelect onSelect={mockOnSelect} onRunTests={mockOnRunTests} />);

    const lockedPilot = PILOTS.find(p => p.unlockLevel && p.unlockLevel > 1);
    if (lockedPilot) {
      fireEvent.click(screen.getByText(lockedPilot.name));
      const launchButton = screen.getAllByText(/characterSelect\.locked/)[0];
      expect(launchButton).toBeInTheDocument();
    }
  });

  it('calls onSelect with correct data when launch is clicked', () => {
    render(<CharacterSelect onSelect={mockOnSelect} onRunTests={mockOnRunTests} />);

    // Select Vanguard
    fireEvent.click(screen.getByText('Cpt. Iron Jackson'));

    // Select module
    fireEvent.click(screen.getByText('DEFENSE'));

    // Select consumables
    fireEvent.click(screen.getByText('NANO-STIM'));
    fireEvent.click(screen.getByText('L-COOLANT'));

    // Click launch - use regex to match i18n key or translated text
    const launchBtn = screen.getByRole('button', { name: /initialize|neural|launch|enter/i }) ||
      screen.getByText(/characterSelect\.launch/i);
    fireEvent.click(launchBtn);

    expect(mockOnSelect).toHaveBeenCalledOnce();
    const selectedPilot = PILOTS.find(p => p.name === 'Cpt. Iron Jackson');
    const selectedConsumables = expect.arrayContaining([
      expect.objectContaining({ id: 'nano_stim' }),
      expect.objectContaining({ id: 'coolant' }),
    ]);
    expect(mockOnSelect).toHaveBeenCalledWith(selectedPilot, 'DEFENSE', selectedConsumables);
  });
});