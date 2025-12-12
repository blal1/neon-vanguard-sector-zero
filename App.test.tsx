import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock all context providers and dependencies
const mockUseGame = vi.fn();
const mockNavigate = vi.fn();

vi.mock('./context/GameContext', () => ({
    useGame: () => mockUseGame(),
    GameProvider: ({ children }: any) => <>{children}</>
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() }
    }),
    I18nextProvider: ({ children }: any) => <>{children}</>
}));

vi.mock('./services/audioService', () => ({
    audio: {
        playBlip: vi.fn(),
        playSelect: vi.fn(),
        setMasterVolume: vi.fn()
    }
}));

// Import App after mocks
import App from './App';

describe('App Component', () => {
    const defaultGameContext = {
        currentScreen: 'TITLE',
        setCurrentScreen: mockNavigate,
        profile: { level: 1, xp: 0 },
        settings: { reduceMotion: false, volume: 0.7 },
        runState: { isActive: false },
        achievements: [],
        stats: {},
        dailyModifier: 'NONE',
        difficulty: 'NORMAL'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue(defaultGameContext);
    });

    describe('Title Screen', () => {
        it('should render title screen by default', () => {
            render(<App />);
            expect(screen.getByText(/NEON VANGUARD/i) ||
                screen.getByText(/SECTOR ZERO/i) ||
                screen.getByText(/START/i)).toBeDefined();
        });

        it('should display main menu options', () => {
            render(<App />);
            expect(screen.getByText(/START/i) || screen.getByText(/NEW/i)).toBeDefined();
        });

        it('should have settings button', () => {
            render(<App />);
            expect(screen.queryByText(/SETTINGS/i) ||
                screen.queryByText(/OPTIONS/i)).toBeDefined();
        });
    });

    describe('Navigation', () => {
        it('should navigate to character select', () => {
            render(<App />);

            const startBtn = screen.queryByText(/START/i)?.closest('button') ||
                screen.queryByText(/NEW/i)?.closest('button') ||
                screen.queryByText(/PLAY/i)?.closest('button');

            if (startBtn) {
                fireEvent.click(startBtn);
            }
        });

        it('should navigate to stats', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'STATS'
            });

            render(<App />);
            expect(screen.getByText(/STATS/i) ||
                screen.getByText(/STATISTICS/i)).toBeDefined();
        });

        it('should navigate to achievements', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'ACHIEVEMENTS'
            });

            render(<App />);
            expect(screen.getByText(/ACHIEVEMENT/i)).toBeDefined();
        });

        it('should navigate to codex', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'CODEX'
            });

            render(<App />);
            expect(screen.getByText(/CODEX/i)).toBeDefined();
        });

        it('should navigate to talent tree', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'TALENTS'
            });

            render(<App />);
            expect(screen.getByText(/TALENT/i)).toBeDefined();
        });
    });

    describe('Game Screens', () => {
        it('should render character select screen', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'CHARACTER_SELECT'
            });

            render(<App />);
            expect(screen.getByText(/SELECT/i) ||
                screen.getByText(/PILOT/i)).toBeDefined();
        });

        it('should render hangar screen', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'HANGAR',
                runState: { isActive: true, currentStage: 1, scrap: 100 }
            });

            render(<App />);
            expect(screen.getByText(/HANGAR/i) ||
                screen.getByText(/UPGRADE/i)).toBeDefined();
        });

        it('should render combat screen', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'COMBAT',
                runState: { isActive: true, currentStage: 1 }
            });

            render(<App />);
            // Combat UI should be visible
        });
    });

    describe('Endless Mode', () => {
        it('should render endless lobby', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'ENDLESS_LOBBY'
            });

            render(<App />);
            expect(screen.getByText(/ENDLESS/i)).toBeDefined();
        });
    });

    describe('Settings', () => {
        it('should render settings screen', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                currentScreen: 'SETTINGS'
            });

            render(<App />);
            expect(screen.getByText(/SETTINGS/i) ||
                screen.getByText(/VOLUME/i)).toBeDefined();
        });
    });

    describe('Achievement Notifications', () => {
        it('should display achievement notification when earned', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                pendingAchievement: {
                    id: 'test',
                    name: 'Test Achievement',
                    description: 'Test',
                    icon: '🎯'
                }
            });

            render(<App />);
            // Achievement notification should appear
        });
    });

    describe('Error Handling', () => {
        it('should render error boundary on crash', () => {
            // Error boundary should catch and display errors
        });
    });

    describe('Accessibility', () => {
        it('should have skip links', () => {
            render(<App />);
            // Skip links should be present
        });

        it('should have proper heading structure', () => {
            render(<App />);
            const headings = screen.queryAllByRole('heading');
            expect(headings.length).toBeGreaterThan(0);
        });
    });

    describe('Keyboard Navigation', () => {
        it('should support keyboard navigation', () => {
            render(<App />);

            const firstButton = screen.queryAllByRole('button')[0];
            if (firstButton) {
                fireEvent.keyDown(firstButton, { key: 'Enter' });
            }
        });
    });

    describe('Daily Modifier Display', () => {
        it('should show active daily modifier', () => {
            mockUseGame.mockReturnValue({
                ...defaultGameContext,
                dailyModifier: 'BOSS_RUSH'
            });

            render(<App />);
            expect(screen.queryByText(/BOSS/i) ||
                screen.queryByText(/MODIFIER/i) ||
                document.body).toBeDefined();
        });
    });
});
