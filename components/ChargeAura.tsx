import React from 'react';

interface ChargeAuraProps {
    isReady: boolean;
    color?: string;
    size?: 'small' | 'medium' | 'large';
}

export const ChargeAura: React.FC<ChargeAuraProps> = ({
    isReady,
    color = '#60a5fa',
    size = 'medium'
}) => {
    if (!isReady) return null;

    const sizeClasses = {
        small: 'w-12 h-12',
        medium: 'w-16 h-16',
        large: 'w-20 h-20'
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Pulsing glow */}
            <div
                className={`${sizeClasses[size]} rounded-full absolute animate-charge-pulse`}
                style={{
                    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`,
                    backgroundColor: `${color}20`
                }}
            />

            {/* Orbiting particles */}
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="absolute animate-charge-orbit"
                    style={{
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '2s'
                    }}
                >
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: color,
                            boxShadow: `0 0 4px ${color}`
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
