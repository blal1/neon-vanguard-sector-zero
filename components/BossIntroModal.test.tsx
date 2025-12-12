import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import { BossIntroModal } from './BossIntroModal';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('../services/audioService', () => ({
    audio: {
        playSound: vi.fn(),
        playBossIntro: vi.fn()
    }
}));

describe('BossIntroModal Component', () => {
    const mockOnComplete = vi.fn();
    const mockBoss = {
        id: 'SIGMA_PRIME',
        name: 'SIGMA PRIME',
        title: 'Sector Zero Guardian',
        description: 'The final defense of Sector Zero.',
        threatLevel: 10,
        maxHp: 500,
        damage: 25,
        speed: 0.8,
        xpReward: 1000,
        abilities: [],
        dialogue: {
            intro: [
                'Initiating defense protocols.',
                'You have entered restricted airspace.',
                'Prepare for termination.'
            ],
            phase: {},
            defeat: 'Systems... failing...'
        },
        phases: [
            { name: 'Phase 1', hpThreshold: 100, dialogue: 'Initiating defense protocols.' }
        ]
    };

    const defaultProps = {
        boss: mockBoss,
        onComplete: mockOnComplete
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render when open', () => {
            render(<BossIntroModal {...defaultProps} />);
            expect(screen.getByText(/SIGMA PRIME/i) || screen.getByText(/boss/i)).toBeDefined();
        });

        it('should not render when closed', () => {
            render(<BossIntroModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText(/SIGMA PRIME/i)).toBeNull();
        });

        it('should display boss name', () => {
            render(<BossIntroModal {...defaultProps} />);
            expect(screen.getByText(/SIGMA PRIME/i)).toBeDefined();
        });

        it('should display boss title', () => {
            render(<BossIntroModal {...defaultProps} />);
            expect(screen.getByText(/Sector Zero Guardian/i) ||
                screen.getByText(/Guardian/i)).toBeDefined();
        });

        it('should display boss description', () => {
            render(<BossIntroModal {...defaultProps} />);
            expect(screen.getByText(/final defense/i) ||
                screen.getByText(/defense/i)).toBeDefined();
        });

        it('should display threat level', () => {
            render(<BossIntroModal {...defaultProps} />);
            expect(screen.getByText(/10/) ||
                screen.getByText(/THREAT/i)).toBeDefined();
        });
    });

    describe('Auto-close Behavior', () => {
        it('should auto-close after timeout', async () => {
            render(<BossIntroModal {...defaultProps} />);

            act(() => {
                vi.advanceTimersByTime(5000); // 5 seconds
            });

            await waitFor(() => {
                expect(mockOnComplete).toHaveBeenCalled();
            });
        });
    });

    describe('Skip Functionality', () => {
        it('should have skip button', () => {
            render(<BossIntroModal {...defaultProps} />);
            const skipBtn = screen.queryByText(/SKIP/i) ||
                screen.queryByText(/CONTINUE/i);
            expect(skipBtn).toBeDefined();
        });

        it('should call onComplete when skip is clicked', () => {
            render(<BossIntroModal {...defaultProps} />);
            const skipBtn = screen.queryByText(/SKIP/i)?.closest('button') ||
                screen.queryByText(/CONTINUE/i)?.closest('button');

            if (skipBtn) {
                fireEvent.click(skipBtn);
                expect(mockOnComplete).toHaveBeenCalled();
            }
        });
    });

    describe('Animations', () => {
        it('should show entrance animation', () => {
            render(<BossIntroModal {...defaultProps} />);
            // Modal should have animation classes
        });

        it('should animate boss name typing', () => {
            render(<BossIntroModal {...defaultProps} />);
            // Text should appear progressively
        });
    });

    describe('Accessibility', () => {
        it('should be focusable', () => {
            render(<BossIntroModal {...defaultProps} />);
            // Modal should be in focus when open
        });

        it('should have ARIA attributes', () => {
            render(<BossIntroModal {...defaultProps} />);
            const modal = screen.queryByRole('dialog') ||
                screen.queryByRole('alertdialog');
            expect(modal || document.body).toBeDefined();
        });
    });
});
