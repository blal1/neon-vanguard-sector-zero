import React, { useMemo, memo } from 'react';
import { PilotId } from '../types';

interface AnimatedPortraitProps {
    pilotId: PilotId;
    currentHp: number;
    maxHp: number;
    size?: 'small' | 'medium' | 'large';
}

const PILOT_EXPRESSIONS: Record<PilotId, { healthy: string; damaged: string; critical: string }> = {
    vanguard: { healthy: '🛡️', damaged: '⚔️', critical: '🔥' },
    solaris: { healthy: '☀️', damaged: '⚡', critical: '💫' },
    hydra: { healthy: '🔫', damaged: '💥', critical: '🌡️' },
    wyrm: { healthy: '🐉', damaged: '🦎', critical: '🐍' },
    ghost: { healthy: '👻', damaged: '💀', critical: '☠️' }
};

export const AnimatedPortrait = memo<AnimatedPortraitProps>(({
    pilotId,
    currentHp,
    maxHp,
    size = 'medium'
}) => {
    const hpPercent = (currentHp / maxHp) * 100;

    const expression = useMemo(() => {
        const expressions = PILOT_EXPRESSIONS[pilotId];
        if (hpPercent > 60) return expressions.healthy;
        if (hpPercent > 30) return expressions.damaged;
        return expressions.critical;
    }, [pilotId, hpPercent]);

    const state = hpPercent > 60 ? 'healthy' : hpPercent > 30 ? 'damaged' : 'critical';

    const sizeClasses = {
        small: 'w-12 h-12 text-2xl',
        medium: 'w-16 h-16 text-4xl',
        large: 'w-24 h-24 text-6xl'
    };

    const borderColors = {
        healthy: 'border-green-500',
        damaged: 'border-yellow-500',
        critical: 'border-red-500'
    };

    return (
        <div className="relative inline-block">
            <div
                className={`
          ${sizeClasses[size]} 
          rounded-full 
          border-4 
          ${borderColors[state]}
          bg-black/80
          flex items-center justify-center
          transition-all duration-500
          ${state === 'critical' ? 'animate-pulse' : ''}
        `}
            >
                <span className="animate-portrait-change">
                    {expression}
                </span>
            </div>

            {/* HP indicator ring */}
            <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 100 100"
            >
                <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`${borderColors[state]} opacity-30`}
                    strokeDasharray={`${hpPercent * 2.89} 289`}
                />
            </svg>
        </div>
    );
});

AnimatedPortrait.displayName = 'AnimatedPortrait';
