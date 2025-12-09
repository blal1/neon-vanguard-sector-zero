import React, { useState, useCallback, useEffect } from 'react';
import { ParticleEffect, ParticleType } from './ParticleEffect';

export interface VisualEffect {
    id: string;
    type: 'particle' | 'flash';
    particleType?: ParticleType;
    flashType?: 'critical' | 'damage' | 'heal' | 'energy' | 'warning' | 'ability';
    x?: number;
    y?: number;
}

interface CombatEffectsProps {
    onAbilityUse?: (ability: any) => void;
    onCriticalHit?: (targetX: number, targetY: number) => void;
    onPlayerDamage?: (damage: number) => void;
    onHealing?: (hpGained: number) => void;
    onStatusEffect?: (effect: 'stun' | 'burn', targetX: number, targetY: number) => void;
    onEnemyDeath?: (x: number, y: number) => void;
}

export const useCombatEffects = (props: CombatEffectsProps = {}) => {
    const [effects, setEffects] = useState<VisualEffect[]>([]);
    const [screenFlash, setScreenFlash] = useState<string | null>(null);
    const [screenShake, setScreenShake] = useState<string>('');

    const spawnParticles = useCallback((type: ParticleType, x: number = 50, y: number = 50) => {
        const id = `effect-${Date.now()}-${Math.random()}`;
        setEffects(prev => [...prev.slice(-20), { id, type: 'particle', particleType: type, x, y }]);
    }, []);

    const triggerFlash = useCallback((type: VisualEffect['flashType']) => {
        if (!type) return;
        setScreenFlash(`flash-${type}`);
        setTimeout(() => setScreenFlash(null), 300);
    }, []);

    const triggerScreenShake = useCallback((type: 'light' | 'rumble' | 'vertical' | 'intense' | 'horizontal' = 'light') => {
        const shakeClass = `shake-${type}`;
        setScreenShake(shakeClass);
        setTimeout(() => setScreenShake(''), 500);
    }, []);

    const clearEffects = useCallback(() => {
        setEffects([]);
        setScreenFlash(null);
        setScreenShake('');
    }, []);

    return {
        effects,
        screenFlash,
        screenShake,
        spawnParticles,
        triggerFlash,
        triggerScreenShake,
        clearEffects
    };
};

interface CombatEffectsLayerProps {
    children: React.ReactNode;
    effects: VisualEffect[];
    screenFlash: string | null;
    screenShake: string;
}

export const CombatEffectsLayer: React.FC<CombatEffectsLayerProps> = ({ 
    children,
    effects,
    screenFlash,
    screenShake
}) => {
    return (
        <div className={`relative w-full h-full ${screenShake}`}>
            {children}
            {/* Screen Flash Overlay */}
            <div
                className={`fixed inset-0 pointer-events-none z-[100] ${screenFlash || ''}`}
                style={{ mixBlendMode: 'screen' }}
            />

            {/* Particle Effects */}
            <div className="fixed inset-0 pointer-events-none z-[99]">
                {effects.map(effect => {
                    if (effect.type === 'particle' && effect.particleType) {
                        return (
                            <ParticleEffect
                                key={effect.id}
                                type={effect.particleType}
                                x={effect.x || 50}
                                y={effect.y || 50}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};
