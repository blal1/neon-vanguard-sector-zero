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

// Validate replay data structure
export const validateReplayData = (data: unknown): { valid: boolean; error?: string; replay?: CombatReplay } => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid data format' };
    }

    const obj = data as Record<string, unknown>;

    // Required fields check
    const requiredFields = ['id', 'timestamp', 'pilotId', 'pilotName', 'stage', 'duration', 'actions', 'outcome', 'finalStats'];
    for (const field of requiredFields) {
        if (!(field in obj)) {
            return { valid: false, error: `Missing required field: ${field}` };
        }
    }

    // Actions array check
    if (!Array.isArray(obj.actions) || obj.actions.length === 0) {
        return { valid: false, error: 'Actions must be a non-empty array' };
    }

    // Validate action structure
    const firstAction = obj.actions[0] as Record<string, unknown>;
    if (!firstAction.turn || !firstAction.timestamp || !firstAction.actor || !firstAction.result) {
        return { valid: false, error: 'Invalid action structure' };
    }

    // Outcome check
    if (obj.outcome !== 'VICTORY' && obj.outcome !== 'DEFEAT') {
        return { valid: false, error: 'Invalid outcome value' };
    }

    return { valid: true, replay: obj as unknown as CombatReplay };
};

// Import replay from JSON string
export const importReplayFromJson = (jsonString: string): { success: boolean; error?: string; replay?: CombatReplay } => {
    try {
        const data = JSON.parse(jsonString);
        const validation = validateReplayData(data);

        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        return { success: true, replay: validation.replay };
    } catch (e) {
        return { success: false, error: 'Invalid JSON format' };
    }
};

// Import replay and add to state
export const importReplay = (state: ReplayState, replay: CombatReplay): ReplayState => {
    // Check for duplicates
    if (state.replays.some(r => r.id === replay.id)) {
        // Generate new ID for duplicate
        replay = { ...replay, id: `${replay.id}-import-${Date.now()}` };
    }
    return addReplay(state, replay);
};
