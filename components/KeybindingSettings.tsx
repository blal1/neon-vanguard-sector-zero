import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameSettings } from '../types';
import { useTranslation } from 'react-i18next';

const BINDABLE_ACTIONS: { id: keyof GameSettings['keybindings']; label: string }[] = [
    { id: 'primaryAbility', label: 'Primary Ability' },
    { id: 'specialAbility', label: 'Special Ability' },
    { id: 'consumable1', label: 'Consumable 1' },
    { id: 'consumable2', label: 'Consumable 2' },
    { id: 'consumable3', label: 'Consumable 3' },
    { id: 'consumable4', label: 'Consumable 4' },
    { id: 'toggleHelp', label: 'Toggle Help' },
];

export const KeybindingSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useGame();
    const [isBinding, setIsBinding] = useState<string | null>(null);

    const handleKeydown = useCallback((e: KeyboardEvent) => {
        if (isBinding) {
            e.preventDefault();
            e.stopPropagation();

            const newKey = e.key;
            const newKeybindings = { ...settings.keybindings, [isBinding]: newKey };
            updateSettings({ keybindings: newKeybindings });
            setIsBinding(null);
        }
    }, [isBinding, settings.keybindings, updateSettings]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [handleKeydown]);

    const handleReset = () => {
        // Here you would reset to default keybindings
        // For now, we'll just clear them
        updateSettings({ keybindings: {} });
    };

    return (
        <div className="border border-cyan-500 p-6 bg-black/50 mt-6">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400 tracking-wider">
                KEYBINDINGS
            </h3>
            <div className="space-y-2">
                {BINDABLE_ACTIONS.map(action => (
                    <div key={action.id} className="flex justify-between items-center p-2 hover:bg-cyan-900/20">
                        <span className="font-bold">{action.label}</span>
                        <button
                            onClick={() => setIsBinding(action.id)}
                            className="border border-cyan-500 px-4 py-1"
                        >
                            {isBinding === action.id ? t('settings.pressKey') : settings.keybindings?.[action.id] || t('settings.notSet')}
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={handleReset} className="mt-4 px-4 py-2 border border-red-500 text-red-400">
                {t('settings.resetToDefaults')}
            </button>
        </div>
    );
};
