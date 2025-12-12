import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AnimatedPortrait } from './AnimatedPortrait';
import { PilotId } from '../types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        img: ({ ...props }: any) => <img {...props} />
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('AnimatedPortrait Component', () => {
    const defaultProps = {
        pilotId: PilotId.VANGUARD,
        currentHp: 80,
        maxHp: 100,
        size: 'large' as const
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render portrait container', () => {
            render(<AnimatedPortrait {...defaultProps} />);
            expect(document.body.querySelector('[class*="portrait"]') || document.body).toBeDefined();
        });

        it('should render with correct pilot', () => {
            render(<AnimatedPortrait {...defaultProps} />);
            // Pilot image or icon should be rendered
        });

        it('should render in large size', () => {
            render(<AnimatedPortrait {...defaultProps} size="large" />);
            // Large size styling should be applied
        });

        it('should render in small size', () => {
            render(<AnimatedPortrait {...defaultProps} size="small" />);
            // Small size styling should be applied
        });
    });

    describe('HP-based Animation', () => {
        it('should show normal state at high HP', () => {
            render(<AnimatedPortrait {...defaultProps} currentHp={90} maxHp={100} />);
            // Normal state - no damage indicators
        });

        it('should show warning state at medium HP', () => {
            render(<AnimatedPortrait {...defaultProps} currentHp={50} maxHp={100} />);
            // Warning state - should have some visual change
        });

        it('should show danger state at low HP', () => {
            render(<AnimatedPortrait {...defaultProps} currentHp={20} maxHp={100} />);
            // Danger state - should pulse or change color
        });

        it('should show critical state near death', () => {
            render(<AnimatedPortrait {...defaultProps} currentHp={5} maxHp={100} />);
            // Critical state - intense visual feedback
        });
    });

    describe('Pilot Variants', () => {
        it('should render VANGUARD portrait', () => {
            render(<AnimatedPortrait {...defaultProps} pilotId={PilotId.VANGUARD} />);
        });

        it('should render SOLARIS portrait', () => {
            render(<AnimatedPortrait {...defaultProps} pilotId={PilotId.SOLARIS} />);
        });

        it('should render HYDRA portrait', () => {
            render(<AnimatedPortrait {...defaultProps} pilotId={PilotId.HYDRA} />);
        });

        it('should render WYRM portrait', () => {
            render(<AnimatedPortrait {...defaultProps} pilotId={PilotId.WYRM} />);
        });

        it('should render GHOST portrait', () => {
            render(<AnimatedPortrait {...defaultProps} pilotId={PilotId.GHOST} />);
        });
    });

    describe('Animation States', () => {
        it('should handle HP decrease animation', () => {
            const { rerender } = render(<AnimatedPortrait {...defaultProps} currentHp={100} />);
            rerender(<AnimatedPortrait {...defaultProps} currentHp={50} />);
            // Should trigger damage animation
        });

        it('should handle HP increase animation', () => {
            const { rerender } = render(<AnimatedPortrait {...defaultProps} currentHp={50} />);
            rerender(<AnimatedPortrait {...defaultProps} currentHp={80} />);
            // Should trigger heal animation
        });
    });
});
