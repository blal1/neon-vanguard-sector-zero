import React, { useState } from 'react';
import { tts } from '../services/ttsService';
import { ScreenReaderOnly } from './ScreenReaderOnly';
import { useTranslation } from 'react-i18next';

interface TTSSettingsPanelProps {
    onClose?: () => void;
}

/**
 * TTS Settings Panel - Text-to-Speech controls
 * WCAG 2.1 compliant with proper labels
 */
export const TTSSettingsPanel: React.FC<TTSSettingsPanelProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [enabled, setEnabled] = useState(true);
    const [rate, setRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);

    const handleEnabledToggle = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        tts.setEnabled(newEnabled);
        tts.speak(newEnabled ? 'Text-to-speech enabled' : 'Text-to-speech disabled', true);
    };

    const handleRateChange = (newRate: number) => {
        setRate(newRate);
        tts.setRate(newRate);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        tts.setVolume(newVolume);
    };

    const handleTest = () => {
        tts.speak(`Testing text-to-speech at speed ${rate.toFixed(1)} and volume ${Math.round(volume * 100)} percent`, true);
    };

    return (
        <div className="border border-cyan-500 bg-black/90 p-6 max-w-md">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500 pb-2">
                🔊 Text-to-Speech (TTS)
            </h2>

            <ScreenReaderOnly>
                <p>Controls to configure the game's integrated text-to-speech</p>
            </ScreenReaderOnly>

            {/* Enable/Disable */}
            <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={handleEnabledToggle}
                        className="w-5 h-5"
                        aria-label="Enable or disable text-to-speech"
                    />
                    <span className="text-white font-bold">
                        {enabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-8">
                    Auto-read game events
                </p>
            </div>

            {/* Speed Control */}
            <div className="mb-6">
                <label htmlFor="tts-rate" className="block text-white font-bold mb-2">
                    ⚡ Speed: {rate.toFixed(1)}x
                </label>
                <input
                    type="range"
                    id="tts-rate"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => handleRateChange(Number(e.target.value))}
                    disabled={!enabled}
                    className="w-full"
                    aria-label="Speech rate"
                    aria-valuemin={0.5}
                    aria-valuemax={2}
                    aria-valuenow={rate}
                    aria-valuetext={`${rate.toFixed(1)} times normal speed`}
                    aria-describedby="tts-rate-help"
                />
                <p id="tts-rate-help" className="text-xs text-gray-400 mt-1">
                    0.5x = Slow | 1.0x = Normal | 2.0x = Fast
                </p>
            </div>

            {/* Volume Control */}
            <div className="mb-6">
                <label htmlFor="tts-volume" className="block text-white font-bold mb-2">
                    🔊 Volume: {Math.round(volume * 100)}%
                </label>
                <input
                    type="range"
                    id="tts-volume"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    disabled={!enabled}
                    className="w-full"
                    aria-label="TTS volume"
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={volume}
                    aria-valuetext={`${Math.round(volume * 100)} percent of max volume`}
                    aria-describedby="tts-volume-help"
                />
                <p id="tts-volume-help" className="text-xs text-gray-400 mt-1">
                    0% = Muted | 100% = Max volume
                </p>
            </div>

            {/* Test Button */}
            <div className="mb-6">
                <button
                    onClick={handleTest}
                    disabled={!enabled}
                    className={`w-full border-2 px-4 py-2 font-bold transition-colors ${enabled
                        ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black'
                        : 'border-gray-700 text-gray-600 cursor-not-allowed'
                        }`}
                    aria-label="Test current TTS settings"
                >
                    🎤 TEST VOICE
                </button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="border border-gray-700 bg-gray-900/50 p-3 text-xs">
                <div className="text-gray-400 font-bold mb-2">⌨️ Keyboard Shortcuts:</div>
                <div className="space-y-1 text-gray-500">
                    <div><kbd className="bg-gray-800 px-2 py-0.5 rounded">Ctrl</kbd> + <kbd className="bg-gray-800 px-2 py-0.5 rounded">T</kbd> - Toggle TTS</div>
                    <div><kbd className="bg-gray-800 px-2 py-0.5 rounded">↑</kbd> <kbd className="bg-gray-800 px-2 py-0.5 rounded">↓</kbd> - Navigate</div>
                    <div><kbd className="bg-gray-800 px-2 py-0.5 rounded">Tab</kbd> - Keyboard navigation</div>
                </div>
            </div>

            {/* Close Button */}
            {onClose && (
                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full border border-white text-white px-4 py-2 hover:bg-white hover:text-black transition-colors font-bold"
                        aria-label="Close TTS settings"
                    >
                        CLOSE
                    </button>
                </div>
            )}

            {/* Info */}
            <div className="mt-4 text-xs text-gray-500 text-center">
                ℹ️ Uses your browser's Web Speech API
            </div>
        </div>
    );
};
