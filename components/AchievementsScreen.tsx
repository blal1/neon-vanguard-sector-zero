import React, { useState } from 'react';
import { Achievement } from '../types';
import { ACHIEVEMENTS, getAchievementsByCategory, getRarityColor, getCategoryIcon } from '../constants/achievements';
import { useGame } from '../context/GameContext';
import { audio } from '../services/audioService';
import { useTranslation } from 'react-i18next';

interface AchievementsScreenProps {
    onBack: () => void;
}

type CategoryFilter = 'ALL' | Achievement['category'];
type StatusFilter = 'ALL' | 'UNLOCKED' | 'LOCKED';

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { achievements, stats, profile } = useGame();
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    const isUnlocked = (achievementId: string): boolean => {
        return achievements.some(a => a.achievementId === achievementId);
    };

    const getUnlockDate = (achievementId: string): string => {
        const ach = achievements.find(a => a.achievementId === achievementId);
        if (ach) {
            return new Date(ach.unlockedAt).toLocaleDateString();
        }
        return '';
    };

    // Filter achievements
    let filteredAchievements = ACHIEVEMENTS;

    // Hide hidden achievements until unlocked
    filteredAchievements = filteredAchievements.filter(a => !a.hidden || isUnlocked(a.id));

    if (categoryFilter !== 'ALL') {
        filteredAchievements = getAchievementsByCategory(categoryFilter).filter(a => !a.hidden || isUnlocked(a.id));
    }

    if (statusFilter === 'UNLOCKED') {
        filteredAchievements = filteredAchievements.filter(a => isUnlocked(a.id));
    } else if (statusFilter === 'LOCKED') {
        filteredAchievements = filteredAchievements.filter(a => !isUnlocked(a.id));
    }

    const totalUnlocked = achievements.length;
    const totalAchievements = ACHIEVEMENTS.length;
    const completionPercent = Math.floor((totalUnlocked / totalAchievements) * 100);

    const handleCategoryChange = (category: CategoryFilter) => {
        audio.playHover();
        setCategoryFilter(category);
    };

    const handleStatusChange = (status: StatusFilter) => {
        audio.playHover();
        setStatusFilter(status);
    };

    return (
        <div className="flex flex-col h-full text-white">
            {/* Header */}
            <div className="border-b-2 border-purple-500 pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-4xl font-bold text-purple-400 tracking-wider">
                        🏆 ACHIEVEMENTS
                    </h1>
                    <button
                        onClick={() => { audio.playBlip(); onBack(); }}
                        className="border border-gray-500 text-gray-400 px-4 py-2 hover:bg-gray-800 transition-colors"
                    >
                        [ BACK ]
                    </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{t('achievements.progress')}</span>
                            <span className="text-purple-400 font-bold">{totalUnlocked}/{totalAchievements} ({completionPercent}%)</span>
                        </div>
                        <div className="h-4 bg-gray-900 border border-purple-700">
                            <div
                                className="h-full bg-purple-500 transition-all duration-500"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                {/* Category Filter */}
                <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-2 uppercase">{t('achievements.category')}</div>
                    <div className="flex gap-2 flex-wrap">
                        {(['ALL', 'COMBAT', 'SURVIVAL', 'SPEED', 'COLLECTION', 'MASTERY'] as CategoryFilter[]).map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-3 py-1 border transition-colors text-sm ${categoryFilter === cat
                                    ? 'border-purple-500 bg-purple-900/50 text-purple-300'
                                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                    }`}
                            >
                                {cat !== 'ALL' && getCategoryIcon(cat as Achievement['category'])} {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <div className="text-xs text-gray-500 mb-2 uppercase">{t('achievements.status')}</div>
                    <div className="flex gap-2">
                        {(['ALL', 'UNLOCKED', 'LOCKED'] as StatusFilter[]).map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-3 py-1 border transition-colors text-sm ${statusFilter === status
                                    ? 'border-purple-500 bg-purple-900/50 text-purple-300'
                                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Achievement Grid */}
                <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto pr-2">
                    {filteredAchievements.map(achievement => {
                        const unlocked = isUnlocked(achievement.id);
                        const rarityColor = getRarityColor(achievement.rarity);
                        const borderColor = unlocked
                            ? {
                                'COMMON': 'border-gray-500',
                                'RARE': 'border-blue-500',
                                'EPIC': 'border-purple-500',
                                'LEGENDARY': 'border-yellow-500'
                            }[achievement.rarity]
                            : 'border-gray-800';

                        return (
                            <div
                                key={achievement.id}
                                className={`border-2 ${borderColor} p-4 transition-all ${unlocked
                                    ? 'bg-black/50 hover:scale-105 cursor-pointer'
                                    : 'bg-gray-900/30 opacity-60'
                                    }`}
                                title={unlocked ? achievement.description : '???'}
                            >
                                {/* Icon */}
                                <div className="text-5xl text-center mb-2">
                                    {unlocked ? achievement.icon : '🔒'}
                                </div>

                                {/* Name */}
                                <div className={`text-center font-bold mb-1 ${unlocked ? rarityColor : 'text-gray-600'}`}>
                                    {unlocked ? achievement.name : '???'}
                                </div>

                                {/* Description */}
                                <div className="text-xs text-center text-gray-400 mb-2 min-h-[40px]">
                                    {unlocked ? achievement.description : 'Complete unknown task.'}
                                </div>

                                {/* Rarity & Date */}
                                <div className="text-xs text-center pt-2 border-t border-gray-800">
                                    {unlocked ? (
                                        <>
                                            <div className={rarityColor}>{achievement.rarity}</div>
                                            <div className="text-gray-600">{getUnlockDate(achievement.id)}</div>
                                        </>
                                    ) : (
                                        <div className="text-gray-700">LOCKED</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Panel */}
                <div className="w-80 border-l-2 border-purple-700 pl-4 overflow-y-auto">
                    <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-purple-700 pb-2">
                        📊 STATISTICS
                    </h2>

                    <div className="space-y-3 text-sm">
                        {/* Combat Stats */}
                        <div>
                            <div className="text-gray-500 uppercase text-xs mb-1">Combat</div>
                            <div className="space-y-1">
                                <StatRow label="Total Kills" value={profile.totalKills} />
                                <StatRow label="Bosses Defeated" value={stats.bossesDefeated} />
                                <StatRow label="Critical Hits" value={stats.criticalHits} />
                                <StatRow label="Damage Dealt" value={stats.totalDamageDealt} />
                            </div>
                        </div>

                        {/* Survival Stats */}
                        <div>
                            <div className="text-gray-500 uppercase text-xs mb-1">Survival</div>
                            <div className="space-y-1">
                                <StatRow label="Perfect Runs" value={stats.perfectRuns} />
                                <StatRow label="Highest Stage" value={stats.highestStageReached} />
                                <StatRow label="Survival Wins" value={stats.survivalWins} />
                                <StatRow label="Defense Wins" value={stats.defenseWins} />
                            </div>
                        </div>

                        {/* Speed Stats */}
                        <div>
                            <div className="text-gray-500 uppercase text-xs mb-1">Speed</div>
                            <div className="space-y-1">
                                <StatRow label="Fastest Win" value={stats.fastestWinTime > 0 ? `${stats.fastestWinTime}s` : 'N/A'} />
                                <StatRow label="Current Streak" value={stats.currentWinStreak} />
                                <StatRow label="Longest Streak" value={stats.longestWinStreak} />
                            </div>
                        </div>

                        {/* Collection Stats */}
                        <div>
                            <div className="text-gray-500 uppercase text-xs mb-1">Collection</div>
                            <div className="space-y-1">
                                <StatRow label="Level" value={profile.level} />
                                <StatRow label="Pilots Unlocked" value={`${stats.pilotsUnlocked.length}/4`} />
                                <StatRow label="Augmentations" value={stats.augmentationsOwned.length} />
                            </div>
                        </div>

                        {/* Time Stats */}
                        <div>
                            <div className="text-gray-500 uppercase text-xs mb-1">Time</div>
                            <div className="space-y-1">
                                <StatRow label="Playtime" value={`${Math.floor(stats.totalPlayTimeSeconds / 3600)}h ${Math.floor((stats.totalPlayTimeSeconds % 3600) / 60)}m`} />
                                <StatRow label="Missions Completed" value={profile.missionsCompleted} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component
const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-400">{label}:</span>
        <span className="text-white font-bold">{value}</span>
    </div>
);
