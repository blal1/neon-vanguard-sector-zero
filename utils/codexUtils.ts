import { CodexEntry, CodexState, CodexProgress, CodexCategory } from '../types/codex';
import { ALL_CODEX_ENTRIES } from '../constants/codexData';
import { PilotId } from '../types';

// Initialize codex state from all entries
export const initializeCodex = (): CodexState => {
    const entries: Record<string, CodexEntry> = {};

    ALL_CODEX_ENTRIES.forEach(entry => {
        entries[entry.id] = {
            ...entry,
            isUnlocked: false,
            readCount: 0,
            isNew: false
        };
    });

    return {
        entries,
        enemyDefeatCounts: {},
        unlockedCount: 0,
        totalCount: ALL_CODEX_ENTRIES.length,
        newEntryIds: []
    };
};

// Calculate progress statistics
export const calculateCodexProgress = (codex: CodexState): CodexProgress => {
    const entries = Object.values(codex.entries);
    const unlocked = entries.filter(e => e.isUnlocked).length;

    const byCategory = {
        PILOT: {
            unlocked: entries.filter(e => e.category === 'PILOT' && e.isUnlocked).length,
            total: entries.filter(e => e.category === 'PILOT').length
        },
        ENEMY: {
            unlocked: entries.filter(e => e.category === 'ENEMY' && e.isUnlocked).length,
            total: entries.filter(e => e.category === 'ENEMY').length
        },
        LORE: {
            unlocked: entries.filter(e => e.category === 'LORE' && e.isUnlocked).length,
            total: entries.filter(e => e.category === 'LORE').length
        },
        AUDIO_LOG: {
            unlocked: entries.filter(e => e.category === 'AUDIO_LOG' && e.isUnlocked).length,
            total: entries.filter(e => e.category === 'AUDIO_LOG').length
        }
    };

    return {
        unlocked,
        total: codex.totalCount,
        percent: Math.round((unlocked / codex.totalCount) * 100),
        byCategory
    };
};

// Unlock a pilot bio
export const unlockPilotBio = (codex: CodexState, pilotId: PilotId): CodexState => {
    const entryId = `pilot-${pilotId}`;
    const entry = codex.entries[entryId];

    if (!entry || entry.isUnlocked) return codex;

    return {
        ...codex,
        entries: {
            ...codex.entries,
            [entryId]: {
                ...entry,
                isUnlocked: true,
                isNew: true,
                unlockedDate: Date.now()
            }
        },
        unlockedCount: codex.unlockedCount + 1,
        lastUnlockedId: entryId,
        newEntryIds: [...codex.newEntryIds, entryId]
    };
};

// Record enemy defeat and check for unlock
export const recordEnemyDefeat = (codex: CodexState, enemyType: string): CodexState => {
    const newDefeatCount = (codex.enemyDefeatCounts[enemyType] || 0) + 1;
    const newDefeatCounts = {
        ...codex.enemyDefeatCounts,
        [enemyType]: newDefeatCount
    };

    // Check if we should unlock the entry
    const entryId = `enemy-${enemyType.toLowerCase().replace('_', '-')}`;
    const entry = codex.entries[entryId];

    if (entry && !entry.isUnlocked && 'defeatsRequired' in entry) {
        if (newDefeatCount >= entry.defeatsRequired) {
            // Unlock the entry
            return {
                ...codex,
                enemyDefeatCounts: newDefeatCounts,
                entries: {
                    ...codex.entries,
                    [entryId]: {
                        ...entry,
                        isUnlocked: true,
                        isNew: true,
                        unlockedDate: Date.now(),
                        defeatedCount: newDefeatCount
                    }
                },
                unlockedCount: codex.unlockedCount + 1,
                lastUnlockedId: entryId,
                newEntryIds: [...codex.newEntryIds, entryId]
            };
        } else {
            // Update defeat count only
            return {
                ...codex,
                enemyDefeatCounts: newDefeatCounts,
                entries: {
                    ...codex.entries,
                    [entryId]: {
                        ...entry,
                        defeatedCount: newDefeatCount
                    }
                }
            };
        }
    }

    return {
        ...codex,
        enemyDefeatCounts: newDefeatCounts
    };
};

// Unlock lore entry (by stage or achievement)
export const unlockLoreEntry = (codex: CodexState, loreId: string): CodexState => {
    const entry = codex.entries[loreId];

    if (!entry || entry.isUnlocked) return codex;

    return {
        ...codex,
        entries: {
            ...codex.entries,
            [loreId]: {
                ...entry,
                isUnlocked: true,
                isNew: true,
                unlockedDate: Date.now()
            }
        },
        unlockedCount: codex.unlockedCount + 1,
        lastUnlockedId: loreId,
        newEntryIds: [...codex.newEntryIds, loreId]
    };
};

// Try to unlock random audio log (chance-based)
export const tryUnlockRandomAudioLog = (codex: CodexState, chance: number = 0.15): CodexState => {
    if (Math.random() > chance) return codex;

    // Find locked audio logs
    const lockedAudioLogs = Object.values(codex.entries).filter(
        e => e.category === 'AUDIO_LOG' && !e.isUnlocked
    );

    if (lockedAudioLogs.length === 0) return codex;

    // Pick random one
    const randomLog = lockedAudioLogs[Math.floor(Math.random() * lockedAudioLogs.length)];

    return {
        ...codex,
        entries: {
            ...codex.entries,
            [randomLog.id]: {
                ...randomLog,
                isUnlocked: true,
                isNew: true,
                unlockedDate: Date.now()
            }
        },
        unlockedCount: codex.unlockedCount + 1,
        lastUnlockedId: randomLog.id,
        newEntryIds: [...codex.newEntryIds, randomLog.id]
    };
};

// Mark entry as read
export const markEntryAsRead = (codex: CodexState, entryId: string): CodexState => {
    const entry = codex.entries[entryId];
    if (!entry) return codex;

    return {
        ...codex,
        entries: {
            ...codex.entries,
            [entryId]: {
                ...entry,
                readCount: entry.readCount + 1,
                isNew: false
            }
        },
        newEntryIds: codex.newEntryIds.filter(id => id !== entryId)
    };
};

// Get next unread entry ID
export const getNextUnreadEntry = (codex: CodexState): string | null => {
    return codex.newEntryIds[0] || null;
};
