import { describe, it, expect } from 'vitest';
import {
    initializeReplayState,
    addReplay,
    deleteReplay,
    clearAllReplays,
    getReplayById,
    getRecentReplays,
    filterReplays,
    formatDuration,
    validateReplayData,
    importReplayFromJson,
    importReplay
} from './replayUtils';
import { ReplayState, CombatReplay } from '../types/replay';
import { PilotId } from '../types';

// Mock replay factory with correct types
const createMockReplay = (overrides: Partial<CombatReplay> = {}): CombatReplay => ({
    id: `replay-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    pilotId: PilotId.VANGUARD,
    pilotName: 'VANGUARD',
    module: 'ASSAULT',
    stage: 1,
    difficulty: 'VETERAN',
    duration: 60000,
    actions: [
        {
            turn: 1,
            timestamp: 1, // Must be truthy for validation
            actor: 'PLAYER',
            actionType: 'ATTACK',
            result: 'Hit for 10 damage'
        }
    ],
    outcome: 'VICTORY',
    finalStats: {
        damageDealt: 100,
        damageTaken: 50,
        enemiesKilled: 5,
        itemsUsed: 2,
        turnsElapsed: 10,
        criticalHits: 2
    },
    ...overrides
});

describe('replayUtils', () => {
    describe('initializeReplayState', () => {
        it('should return an empty replay state with max 10 replays', () => {
            const state = initializeReplayState();
            expect(state.replays).toEqual([]);
            expect(state.maxReplays).toBe(10);
        });
    });

    describe('addReplay', () => {
        it('should add a replay to the beginning of the list', () => {
            const state = initializeReplayState();
            const replay = createMockReplay({ id: 'test-1' });

            const newState = addReplay(state, replay);

            expect(newState.replays).toHaveLength(1);
            expect(newState.replays[0].id).toBe('test-1');
        });

        it('should limit replays to maxReplays', () => {
            let state: ReplayState = { replays: [], maxReplays: 3 };

            for (let i = 0; i < 5; i++) {
                state = addReplay(state, createMockReplay({ id: `replay-${i}` }));
            }

            expect(state.replays).toHaveLength(3);
            expect(state.replays[0].id).toBe('replay-4');
        });
    });

    describe('deleteReplay', () => {
        it('should remove a specific replay by ID', () => {
            let state = initializeReplayState();
            state = addReplay(state, createMockReplay({ id: 'keep-1' }));
            state = addReplay(state, createMockReplay({ id: 'delete-me' }));
            state = addReplay(state, createMockReplay({ id: 'keep-2' }));

            const newState = deleteReplay(state, 'delete-me');

            expect(newState.replays).toHaveLength(2);
            expect(newState.replays.find(r => r.id === 'delete-me')).toBeUndefined();
        });
    });

    describe('clearAllReplays', () => {
        it('should remove all replays', () => {
            let state = initializeReplayState();
            state = addReplay(state, createMockReplay());
            state = addReplay(state, createMockReplay());

            const cleared = clearAllReplays(state);

            expect(cleared.replays).toEqual([]);
        });
    });

    describe('getReplayById', () => {
        it('should return the replay with matching ID', () => {
            let state = initializeReplayState();
            const target = createMockReplay({ id: 'target' });
            state = addReplay(state, createMockReplay({ id: 'other' }));
            state = addReplay(state, target);

            const found = getReplayById(state, 'target');

            expect(found).toBeDefined();
            expect(found?.id).toBe('target');
        });

        it('should return undefined if not found', () => {
            const state = initializeReplayState();
            expect(getReplayById(state, 'missing')).toBeUndefined();
        });
    });

    describe('getRecentReplays', () => {
        it('should return the most recent N replays', () => {
            let state = initializeReplayState();
            for (let i = 0; i < 10; i++) {
                state = addReplay(state, createMockReplay({ id: `replay-${i}` }));
            }

            const recent = getRecentReplays(state, 3);

            expect(recent).toHaveLength(3);
            expect(recent[0].id).toBe('replay-9');
        });

        it('should default to 5 replays', () => {
            let state = initializeReplayState();
            for (let i = 0; i < 10; i++) {
                state = addReplay(state, createMockReplay());
            }

            const recent = getRecentReplays(state);
            expect(recent).toHaveLength(5);
        });
    });

    describe('filterReplays', () => {
        it('should filter by pilotId', () => {
            let state = initializeReplayState();
            state = addReplay(state, createMockReplay({ pilotId: PilotId.VANGUARD }));
            state = addReplay(state, createMockReplay({ pilotId: PilotId.SOLARIS }));
            state = addReplay(state, createMockReplay({ pilotId: PilotId.VANGUARD }));

            const filtered = filterReplays(state, { pilotId: PilotId.VANGUARD });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(r => r.pilotId === PilotId.VANGUARD)).toBe(true);
        });

        it('should filter by outcome', () => {
            let state = initializeReplayState();
            state = addReplay(state, createMockReplay({ outcome: 'VICTORY' }));
            state = addReplay(state, createMockReplay({ outcome: 'DEFEAT' }));
            state = addReplay(state, createMockReplay({ outcome: 'VICTORY' }));

            const filtered = filterReplays(state, { outcome: 'DEFEAT' });

            expect(filtered).toHaveLength(1);
            expect(filtered[0].outcome).toBe('DEFEAT');
        });

        it('should filter by stage', () => {
            let state = initializeReplayState();
            state = addReplay(state, createMockReplay({ stage: 1 }));
            state = addReplay(state, createMockReplay({ stage: 3 }));
            state = addReplay(state, createMockReplay({ stage: 1 }));

            const filtered = filterReplays(state, { stage: 3 });

            expect(filtered).toHaveLength(1);
            expect(filtered[0].stage).toBe(3);
        });
    });

    describe('formatDuration', () => {
        it('should format milliseconds to mm:ss', () => {
            expect(formatDuration(60000)).toBe('1:00');
            expect(formatDuration(90000)).toBe('1:30');
            expect(formatDuration(5000)).toBe('0:05');
            expect(formatDuration(125000)).toBe('2:05');
        });
    });

    describe('validateReplayData', () => {
        it('should validate correct replay data', () => {
            const validData = createMockReplay();
            const result = validateReplayData(validData);

            expect(result.valid).toBe(true);
            expect(result.replay).toBeDefined();
        });

        it('should reject null/undefined', () => {
            expect(validateReplayData(null).valid).toBe(false);
            expect(validateReplayData(undefined).valid).toBe(false);
        });

        it('should reject missing required fields', () => {
            const incomplete = { id: 'test' };
            const result = validateReplayData(incomplete);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('Missing required field');
        });

        it('should reject empty actions array', () => {
            const noActions = { ...createMockReplay(), actions: [] };
            const result = validateReplayData(noActions);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('non-empty array');
        });

        it('should reject invalid outcome', () => {
            const badOutcome = { ...createMockReplay(), outcome: 'DRAW' as any };
            const result = validateReplayData(badOutcome);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid outcome');
        });
    });

    describe('importReplayFromJson', () => {
        it('should import valid JSON', () => {
            const replay = createMockReplay();
            const json = JSON.stringify(replay);

            const result = importReplayFromJson(json);

            expect(result.success).toBe(true);
            expect(result.replay).toBeDefined();
        });

        it('should reject invalid JSON', () => {
            const result = importReplayFromJson('not valid json');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid JSON');
        });
    });

    describe('importReplay', () => {
        it('should add imported replay to state', () => {
            const state = initializeReplayState();
            const replay = createMockReplay({ id: 'imported' });

            const newState = importReplay(state, replay);

            expect(newState.replays).toHaveLength(1);
        });

        it('should generate new ID for duplicate imports', () => {
            let state = initializeReplayState();
            const replay = createMockReplay({ id: 'duplicate' });

            state = addReplay(state, replay);
            state = importReplay(state, { ...replay });

            expect(state.replays).toHaveLength(2);
            expect(state.replays[0].id).toContain('duplicate-import');
        });
    });
});
