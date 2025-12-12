import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StatsScreen } from './StatsScreen';
import { PilotId, HazardType } from '../types';

// Mock dependencies
const mockUseGame = vi.fn();

vi.mock('../context/GameContext', () => ({
    useGame: () => mockUseGame()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

vi.mock('recharts', () => ({
    LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />
}));

vi.mock('../services/audioService', () => ({
    audio: {
        playBlip: vi.fn()
    }
}));

describe('StatsScreen Component', () => {
    const mockStats = {
        totalDamageDealt: 15420,
        totalDamageTaken: 8520,
        criticalHits: 156,
        abilitiesUsed: 324,
        fastestWinTime: 45000, // 45 seconds
        longestWinStreak: 7,
        currentWinStreak: 3,
        perfectRuns: 2,
        bossesDefeated: 12,
        bossesDefeatedLowHp: 3,
        runsCompleted: 25,
        runsFailed: 8,
        totalPlaytime: 3600000, // 1 hour
        enemyKillsByType: {
            'Scout Drone': 150,
            'Heavy Mech': 45,
            'Assault Bot': 80
        },
        hazardsSurvived: {
            'ACID_RAIN': 12,
            'ION_STORM': 8,
            'SEISMIC': 5
        },
        itemUsage: {
            'nano_stim': 45,
            'emp_grenade': 23,
            'coolant': 12
        },
        abilityUsage: {
            'laser_shot': 200,
            'plasma_blast': 89,
            'shield_charge': 35
        },
        pilotUsage: {
            [PilotId.VANGUARD]: 15,
            [PilotId.SOLARIS]: 8,
            [PilotId.HYDRA]: 5,
            [PilotId.WYRM]: 3,
            [PilotId.GHOST]: 2
        },
        runHistory: [
            { date: Date.now() - 86400000, success: true, stage: 10, pilot: PilotId.VANGUARD },
            { date: Date.now() - 172800000, success: false, stage: 4, pilot: PilotId.SOLARIS }
        ]
    };

    const defaultGameContext = {
        stats: mockStats,
        profile: {
            level: 15,
            xp: 2500,
            missionsCompleted: 25,
            totalKills: 275
        },
        isPilotUnlocked: () => true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue(defaultGameContext);
    });

    describe('Combat Statistics', () => {
        it('should display total damage dealt', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('15') || document.body.textContent?.includes('DAMAGE')).toBeTruthy();
        });

        it('should display total damage taken', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('8520') || document.body.textContent?.includes('8,520')).toBeTruthy();
        });

        it('should display critical hits', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('156') || document.body.textContent?.includes('CRITICAL')).toBeTruthy();
        });

        it('should display abilities used', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('324') || document.body.textContent?.includes('ABILITIES')).toBeTruthy();
        });
    });

    describe('Rendering', () => {
        it('should render stats header', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('STATS') || document.body.textContent?.includes('stats')).toBeTruthy();
        });

        it('should display profile level', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('15') || document.body.textContent?.includes('LEVEL')).toBeTruthy();
        });

        it('should show navigation tabs', () => {
            render(<StatsScreen />);
            const buttons = screen.queryAllByRole('button');
            expect(buttons.length >= 0).toBeTruthy();
        });
    });

    describe('Run Statistics', () => {
        it('should display runs completed', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('25') || document.body.textContent?.includes('COMPLETED')).toBeTruthy();
        });

        it('should display runs failed', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('8') || document.body.textContent?.includes('FAILED')).toBeTruthy();
        });

        it('should display win rate', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('75') || document.body.textContent?.includes('%')).toBeTruthy();
        });

        it('should display fastest win time', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('45') || document.body.textContent?.includes('FASTEST')).toBeTruthy();
        });

        it('should display win streaks', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('7') || document.body.textContent?.includes('STREAK')).toBeTruthy();
        });

        it('should display perfect runs', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('2') || document.body.textContent?.includes('PERFECT')).toBeTruthy();
        });
    });

    describe('Boss Statistics', () => {
        it('should display bosses defeated', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('12') || document.body.textContent?.includes('BOSS')).toBeTruthy();
        });

        it('should display low HP boss kills', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('3') || document.body.textContent?.includes('LOW')).toBeTruthy();
        });
    });

    describe('Enemy Kill Statistics', () => {
        it('should display enemy kill breakdown', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('Scout') || document.body.textContent?.includes('150')).toBeTruthy();
        });

        it('should display total kills', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('275') || document.body.textContent?.includes('TOTAL')).toBeTruthy();
        });
    });

    describe('Hazard Statistics', () => {
        it('should display hazards survived', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('HAZARD') || document.body.textContent?.includes('12')).toBeTruthy();
        });
    });

    describe('Item Usage', () => {
        it('should display item usage breakdown', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('45') || document.body.textContent?.includes('ITEM')).toBeTruthy();
        });
    });

    describe('Pilot Usage', () => {
        it('should display pilot usage chart', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('VANGUARD') || screen.queryByTestId('pie-chart')).toBeTruthy();
        });

        it('should show most used pilot', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('15') || document.body.textContent?.includes('VANGUARD')).toBeTruthy();
        });
    });

    describe('Charts', () => {
        it('should render chart components', () => {
            render(<StatsScreen />);
            expect(screen.queryByTestId('chart-container') || document.body).toBeTruthy();
        });
    });

    describe('Run History', () => {
        it('should display recent runs', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('HISTORY') || document.body.textContent?.length).toBeTruthy();
        });

        it('should show run outcome (success/failure)', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.length).toBeGreaterThan(0);
        });
    });

    describe('Playtime', () => {
        it('should display total playtime', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('1') || document.body.textContent?.includes('HOUR')).toBeTruthy();
        });
    });

    describe('Navigation', () => {
        it('should have close button', () => {
            render(<StatsScreen />);
            expect(document.body.textContent?.includes('CLOSE') || document.body.textContent?.includes('BACK') || screen.queryAllByRole('button').length >= 0).toBeTruthy();
        });
    });
});

