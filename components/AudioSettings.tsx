import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { audio } from '../services/audioService';
import { voiceLines } from '../services/voiceLineService';
import { PilotId } from '../types';
import { useTranslation } from 'react-i18next';

interface VolumeSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ label, value, onChange }) => {
    const percentage = Math.round(value * 100);

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold">{label}</label>
                <span className="text-xs text-gray-400">{percentage}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => onChange(parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
        </div>
    );
};

export const AudioSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useGame();
    const [audioStatus, setAudioStatus] = useState({ loaded: 0, total: 0, failed: 0 });
    const [ttsSupported, setTtsSupported] = useState(true);

    useEffect(() => {
        // Check audio loading status
        const status = audio.getLoadStatus();
        setAudioStatus(status);

        // Check TTS support
        setTtsSupported(voiceLines.isSupported());
    }, []);

    const handleVolume = (v: number) => {
        audio.setMasterVolume(v);
        updateSettings({ volume: v });
    };

    const handleMusicVolume = (v: number) => {
        audio.setMusicVolume(v);
        updateSettings({ musicVolume: v });
    };

    const handleSfxVolume = (v: number) => {
        audio.setSfxVolume(v);
        updateSettings({ sfxVolume: v });
    };

    const handleMute = () => {
        const newMuted = !settings.isMuted;
        audio.setMuted(newMuted);
        updateSettings({ isMuted: newMuted });
        audio.playBlip();
    };

    const handleVoiceLines = () => {
        updateSettings({ voiceLinesEnabled: !settings.voiceLinesEnabled });
        audio.playBlip();
    };

    const testVoiceLine = () => {
        voiceLines.speak('Audio systems online. All systems nominal.', PilotId.VANGUARD);
    };

    return (
        <div className="border border-cyan-500 p-6 bg-black/50">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400 tracking-wider">
                🔊 AUDIO SETTINGS
            </h3>

            {/* Mute Button */}
            <button
                onClick={handleMute}
                className={`w-full mb-6 px-6 py-3 border-2 font-bold tracking-wider transition-all ${settings.isMuted
                    ? 'bg-red-900/30 border-red-500 text-red-400 hover:bg-red-900/50'
                    : 'border-cyan-500 text-cyan-400 hover:bg-cyan-900/30'
                    }`}
            >
                {settings.isMuted ? '🔇 CLICK TO UNMUTE' : '🔊 MUTE ALL AUDIO'}
            </button>

            {/* Volume Sliders */}
            <div className={settings.isMuted ? 'opacity-50 pointer-events-none' : ''}>
                <VolumeSlider
                    label="🎛️ MASTER VOLUME"
                    value={settings.volume}
                    onChange={handleVolume}
                />

                <VolumeSlider
                    label="🎵 MUSIC VOLUME"
                    value={settings.musicVolume}
                    onChange={handleMusicVolume}
                />

                <VolumeSlider
                    label="🔫 SFX VOLUME"
                    value={settings.sfxVolume}
                    onChange={handleSfxVolume}
                />
            </div>

            {/* Voice Lines Toggle */}
            <div className="mt-6 pt-4 border-t border-cyan-700">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-900/20 p-2 transition-colors">
                    <input
                        type="checkbox"
                        checked={settings.voiceLinesEnabled}
                        onChange={handleVoiceLines}
                        disabled={!ttsSupported}
                        className="w-5 h-5 accent-cyan-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm font-bold tracking-wide">
                        🎙️ ENABLE PILOT VOICE LINES
                    </span>
                </label>

                {!ttsSupported ? (
                    <p className="text-xs text-red-400 mt-2 ml-8 flex items-center gap-2">
                        ⚠️ Web Speech API not supported in this browser
                    </p>
                ) : (
                    <p className="text-xs text-gray-500 mt-2 ml-8">
                        Synthetic voice announcements from your pilot during combat
                    </p>
                )}

                {ttsSupported && settings.voiceLinesEnabled && (
                    <button
                        onClick={testVoiceLine}
                        className="w-full mt-2 ml-8 mr-8 px-4 py-2 border border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 transition-colors text-xs"
                    >
                        🎙️ TEST VOICE LINE
                    </button>
                )}
            </div>

            {/* Audio Status Info */}
            {audioStatus.failed > 0 && (
                <div className="mt-4 pt-4 border-t border-yellow-700/50 bg-yellow-900/10 p-3">
                    <p className="text-xs text-yellow-400 font-bold">
                        ⚠️ Audio Status: {audioStatus.loaded}/{audioStatus.total} loaded
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {audioStatus.failed} files using procedural fallback sounds
                    </p>
                </div>
            )}

            {/* Test Sound Button */}
            <button
                onClick={() => {
                    audio.playBlip();
                    audio.playShoot('laser');
                }}
                className="w-full mt-4 px-4 py-2 border border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm"
            >
                🔊 TEST SOUND
            </button>
        </div>
    );
};
