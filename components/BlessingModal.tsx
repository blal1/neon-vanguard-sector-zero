import React from 'react';
import { EndlessBlessing, ENDLESS_BLESSINGS } from '../constants';
import { audio } from '../services/audioService';

interface BlessingModalProps {
    wave: number;
    onSelectBlessing: (blessing: EndlessBlessing) => void;
}

export const BlessingModal: React.FC<BlessingModalProps> = ({ wave, onSelectBlessing }) => {
    // Pick 3 random blessings
    const shuffled = [...ENDLESS_BLESSINGS].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    const handleSelect = (blessing: EndlessBlessing) => {
        audio.playBlip();
        onSelectBlessing(blessing);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 font-mono">
            <div className="bg-gray-900 border-2 border-purple-500 p-8 max-w-3xl w-full mx-4">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4 animate-pulse">✨</div>
                    <h2 className="text-3xl font-bold text-purple-400 tracking-wider">
                        WAVE {wave} BLESSING
                    </h2>
                    <p className="text-gray-400 mt-2">Choose a temporary power-up</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {choices.map((blessing) => (
                        <button
                            key={blessing.id}
                            onClick={() => handleSelect(blessing)}
                            className="border-2 border-purple-600 hover:border-purple-400 hover:bg-purple-900/30 p-4 transition-all text-left group"
                        >
                            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                {blessing.icon}
                            </div>
                            <div className="text-lg font-bold text-purple-300 mb-1">
                                {blessing.name}
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                                {blessing.description}
                            </div>
                            <div className="text-xs text-purple-500">
                                Duration: {blessing.duration} wave{blessing.duration > 1 ? 's' : ''}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
