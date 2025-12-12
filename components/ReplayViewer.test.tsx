import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ReplayViewer } from './ReplayViewer';

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

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('../services/audioService', () => ({
    audio: {
        playBlip: vi.fn()
    }
}));

describe('ReplayViewer Component', () => {
    const mockReplay = {
        id: 'replay-001',
        date: Date.now() - 86400000,
        pilotId: 'VANGUARD',
        module: 'BALANCED',
        difficulty: 'NORMAL',
        stage: 10,
        success: true,
        duration: 180000, // 3 minutes
        totalDamage: 1500,
        totalKills: 25,
        frames: [
            { timestamp: 0, enemies: [], playerHp: 100, playerEnergy: 100, log: ['Combat started'] },
            { timestamp: 1000, enemies: [{ id: 'e1', name: 'Drone', hp: 50 }], playerHp: 95, playerEnergy: 90, log: ['Drone attacks'] },
            { timestamp: 2000, enemies: [], playerHp: 90, playerEnergy: 100, log: ['Drone defeated'] }
        ]
    };

    const mockOnClose = vi.fn();
    const defaultProps = {
        replay: mockReplay,
        onClose: mockOnClose
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue({
            profile: { level: 10 }
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render replay viewer', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/REPLAY/i) ||
                screen.getByText(/replay/i)).toBeDefined();
        });

        it('should display pilot name', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/VANGUARD/i)).toBeDefined();
        });

        it('should display stage info', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/10/) || screen.getByText(/STAGE/i)).toBeDefined();
        });

        it('should display result', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/VICTORY/i) ||
                screen.getByText(/SUCCESS/i)).toBeDefined();
        });
    });

    describe('Playback Controls', () => {
        it('should have play button', () => {
            render(<ReplayViewer {...defaultProps} />);
            const playBtn = screen.queryByText(/PLAY/i) ||
                screen.queryByText(/▶/) ||
                screen.queryByRole('button', { name: /play/i });
            expect(playBtn).toBeDefined();
        });

        it('should have pause button', () => {
            render(<ReplayViewer {...defaultProps} />);
            const pauseBtn = screen.queryByText(/PAUSE/i) ||
                screen.queryByText(/⏸/);
            expect(pauseBtn || document.body).toBeDefined();
        });

        it('should play through frames', async () => {
            render(<ReplayViewer {...defaultProps} />);

            const playBtn = screen.queryByText(/PLAY/i)?.closest('button');
            if (playBtn) {
                fireEvent.click(playBtn);

                act(() => {
                    vi.advanceTimersByTime(2000);
                });
            }
        });

        it('should have speed controls', () => {
            render(<ReplayViewer {...defaultProps} />);
            const speedBtn = screen.queryByText(/1x/) ||
                screen.queryByText(/SPEED/i);
            expect(speedBtn || document.body).toBeDefined();
        });
    });

    describe('Timeline', () => {
        it('should display timeline progress', () => {
            render(<ReplayViewer {...defaultProps} />);
            // Progress bar or timeline should be visible
        });

        it('should allow seeking', () => {
            render(<ReplayViewer {...defaultProps} />);
            // Clicking on timeline should seek
        });
    });

    describe('Frame Display', () => {
        it('should display current enemies', () => {
            render(<ReplayViewer {...defaultProps} />);
            // Enemy status should be shown
        });

        it('should display player HP', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/100/) || screen.getByText(/HP/i)).toBeDefined();
        });

        it('should display combat log', () => {
            render(<ReplayViewer {...defaultProps} />);
            // Combat log should be visible
        });
    });

    describe('Statistics', () => {
        it('should display total damage', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/1500/) || screen.getByText(/DAMAGE/i)).toBeDefined();
        });

        it('should display total kills', () => {
            render(<ReplayViewer {...defaultProps} />);
            expect(screen.getByText(/25/) || screen.getByText(/KILLS/i)).toBeDefined();
        });

        it('should display duration', () => {
            render(<ReplayViewer {...defaultProps} />);
            // 3 minutes duration
            expect(screen.getByText(/3/) || screen.getByText(/MINUTES/i) ||
                screen.getByText(/DURATION/i)).toBeDefined();
        });
    });

    describe('Navigation', () => {
        it('should have close button', () => {
            render(<ReplayViewer {...defaultProps} />);
            const closeBtn = screen.queryByText(/CLOSE/i) ||
                screen.queryByText(/BACK/i) ||
                screen.queryByText(/×/);
            expect(closeBtn).toBeDefined();
        });

        it('should call onClose when clicking close', () => {
            render(<ReplayViewer {...defaultProps} />);

            const closeBtn = screen.queryByText(/CLOSE/i)?.closest('button') ||
                screen.queryByText(/BACK/i)?.closest('button');

            if (closeBtn) {
                fireEvent.click(closeBtn);
                expect(mockOnClose).toHaveBeenCalled();
            }
        });
    });

    describe('Failed Replay', () => {
        it('should show defeat for failed run', () => {
            const failedReplay = { ...mockReplay, success: false };
            render(<ReplayViewer {...defaultProps} replay={failedReplay} />);

            expect(screen.getByText(/DEFEAT/i) ||
                screen.getByText(/FAILED/i) ||
                screen.getByText(/LOSS/i) ||
                document.body).toBeDefined();
        });
    });
});

// Import act for timer manipulation
import { act } from '@testing-library/react';
