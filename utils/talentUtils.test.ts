import { describe, it, expect, beforeEach } from 'vitest';
import {
    initializeTalentState,
    unlockTalent,
    resetTalentsForPilot,
    getTalentRank,
    canUnlockTalent,
    calculateTalentBonuses,
    awardPilotPoints,
    getTotalPointsSpentForPilot,
    getAllocatedPointsTotal,
    getActiveTalentSynergies
} from './talentUtils';
import { PilotId } from '../types';
import { PlayerTalentState, Talent } from '../types/talents';

// Mock talent for testing
const createMockTalent = (overrides?: Partial<Talent>): Talent => ({
    id: 'test_talent_1',
    name: 'Test Talent',
    description: 'A test talent',
    tier: 1,
    cost: 1,
    maxRank: 3,
    effects: [{ type: 'DAMAGE_BONUS', value: 5 }],
    position: { row: 0, col: 0 },
    ...overrides
});

describe('Talent Utilities', () => {
    let initialState: PlayerTalentState;

    beforeEach(() => {
        initialState = initializeTalentState();
    });

    describe('initializeTalentState', () => {
        it('should initialize state for all pilots', () => {
            expect(initialState[PilotId.VANGUARD]).toBeDefined();
            expect(initialState[PilotId.SOLARIS]).toBeDefined();
            expect(initialState[PilotId.HYDRA]).toBeDefined();
            expect(initialState[PilotId.WYRM]).toBeDefined();
            expect(initialState[PilotId.GHOST]).toBeDefined();
        });

        it('should start with 0 available points', () => {
            expect(initialState.availablePoints).toBe(0);
        });

        it('should start with 0 total points earned', () => {
            expect(initialState.totalPointsEarned).toBe(0);
        });

        it('should start with empty unlocked talents for each pilot', () => {
            expect(initialState[PilotId.VANGUARD].unlockedTalents).toEqual([]);
            expect(initialState[PilotId.SOLARIS].unlockedTalents).toEqual([]);
        });
    });

    describe('awardPilotPoints', () => {
        it('should add points to available pool', () => {
            const newState = awardPilotPoints(initialState, 5);
            expect(newState.availablePoints).toBe(5);
        });

        it('should track total points earned', () => {
            const state1 = awardPilotPoints(initialState, 5);
            const state2 = awardPilotPoints(state1, 3);
            expect(state2.totalPointsEarned).toBe(8);
        });

        it('should accumulate points correctly', () => {
            let state = initialState;
            state = awardPilotPoints(state, 10);
            state = awardPilotPoints(state, 5);
            expect(state.availablePoints).toBe(15);
        });
    });

    describe('unlockTalent', () => {
        it('should not unlock without enough points', () => {
            const talent = createMockTalent({ cost: 5 });
            const newState = unlockTalent(initialState, PilotId.VANGUARD, talent);
            expect(newState[PilotId.VANGUARD].unlockedTalents.length).toBe(0);
        });

        it('should unlock talent when have enough points', () => {
            let state = awardPilotPoints(initialState, 5);
            const talent = createMockTalent({ cost: 1 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            expect(state[PilotId.VANGUARD].unlockedTalents.length).toBe(1);
            expect(state[PilotId.VANGUARD].unlockedTalents[0].talentId).toBe(talent.id);
        });

        it('should deduct points when unlocking', () => {
            let state = awardPilotPoints(initialState, 5);
            const talent = createMockTalent({ cost: 2 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            expect(state.availablePoints).toBe(3);
        });

        it('should not exceed max rank', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1, maxRank: 2 });

            // Unlock 3 times
            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            const rank = getTalentRank(state, PilotId.VANGUARD, talent.id);
            expect(rank).toBe(2); // Capped at maxRank
        });

        it('should track points spent per pilot', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 3 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            expect(state[PilotId.VANGUARD].totalPointsSpent).toBe(3);
        });

        it('should check prerequisites', () => {
            let state = awardPilotPoints(initialState, 10);
            const prerequisite = createMockTalent({ id: 'prereq', cost: 1 });
            const dependent = createMockTalent({
                id: 'dependent',
                cost: 1,
                requires: ['prereq']
            });

            // Try to unlock dependent without prerequisite
            state = unlockTalent(state, PilotId.VANGUARD, dependent);
            expect(state[PilotId.VANGUARD].unlockedTalents.length).toBe(0);

            // Unlock prerequisite first
            state = unlockTalent(state, PilotId.VANGUARD, prerequisite);
            state = unlockTalent(state, PilotId.VANGUARD, dependent);
            expect(state[PilotId.VANGUARD].unlockedTalents.length).toBe(2);
        });
    });

    describe('resetTalentsForPilot', () => {
        it('should clear unlocked talents for pilot', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = resetTalentsForPilot(state, PilotId.VANGUARD);

            expect(state[PilotId.VANGUARD].unlockedTalents).toEqual([]);
        });

        it('should refund spent points', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 3 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            const pointsBeforeReset = state.availablePoints;
            state = resetTalentsForPilot(state, PilotId.VANGUARD);

            expect(state.availablePoints).toBe(pointsBeforeReset + 3);
        });

        it('should not affect other pilots', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = unlockTalent(state, PilotId.SOLARIS, talent);

            state = resetTalentsForPilot(state, PilotId.VANGUARD);

            expect(state[PilotId.VANGUARD].unlockedTalents.length).toBe(0);
            expect(state[PilotId.SOLARIS].unlockedTalents.length).toBe(1);
        });
    });

    describe('getTalentRank', () => {
        it('should return 0 for unlocked talent', () => {
            const rank = getTalentRank(initialState, PilotId.VANGUARD, 'nonexistent');
            expect(rank).toBe(0);
        });

        it('should return current rank for unlocked talent', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1, maxRank: 3 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            const rank = getTalentRank(state, PilotId.VANGUARD, talent.id);
            expect(rank).toBe(2);
        });
    });

    describe('canUnlockTalent', () => {
        it('should return false when not enough points', () => {
            const talent = createMockTalent({ cost: 5 });
            const result = canUnlockTalent(initialState, PilotId.VANGUARD, talent);
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('Not enough');
        });

        it('should return false when at max rank', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1, maxRank: 1 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            const result = canUnlockTalent(state, PilotId.VANGUARD, talent);
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('max rank');
        });

        it('should return false when prerequisites not met', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1, requires: ['prereq_talent'] });

            const result = canUnlockTalent(state, PilotId.VANGUARD, talent);
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toContain('Prerequisites');
        });

        it('should return true when all conditions met', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 1 });

            const result = canUnlockTalent(state, PilotId.VANGUARD, talent);
            expect(result.canUnlock).toBe(true);
        });
    });

    describe('calculateTalentBonuses', () => {
        it('should return empty object for no talents', () => {
            const bonuses = calculateTalentBonuses(initialState, PilotId.VANGUARD, []);
            expect(bonuses).toEqual({});
        });

        it('should sum up effect values', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({
                cost: 1,
                maxRank: 3,
                effects: [{ type: 'DAMAGE_BONUS', value: 5 }]
            });
            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            const bonuses = calculateTalentBonuses(state, PilotId.VANGUARD, [talent]);
            expect(bonuses['DAMAGE_BONUS']).toBe(10); // 5 * 2 ranks
        });

        it('should handle multiple effect types', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({
                cost: 1,
                effects: [
                    { type: 'DAMAGE_BONUS', value: 5 },
                    { type: 'HP_BONUS', value: 10 }
                ]
            });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            const bonuses = calculateTalentBonuses(state, PilotId.VANGUARD, [talent]);
            expect(bonuses['DAMAGE_BONUS']).toBe(5);
            expect(bonuses['HP_BONUS']).toBe(10);
        });
    });

    describe('getTotalPointsSpentForPilot', () => {
        it('should return 0 initially', () => {
            expect(getTotalPointsSpentForPilot(initialState, PilotId.VANGUARD)).toBe(0);
        });

        it('should track spent points correctly', () => {
            let state = awardPilotPoints(initialState, 10);
            const talent = createMockTalent({ cost: 3 });
            state = unlockTalent(state, PilotId.VANGUARD, talent);

            expect(getTotalPointsSpentForPilot(state, PilotId.VANGUARD)).toBe(3);
        });
    });

    describe('getAllocatedPointsTotal', () => {
        it('should sum points across all pilots', () => {
            let state = awardPilotPoints(initialState, 20);
            const talent = createMockTalent({ cost: 2 });

            state = unlockTalent(state, PilotId.VANGUARD, talent);
            state = unlockTalent(state, PilotId.SOLARIS, talent);
            state = unlockTalent(state, PilotId.HYDRA, talent);

            expect(getAllocatedPointsTotal(state)).toBe(6); // 2 * 3 pilots
        });
    });

    describe('getActiveTalentSynergies', () => {
        it('should return empty array for no talents', () => {
            const synergies = getActiveTalentSynergies([]);
            expect(synergies).toEqual([]);
        });
    });
});
