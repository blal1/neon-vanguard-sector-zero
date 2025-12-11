import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';

export const KeyboardShortcuts: React.FC = () => {
    const { settings } = useGame();
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === (settings.keybindings?.toggleHelp || 'F1')) {
                e.preventDefault();
                setVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [settings.keybindings]);

    if (!visible) {
        return null;
    }

    const keybindings = settings.keybindings || {};

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-cyan-500 p-8 rounded-lg max-w-2xl">
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">{t('keyboardShortcuts.title')}</h2>
                <div className="grid grid-cols-2 gap-4 text-white">
                    <div>
                        <h3 className="text-xl font-bold text-cyan-500 mb-2">{t('common.general')}</h3>
                        <ul>
                            <li><span className="font-bold text-cyan-400">{keybindings.toggleHelp || 'F1'}:</span> {t('keyboardShortcuts.toggleHelp')}</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-cyan-500 mb-2">{t('keyboardShortcuts.combat')}</h3>
                        <ul>
                            <li><span className="font-bold text-cyan-400">{keybindings.primaryAbility || 'Space'}:</span> {t('keyboardShortcuts.primaryAbility')}</li>
                            <li><span className="font-bold text-cyan-400">{keybindings.specialAbility || 'Shift'}:</span> {t('keyboardShortcuts.specialAbility')}</li>
                            <li><span className="font-bold text-cyan-400">{keybindings.consumable1 || '1'} - {keybindings.consumable4 || '4'}:</span> {t('keyboardShortcuts.useConsumables')}</li>
                        </ul>
                    </div>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="mt-8 px-8 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all"
                >
                    {t('common.close')}
                </button>
            </div>
        </div>
    );
};
