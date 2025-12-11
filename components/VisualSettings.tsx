import React from 'react';
import { useGame } from '../context/GameContext';
import { GameSettings } from '../types';
import { useTranslation } from 'react-i18next';

export const VisualSettings: React.FC = () => {
    const { settings, updateSettings } = useGame();
    const { i18n, t } = useTranslation();

    const handleToggle = (setting: keyof GameSettings) => {
        updateSettings({ [setting]: !settings[setting] });
    };

    const handleCombatSpeed = (speed: 'slow' | 'normal' | 'fast') => {
        updateSettings({ combatSpeed: speed });
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    }

    return (
        <div className="border border-cyan-500 p-6 bg-black/50 mt-6">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400 tracking-wider">
                {t('settings.visualGameplay')}
            </h3>

            <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-900/20 p-2 transition-colors">
                    <input
                        type="checkbox"
                        checked={settings.showDamageNumbers}
                        onChange={() => handleToggle('showDamageNumbers')}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold tracking-wide">
                        {t('settings.showDamageNumbers')}
                    </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-900/20 p-2 transition-colors">
                    <input
                        type="checkbox"
                        checked={settings.screenShake}
                        onChange={() => handleToggle('screenShake')}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold tracking-wide">
                        {t('settings.enableScreenShake')}
                    </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-900/20 p-2 transition-colors">
                    <input
                        type="checkbox"
                        checked={settings.performanceMode}
                        onChange={() => handleToggle('performanceMode')}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold tracking-wide">
                        {t('settings.performanceMode')}
                    </span>
                </label>

                <div>
                    <label className="text-sm font-bold tracking-wide">
                        LANGUAGE
                    </label>
                    <div className="flex gap-2 mt-2">
                        <select
                            value={i18n.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-gray-800 border border-cyan-500 text-white p-2"
                        >
                            <option value="en">{t('settings.english')}</option>
                            <option value="fr">{t('settings.french')}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold tracking-wide">
                        COMBAT SPEED
                    </label>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => handleCombatSpeed('slow')}
                            className={`px-4 py-2 border ${settings.combatSpeed === 'slow' ? 'bg-cyan-500 text-black' : 'border-cyan-500 text-cyan-400'}`}
                        >
                            SLOW
                        </button>
                        <button
                            onClick={() => handleCombatSpeed('normal')}
                            className={`px-4 py-2 border ${settings.combatSpeed === 'normal' ? 'bg-cyan-500 text-black' : 'border-cyan-500 text-cyan-400'}`}
                        >
                            NORMAL
                        </button>
                        <button
                            onClick={() => handleCombatSpeed('fast')}
                            className={`px-4 py-2 border ${settings.combatSpeed === 'fast' ? 'bg-cyan-500 text-black' : 'border-cyan-500 text-cyan-400'}`}
                        >
                            FAST
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold tracking-wide">
                        COMBAT LOG FONT SIZE
                    </label>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => updateSettings({ combatLogFontSize: 12 })}
                            className={`px-4 py-2 border ${settings.combatLogFontSize === 12 ? 'bg-cyan-500 text-black' : 'border-cyan-500 text-cyan-400'}`}
                        >
                            Small
                        </button>
                        <button
                            onClick={() => updateSettings({ combatLogFontSize: 14 })}
                            className={`px-4 py-2 border ${settings.combatLogFontSize === 14 || !settings.combatLogFontSize ? 'bg-cyan-500 text-black' : 'border-cyan-500 text-cyan-400'}`}
                        >
                            Medium
                        </button>
                        <button
                            onClick={() => updateSettings({ combatLogFontSize: 16 })}
                            className={`px-4 py-2 border ${settings.combatLogFontSize === 16 ? 'bg-cyan-500 text-black' : 'border-cyan-500 text-cyan-400'}`}
                        >
                            Large
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold tracking-wide">
                        COLORBLIND MODE
                    </label>
                    <div className="flex gap-2 mt-2">
                        <select
                            value={settings.colorblindMode || 'none'}
                            onChange={(e) => updateSettings({ colorblindMode: e.target.value as any })}
                            className="bg-gray-800 border border-cyan-500 text-white p-2"
                        >
                            <option value="none">{t('settings.colorblindNone')}</option>
                            <option value="protanopia">{t('settings.colorblindProtanopia')}</option>
                            <option value="deuteranopia">{t('settings.colorblindDeuteranopia')}</option>
                            <option value="tritanopia">{t('settings.colorblindTritanopia')}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold tracking-wide">
                        AUTO-SAVE INTERVAL (SECONDS)
                    </label>
                    <div className="flex gap-2 mt-2">
                        <input
                            type="number"
                            value={settings.autoSaveInterval || 30}
                            onChange={(e) => updateSettings({ autoSaveInterval: parseInt(e.target.value) })}
                            className="bg-gray-800 border border-cyan-500 text-white p-2 w-24"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};