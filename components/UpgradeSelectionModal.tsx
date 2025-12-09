import React from 'react';
import { EndlessUpgrade } from '../types';
import { ENDLESS_UPGRADES } from '../constants';

interface UpgradeSelectionModalProps {
    wave: number;
    onSelectUpgrade: (upgradeId: string) => void;
}

export const UpgradeSelectionModal: React.FC<UpgradeSelectionModalProps> = ({ wave, onSelectUpgrade }) => {
    // Generate 3 random upgrades with rarity weighting
    const getRandomUpgrades = (): EndlessUpgrade[] => {
        const commons = ENDLESS_UPGRADES.filter(u => u.rarity === 'COMMON');
        const rares = ENDLESS_UPGRADES.filter(u => u.rarity === 'RARE');
        const legendaries = ENDLESS_UPGRADES.filter(u => u.rarity === 'LEGENDARY');

        const choices: EndlessUpgrade[] = [];

        for (let i = 0; i < 3; i++) {
            const roll = Math.random();
            let pool: EndlessUpgrade[];

            if (roll < 0.05) {
                // 5% legendary
                pool = legendaries;
            } else if (roll < 0.30) {
                // 25% rare (30% - 5%)
                pool = rares;
            } else {
                // 70% common
                pool = commons;
            }

            const randomUpgrade = pool[Math.floor(Math.random() * pool.length)];
            choices.push(randomUpgrade);
        }

        return choices;
    };

    const [upgrades] = React.useState(getRandomUpgrades());

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'border-gray-500 text-gray-300';
            case 'RARE': return 'border-blue-500 text-blue-400';
            case 'LEGENDARY': return 'border-yellow-500 text-yellow-400';
            default: return 'border-white text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="border-4 border-purple-500 bg-black p-8 max-w-4xl w-full shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-purple-400 mb-2 tracking-wider animate-pulse">
                        ⚡ WAVE {wave} COMPLETE
                    </h1>
                    <p className="text-purple-300 text-lg">Choose your upgrade to continue</p>
                </div>

                {/* Upgrade Options */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    {upgrades.map((upgrade, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelectUpgrade(upgrade.id)}
                            className={`p-6 border-2 transition-all hover:scale-105 hover:shadow-[0_0_30px_currentColor] ${getRarityColor(upgrade.rarity)} bg-black/50`}
                        >
                            {/* Icon */}
                            <div className="text-6xl mb-4">{upgrade.icon}</div>

                            {/* Rarity Badge */}
                            <div className={`text-xs uppercase mb-3 font-bold tracking-wider opacity-70`}>
                                {upgrade.rarity}
                            </div>

                            {/* Name */}
                            <div className="text-xl font-bold mb-3 tracking-wide">
                                {upgrade.name}
                            </div>

                            {/* Description */}
                            <div className="text-sm opacity-80 border-t border-current/30 pt-3">
                                {upgrade.description}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                    Click an upgrade to select and continue to the next wave
                </div>
            </div>
        </div>
    );
};
