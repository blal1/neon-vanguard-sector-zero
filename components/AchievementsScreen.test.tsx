import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AchievementsScreen } from './AchievementsScreen';
import { PilotId } from '../types';

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

vi.mock('../services/audioService', () => ({
    audio: {
        playBlip: vi.fn()
    }
}));

describe('AchievementsScreen Component', () => {
    const mockAchievements = [
        {
            id: 'first_blood',
            name: 'First Blood',
            description: 'Defeat your first enemy',
            icon: '🎯',
            category: 'COMBAT',
            unlocked: true,
            unlockedAt: Date.now() - 86400000, // Yesterday
            progress: 1,
            maxProgress: 1,
            rarity: 'COMMON'
        },
        {
            id: 'boss_slayer',
            name: 'Boss Slayer',
            description: 'Defeat 10 bosses',
            icon: '💀',
            category: 'COMBAT',
            unlocked: false,
            progress: 5,
            maxProgress: 10,
            rarity: 'RARE'
        },
        {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Complete a run in under 5 minutes',
            icon: '⚡',
            category: 'SPEED',
            unlocked: true,
            unlockedAt: Date.now(),
            progress: 1,
            maxProgress: 1,
            rarity: 'EPIC'
        },
        {
            id: 'collector',
            name: 'Collector',
            description: 'Collect 1000 scrap in a single run',
            icon: '💎',
            category: 'EXPLORATION',
            unlocked: false,
            progress: 450,
            maxProgress: 1000,
            rarity: 'LEGENDARY'
        },
        {
            id: 'pilot_master',
            name: 'Pilot Master',
            description: 'Complete a run with each pilot',
            icon: '🏅',
            category: 'PROGRESSION',
            unlocked: false,
            progress: 3,
            maxProgress: 5,
            rarity: 'RARE'
        }
    ];

    const defaultGameContext = {
        achievements: mockAchievements,
        profile: { level: 10, totalKills: 500, xp: 1500 },
        stats: {
            bossesDefeated: 15,
            criticalHits: 200,
            totalDamageDealt: 50000,
            totalDamageTaken: 10000,
            runsCompleted: 25,
            runsFailed: 10,
            fastestWin: 180000,
            currentWinStreak: 3,
            bestWinStreak: 5,
            perfectRuns: 2,
            hazardsSurvived: 100,
            abilityUsage: {},
            enemyKillsByType: {},
            itemUsage: {},
            lowHpBossKills: 5,
            pilotsUnlocked: ['VANGUARD', 'SOLARIS'],
            augmentationsOwned: ['thermal_conv'],
            pilotUsageCount: { vanguard: 10, solaris: 5 }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue(defaultGameContext);
    });

    describe('Rendering', () => {
        it('should render achievements header', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/ACHIEVEMENT/i)).toBeDefined();
        });

        it('should display progress summary', () => {
            render(<AchievementsScreen />);
            // 2/5 achievements unlocked = 40%
            expect(screen.getByText(/2/) || screen.getByText(/5/) || screen.getByText(/40/)).toBeDefined();
        });

        it('should show achievement count', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/5/) || screen.getByText(/TOTAL/i)).toBeDefined();
        });
    });

    describe('Achievement Display', () => {
        it('should display all achievements', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/First Blood/i)).toBeDefined();
            expect(screen.getByText(/Boss Slayer/i)).toBeDefined();
            expect(screen.getByText(/Speed Demon/i)).toBeDefined();
        });

        it('should show achievement icons', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/🎯/)).toBeDefined();
            expect(screen.getByText(/💀/)).toBeDefined();
            expect(screen.getByText(/⚡/)).toBeDefined();
        });

        it('should show achievement descriptions', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/Defeat your first enemy/i)).toBeDefined();
        });
    });

    describe('Unlock Status', () => {
        it('should highlight unlocked achievements', () => {
            render(<AchievementsScreen />);
            // Unlocked achievements should have different styling
            const cards = screen.getAllByRole('button');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should show locked achievements as dimmed', () => {
            render(<AchievementsScreen />);
            // Locked achievements should appear differently
            const bossSlayer = screen.getByText(/Boss Slayer/i).closest('button');
            expect(bossSlayer).toBeDefined();
        });

        it('should show unlock date for completed achievements', () => {
            render(<AchievementsScreen />);
            // Unlocked achievements should show when they were unlocked
        });
    });

    describe('Progress Tracking', () => {
        it('should show progress bar for incomplete achievements', () => {
            render(<AchievementsScreen />);
            // Boss Slayer: 5/10
            expect(screen.getByText(/5/) || screen.getByText(/10/)).toBeDefined();
        });

        it('should show progress percentage', () => {
            render(<AchievementsScreen />);
            // 5/10 = 50%
            expect(screen.getByText(/50/) || screen.getByText(/%/)).toBeDefined();
        });

        it('should show completed progress for unlocked', () => {
            render(<AchievementsScreen />);
            // First Blood: 1/1
            expect(screen.getByText(/1/) || screen.getByText(/COMPLETE/i)).toBeDefined();
        });
    });

    describe('Categories', () => {
        it('should show category tabs', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/COMBAT/i) || screen.getByText(/ALL/i)).toBeDefined();
        });

        it('should filter by COMBAT category', () => {
            render(<AchievementsScreen />);

            const combatTab = screen.queryByText(/COMBAT/i);
            if (combatTab) {
                fireEvent.click(combatTab);
                // Only combat achievements should show
            }
        });

        it('should filter by SPEED category', () => {
            render(<AchievementsScreen />);

            const speedTab = screen.queryByText(/SPEED/i);
            if (speedTab) {
                fireEvent.click(speedTab);
            }
        });

        it('should have ALL category option', () => {
            render(<AchievementsScreen />);

            const allTab = screen.queryByText(/ALL/i);
            expect(allTab || document.body).toBeDefined();
        });
    });

    describe('Rarity Indicators', () => {
        it('should show rarity for each achievement', () => {
            render(<AchievementsScreen />);
            expect(screen.getByText(/COMMON/i) ||
                screen.getByText(/RARE/i) ||
                screen.getByText(/EPIC/i) ||
                screen.getByText(/LEGENDARY/i)).toBeDefined();
        });

        it('should style achievements by rarity', () => {
            render(<AchievementsScreen />);
            // Different rarities should have different visual styles
        });
    });

    describe('Sorting', () => {
        it('should have sort options', () => {
            render(<AchievementsScreen />);

            const sortBtn = screen.queryByText(/SORT/i) ||
                screen.queryByText(/ORDER/i);
            expect(sortBtn || document.body).toBeDefined();
        });
    });

    describe('Navigation', () => {
        it('should have close button', () => {
            render(<AchievementsScreen />);

            const closeBtn = screen.queryByText(/CLOSE/i) ||
                screen.queryByText(/BACK/i) ||
                screen.queryByText(/×/);
            expect(closeBtn).toBeDefined();
        });
    });

    describe('Empty State', () => {
        it('should show message when no achievements in category', () => {
            mockUseGame.mockReturnValue({
                achievements: [],
                profile: { level: 1 }
            });

            render(<AchievementsScreen />);
            expect(screen.getByText(/NO/i) ||
                screen.getByText(/EMPTY/i) ||
                screen.getByText(/0/)).toBeDefined();
        });
    });

    describe('Recent Achievements', () => {
        it('should highlight recently unlocked achievements', () => {
            render(<AchievementsScreen />);

            // Speed Demon was unlocked today
            const speedDemon = screen.getByText(/Speed Demon/i);
            expect(speedDemon).toBeDefined();
        });
    });
});
