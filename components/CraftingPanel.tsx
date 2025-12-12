import React, { useState } from 'react';
import { CRAFTING_RECIPES } from '../constants';
import { useGame } from '../context/GameContext';
import { audio } from '../services/audioService';
import { useTranslation } from 'react-i18next';

export const CraftingPanel: React.FC = () => {
    const { t } = useTranslation();
    const { runState, canCraft, craftItem } = useGame();
    const [notification, setNotification] = useState<string | null>(null);
    const [craftingInProgress, setCraftingInProgress] = useState(false);
    const [lastCraftedItem, setLastCraftedItem] = useState<string | null>(null);

    const handleCraft = (recipeId: string) => {
        if (craftingInProgress) return;

        setCraftingInProgress(true);
        audio.playBlip(); // Crafting start sound

        // Animation delay
        setTimeout(() => {
            const success = craftItem(recipeId);

            if (success) {
                const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
                setNotification(`✓ Crafted ${recipe?.name}!`);
                setLastCraftedItem(recipeId);
                audio.playSound('power_up'); // Success sound

                // Clear success notification after 3s
                setTimeout(() => {
                    setNotification(null);
                    setLastCraftedItem(null);
                }, 3000);
            } else {
                setNotification('✗ Insufficient materials!');
                audio.playAlarm(); // Fail sound
                setTimeout(() => setNotification(null), 2000);
            }

            setCraftingInProgress(false);
        }, 600); // Crafting animation duration
    };

    // Count unlocked recipes
    const unlockedCount = CRAFTING_RECIPES.filter(r => !r.unlockedAtStage || runState.currentStage >= r.unlockedAtStage).length;
    const totalCount = CRAFTING_RECIPES.length;

    return (
        <div className="p-4">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-cyan-400 uppercase">
                        🔧 Crafting Station
                    </h3>
                    <span className="text-sm text-gray-400">
                        Unlocked: {unlockedCount}/{totalCount}
                    </span>
                </div>
                <p className="text-sm text-gray-400">
                    Combine consumables to create more powerful items.
                </p>
            </div>

            {notification && (
                <div className={`mb-4 p-3 border-2 transition-all duration-300 ${notification.startsWith('✓')
                    ? 'border-green-500 bg-green-900/30 text-green-400 animate-pulse'
                    : 'border-red-500 bg-red-900/30 text-red-400'
                    }`}>
                    <div className="flex items-center gap-2">
                        {notification.startsWith('✓') && (
                            <span className="text-2xl">✨</span>
                        )}
                        <span className="font-bold">{notification}</span>
                        {notification.startsWith('✓') && (
                            <span className="text-2xl">✨</span>
                        )}
                    </div>
                </div>
            )}

            {craftingInProgress && (
                <div className="mb-4 p-3 border-2 border-cyan-500 bg-cyan-900/20 text-cyan-400">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin">⚙️</div>
                        <span>Crafting...</span>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {CRAFTING_RECIPES
                    .filter(recipe => !recipe.unlockedAtStage || runState.currentStage >= recipe.unlockedAtStage)
                    .map((recipe) => {
                        const canCraftThis = canCraft(recipe.id);
                        const hasResult = runState.consumables.some(c => c.id === recipe.result.id && c.count >= c.maxCount);

                        return (
                            <div
                                key={recipe.id}
                                className={`border-2 p-4 ${canCraftThis && !hasResult
                                    ? 'border-cyan-500 bg-cyan-900/10'
                                    : 'border-gray-700 bg-gray-800/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className={`font-bold text-lg ${recipe.result.color || 'text-white'}`}>
                                            {recipe.result.name}
                                            {lastCraftedItem === recipe.id && (
                                                <span className="ml-2 text-xs px-2 py-1 bg-green-500 text-black rounded animate-pulse">
                                                    JUST CRAFTED!
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-sm text-gray-400">{recipe.result.description}</p>
                                    </div>
                                    {hasResult && (
                                        <span className="text-yellow-400 text-xs px-2 py-1 border border-yellow-400">
                                            MAX
                                        </span>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <div className="text-xs text-gray-500 uppercase mb-2">{t('hangar.requirements')}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.requirements.map((req, idx) => {
                                            if (req.scrap) {
                                                const hasEnough = runState.scrap >= req.scrap;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`px-3 py-1 border ${hasEnough
                                                            ? 'border-green-500 bg-green-900/20 text-green-400'
                                                            : 'border-red-500 bg-red-900/20 text-red-400'
                                                            }`}
                                                    >
                                                        {req.scrap} Scrap
                                                        {hasEnough && ' ✓'}
                                                    </div>
                                                );
                                            }

                                            if (req.consumableId) {
                                                const consumable = runState.consumables.find(c => c.id === req.consumableId);
                                                const hasEnough = consumable && consumable.count >= req.count;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`px-3 py-1 border ${hasEnough
                                                            ? 'border-green-500 bg-green-900/20 text-green-400'
                                                            : 'border-red-500 bg-red-900/20 text-red-400'
                                                            }`}
                                                    >
                                                        {req.count}x {consumable?.name || req.consumableId}
                                                        {hasEnough && ' ✓'}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleCraft(recipe.id)}
                                    disabled={!canCraftThis || hasResult || craftingInProgress}
                                    className={`w-full py-2 px-4 font-bold uppercase transition-colors ${canCraftThis && !hasResult && !craftingInProgress
                                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {craftingInProgress ? '⚙️ Crafting...' : hasResult ? 'Already Maxed' : canCraftThis ? 'Craft Item' : 'Insufficient Materials'}
                                </button>
                            </div>
                        );
                    })}

                {/* Display locked recipes with unlock message */}
                {CRAFTING_RECIPES
                    .filter(recipe => recipe.unlockedAtStage && runState.currentStage < recipe.unlockedAtStage)
                    .map(recipe => (
                        <div
                            key={recipe.id}
                            className="border-2 border-gray-800 p-4 bg-gray-900/50 text-gray-600"
                        >
                            <h4 className="font-bold text-lg text-gray-500">
                                {recipe.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">Unlocks at Stage {recipe.unlockedAtStage}</p>
                            <div className="text-xs text-gray-700">
                                {recipe.description}
                            </div>
                        </div>
                    ))}
            </div>

            {
                CRAFTING_RECIPES.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        {t('hangar.noRecipes')}
                    </div>
                )
            }
        </div >
    );
};
