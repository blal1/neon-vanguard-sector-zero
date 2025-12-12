import React, { useState } from 'react';
import { Consumable } from '../types';
import { CONSUMABLES } from '../constants';
import { audio } from '../services/audioService';

interface ShopWaveModalProps {
    wave: number;
    scrap: number;
    onPurchase: (item: Consumable, cost: number) => void;
    onContinue: () => void;
}

export const ShopWaveModal: React.FC<ShopWaveModalProps> = ({ wave, scrap, onPurchase, onContinue }) => {
    const [currentScrap, setCurrentScrap] = useState(scrap);

    // Available shop items (subset of consumables)
    const shopItems = CONSUMABLES.filter(c => c.cost && c.cost > 0).slice(0, 6);

    const handlePurchase = (item: Consumable) => {
        if (currentScrap >= (item.cost || 0)) {
            audio.playBlip();
            setCurrentScrap(prev => prev - (item.cost || 0));
            onPurchase(item, item.cost || 0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 font-mono">
            <div className="bg-gray-900 border-2 border-yellow-500 p-8 max-w-4xl w-full mx-4">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🏪</div>
                    <h2 className="text-3xl font-bold text-yellow-400 tracking-wider">
                        WAVE {wave} - BREATHER SHOP
                    </h2>
                    <p className="text-gray-400 mt-2">Resupply before the next fight</p>
                    <div className="text-2xl text-yellow-300 mt-4">
                        💰 {currentScrap} SCRAP
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {shopItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handlePurchase(item)}
                            disabled={currentScrap < (item.cost || 0)}
                            className={`border-2 p-4 text-left transition-all ${currentScrap >= (item.cost || 0)
                                    ? 'border-yellow-600 hover:border-yellow-400 hover:bg-yellow-900/30'
                                    : 'border-gray-700 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <div className="text-lg font-bold text-yellow-300 mb-1">
                                {item.name}
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                                {item.description}
                            </div>
                            <div className="text-sm text-yellow-500 font-bold">
                                💰 {item.cost} SCRAP
                            </div>
                        </button>
                    ))}
                </div>

                {/* HP Restore Option */}
                <div className="border-t border-yellow-700 pt-4 mb-6">
                    <button
                        onClick={() => {
                            if (currentScrap >= 30) {
                                audio.playBlip();
                                setCurrentScrap(prev => prev - 30);
                                onPurchase({
                                    id: 'shop_heal',
                                    name: 'FIELD REPAIR',
                                    description: 'Restore 50 HP',
                                    count: 1,
                                    maxCount: 1,
                                    color: 'text-green-400 border-green-400',
                                    cost: 30
                                }, 30);
                            }
                        }}
                        disabled={currentScrap < 30}
                        className={`w-full p-4 border-2 ${currentScrap >= 30
                                ? 'border-green-600 hover:border-green-400 hover:bg-green-900/30 text-green-400'
                                : 'border-gray-700 opacity-50 cursor-not-allowed text-gray-500'
                            }`}
                    >
                        💚 FIELD REPAIR (+50 HP) - 30 SCRAP
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => { audio.playBlip(); onContinue(); }}
                        className="px-12 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xl tracking-widest transition-colors"
                    >
                        CONTINUE TO WAVE {wave + 1}
                    </button>
                </div>
            </div>
        </div>
    );
};
