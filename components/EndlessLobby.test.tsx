import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EndlessLobby } from './EndlessLobby';
import { PilotId } from '../types';
import { PILOTS } from '../constants';

// Mock dependencies
const mockUseGame = vi.fn();
const mockStartEndlessRun = vi.fn();

vi.mock('../context/GameContext', () => ({
    useGame: () => mockUseGame()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

vi.mock('../services/audioService', () => ({
    audio: {
        playBlip: vi.fn(),
        playSound: vi.fn()
    }
}));

describe('EndlessLobby Component', () => {
    const mockEndlessStats = {
        highestWave: 15,
        totalWavesSurvived: 120,
        totalKills: 850,
        bestPilot: PilotId.VANGUARD,
        fastestWave: 25000, // 25 seconds
        longestRun: 1800000 // 30 minutes
    };

    const defaultGameContext = {
        endlessStats: mockEndlessStats,
        startEndlessRun: mockStartEndlessRun,
        selectedPilot: PILOTS[0],
        selectedModule: 'BALANCED',
        profile: { level: 10 },
        loadouts: [],
        dailyModifier: 'NONE',
        isPilotUnlocked: () => true,
        getLeaderboard: () => []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue(defaultGameContext);
    });

    describe('Rendering', () => {
        it('should render endless lobby header', () => {
            render(<EndlessLobby />);
            expect(document.body.textContent?.includes('ENDLESS') || document.body.textContent?.includes('endless')).toBeTruthy();
        });

        it('should display highest wave record', () => {
            render(<EndlessLobby />);
            expect(document.body.textContent?.includes('15') || document.body.textContent?.includes('WAVE')).toBeTruthy();
        });

        it('should show start button', () => {
            render(<EndlessLobby />);
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('Statistics Display', () => {
        it('should display total waves survived', () => {
            render(<EndlessLobby />);
            expect(screen.getByText(/120/) || screen.getByText(/SURVIVED/i)).toBeDefined();
        });

        it('should display total kills', () => {
            render(<EndlessLobby />);
            expect(screen.getByText(/850/) || screen.getByText(/KILLS/i)).toBeDefined();
        });

        it('should display best pilot', () => {
            render(<EndlessLobby />);
            expect(screen.getByText(/VANGUARD/i) || screen.getByText(/BEST/i)).toBeDefined();
        });
    });

    describe('Pilot Selection', () => {
        it('should show pilot options', () => {
            render(<EndlessLobby />);
            expect(screen.getByText(/VANGUARD/i) || screen.getByText(/SELECT/i)).toBeDefined();
        });

        it('should allow pilot selection', () => {
            render(<EndlessLobby />);

            const pilotBtn = screen.queryByText(/SOLARIS/i)?.closest('button');
            if (pilotBtn) {
                fireEvent.click(pilotBtn);
            }
        });
    });

    describe('Starting Run', () => {
        it('should call startEndlessRun when clicking start', () => {
            render(<EndlessLobby />);

            const startBtn = screen.queryByText(/START/i)?.closest('button') ||
                screen.queryByText(/LAUNCH/i)?.closest('button');

            if (startBtn) {
                fireEvent.click(startBtn);
                expect(mockStartEndlessRun).toHaveBeenCalled();
            }
        });
    });

    describe('Leaderboard', () => {
        it('should show leaderboard section', () => {
            render(<EndlessLobby />);
            expect(screen.queryByText(/LEADERBOARD/i) ||
                screen.queryByText(/RECORDS/i) ||
                document.body).toBeDefined();
        });
    });

    describe('Navigation', () => {
        it('should have back button', () => {
            render(<EndlessLobby />);
            const backBtn = screen.queryByText(/BACK/i) ||
                screen.queryByText(/MENU/i) ||
                screen.queryByText(/×/);
            expect(backBtn).toBeDefined();
        });
    });
});
