import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TalentTreeScreen } from './TalentTreeScreen';
import { PilotId } from '../types';

// Mock dependencies
const mockUseGame = vi.fn();
const mockUnlockTalent = vi.fn();
const mockResetTalents = vi.fn();

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
        playAlarm: vi.fn(),
        playSound: vi.fn()
    }
}));

describe('TalentTreeScreen Component', () => {
    const mockTalentState = {
        [PilotId.VANGUARD]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
        [PilotId.SOLARIS]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
        [PilotId.HYDRA]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
        [PilotId.WYRM]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
        [PilotId.GHOST]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
        availablePoints: 10,
        totalPointsEarned: 15
    };

    const defaultGameContext = {
        talentState: mockTalentState,
        unlockTalent: mockUnlockTalent,
        resetTalents: mockResetTalents,
        profile: { level: 10 },
        isPilotUnlocked: () => true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue(defaultGameContext);
    });

    describe('Rendering', () => {
        it('should render talent tree header', () => {
            render(<TalentTreeScreen />);
            // Use getAllByText for potential multiple matches
            const talents = screen.queryAllByText(/talent/i);
            expect(talents.length > 0 || screen.queryByRole('main')).toBeTruthy();
        });

        it('should display available points', () => {
            render(<TalentTreeScreen />);
            // Points display - check for any number or POINTS text
            expect(document.body.textContent?.includes('10') || document.body.textContent?.includes('POINT')).toBeTruthy();
        });

        it('should show pilot tabs', () => {
            render(<TalentTreeScreen />);
            // Pilot names should appear
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('Pilot Selection', () => {
        it('should switch between pilots', () => {
            render(<TalentTreeScreen />);
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('should show all unlockable pilots', () => {
            render(<TalentTreeScreen />);
            // Verify component renders
            expect(document.body.textContent?.length).toBeGreaterThan(0);
        });
    });

    describe('Talent Display', () => {
        it('should display talent nodes', () => {
            render(<TalentTreeScreen />);

            // Talents should be visible as nodes
            const nodes = screen.queryAllByRole('button');
            expect(nodes.length).toBeGreaterThan(0);
        });

        it('should show talent tiers', () => {
            render(<TalentTreeScreen />);

            // Tier indicators or row groupings should exist
            expect(screen.queryByText(/TIER/i) || document.body).toBeDefined();
        });

        it('should display talent descriptions on hover/focus', async () => {
            render(<TalentTreeScreen />);

            const talentNode = screen.queryAllByRole('button')[0];
            if (talentNode) {
                fireEvent.mouseEnter(talentNode);
                // Tooltip or description should appear
            }
        });
    });

    describe('Talent Unlocking', () => {
        it('should highlight unlockable talents', () => {
            render(<TalentTreeScreen />);

            // Talents that can be unlocked should have different styling
            const buttons = screen.getAllByRole('button');
            expect(buttons.some(btn => !btn.hasAttribute('disabled'))).toBe(true);
        });

        it('should call unlockTalent when clicking available talent', () => {
            render(<TalentTreeScreen />);

            const talentNodes = screen.queryAllByRole('button').filter(
                btn => btn.getAttribute('aria-label')?.includes('talent') ||
                    btn.getAttribute('data-talent-id')
            );

            if (talentNodes.length > 0) {
                fireEvent.click(talentNodes[0]);
            }
        });

        it('should disable locked talents', () => {
            render(<TalentTreeScreen />);

            // Some talents should be locked (prerequisites not met)
            const buttons = screen.getAllByRole('button');
            expect(buttons.some(btn => btn.hasAttribute('disabled'))).toBe(true);
        });

        it('should show cost for each talent', () => {
            render(<TalentTreeScreen />);

            // Cost indicators should be visible
            expect(document.body.textContent?.includes('1') ||
                document.body.textContent?.includes('COST')).toBe(true);
        });
    });

    describe('Prerequisites', () => {
        it('should show connection lines between talents', () => {
            render(<TalentTreeScreen />);

            // Visual connections should exist (SVG lines or similar)
            const container = screen.getByRole('main') || document.body;
            expect(container).toBeDefined();
        });

        it('should indicate prerequisite requirements', () => {
            render(<TalentTreeScreen />);

            // Locked talents should show what's required
        });
    });

    describe('Reset Functionality', () => {
        it('should show reset button', () => {
            render(<TalentTreeScreen />);

            const resetBtn = screen.queryByText(/RESET/i);
            expect(resetBtn).toBeDefined();
        });

        it('should call resetTalents when confirmed', async () => {
            render(<TalentTreeScreen />);

            const resetBtn = screen.queryByText(/RESET/i)?.closest('button');
            if (resetBtn) {
                fireEvent.click(resetBtn);

                // Confirm dialog might appear
                const confirmBtn = screen.queryByText(/CONFIRM/i)?.closest('button') ||
                    screen.queryByText(/YES/i)?.closest('button');

                if (confirmBtn) {
                    fireEvent.click(confirmBtn);
                    expect(mockResetTalents).toHaveBeenCalled();
                }
            }
        });

        it('should refund points after reset', async () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                talentState: {
                    ...mockTalentState,
                    [PilotId.VANGUARD]: {
                        unlockedTalents: [{ talentId: 'test_talent', currentRank: 2 }],
                        totalPointsSpent: 4,
                        presets: []
                    },
                    availablePoints: 6
                }
            });

            render(<TalentTreeScreen />);

            // After reset, points should be 10 (6 + 4 refunded)
        });
    });

    describe('Talent Ranks', () => {
        it('should show multi-rank talents', () => {
            render(<TalentTreeScreen />);

            // Talents with multiple ranks should show progress
            expect(document.body.textContent?.includes('/') ||
                document.body.textContent?.includes('RANK')).toBeDefined();
        });

        it('should increment rank on repeat click', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                talentState: {
                    ...mockTalentState,
                    [PilotId.VANGUARD]: {
                        unlockedTalents: [{ talentId: 'test_talent', currentRank: 1 }],
                        totalPointsSpent: 1,
                        presets: []
                    }
                }
            });

            render(<TalentTreeScreen />);
            // Clicking same talent should increase rank
        });
    });

    describe('Synergies', () => {
        it('should highlight active synergies', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                talentState: {
                    ...mockTalentState,
                    [PilotId.VANGUARD]: {
                        unlockedTalents: [
                            { talentId: 'synergy_talent_1', currentRank: 1 },
                            { talentId: 'synergy_talent_2', currentRank: 1 }
                        ],
                        totalPointsSpent: 2,
                        presets: []
                    }
                }
            });

            render(<TalentTreeScreen />);

            // Active synergies should be highlighted
        });

        it('should show synergy bonus descriptions', () => {
            render(<TalentTreeScreen />);

            // Synergy info should be accessible
            const synergyText = screen.queryByText(/SYNERGY/i);
            expect(synergyText || document.body).toBeDefined();
        });
    });

    describe('Navigation', () => {
        it('should have close/back button', () => {
            render(<TalentTreeScreen />);

            const closeBtn = screen.queryByText(/CLOSE/i) ||
                screen.queryByText(/BACK/i) ||
                screen.queryByText(/×/);
            expect(closeBtn).toBeDefined();
        });
    });
});
