// ============================================
// CODEX / LORE SYSTEM TYPES
// ============================================

export type CodexCategory = 'PILOT' | 'ENEMY' | 'LORE' | 'AUDIO_LOG';

export interface CodexEntry {
    id: string;
    category: CodexCategory;
    title: string;
    subtitle?: string;
    content: string; // Markdown formatted
    isUnlocked: boolean;
    unlockedDate?: number;
    readCount: number;
    isNew?: boolean; // True if unlocked but not read
    tags?: string[];
    relatedEntries?: string[]; // IDs of related entries
}

export interface PilotCodexEntry extends CodexEntry {
    category: 'PILOT';
    pilotId: PilotId;
    mechClass: string;
    origin: string;
}

export interface EnemyCodexEntry extends CodexEntry {
    category: 'ENEMY';
    enemyType: string;
    threatLevel: 1 | 2 | 3 | 4 | 5;
    defeatedCount: number;
    defeatsRequired: number; // Number of defeats needed to unlock
}

export interface LoreCodexEntry extends CodexEntry {
    category: 'LORE';
    chapter?: number;
    location?: string;
}

export interface AudioLogEntry extends CodexEntry {
    category: 'AUDIO_LOG';
    speaker: string;
    location: string;
    timestamp: string; // In-universe timestamp
}

export interface AugmentationCodexEntry extends CodexEntry {
    category: 'AUGMENTATION';
    augmentationId: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    synergyBonus?: string; // Description of synergy bonus if any
}

export interface CodexState {
    entries: Record<string, CodexEntry>;
    enemyDefeatCounts: Record<string, number>; // Track defeats for unlock
    unlockedCount: number;
    totalCount: number;
    lastUnlockedId?: string;
    newEntryIds: string[]; // Queue of unread entries
}

export interface CodexProgress {
    unlocked: number;
    total: number;
    percent: number;
    byCategory: {
        PILOT: { unlocked: number; total: number };
        ENEMY: { unlocked: number; total: number };
        LORE: { unlocked: number; total: number };
        AUDIO_LOG: { unlocked: number; total: number };
    };
}
