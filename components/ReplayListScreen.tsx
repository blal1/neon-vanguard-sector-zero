import React from 'react';
import { CombatReplay } from '../types/replay';
import { audio } from '../services/audioService';
import { useTranslation } from 'react-i18next';

interface ReplayListScreenProps {
    replays: CombatReplay[];
    onBack: () => void;
    onSelectReplay: (replayId: string) => void;
    onDeleteReplay: (replayId: string) => void;
    onClearAll: () => void;
    maxReplays: number;
}

export const ReplayListScreen: React.FC<ReplayListScreenProps> = ({
    replays,
    onBack,
    onSelectReplay,
    onDeleteReplay,
    onClearAll,
    maxReplays
}) => {
    const { t } = useTranslation();
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSelectReplay = (id: string) => {
        audio.playBlip();
        onSelectReplay(id);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        audio.playBlip();
        onDeleteReplay(id);
    };

    const handleClearAll = () => {
        if (confirm('Delete all replays? This cannot be undone.')) {
            audio.playBlip();
            onClearAll();
        }
    };

    return (
        <div className="w-full h-full bg-black text-green-500 font-mono p-6 overflow-auto">
            {/* Header */}
            <div className="border-2 border-green-500 p-4 mb-6 bg-green-900/10">
                <div className="text-cyan-400 text-xl mb-2">
                    ═══════════════════════════════════════════════
                </div>
                <h1 className="text-3xl font-bold text-cyan-400 text-center tracking-wider">
                    🎬 COMBAT REPLAYS
                </h1>
                <div className="text-cyan-400 text-xl mt-2">
                    ═══════════════════════════════════════════════
                </div>
                <p className="text-sm text-gray-400 text-center mt-2">
                    {replays.length} / {maxReplays} replays stored
                </p>
            </div>

            {/* Replay List */}
            {replays.length > 0 ? (
                <div className="space-y-3 mb-6">
                    {replays.map(replay => (
                        <div
                            key={replay.id}
                            className="border-2 border-green-700 p-4 hover:bg-green-900/20 hover:border-green-500 cursor-pointer transition-all"
                            onClick={() => handleSelectReplay(replay.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="text-cyan-400 font-bold text-lg flex items-center gap-3">
                                        <span>{replay.pilotName}</span>
                                        <span className="text-gray-600">|</span>
                                        <span className="text-yellow-400 text-sm">
                                            Stage {replay.stage}
                                        </span>
                                        <span className="text-gray-600">|</span>
                                        <span className="text-sm text-purple-400">
                                            {replay.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        📅 {formatDate(replay.timestamp)}
                                    </div>
                                </div>
                                <div className={`px-4 py-1 font-bold ${replay.outcome === 'VICTORY'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-red-600 text-white'
                                    }`}>
                                    {replay.outcome}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-5 gap-3 mt-3 text-xs border-t border-green-800 pt-3">
                                <div className="text-center">
                                    <div className="text-gray-500">{t('replay.duration')}</div>
                                    <div className="text-cyan-400 font-bold">{formatDuration(replay.duration)}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500">Damage</div>
                                    <div className="text-orange-400 font-bold">{replay.finalStats.damageDealt}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500">Kills</div>
                                    <div className="text-green-400 font-bold">{replay.finalStats.enemiesKilled}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500">Items</div>
                                    <div className="text-yellow-400 font-bold">{replay.finalStats.itemsUsed}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500">{t('replay.actions')}</div>
                                    <div className="text-purple-400 font-bold">{replay.actions.length}</div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <div className="mt-3 border-t border-green-800 pt-2 flex justify-end">
                                <button
                                    onClick={(e) => handleDelete(replay.id, e)}
                                    className="text-xs text-red-400 hover:text-red-300 border border-red-700 px-3 py-1 hover:bg-red-900/30 transition-all"
                                >
                                    🗑 DELETE
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border-2 border-gray-700 p-12 text-center">
                    <div className="text-6xl mb-4 opacity-30">🎬</div>
                    <div className="text-xl text-gray-600 mb-2">{t('replay.noReplays')}</div>
                    <div className="text-sm text-gray-700">{t('replay.completeRun')}</div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-3 border-t-2 border-green-500 pt-4 mt-6">
                <button
                    onClick={() => { audio.playBlip(); onBack(); }}
                    className="px-6 py-3 border-2 border-green-500 text-green-400 hover:bg-green-900/30 transition-all font-bold"
                >
                    &lt; BACK TO MENU
                </button>
                {replays.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="px-6 py-3 border-2 border-red-500 text-red-400 hover:bg-red-900/30 transition-all"
                    >
                        🗑 CLEAR ALL REPLAYS
                    </button>
                )}
                <div className="flex-1" />
                <div className="text-xs text-gray-600 self-center">
                    Storage: ~{Math.round(replays.length * 25)}KB
                </div>
            </div>
        </div>
    );
};
