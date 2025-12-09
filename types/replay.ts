import { PilotId, PilotModule, DifficultyLevel } from '../types';

// ============================================
// COMBAT REPLAY SYSTEM TYPES
// ============================================

export interface CombatAction {
    turn: number;
    timestamp: number; // ms from combat start
    actor: 'PLAYER' | 'ENEMY' | 'SYSTEM';
    actorName?: string; // Enemy name if actor is ENEMY
    actionType: 'ATTACK' | 'ABILITY' | 'ITEM' | 'DEFEND' | 'SPECIAL' | 'STATUS';
    abilityId?: string;
    itemId?: string;
    targetId?: string;
    damage?: number;
    healing?: number;
    result: string; // "Hit for 45 damage", "Critical! 90 damage", etc.
    isCritical?: boolean;
    playerHp?: number;
    playerMaxHp?: number;
    enemyCount?: number; // Number of alive enemies
}

export interface CombatReplay {
    id: string; // UUID
    timestamp: number; // Date.now()
    pilotId: PilotId;
    pilotName: string;
    module: PilotModule;
    stage: number;
    difficulty: DifficultyLevel;
    duration: number; // Total combat time in ms
    actions: CombatAction[];
    outcome: 'VICTORY' | 'DEFEAT';
    finalStats: {
        damageDealt: number;
        damageTaken: number;
        enemiesKilled: number;
        itemsUsed: number;
        turnsElapsed: number;
        criticalHits: number;
    };
}

export interface ReplayState {
    replays: CombatReplay[];
    maxReplays: number; // Default 10
}

export interface ReplayPlaybackState {
    replay: CombatReplay;
    currentActionIndex: number;
    isPlaying: boolean;
    playbackSpeed: 1 | 2 | 4 | 8;
}
