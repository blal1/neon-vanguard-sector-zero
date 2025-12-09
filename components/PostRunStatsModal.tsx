import React from 'react';

interface PostRunStatsModalProps {
    runStats: {
        damageDealt: number;
        enemiesKilled: number;
        timeElapsed: string;
        hazardsEncountered: number;
        itemsUsed: number;
        scrapCollected: number;
    };
    isVictory: boolean;
    onViewFullStats: () => void;
    onContinue: () => void;
}

export const PostRunStatsModal: React.FC<PostRunStatsModalProps> = ({
    runStats,
    isVictory,
    onViewFullStats,
    onContinue
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-2xl w-full mx-4 border-2 border-cyan-500 bg-black p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-cyan-400 tracking-widest mb-2">
                        {isVictory ? '✓ MISSION COMPLETE' : '✗ MISSION FAILED'}
                    </h2>
                    <div className="h-1 bg-cyan-500 w-32 mx-auto"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-gray-700 bg-gray-900/50 p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Damage Dealt</div>
                        <div className="text-2xl font-bold text-red-400">{runStats.damageDealt.toLocaleString()}</div>
                    </div>
                    <div className="border border-gray-700 bg-gray-900/50 p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Enemies Killed</div>
                        <div className="text-2xl font-bold text-orange-400">{runStats.enemiesKilled}</div>
                    </div>
                    <div className="border border-gray-700 bg-gray-900/50 p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Time Elapsed</div>
                        <div className="text-2xl font-bold text-blue-400">{runStats.timeElapsed}</div>
                    </div>
                    <div className=" border border-gray-700 bg-gray-900/50 p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Scrap Collected</div>
                        <div className="text-2xl font-bold text-yellow-400">{runStats.scrapCollected}</div>
                    </div>
                    <div className="border border-gray-700 bg-gray-900/50 p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Hazards Faced</div>
                        <div className="text-2xl font-bold text-green-400">{runStats.hazardsEncountered}</div>
                    </div>
                    <div className="border border-gray-700 bg-gray-900/50 p-4">
                        <div className="text-xs text-gray-400 uppercase mb-1">Items Used</div>
                        <div className="text-2xl font-bold text-purple-400">{runStats.itemsUsed}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onViewFullStats}
                        className="border border-cyan-500 text-cyan-400 px-6 py-3 hover:bg-cyan-900/50 transition-all font-bold tracking-wide"
                    >
                        📊 VIEW FULL STATS
                    </button>
                    <button
                        onClick={onContinue}
                        className={`border px-6 py-3 transition-all font-bold tracking-wide ${isVictory
                                ? 'border-green-500 text-green-400 hover:bg-green-900/50'
                                : 'border-red-500 text-red-400 hover:bg-red-900/50'
                            }`}
                    >
                        {isVictory ? '→ CONTINUE' : '→ RETURN'}
                    </button>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>
            </div>
        </div>
    );
};
