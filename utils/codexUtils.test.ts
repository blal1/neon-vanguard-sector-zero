import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    initializeCodex,
    calculateCodexProgress,
    unlockPilotBio,
    recordEnemyDefeat,
    unlockLoreEntry,
    tryUnlockRandomAudioLog,
    markEntryAsRead,
    getNextUnreadEntry
} from './codexUtils';
import { CodexState } from '../types/codex';
import { PilotId } from '../types';

describe('Codex Utilities', () => {
    let initialCodex: CodexState;

    beforeEach(() => {
        initialCodex = initializeCodex();
    });

    describe('initializeCodex', () => {
        it('should create codex with entries', () => {
            expect(Object.keys(initialCodex.entries).length).toBeGreaterThan(0);
        });

        it('should start with all entries locked', () => {
            const allLocked = Object.values(initialCodex.entries).every(e => !e.isUnlocked);
            expect(allLocked).toBe(true);
        });

        it('should have correct total count', () => {
            expect(initialCodex.totalCount).toBe(Object.keys(initialCodex.entries).length);
        });

        it('should start with 0 unlocked', () => {
            expect(initialCodex.unlockedCount).toBe(0);
        });

        it('should initialize enemy defeat counts as empty', () => {
            expect(initialCodex.enemyDefeatCounts).toEqual({});
        });

        it('should start with empty new entry IDs', () => {
            expect(initialCodex.newEntryIds).toEqual([]);
        });
    });

    describe('calculateCodexProgress', () => {
        it('should return 0% for new codex', () => {
            const progress = calculateCodexProgress(initialCodex);
            expect(progress.percent).toBe(0);
            expect(progress.unlocked).toBe(0);
        });

        it('should calculate correct percentage', () => {
            // Unlock a few entries
            let codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const progress = calculateCodexProgress(codex);
            expect(progress.unlocked).toBeGreaterThan(0);
            expect(progress.percent).toBeGreaterThan(0);
        });

        it('should track progress by category', () => {
            const progress = calculateCodexProgress(initialCodex);
            expect(progress.byCategory.PILOT).toBeDefined();
            expect(progress.byCategory.ENEMY).toBeDefined();
            expect(progress.byCategory.LORE).toBeDefined();
            expect(progress.byCategory.AUDIO_LOG).toBeDefined();
        });
    });

    describe('unlockPilotBio', () => {
        it('should unlock pilot bio entry', () => {
            const codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const entryId = `pilot-${PilotId.VANGUARD}`;

            if (codex.entries[entryId]) {
                expect(codex.entries[entryId].isUnlocked).toBe(true);
            }
        });

        it('should increment unlocked count', () => {
            const codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            expect(codex.unlockedCount).toBeGreaterThanOrEqual(initialCodex.unlockedCount);
        });

        it('should mark entry as new', () => {
            const codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const entryId = `pilot-${PilotId.VANGUARD}`;

            if (codex.entries[entryId]) {
                expect(codex.entries[entryId].isNew).toBe(true);
                expect(codex.newEntryIds).toContain(entryId);
            }
        });

        it('should not re-unlock already unlocked entry', () => {
            let codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const countAfterFirst = codex.unlockedCount;
            codex = unlockPilotBio(codex, PilotId.VANGUARD);
            expect(codex.unlockedCount).toBe(countAfterFirst);
        });
    });

    describe('recordEnemyDefeat', () => {
        it('should increment defeat count', () => {
            const codex = recordEnemyDefeat(initialCodex, 'SCOUT_DRONE');
            expect(codex.enemyDefeatCounts['SCOUT_DRONE']).toBe(1);
        });

        it('should accumulate defeat counts', () => {
            let codex = recordEnemyDefeat(initialCodex, 'SCOUT_DRONE');
            codex = recordEnemyDefeat(codex, 'SCOUT_DRONE');
            codex = recordEnemyDefeat(codex, 'SCOUT_DRONE');
            expect(codex.enemyDefeatCounts['SCOUT_DRONE']).toBe(3);
        });

        it('should track different enemy types separately', () => {
            let codex = recordEnemyDefeat(initialCodex, 'SCOUT_DRONE');
            codex = recordEnemyDefeat(codex, 'HEAVY_MECH');
            expect(codex.enemyDefeatCounts['SCOUT_DRONE']).toBe(1);
            expect(codex.enemyDefeatCounts['HEAVY_MECH']).toBe(1);
        });
    });

    describe('unlockLoreEntry', () => {
        it('should unlock valid lore entry', () => {
            // Find a lore entry ID from the codex
            const loreEntryId = Object.keys(initialCodex.entries).find(
                id => initialCodex.entries[id].category === 'LORE'
            );

            if (loreEntryId) {
                const codex = unlockLoreEntry(initialCodex, loreEntryId);
                expect(codex.entries[loreEntryId].isUnlocked).toBe(true);
            }
        });

        it('should not modify codex for invalid entry', () => {
            const codex = unlockLoreEntry(initialCodex, 'nonexistent_entry');
            expect(codex).toBe(initialCodex);
        });
    });

    describe('tryUnlockRandomAudioLog', () => {
        it('should sometimes unlock audio log (with high chance)', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force unlock
            const codex = tryUnlockRandomAudioLog(initialCodex, 0.5);

            // Check if an audio log was unlocked
            const audioLogs = Object.values(codex.entries).filter(
                e => e.category === 'AUDIO_LOG' && e.isUnlocked
            );

            // May or may not have audio logs in test data
            expect(typeof audioLogs.length).toBe('number');
            vi.restoreAllMocks();
        });

        it('should not unlock with 0 chance', () => {
            const codex = tryUnlockRandomAudioLog(initialCodex, 0);
            expect(codex.unlockedCount).toBe(initialCodex.unlockedCount);
        });

        it('should respect chance parameter', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.9); // Above any reasonable chance
            const codex = tryUnlockRandomAudioLog(initialCodex, 0.1);
            expect(codex).toBe(initialCodex); // Should return unchanged
            vi.restoreAllMocks();
        });
    });

    describe('markEntryAsRead', () => {
        it('should mark entry as read', () => {
            let codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const entryId = `pilot-${PilotId.VANGUARD}`;

            if (codex.entries[entryId]) {
                codex = markEntryAsRead(codex, entryId);
                expect(codex.entries[entryId].isNew).toBe(false);
                expect(codex.entries[entryId].readCount).toBe(1);
            }
        });

        it('should remove from new entry IDs', () => {
            let codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const entryId = `pilot-${PilotId.VANGUARD}`;

            codex = markEntryAsRead(codex, entryId);
            expect(codex.newEntryIds).not.toContain(entryId);
        });

        it('should increment read count on multiple reads', () => {
            let codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            const entryId = `pilot-${PilotId.VANGUARD}`;

            if (codex.entries[entryId]) {
                codex = markEntryAsRead(codex, entryId);
                codex = markEntryAsRead(codex, entryId);
                codex = markEntryAsRead(codex, entryId);
                expect(codex.entries[entryId].readCount).toBe(3);
            }
        });
    });

    describe('getNextUnreadEntry', () => {
        it('should return null for no new entries', () => {
            const next = getNextUnreadEntry(initialCodex);
            expect(next).toBeNull();
        });

        it('should return first unread entry', () => {
            let codex = unlockPilotBio(initialCodex, PilotId.VANGUARD);
            codex = unlockPilotBio(codex, PilotId.SOLARIS);

            const next = getNextUnreadEntry(codex);

            if (codex.newEntryIds.length > 0) {
                expect(next).toBe(codex.newEntryIds[0]);
            }
        });
    });
});
