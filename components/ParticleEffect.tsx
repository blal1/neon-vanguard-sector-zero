import React, { useEffect, useState, memo } from 'react';
import { useGame } from '../context/GameContext';

export type ParticleType =
    | 'hit'
    | 'critical'
    | 'heal'
    | 'energy'
    | 'explosion'
    | 'stun'
    | 'burn'
    | 'laser'
    | 'heavy_shot'
    | 'standard_shot'
    | 'bio_shot'
    | 'overheat'
    | 'enemy_explosion'
    | 'player_hit'
    | 'shield'
    | 'dodge';

interface Particle {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    lifetime: number;
}

interface ParticleConfig {
    count: number;
    spread: number;
    color: string;
    duration: number;
}

// Particle configurations for each effect type
const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
    hit: { count: 8, spread: 20, color: '#fbbf24', duration: 500 },
    critical: { count: 16, spread: 40, color: '#f59e0b', duration: 800 },
    heal: { count: 10, spread: 15, color: '#34d399', duration: 600 },
    energy: { count: 12, spread: 25, color: '#818cf8', duration: 600 },
    explosion: { count: 20, spread: 50, color: '#ef4444', duration: 700 },
    stun: { count: 8, spread: 15, color: '#60a5fa', duration: 500 },
    burn: { count: 12, spread: 20, color: '#f97316', duration: 800 },
    laser: { count: 6, spread: 15, color: '#22d3ee', duration: 400 },
    heavy_shot: { count: 14, spread: 30, color: '#a855f7', duration: 600 },
    standard_shot: { count: 6, spread: 15, color: '#fbbf24', duration: 400 },
    bio_shot: { count: 10, spread: 20, color: '#84cc16', duration: 500 },
    overheat: { count: 10, spread: 15, color: '#ff6b6b', duration: 700 },
    enemy_explosion: { count: 24, spread: 60, color: '#ef4444', duration: 900 },
    player_hit: { count: 8, spread: 20, color: '#ef4444', duration: 500 },
    shield: { count: 10, spread: 25, color: '#60a5fa', duration: 600 },
    dodge: { count: 6, spread: 30, color: '#a3e635', duration: 400 }
};

interface ParticleEffectProps {
    type: ParticleType;
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
    onComplete?: () => void;
}

export const ParticleEffect = memo<ParticleEffectProps>(({ type, x, y, onComplete }) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const { settings } = useGame();
    const config = PARTICLE_CONFIGS[type] || PARTICLE_CONFIGS.hit;

    useEffect(() => {
        const count = settings.performanceMode ? Math.floor(config.count / 2) : config.count;

        // Generate particles
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
            const speed = Math.random() * config.spread + 10;

            newParticles.push({
                id: `particle-${Date.now()}-${i}`,
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                color: config.color,
                lifetime: 0
            });
        }
        setParticles(newParticles);

        // Auto cleanup
        const timeout = setTimeout(() => {
            setParticles([]);
            onComplete?.();
        }, config.duration);

        return () => clearTimeout(timeout);
    }, [type, x, y, config, onComplete, settings.performanceMode]);

    if (particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle, idx) => (
                <div
                    key={particle.id}
                    className={`absolute rounded-full ${type === 'critical' ? 'animate-ping' : ''}`}
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                        animation: `particle-float-${type} ${config.duration}ms ease-out forwards`,
                        animationDelay: `${idx * 20}ms`,
                        transform: 'translate(-50%, -50%)',
                        '--particle-vx': `${particle.vx}px`,
                        '--particle-vy': `${particle.vy}px`
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
});

ParticleEffect.displayName = 'ParticleEffect';
