import { PilotId } from '../types';

// ============================================
// TALENT SYSTEM TYPES
// ============================================

export type TalentEffectType =
    | 'MAX_HP_PERCENT'      // +X% max HP
    | 'MAX_HP_FLAT'         // +X flat HP
    | 'DAMAGE_PERCENT'      // +X% damage
    | 'REGEN_PERCENT'       // +X% regen rate
    | 'THORNS_DAMAGE'       // Reflect X% damage
    | 'COOLDOWN_REDUCTION'  // -X% ability cooldowns
    | 'CRIT_CHANCE'         // +X% crit chance
    | 'CRIT_DAMAGE'         // +X% crit damage
    | 'DODGE_CHANCE'        // +X% dodge chance
    | 'ENERGY_MAX'          // +X max energy
    | 'ENERGY_REGEN'        // +X energy regen per tick
    | 'XP_GAIN'             // +X% XP gain
    | 'SCRAP_GAIN'          // +X% scrap gain
    | 'DAMAGE_TAKEN_REDUCTION' // -X% damage taken
    | 'FULL_ENERGY_DAMAGE_BONUS' // +X% damage when energy is full
    | 'HEAT_REDUCTION'      // -X% heat generation
    | 'SINGLE_TARGET_DAMAGE' // +X% damage to single target abilities
    | 'BURROW_COOLDOWN_REDUCTION' // -X% burrow cooldown
    | 'ACID_BILE_BURN'      // Acid Bile ability now applies burn
    | 'CRIT_STUN_CHANCE'    // X% chance to stun on critical hit
    | 'CLOAK_DURATION'      // +X ms cloak duration (GHOST)
    | 'CLOAKED_CRIT_CHANCE' // +X% crit chance when cloaked (GHOST)
    | 'SPEED_PERCENT';      // +X% speed (GHOST)

export interface TalentEffect {
    type: TalentEffectType;
    value: number;
}

export interface Talent {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji
    tier: number; // 1, 2, 3
    maxRank: number;
    cost: number; // Pilot Points per rank
    effects: TalentEffect[];
    requires?: string[]; // Prerequisite talent IDs
}

export interface TalentTree {
    pilotId: PilotId;
    name: string;
    description: string;
    talents: Talent[];
}

export interface TalentProgress {
    talentId: string;
    currentRank: number;
}

export interface TalentPreset {
    id: string;
    name: string;
    talents: TalentProgress[];
}

export interface PilotTalentState {
    unlockedTalents: TalentProgress[];
    totalPointsSpent: number;
    presets: TalentPreset[];
}

export interface PlayerTalentState {
    [PilotId.VANGUARD]: PilotTalentState;
    [PilotId.SOLARIS]: PilotTalentState;
    [PilotId.HYDRA]: PilotTalentState;
    [PilotId.WYRM]: PilotTalentState;
    [PilotId.GHOST]: PilotTalentState;
    availablePoints: number;
    totalPointsEarned: number;
}
