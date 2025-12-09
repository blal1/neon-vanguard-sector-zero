import React, { useState } from 'react';
import { PilotConfig, PilotModule, Consumable, EndlessLeaderboardEntry } from '../types';
import { PILOTS, CONSUMABLES, DIFFICULTIES } from '../constants';
import { useGame } from '../context/GameContext';
import { audio } from '../services/audioService';

interface EndlessLobbyProps {
    onStart: (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => void;
    onBack: () => void;
}

export const EndlessLobby: React.FC<EndlessLobbyProps> = ({ onStart, onBack }) => {
    const { getLeaderboard, isPilotUnlocked, difficulty, stats } = useGame();
    const [selectedPilot, setSelectedPilot] = useState<PilotConfig | null>(null);
    const [selectedModule, setSelectedModule] = useState<PilotModule>('ASSAULT');
    const [selectedConsumables, setSelectedConsumables] = useState<Consumable[]>([]);

    // Get top 5 leaderboard entries
    const topScores = getLeaderboard().slice(0, 5);

    const handlePilotSelect = (pilot: PilotConfig) => {
        if (isPilotUnlocked(pilot)) {
            audio.playBlip();
            setSelectedPilot(pilot);
        }
    };

    const handleModuleSelect = (module: PilotModule) => {
        audio.playBlip();
        setSelectedModule(module);
    };

    const toggleConsumable = (consumable: Consumable) => {
        audio.playBlip();
        const exists = selectedConsumables.find(c => c.id === consumable.id);
        if (exists) {
            setSelectedConsumables(selectedConsumables.filter(c => c.id !== consumable.id));
        } else {
            if (selectedConsumables.length < 4) {
                setSelectedConsumables([...selectedConsumables, { ...consumable }]);
            }
        }
    };

    const handleStart = () => {
        if (selectedPilot) {
            audio.playBlip();
            onStart(selectedPilot, selectedModule, selectedConsumables);
        }
    };

    const themeColor = selectedPilot ? selectedPilot.color : '#ffffff';

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-purple-500 pb-4 mb-6">
                <h1 className="text-5xl font-bold text-purple-400 tracking-wider mb-2">🌊 ENDLESS MODE</h1>
                <p className="text-purple-300/70 text-sm">Survive infinite waves. Push your limits. Claim the leaderboard.</p>
            </div>

            <div className="flex gap-6 flex-1">
                {/* Left Column: Setup */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Pilot Selection */}
                    <div className="border border-purple-500/30 p-4 bg-black/50">
                        <h2 className="text-purple-400 font-bold mb-3 text-lg border-b border-purple-500/30 pb-2">SELECT PILOT</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {PILOTS.map(pilot => {
                                const unlocked = isPilotUnlocked(pilot);
                                const isSelected = selectedPilot?.id === pilot.id;
                                return (
                                    <button
                                        key={pilot.id}
                                        onClick={() => handlePilotSelect(pilot)}
                                        disabled={!unlocked}
                                        className={`p-3 border transition-all ${isSelected
                                                ? `${pilot.borderColor} ${pilot.textColor} bg-current/10 shadow-[0_0_10px_currentColor]`
                                                : unlocked
                                                    ? `${pilot.borderColor} ${pilot.textColor} hover:bg-current/5`
                                                    : 'border-gray-700 text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="font-bold text-sm">{pilot.mechName}</div>
                                        {!unlocked && <div className="text-xs opacity-50">LOCKED</div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Module Selection */}
                    {selectedPilot && (
                        <div className="border border-purple-500/30 p-4 bg-black/50">
                            <h2 className="text-purple-400 font-bold mb-3 text-lg border-b border-purple-500/30 pb-2">SELECT MODULE</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {(['ASSAULT', 'DEFENSE'] as PilotModule[]).map(module => (
                                    <button
                                        key={module}
                                        onClick={() => handleModuleSelect(module)}
                                        className={`p-3 border transition-all ${selectedModule === module
                                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                                                : 'border-gray-600 text-gray-400 hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="font-bold">{module}</div>
                                        <div className="text-xs opacity-70">
                                            {module === 'ASSAULT' ? '+DMG | -HP' : '+HP | -DMG'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Consumables Selection */}
                    <div className="border border-purple-500/30 p-4 bg-black/50 flex-1">
                        <h2 className="text-purple-400 font-bold mb-3 text-lg border-b border-purple-500/30 pb-2">
                            LOADOUT ({selectedConsumables.length}/4)
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {CONSUMABLES.map(consumable => {
                                const isSelected = selectedConsumables.some(c => c.id === consumable.id);
                                return (
                                    <button
                                        key={consumable.id}
                                        onClick={() => toggleConsumable(consumable)}
                                        className={`p-2 border transition-all text-left ${isSelected
                                                ? `${consumable.color} bg-current/10`
                                                : 'border-gray-600 text-gray-400 hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="font-bold text-xs">{consumable.name}</div>
                                        <div className="text-xs opacity-60">{consumable.description}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStart}
                        disabled={!selectedPilot}
                        className={`py-4 border font-bold text-lg transition-all ${selectedPilot
                                ? 'border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse'
                                : 'border-gray-700 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {selectedPilot ? '⚡ START ENDLESS RUN' : '⚠ SELECT PILOT TO START'}
                    </button>
                </div>

                {/* Right Column: Info & Leaderboard */}
                <div className="w-96 flex flex-col gap-4">
                    {/* Info Panel */}
                    <div className="border border-blue-500/30 p-4 bg-black/50">
                        <h2 className="text-blue-400 font-bold mb-3 text-lg border-b border-blue-500/30 pb-2">🎮 MODE INFO</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Infinite waves of enemies</li>
                            <li>• Difficulty increases each wave</li>
                            <li>• <span className="text-yellow-400">Free upgrade</span> every <span className="font-bold">5 waves</span></li>
                            <li>• Boss appears every <span className="font-bold text-red-400">10 waves</span></li>
                            <li>• Earn <span className="text-green-400">score</span> based on wave, kills, and survival time</li>
                            <li>• One death ends the run</li>
                        </ul>
                    </div>

                    {/* Personal Best */}
                    <div className="border border-amber-500/30 p-4 bg-black/50">
                        <h2 className="text-amber-400 font-bold mb-2 text-lg border-b border-amber-500/30 pb-2">⭐ YOUR BEST</h2>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Highest Wave:</span>
                                <span className="text-white font-bold">{stats.endlessHighestWave || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">High Score:</span>
                                <span className="text-purple-400 font-bold">{stats.endlessHighScore || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Runs Completed:</span>
                                <span className="text-white">{stats.endlessRunsCompleted || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Difficulty:</span>
                                <span className="text-cyan-400">{DIFFICULTIES[difficulty].name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Preview */}
                    <div className="border border-green-500/30 p-4 bg-black/50 flex-1">
                        <h2 className="text-green-400 font-bold mb-3 text-lg border-b border-green-500/30 pb-2">🏆 TOP SCORES</h2>
                        {topScores.length === 0 ? (
                            <div className="text-gray-500 text-sm italic text-center py-8">
                                No scores yet. Be the first!
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topScores.map((entry, idx) => (
                                    <div key={entry.id} className="flex items-center gap-2 text-xs border-b border-gray-800 pb-1">
                                        <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                                            #{idx + 1}
                                        </span>
                                        <span className="flex-1 text-white">{PILOTS.find(p => p.id === entry.pilotId)?.mechName || 'Unknown'}</span>
                                        <span className="text-blue-400">W{entry.wave}</span>
                                        <span className="text-purple-400 font-bold">{entry.score}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="mt-4 border border-gray-600 text-gray-400 px-6 py-2 hover:bg-gray-800 transition-colors"
            >
                ← BACK TO MENU
            </button>
        </div>
    );
};
