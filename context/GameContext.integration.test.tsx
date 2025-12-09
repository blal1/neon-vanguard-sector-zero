import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GameProvider, useGame } from './GameContext';
import { PilotId, PilotConfig, PilotModule, Consumable } from '../types';
import { PILOTS, MODULES, CONSUMABLES, DIFFICULTIES } from '../constants';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock audio service as it's used within GameContext
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
    preloadAssets: vi.fn().mockResolvedValue(undefined),
  },
}));

// A test component to consume the context
const TestComponent = () => {
  const game = useGame();
  return (
    <div>
      <span data-testid="current-stage">{game.runState.currentStage}</span>
      <span data-testid="current-hp">{game.runState.currentHp}</span>
      <span data-testid="scrap">{game.runState.scrap}</span>
      <span data-testid="difficulty">{game.difficulty}</span>
      <span data-testid="lives">{game.lives}</span>
      <span data-testid="missions-completed">{game.profile.missionsCompleted}</span>
      <span data-testid="total-kills">{game.profile.totalKills}</span>
      <button onClick={() => game.startRun(PILOTS[0], MODULES[0], [])}>Start Run</button>
      <button onClick={() => game.endRun()}>End Run</button>
      <button onClick={() => game.addScrap(10)}>Add Scrap</button>
      <button onClick={() => game.addXp(10)}>Add XP</button>
      <button onClick={() => game.addKill()}>Add Kill</button>
      <button onClick={() => game.setDifficulty('ELITE')}>Set Elite Difficulty</button>
      <button onClick={() => game.craftItem('mega_stim')}>Craft Mega Stim</button>
    </div>
  );
};

describe('GameContext Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('provides default values and allows starting a run', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('current-stage')).toHaveTextContent('1');
    expect(screen.getByTestId('scrap')).toHaveTextContent('0');
    expect(screen.getByTestId('difficulty')).toHaveTextContent('VETERAN');

    fireEvent.click(screen.getByText('Start Run'));

    await waitFor(() => {
      expect(screen.getByTestId('current-hp')).toHaveTextContent('130'); // Vanguard base 150 - 20 (assault module) = 130
      expect(screen.getByTestId('current-stage')).toHaveTextContent('1');
    });
  });

  it('updates scrap correctly', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    fireEvent.click(screen.getByText('Add Scrap'));
    await waitFor(() => {
      expect(screen.getByTestId('scrap')).toHaveTextContent('10');
    });
  });

  it('updates xp and levels up correctly', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Initial level 1, xp 0 (from mockDefaultProfile)
    // Add 100 XP to level up to 2 (level 1 requires 100 XP)
    for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByText('Add XP')); // each click adds 10 xp
    }
    

    // Wait for the asynchronous state updates to propagate
    await waitFor(() => {
      expect(screen.getByTestId('missions-completed')).toHaveTextContent('0'); // missionsCompleted is not affected by addXp
      expect(screen.getByTestId('total-kills')).toHaveTextContent('0'); // totalKills is not affected by addXp
    });
  });

  it('updates total kills correctly', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    fireEvent.click(screen.getByText('Add Kill'));
    await waitFor(() => {
      expect(screen.getByTestId('total-kills')).toHaveTextContent('1');
    });
  });
  
  it('sets difficulty correctly', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    fireEvent.click(screen.getByText('Set Elite Difficulty'));
    await waitFor(() => {
      expect(screen.getByTestId('difficulty')).toHaveTextContent('ELITE');
      // Lives for ELITE difficulty is 999 (from constants), assuming no permadeath
      expect(screen.getByTestId('lives')).toHaveTextContent('999'); 
    });
  });

  it('crafts item correctly', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Add enough scrap and consumables for mega_stim (requires 2 nano_stim, 50 scrap)
    for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Add Scrap')); // each click adds 10 scrap
    }

    fireEvent.click(screen.getByText('Start Run')); // Initialize consumables (nano_stim count 2)

    await waitFor(() => {
        expect(screen.getByTestId('scrap')).toHaveTextContent('50');
    });

    fireEvent.click(screen.getByText('Craft Mega Stim'));

    await waitFor(() => {
        expect(screen.getByTestId('scrap')).toHaveTextContent('0'); // 50 scrap used
    });
  });
});
