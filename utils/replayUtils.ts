import { ReplayState, CombatReplay } from '../types/replay';

// Initialize empty replay state
export const initializeReplayState = (): ReplayState => ({
    replays: [],
    maxReplays: 10
});

// Add new replay (keeps only most recent 10)
export const addReplay = (state: ReplayState, replay: CombatReplay): ReplayState => {
    const newReplays = [replay, ...state.replays].slice(0, state.maxReplays);
    return {
        ...state,
        replays: newReplays
    };
};

// Delete specific replay
export const deleteReplay = (state: ReplayState, replayId: string): ReplayState => ({
    ...state,
    replays: state.replays.filter(r => r.id !== replayId)
});

// Clear all replays
export const clearAllReplays = (state: ReplayState): ReplayState => ({
    ...state,
    replays: []
});

// Get replay by ID
export const getReplayById = (state: ReplayState, id: string): CombatReplay | undefined => {
    return state.replays.find(r => r.id === id);
};

// Get recent replays
export const getRecentReplays = (state: ReplayState, count: number = 5): CombatReplay[] => {
    return state.replays.slice(0, count);
};

// Filter replays by criteria
export const filterReplays = (
    state: ReplayState,
    filters: {
        pilotId?: string;
        outcome?: 'VICTORY' | 'DEFEAT';
        stage?: number;
    }
): CombatReplay[] => {
    return state.replays.filter(replay => {
        if (filters.pilotId && replay.pilotId !== filters.pilotId) return false;
        if (filters.outcome && replay.outcome !== filters.outcome) return false;
        if (filters.stage && replay.stage !== filters.stage) return false;
        return true;
    });
};

// Calculate storage size estimate
export const estimateStorageSize = (state: ReplayState): number => {
    const jsonString = JSON.stringify(state);
    return new Blob([jsonString]).size;
};

// Format duration for display
export const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
