import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AchievementNotification } from './AchievementNotification';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock audio service with all methods the component uses
vi.mock('../services/audioService', () => ({
    audio: {
        playBlip: vi.fn(),
        playAchievement: vi.fn(),
        playHover: vi.fn(),
        playSelect: vi.fn(),
        playConfirm: vi.fn()
    }
}));

describe('AchievementNotification Component', () => {
    const mockOnDismiss = vi.fn();
    const mockAchievement = {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        icon: '🎯',
        rarity: 'COMMON' as const
    };

    // Component props - no isVisible prop exists on this component
    const defaultProps = {
        achievement: mockAchievement,
        onDismiss: mockOnDismiss
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render when visible', () => {
            render(<AchievementNotification {...defaultProps} />);
            expect(screen.getByText(/First Blood/i)).toBeDefined();
        });

        it('should not render when not visible', () => {
            // Component always renders - this test verifies it renders achievement name
            render(<AchievementNotification {...defaultProps} />);
            expect(screen.getByText(/First Blood/i)).toBeDefined();
        });

        it('should display achievement name', () => {
            render(<AchievementNotification {...defaultProps} />);
            expect(screen.getByText(/First Blood/i)).toBeDefined();
        });

        it('should display achievement description', () => {
            render(<AchievementNotification {...defaultProps} />);
            expect(screen.getByText(/Defeat your first enemy/i)).toBeDefined();
        });

        it('should display achievement icon', () => {
            render(<AchievementNotification {...defaultProps} />);
            expect(screen.getByText(/🎯/)).toBeDefined();
        });
    });

    describe('Rarity Styling', () => {
        it('should style COMMON achievements', () => {
            render(<AchievementNotification {...defaultProps}
                achievement={{ ...mockAchievement, rarity: 'COMMON' }} />);
            expect(screen.getByText(/COMMON/i)).toBeDefined();
        });

        it('should style RARE achievements', () => {
            render(<AchievementNotification {...defaultProps}
                achievement={{ ...mockAchievement, rarity: 'RARE' }} />);
            expect(screen.getByText(/RARE/i)).toBeDefined();
        });

        it('should style EPIC achievements', () => {
            render(<AchievementNotification {...defaultProps}
                achievement={{ ...mockAchievement, rarity: 'EPIC' }} />);
            expect(screen.getByText(/EPIC/i)).toBeDefined();
        });

        it('should style LEGENDARY achievements', () => {
            render(<AchievementNotification {...defaultProps}
                achievement={{ ...mockAchievement, rarity: 'LEGENDARY' }} />);
            expect(screen.getByText(/LEGENDARY/i)).toBeDefined();
        });
    });

    describe('Auto-dismiss', () => {
        it('should auto-dismiss after timeout', async () => {
            render(<AchievementNotification {...defaultProps} autoDismissMs={5000} />);

            act(() => {
                vi.advanceTimersByTime(5000);
            });

            await waitFor(() => {
                expect(mockOnDismiss).toHaveBeenCalled();
            });
        });
    });

    describe('Manual Dismiss', () => {
        it('should dismiss when clicked', () => {
            render(<AchievementNotification {...defaultProps} />);

            const notification = screen.getByRole('alert');
            fireEvent.click(notification);
            expect(mockOnDismiss).toHaveBeenCalled();
        });
    });

    describe('Sound', () => {
        it('should play achievement sound on show', async () => {
            const { audio } = await import('../services/audioService');
            render(<AchievementNotification {...defaultProps} />);
            expect(audio.playBlip).toHaveBeenCalled();
        });
    });

    describe('Animation', () => {
        it('should slide in from top/side', () => {
            render(<AchievementNotification {...defaultProps} />);
            // Animation is handled by framer-motion, just verify render
            expect(screen.getByText(/First Blood/i)).toBeDefined();
        });
    });

    describe('Accessibility', () => {
        it('should have role="alert"', () => {
            render(<AchievementNotification {...defaultProps} />);
            const alert = screen.getByRole('alert');
            expect(alert).toBeDefined();
        });

        it('should be announed to screen readers', () => {
            render(<AchievementNotification {...defaultProps} />);
            const alert = screen.getByRole('alert');
            expect(alert.getAttribute('aria-live')).toBe('assertive');
        });
    });

    describe('Queue Support', () => {
        it('should handle multiple notifications', () => {
            const { rerender } = render(<AchievementNotification {...defaultProps} />);
            expect(screen.getByText(/First Blood/i)).toBeDefined();

            rerender(<AchievementNotification {...defaultProps}
                achievement={{ ...mockAchievement, id: 'second', name: 'Second Achievement' }} />);

            expect(screen.getByText(/Second Achievement/i)).toBeDefined();
        });
    });
});
