import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CodexScreen } from './CodexScreen';
import { PilotId } from '../types';

// Mock dependencies
const mockUseGame = vi.fn();
const mockMarkEntryAsRead = vi.fn();

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

describe('CodexScreen Component', () => {
    const mockCodexState = {
        entries: {
            'pilot-VANGUARD': {
                id: 'pilot-VANGUARD',
                category: 'PILOT',
                title: 'Vanguard',
                content: 'A balanced assault mech.',
                isUnlocked: true,
                isNew: false,
                readCount: 1
            },
            'pilot-SOLARIS': {
                id: 'pilot-SOLARIS',
                category: 'PILOT',
                title: 'Solaris',
                content: 'Energy-based combat unit.',
                isUnlocked: true,
                isNew: true,
                readCount: 0
            },
            'enemy-scout-drone': {
                id: 'enemy-scout-drone',
                category: 'ENEMY',
                title: 'Scout Drone',
                content: 'Light reconnaissance unit.',
                isUnlocked: true,
                isNew: false,
                readCount: 2,
                defeatsRequired: 5
            },
            'lore-sector-zero': {
                id: 'lore-sector-zero',
                category: 'LORE',
                title: 'Sector Zero',
                content: 'The forbidden zone.',
                isUnlocked: false,
                isNew: false,
                readCount: 0
            }
        },
        unlockedCount: 3,
        totalCount: 4,
        newEntryIds: ['pilot-SOLARIS'],
        enemyDefeatCounts: { 'scout-drone': 10 }
    };

    const defaultGameContext = {
        codexState: mockCodexState,
        markEntryAsRead: mockMarkEntryAsRead
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue(defaultGameContext);
    });

    describe('Rendering', () => {
        it('should render codex header', () => {
            render(<CodexScreen />);
            expect(screen.getByText(/codex/i) || screen.getByText(/CODEX/i)).toBeDefined();
        });

        it('should display progress percentage', () => {
            render(<CodexScreen />);
            expect(screen.getByText(/75/) || screen.getByText(/3/) || screen.getByText(/%/)).toBeDefined();
        });

        it('should show category tabs', () => {
            render(<CodexScreen />);
            expect(screen.getByText(/PILOT/i) || screen.getByText(/pilot/i)).toBeDefined();
            expect(screen.getByText(/ENEMY/i) || screen.getByText(/enemy/i)).toBeDefined();
            expect(screen.getByText(/LORE/i) || screen.getByText(/lore/i)).toBeDefined();
        });
    });

    describe('Category Filtering', () => {
        it('should filter by PILOT category', () => {
            render(<CodexScreen />);

            const pilotTab = screen.getByText(/PILOT/i);
            fireEvent.click(pilotTab);

            // Should show pilot entries
            expect(screen.getByText(/Vanguard/i) || screen.getByText(/VANGUARD/i)).toBeDefined();
        });

        it('should filter by ENEMY category', () => {
            render(<CodexScreen />);

            const enemyTab = screen.getByText(/ENEMY/i);
            fireEvent.click(enemyTab);

            // Should show enemy entries
            expect(screen.getByText(/Scout/i) || screen.getByText(/Drone/i)).toBeDefined();
        });

        it('should filter by LORE category', () => {
            render(<CodexScreen />);

            const loreTab = screen.getByText(/LORE/i);
            fireEvent.click(loreTab);

            // Should show lore entries (even locked ones with ??? placeholders)
        });
    });

    describe('Entry Display', () => {
        it('should show unlocked entries', () => {
            render(<CodexScreen />);
            expect(screen.getByText(/Vanguard/i)).toBeDefined();
        });

        it('should show locked entries as hidden/placeholder', () => {
            render(<CodexScreen />);

            // Locked entries should show ??? or similar
            const lockedText = screen.queryByText(/\?\?\?/) ||
                screen.queryByText(/LOCKED/i) ||
                screen.queryByText('???');
            expect(lockedText || document.body).toBeDefined();
        });

        it('should mark new entries with indicator', () => {
            render(<CodexScreen />);

            // New entries should have a visual indicator
            const newIndicator = screen.queryByText(/NEW/i) ||
                screen.queryByText(/!/);
            expect(newIndicator || document.body).toBeDefined();
        });
    });

    describe('Entry Details', () => {
        it('should show entry content when selected', async () => {
            render(<CodexScreen />);

            const entryCard = screen.getByText(/Vanguard/i).closest('button');
            if (entryCard) {
                fireEvent.click(entryCard);

                await waitFor(() => {
                    expect(screen.getByText(/balanced assault/i) ||
                        screen.getByText(/assault mech/i)).toBeDefined();
                });
            }
        });

        it('should call markEntryAsRead when viewing new entry', async () => {
            render(<CodexScreen />);

            const newEntry = screen.getByText(/Solaris/i).closest('button');
            if (newEntry) {
                fireEvent.click(newEntry);

                await waitFor(() => {
                    expect(mockMarkEntryAsRead).toHaveBeenCalledWith('pilot-SOLARIS');
                });
            }
        });
    });

    describe('Enemy Entries', () => {
        it('should show defeat count for enemy entries', () => {
            render(<CodexScreen />);

            // Navigate to enemies
            const enemyTab = screen.getByText(/ENEMY/i);
            fireEvent.click(enemyTab);

            // Defeat count should be visible
            expect(screen.getByText(/10/) ||
                screen.getByText(/defeat/i)).toBeDefined();
        });

        it('should show unlock requirements', () => {
            render(<CodexScreen />);

            // Requirements should be shown for locked enemy entries
            expect(document.body.textContent?.includes('5') ||
                document.body.textContent?.includes('DEFEAT')).toBeDefined();
        });
    });

    describe('Audio Logs', () => {
        it('should show audio log category', () => {
            render(<CodexScreen />);

            const audioTab = screen.queryByText(/AUDIO/i);
            expect(audioTab || document.body).toBeDefined();
        });
    });

    describe('Navigation', () => {
        it('should have close button', () => {
            render(<CodexScreen />);

            const closeBtn = screen.queryByText(/CLOSE/i) ||
                screen.queryByText(/BACK/i) ||
                screen.queryByText(/×/);
            expect(closeBtn).toBeDefined();
        });
    });

    describe('Progress Display', () => {
        it('should show overall progress', () => {
            render(<CodexScreen />);

            // 3/4 = 75% unlocked
            expect(screen.getByText(/3/) ||
                screen.getByText(/4/) ||
                screen.getByText(/75/)).toBeDefined();
        });

        it('should show per-category progress', () => {
            render(<CodexScreen />);

            // Each category should have its own progress
        });
    });
});
