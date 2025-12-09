import { Achievement } from '../types';

/**
 * All achievements in the game
 * 18 unique achievements across 5 categories
 */
export const ACHIEVEMENTS: Achievement[] = [
    // ==========================================
    // COMBAT ACHIEVEMENTS (4)
    // ==========================================
    {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Win your first combat.',
        category: 'COMBAT',
        icon: '⚔️',
        rarity: 'COMMON',
        condition: (stats, profile) => profile.missionsCompleted >= 1
    },
    {
        id: 'centurion',
        name: 'Centurion',
        description: 'Eliminate 100 enemies.',
        category: 'COMBAT',
        icon: '💀',
        rarity: 'COMMON',
        condition: (stats, profile) => profile.totalKills >= 100
    },
    {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Land 50 critical hits.',
        category: 'COMBAT',
        icon: '🎯',
        rarity: 'RARE',
        condition: (stats) => stats.criticalHits >= 50
    },
    {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat 5 bosses.',
        category: 'COMBAT',
        icon: '👹',
        rarity: 'RARE',
        condition: (stats) => stats.bossesDefeated >= 5
    },

    // ==========================================
    // SURVIVAL ACHIEVEMENTS (4)
    // ==========================================
    {
        id: 'david_vs_goliath',
        name: 'David vs Goliath',
        description: 'Defeat a boss with less than 20% HP.',
        category: 'SURVIVAL',
        icon: '🏆',
        rarity: 'EPIC',
        condition: (stats) => stats.bossesDefeatedLowHp >= 1
    },
    {
        id: 'iron_curtain',
        name: 'Iron Curtain',
        description: 'Complete a run without taking damage.',
        category: 'SURVIVAL',
        icon: '🛡️',
        rarity: 'LEGENDARY',
        condition: (stats) => stats.perfectRuns >= 1
    },
    {
        id: 'pacifist',
        name: 'Pacifist',
        description: 'Win a stage without using consumables.',
        category: 'SURVIVAL',
        icon: '☮️',
        rarity: 'RARE',
        condition: (stats, profile) => {
            // Only checks if no consumables used in at least one run
            return stats.noConsumablesUsedThisRun && profile.missionsCompleted >= 1;
        }
    },
    {
        id: 'deep_dive',
        name: 'Deep Dive',
        description: 'Reach Stage 15.',
        category: 'SURVIVAL',
        icon: '🌊',
        rarity: 'EPIC',
        condition: (stats) => stats.highestStageReached >= 15
    },

    // ==========================================
    // SPEED ACHIEVEMENTS (2)
    // ==========================================
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Win a combat in under 30 seconds.',
        category: 'SPEED',
        icon: '⚡',
        rarity: 'RARE',
        condition: (stats) => stats.fastestWinTime > 0 && stats.fastestWinTime <= 30
    },
    {
        id: 'lightning_fast',
        name: 'Lightning Fast',
        description: 'Complete a full run (Stage 1-5) in under 10 minutes.',
        category: 'SPEED',
        icon: '⚡⚡',
        rarity: 'EPIC',
        condition: (stats) => stats.fastestWinTime > 30 && stats.fastestWinTime <= 600
    },

    // ==========================================
    // COLLECTION ACHIEVEMENTS (3)
    // ==========================================
    {
        id: 'collector',
        name: 'The Collector',
        description: 'Acquire all 6 augmentations in a single run.',
        category: 'COLLECTION',
        icon: '💎',
        rarity: 'EPIC',
        condition: (stats) => stats.augmentationsOwned.length >= 6
    },
    {
        id: 'pilot_roster',
        name: 'Full Roster',
        description: 'Unlock all 4 pilots.',
        category: 'COLLECTION',
        icon: '👥',
        rarity: 'RARE',
        condition: (stats) => stats.pilotsUnlocked.length >= 4
    },
    {
        id: 'veteran',
        name: 'Veteran',
        description: 'Reach Level 10.',
        category: 'COLLECTION',
        icon: '⭐',
        rarity: 'COMMON',
        condition: (stats, profile) => profile.level >= 10
    },

    // ==========================================
    // MASTERY ACHIEVEMENTS (5)
    // ==========================================
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Win 5 combats in a row.',
        category: 'MASTERY',
        icon: '🔥',
        rarity: 'RARE',
        condition: (stats) => stats.currentWinStreak >= 5
    },
    {
        id: 'architect_nemesis',
        name: "Architect's Nemesis",
        description: 'Defeat The Architect (Stage 25).',
        category: 'MASTERY',
        icon: '👑',
        rarity: 'LEGENDARY',
        condition: (stats) => stats.highestStageReached >= 25 && stats.bossesDefeated >= 5
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Defeat a boss without taking any damage.',
        category: 'MASTERY',
        icon: '💯',
        rarity: 'LEGENDARY',
        condition: (stats) => stats.bossesPerfect >= 1
    },
    {
        id: 'marathon_runner',
        name: 'Marathon Runner',
        description: 'Play for over 2 hours (total).',
        category: 'MASTERY',
        icon: '⏱️',
        rarity: 'COMMON',
        condition: (stats) => stats.totalPlayTimeSeconds >= 7200 // 2 hours
    },
    {
        id: 'survival_king',
        name: 'Survival King',
        description: 'Win 10 Survival missions.',
        category: 'MASTERY',
        icon: '⌛',
        rarity: 'EPIC',
        condition: (stats) => stats.survivalWins >= 10
    },

    // ==========================================
    // HIDDEN ACHIEVEMENTS (3)
    // ==========================================
    {
        id: 'true_survivor',
        name: '???',
        description: '???',
        category: 'SURVIVAL',
        icon: '💎',
        rarity: 'LEGENDARY',
        hidden: true,
        condition: (stats) => stats.highestStageReached >= 25 && stats.noDamageTakenThisRun
    },
    {
        id: 'ghost',
        name: '???',
        description: '???',
        category: 'SPEED',
        icon: '👻',
        rarity: 'EPIC',
        hidden: true,
        condition: (stats) => stats.runsCompleted >= 1 && stats.noConsumablesUsedThisRun && stats.noDamageTakenThisRun
    },
    {
        id: 'destroyer',
        name: '???',
        description: '???',
        category: 'COMBAT',
        icon: '🔥',
        rarity: 'LEGENDARY',
        hidden: true,
        condition: (stats, profile) => profile.totalKills >= 1000
    }
];

/**
 * Helper: Get achievement by ID
 */
export const getAchievementById = (id: string): Achievement | undefined => {
    return ACHIEVEMENTS.find(a => a.id === id);
};

/**
 * Helper: Get achievements by category
 */
export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
    return ACHIEVEMENTS.filter(a => a.category === category);
};

/**
 * Helper: Get achievements by rarity
 */
export const getAchievementsByRarity = (rarity: Achievement['rarity']): Achievement[] => {
    return ACHIEVEMENTS.filter(a => a.rarity === rarity);
};

/**
 * Helper: Get rarity color for UI
 */
export const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
        case 'COMMON': return 'text-gray-400';
        case 'RARE': return 'text-blue-400';
        case 'EPIC': return 'text-purple-500';
        case 'LEGENDARY': return 'text-yellow-500';
    }
};

/**
 * Helper: Get category icon
 */
export const getCategoryIcon = (category: Achievement['category']): string => {
    switch (category) {
        case 'COMBAT': return '⚔️';
        case 'SURVIVAL': return '🛡️';
        case 'SPEED': return '⚡';
        case 'COLLECTION': return '💎';
        case 'MASTERY': return '👑';
    }
};
