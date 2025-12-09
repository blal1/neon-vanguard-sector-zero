import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export type ParticleType = 'hit' | 'critical' | 'heal' | 'energy' | 'explosion' | 'stun' | 'burn' | 'laser' | 'heavy_shot' | 'standard_shot' | 'bio_shot' | 'overheat' | 'enemy_explosion' | 'player_hit' | 'shield';

interface ParticleEffectProps {
    type: ParticleType;
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
    onComplete?: () => void;
}
//... (rest of the file)
export const ParticleEffect: React.FC<ParticleEffectProps> = ({ type, x, y, onComplete }) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const { settings } = useGame();
    const config = PARTICLE_CONFIGS[type] || PARTICLE_CONFIGS.hit;

    useEffect(() => {
        const count = settings.performanceMode ? Math.floor(config.count / 2) : config.count;

        // Generate particles
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
//... (rest of the file)
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
    }, [type, x, y, config, onComplete]);

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
};
