import React, { useState } from 'react';
import { AudioSettings } from './AudioSettings';
import { VisualSettings } from './VisualSettings';
import { KeybindingSettings } from './KeybindingSettings';
import { audio } from '../services/audioService';
import { useTranslation } from 'react-i18next';

type SettingsTab = 'audio' | 'visual' | 'controls';

interface SettingsScreenProps {
    onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('audio');
    const { t } = useTranslation();

    const tabs: { id: SettingsTab; icon: string; label: string }[] = [
        { id: 'audio', icon: '🔊', label: 'AUDIO' },
        { id: 'visual', icon: '🎨', label: 'VISUAL' },
        { id: 'controls', icon: '⌨️', label: 'CONTROLS' },
    ];

    const handleTabChange = (tab: SettingsTab) => {
        setActiveTab(tab);
        audio.playBlip();
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 font-mono">
            <div className="bg-gray-900 border-2 border-cyan-500 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b-2 border-cyan-500 p-4 flex justify-between items-center bg-cyan-900/20">
                    <h2 className="text-2xl text-cyan-400 font-bold tracking-wider">
                        ⚙️ SETTINGS
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-400 text-xl px-3 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-cyan-700 bg-gray-900">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex-1 px-6 py-3 text-sm font-bold tracking-wider transition-all ${activeTab === tab.id
                                    ? 'bg-cyan-900/50 text-cyan-400 border-b-2 border-cyan-400'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-black/50">
                    {activeTab === 'audio' && <AudioSettings />}
                    {activeTab === 'visual' && <VisualSettings />}
                    {activeTab === 'controls' && <KeybindingSettings />}
                </div>

                {/* Footer */}
                <div className="border-t border-cyan-700 p-4 flex justify-end bg-gray-900">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold tracking-wider transition-colors"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
};
