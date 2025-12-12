import { PlayerTalentState, Talent, TalentProgress, PilotTalentState } from '../types/talents';
import { PilotId } from '../types';

import { TALENT_SYNERGIES } from '../constants/talents';
import { Synergy } from '../types';

export const getActiveTalentSynergies = (unlockedTalentIds: string[]): Synergy[] => {
    const activeSynergies: Synergy[] = [];

    for (const synergy of TALENT_SYNERGIES) {
        const hasAllRequired = synergy.augmentationIds.every(talentId => unlockedTalentIds.includes(talentId));

        if (hasAllRequired) {
            activeSynergies.push(synergy);
        }
    }

    return activeSynergies;
};

export const initializeTalentState = (): PlayerTalentState => ({
    [PilotId.VANGUARD]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
    [PilotId.SOLARIS]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
    [PilotId.HYDRA]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
    [PilotId.WYRM]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
    [PilotId.GHOST]: { unlockedTalents: [], totalPointsSpent: 0, presets: [] },
    availablePoints: 0,
    totalPointsEarned: 0
});

export const unlockTalent = (
    state: PlayerTalentState,
    pilotId: PilotId,
    talent: Talent
): PlayerTalentState => {
    const pilotState = state[pilotId];
    const existingProgress = pilotState.unlockedTalents.find(p => p.talentId === talent.id);

    // Check if can afford
    if (state.availablePoints < talent.cost) {
        return state; // Not enough points
    }

    // Check if at max rank
    if (existingProgress && existingProgress.currentRank >= talent.maxRank) {
        return state; // Already maxed
    }

    // Check prerequisites
    if (talent.requires) {
        const allPrereqsMet = talent.requires.every(reqId =>
            pilotState.unlockedTalents.some(p => p.talentId === reqId && p.currentRank > 0)
        );
        if (!allPrereqsMet) {
            return state; // Prerequisites not met
        }
    }

    // Unlock or rank up
    const newRank = existingProgress ? existingProgress.currentRank + 1 : 1;
    const newUnlockedTalents = existingProgress
        ? pilotState.unlockedTalents.map(p =>
            p.talentId === talent.id ? { ...p, currentRank: newRank } : p
        )
        : [...pilotState.unlockedTalents, { talentId: talent.id, currentRank: newRank }];

    return {
        ...state,
        [pilotId]: {
            unlockedTalents: newUnlockedTalents,
            totalPointsSpent: pilotState.totalPointsSpent + talent.cost
        },
        availablePoints: state.availablePoints - talent.cost
    };
};

export const resetTalentsForPilot = (
    state: PlayerTalentState,
    pilotId: PilotId
): PlayerTalentState => {
    const pilotState = state[pilotId];
    return {
        ...state,
        [pilotId]: {
            ...pilotState,
            unlockedTalents: [],
            totalPointsSpent: 0
        },
        availablePoints: state.availablePoints + pilotState.totalPointsSpent
    };
};

export const getTalentRank = (
    state: PlayerTalentState,
    pilotId: PilotId,
    talentId: string
): number => {
    const progress = state[pilotId].unlockedTalents.find(p => p.talentId === talentId);
    return progress ? progress.currentRank : 0;
};

export const canUnlockTalent = (
    state: PlayerTalentState,
    pilotId: PilotId,
    talent: Talent
): { canUnlock: boolean; reason?: string } => {
    const currentRank = getTalentRank(state, pilotId, talent.id);

    if (state.availablePoints < talent.cost) {
        return { canUnlock: false, reason: 'Not enough Pilot Points' };
    }

    if (currentRank >= talent.maxRank) {
        return { canUnlock: false, reason: 'Already at max rank' };
    }

    if (talent.requires) {
        const allPrereqsMet = talent.requires.every(reqId =>
            getTalentRank(state, pilotId, reqId) > 0
        );
        if (!allPrereqsMet) {
            return { canUnlock: false, reason: 'Prerequisites not met' };
        }
    }

    return { canUnlock: true };
};

export const calculateTalentBonuses = (
    state: PlayerTalentState,
    pilotId: PilotId,
    talents: Talent[]
): Record<string, number> => {
    const bonuses: Record<string, number> = {};

    state[pilotId].unlockedTalents.forEach(progress => {
        const talent = talents.find(t => t.id === progress.talentId);
        if (!talent) return;

        talent.effects.forEach(effect => {
            const key = effect.type;
            const value = effect.value * progress.currentRank;
            bonuses[key] = (bonuses[key] || 0) + value;
        });
    });

    return bonuses;
};

export const awardPilotPoints = (
    state: PlayerTalentState,
    points: number
): PlayerTalentState => ({
    ...state,
    availablePoints: state.availablePoints + points,
    totalPointsEarned: state.totalPointsEarned + points
});

export const getTotalPointsSpentForPilot = (
    state: PlayerTalentState,
    pilotId: PilotId
): number => {
    return state[pilotId].totalPointsSpent;
};

export const getAllocatedPointsTotal = (state: PlayerTalentState): number => {
    return (
        state[PilotId.VANGUARD].totalPointsSpent +
        state[PilotId.SOLARIS].totalPointsSpent +
        state[PilotId.HYDRA].totalPointsSpent +
        state[PilotId.WYRM].totalPointsSpent +
        state[PilotId.GHOST].totalPointsSpent
    );
};
