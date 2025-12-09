import React from 'react';
import { DifficultyLevel } from '../types';
import { DIFFICULTIES } from '../constants';
import { useGame } from '../context/GameContext';

interface DifficultySelectProps {
    onClose: () => void;
}

export const DifficultySelect: React.FC<DifficultySelectProps> = ({ onClose }) => {
    const { difficulty, setDifficulty } = useGame();

    const handleSelect = (level: DifficultyLevel) => {
        setDifficulty(level);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-cyan-500 p-6 max-w-3xl w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    aria-label="Close"
                >
                    [X]
                </button>

                <h2 className="text-2xl font-bold mb-2 text-cyan-400 uppercase">
                    ⚔️ Select Difficulty
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                    Choose your challenge level. Higher difficulties increase rewards but make combat more deadly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(DIFFICULTIES).map((config) => {
                        const isSelected = difficulty === config.id;
                        const isNightmare = config.id === 'NIGHTMARE';

                        return (
                            <button
                                key={config.id}
                                onClick={() => handleSelect(config.id)}
                                className={`
                  p-4 border-2 text-left transition-all
                  ${isSelected
                                        ? 'border-yellow-400 bg-yellow-400/10'
                                        : 'border-gray-600 hover:border-gray-400 bg-gray-800/50'
                                    }
                  ${isNightmare ? 'border-red-600 hover:border-red-500' : ''}
                `}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="text-3xl mr-2">{config.icon}</span>
                                        <span className={`font-bold text-lg ${isNightmare ? 'text-red-400' : 'text-white'}`}>
                                            {config.name.toUpperCase()}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <span className="text-yellow-400 text-xl">✓</span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-300 mb-3">{config.description}</p>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Enemy HP:</span>{' '}
                                        <span className={config.enemyHpMult < 1 ? 'text-green-400' : config.enemyHpMult > 1 ? 'text-red-400' : 'text-white'}>
                                            {(config.enemyHpMult * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Enemy DMG:</span>{' '}
                                        <span className={config.enemyDmgMult > 1 ? 'text-red-400' : 'text-white'}>
                                            {(config.enemyDmgMult * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Scrap:</span>{' '}
                                        <span className={config.scrapMult > 1 ? 'text-green-400' : 'text-white'}>
                                            {(config.scrapMult * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Lives:</span>{' '}
                                        <span className={config.lives === 1 ? 'text-red-400' : 'text-white'}>
                                            {config.lives === 999 ? '∞' : config.lives}
                                        </span>
                                    </div>
                                </div>

                                {isNightmare && (
                                    <div className="mt-3 pt-3 border-t border-red-900">
                                        <span className="text-red-400 text-xs font-bold">
                                            ⚠️ PERMADEATH: Death resets ALL progress!
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
