import React from 'react';
import { EndlessLeaderboardEntry, PilotId } from '../types';
import { PILOTS } from '../constants';

interface EndlessGameOverModalProps {
    wave: number;
    kills: number;
    score: number;
    survivalTime: string;
    pilotId: PilotId;
    leaderboardRank: number; // 1-based rank, 0 if not in top 100
    onRetry: () => void;
    onBackToMenu: () => void;
    onViewLeaderboard: () => void;
}

export const EndlessGameOverModal: React.FC<EndlessGameOverModalProps> = ({
    wave,
    kills,
    score,
    survivalTime,
    pilotId,
    leaderboardRank,
    onRetry,
    onBackToMenu,
    onViewLeaderboard
}) => {
    const pilot = PILOTS.find(p => p.id === pilotId);
    const isNewRecord = leaderboardRank > 0 && leaderboardRank <= 10;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="border-4 border-red-600 bg-black p-8 max-w-3xl w-full shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-6xl font-bold text-red-500 mb-3 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                        RUN TERMINATED
                    </h1>
                    <p className="text-red-400 text-lg">Your defense has fallen to the endless waves</p>
                </div>

                {/* Pilot Info */}
                {pilot && (
                    <div className={`text-center mb-6 py-2 ${pilot.textColor}`}>
                        <span className="text-sm opacity-70">Pilot: </span>
                        <span className="font-bold">{pilot.mechName}</span>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 border-y border-red-600/30 py-6">
                    <div className="text-center border-r border-red-600/30">
                        <div className="text-gray-400 text-sm mb-1">Wave Reached</div>
                        <div className="text-white text-4xl font-bold text-purple-400">{wave}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Final Score</div>
                        <div className="text-white text-4xl font-bold text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                    <div className="text-center border-r border-red-600/30">
                        <div className="text-gray-400 text-sm mb-1">Total Kills</div>
                        <div className="text-white text-2xl font-bold">{kills}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Survival Time</div>
                        <div className="text-white text-2xl font-bold">{survivalTime}</div>
                    </div>
                </div>

                {/* Leaderboard Notification */}
                {leaderboardRank > 0 && (
                    <div className={`text-center mb-6 p-4 border-2 ${isNewRecord
                            ? 'border-yellow-500 bg-yellow-900/20'
                            : 'border-blue-500 bg-blue-900/20'
                        }`}>
                        <div className={`text-xl font-bold mb-1 ${isNewRecord ? 'text-yellow-400' : 'text-blue-400'
                            }`}>
                            {isNewRecord && '🏆 '}LEADERBOARD RANK: #{leaderboardRank}
                            {isNewRecord && ' 🏆'}
                        </div>
                        <div className="text-sm text-gray-400">
                            {isNewRecord ? 'New personal best!' : 'Score saved to leaderboard'}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={onRetry}
                        className="py-3 border-2 border-purple-500 text-purple-400 font-bold hover:bg-purple-500/20 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    >
                        ↻ RETRY
                    </button>
                    <button
                        onClick={onViewLeaderboard}
                        className="py-3 border-2 border-yellow-500 text-yellow-400 font-bold hover:bg-yellow-500/20 transition-all hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                    >
                        🏆 LEADERBOARD
                    </button>
                    <button
                        onClick={onBackToMenu}
                        className="py-3 border-2 border-gray-600 text-gray-400 font-bold hover:bg-gray-800 transition-all"
                    >
                        ← MENU
                    </button>
                </div>
            </div>
        </div>
    );
};
