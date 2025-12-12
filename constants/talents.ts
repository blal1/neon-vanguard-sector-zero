import { TalentTree, Talent } from '../types/talents';
import { PilotId, Synergy } from '../types';

// ============================================
// VANGUARD TALENT TREE (Tank/Sustain)
// ============================================
const VANGUARD_TALENTS: Talent[] = [
    // Tier 1
    {
        id: 'vanguard_armor_plating',
        name: 'Armor Plating',
        description: '+10% Maximum HP per rank',
        icon: '🛡️',
        tier: 1,
        maxRank: 3,
        cost: 1,
        effects: [{ type: 'MAX_HP_PERCENT', value: 10 }]
    },
    {
        id: 'vanguard_reactive_armor',
        name: 'Reactive Armor',
        description: 'Reflect 15% damage taken per rank',
        icon: '⚡',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'THORNS_DAMAGE', value: 15 }]
    },
    {
        id: 'vanguard_emergency_repair',
        name: 'Emergency Repair',
        description: '+20% HP regeneration rate per rank',
        icon: '❤️',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'REGEN_PERCENT', value: 20 }]
    },
    // Tier 2
    {
        id: 'vanguard_fortified_core',
        name: 'Fortified Core',
        description: '+50 Flat Maximum HP per rank',
        icon: '💎',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'MAX_HP_FLAT', value: 50 }],
        requires: ['vanguard_armor_plating']
    },
    {
        id: 'vanguard_shield_matrix',
        name: 'Shield Matrix',
        description: '+5% Dodge Chance per rank',
        icon: '🌀',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'DODGE_CHANCE', value: 5 }],
        requires: ['vanguard_reactive_armor']
    },
    {
        id: 'vanguard_resilience',
        name: 'Resilience',
        description: '-5% Damage Taken per rank',
        icon: '💪',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'DAMAGE_TAKEN_REDUCTION', value: 5 }],
        requires: ['vanguard_emergency_repair']
    },
    // Tier 3 (Ultimate)
    {
        id: 'vanguard_unstoppable',
        name: 'Unstoppable',
        description: '+100 HP and +10% Damage',
        icon: '👑',
        tier: 3,
        maxRank: 1,
        cost: 3,
        effects: [
            { type: 'MAX_HP_FLAT', value: 100 },
            { type: 'DAMAGE_PERCENT', value: 10 }
        ],
        requires: ['vanguard_fortified_core', 'vanguard_shield_matrix']
    }
];

// ============================================
// SOLARIS TALENT TREE (Crit/Efficiency)
// ============================================
const SOLARIS_TALENTS: Talent[] = [
    //Tier 1
    {
        id: 'solaris_critical_enhancement',
        name: 'Critical Enhancement',
        description: '+5% Critical Hit Chance per rank',
        icon: '⚡',
        tier: 1,
        maxRank: 3,
        cost: 1,
        effects: [{ type: 'CRIT_CHANCE', value: 5 }]
    },
    {
        id: 'solaris_lethal_precision',
        name: 'Lethal Precision',
        description: '+25% Critical Damage per rank',
        icon: '🎯',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'CRIT_DAMAGE', value: 25 }]
    },
    {
        id: 'solaris_energy_efficiency',
        name: 'Energy Efficiency',
        description: '+20 Maximum Energy per rank',
        icon: '⚡',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'ENERGY_MAX', value: 20 }]
    },
    // Tier 2
    {
        id: 'solaris_rapid_capacitor',
        name: 'Rapid Capacitor',
        description: '-10% Ability Cooldowns per rank',
        icon: '⏱️',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'COOLDOWN_REDUCTION', value: 10 }],
        requires: ['solaris_energy_efficiency']
    },
    {
        id: 'solaris_overcharge',
        name: 'Overcharge',
        description: '+10% Damage when Energy is full per rank',
        icon: '💥',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'FULL_ENERGY_DAMAGE_BONUS', value: 10 }],
        requires: ['solaris_critical_enhancement']
    },
    // Tier 3
    {
        id: 'solaris_assassination_protocol',
        name: 'Assassination Protocol',
        description: '+15% Damage and +10% Crit Chance',
        icon: '💀',
        tier: 3,
        maxRank: 1,
        cost: 3,
        effects: [
            { type: 'DAMAGE_PERCENT', value: 15 },
            { type: 'CRIT_CHANCE', value: 10 }
        ],
        requires: ['solaris_critical_enhancement', 'solaris_rapid_capacitor']
    }
];

// ============================================
// HYDRA TALENT TREE (Damage/Evasion)
// ============================================
const HYDRA_TALENTS: Talent[] = [
    // Tier 1
    {
        id: 'hydra_tactical_advantage',
        name: 'Tactical Advantage',
        description: '+10% Damage per rank',
        icon: '🔫',
        tier: 1,
        maxRank: 3,
        cost: 1,
        effects: [{ type: 'DAMAGE_PERCENT', value: 10 }]
    },
    {
        id: 'hydra_evasive_maneuvers',
        name: 'Evasive Maneuvers',
        description: '+8% Dodge Chance per rank',
        icon: '💨',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'DODGE_CHANCE', value: 8 }]
    },
    {
        id: 'hydra_venting_efficiency',
        name: 'Venting Efficiency',
        description: '-10% Heat Generation per rank',
        icon: '♨️',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'HEAT_REDUCTION', value: 10 }]
    },
    // Tier 2
    {
        id: 'hydra_energy_routing',
        name: 'Energy Routing',
        description: '+10 Energy and +5% Regen per rank',
        icon: '⚙️',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [
            { type: 'ENERGY_MAX', value: 10 },
            { type: 'ENERGY_REGEN', value: 5 }
        ],
        requires: ['hydra_tactical_advantage']
    },
    {
        id: 'hydra_focused_fire',
        name: 'Focused Fire',
        description: '+15% Damage to single target abilities per rank',
        icon: '🔥',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'SINGLE_TARGET_DAMAGE', value: 15 }],
        requires: ['hydra_tactical_advantage']
    },
    // Tier 3
    {
        id: 'hydra_phantom_strike',
        name: 'Phantom Strike',
        description: '+20% Crit Damage and +5% Dodge',
        icon: '👻',
        tier: 3,
        maxRank: 1,
        cost: 3,
        effects: [
            { type: 'CRIT_DAMAGE', value: 20 },
            { type: 'DODGE_CHANCE', value: 5 }
        ],
        requires: ['hydra_evasive_maneuvers', 'hydra_energy_routing']
    }
];

// ============================================
// WYRM TALENT TREE (Power/Durability)
// ============================================
const WYRM_TALENTS: Talent[] = [
    // Tier 1
    {
        id: 'wyrm_bulwark',
        name: 'Bulwark',
        description: '+15% Maximum HP per rank',
        icon: '🏰',
        tier: 1,
        maxRank: 3,
        cost: 1,
        effects: [{ type: 'MAX_HP_PERCENT', value: 15 }]
    },
    {
        id: 'wyrm_power_core',
        name: 'Power Core',
        description: '+12% Damage per rank',
        icon: '⚙️',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'DAMAGE_PERCENT', value: 12 }]
    },
    {
        id: 'wyrm_burrow_mastery',
        name: 'Burrow Mastery',
        description: '-10% Burrow Cooldown per rank',
        icon: '🕳️',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'BURROW_COOLDOWN_REDUCTION', value: 10 }],
    },
    // Tier 2
    {
        id: 'wyrm_reinforced_plating',
        name: 'Reinforced Plating',
        description: '+30 HP and +10% Thorns per rank',
        icon: '🛡️',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [
            { type: 'MAX_HP_FLAT', value: 30 },
            { type: 'THORNS_DAMAGE', value: 10 }
        ],
        requires: ['wyrm_bulwark']
    },
    {
        id: 'wyrm_acidic_bile',
        name: 'Acidic Bile',
        description: 'Acid Bile ability now applies 2s BURNING per rank',
        icon: '🧪',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'ACID_BILE_BURN', value: 2000 }], // Value in ms
        requires: ['wyrm_power_core']
    },
    // Tier 3
    {
        id: 'wyrm_juggernaut',
        name: 'Juggernaut',
        description: '+80 HP and +15% Damage',
        icon: '⚔️',
        tier: 3,
        maxRank: 1,
        cost: 3,
        effects: [
            { type: 'MAX_HP_FLAT', value: 80 },
            { type: 'DAMAGE_PERCENT', value: 15 }
        ],
        requires: ['wyrm_power_core', 'wyrm_reinforced_plating']
    }
];

// ============================================
// GHOST TALENT TREE (Stealth/Speed)
// ============================================
const GHOST_TALENTS: Talent[] = [
    // Tier 1
    {
        id: 'ghost_phantom_reflexes',
        name: 'Phantom Reflexes',
        description: '+10% Dodge Chance per rank',
        icon: '👻',
        tier: 1,
        maxRank: 3,
        cost: 1,
        effects: [{ type: 'DODGE_CHANCE', value: 10 }]
    },
    {
        id: 'ghost_assassination_training',
        name: 'Assassination Training',
        description: '+8% Damage per rank',
        icon: '🗡️',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'DAMAGE_PERCENT', value: 8 }]
    },
    {
        id: 'ghost_swift_strike',
        name: 'Swift Strike',
        description: '-10% Ability Cooldowns per rank',
        icon: '⚡',
        tier: 1,
        maxRank: 2,
        cost: 1,
        effects: [{ type: 'COOLDOWN_REDUCTION', value: 10 }]
    },
    // Tier 2
    {
        id: 'ghost_extended_cloak',
        name: 'Extended Cloak',
        description: '+2s Vanish duration per rank',
        icon: '🌫️',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'CLOAK_DURATION', value: 2000 }], // Value in ms
        requires: ['ghost_phantom_reflexes']
    },
    {
        id: 'ghost_critical_shadow',
        name: 'Critical Shadow',
        description: '+10% Crit Chance when cloaked per rank',
        icon: '🎯',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'CLOAKED_CRIT_CHANCE', value: 10 }],
        requires: ['ghost_assassination_training']
    },
    {
        id: 'ghost_phase_walk',
        name: 'Phase Walk',
        description: '+15% Speed per rank',
        icon: '💨',
        tier: 2,
        maxRank: 2,
        cost: 2,
        effects: [{ type: 'SPEED_PERCENT', value: 15 }],
        requires: ['ghost_swift_strike']
    },
    // Tier 3 (Ultimate)
    {
        id: 'ghost_spectral_assassin',
        name: 'Spectral Assassin',
        description: '+20% Damage and +10% Dodge',
        icon: '👤',
        tier: 3,
        maxRank: 1,
        cost: 3,
        effects: [
            { type: 'DAMAGE_PERCENT', value: 20 },
            { type: 'DODGE_CHANCE', value: 10 }
        ],
        requires: ['ghost_critical_shadow', 'ghost_extended_cloak']
    }
];

export const TALENT_SYNERGIES: Synergy[] = [
    {
        id: 'vanguard_unbreakable',
        name: 'UNBREAKABLE',
        description: 'Massive HP and Armor boost when core talents are combined.',
        augmentationIds: ['vanguard_armor_plating', 'vanguard_shield_matrix'],
        effects: [{ type: 'DAMAGE_TAKEN_REDUCTION', value: 10 }]
    },
    {
        id: 'solaris_solar_flare',
        name: 'SOLAR FLARE',
        description: 'Critical hits have a chance to stun enemies.',
        augmentationIds: ['solaris_critical_enhancement', 'solaris_overcharge'],
        effects: [{ type: 'CRIT_STUN_CHANCE', value: 25 }]
    },
    // NEW SYNERGIES
    {
        id: 'vanguard_iron_will',
        name: 'IRON WILL',
        description: 'Emergency Repair + Resilience = Survive lethal hit once per combat.',
        augmentationIds: ['vanguard_emergency_repair', 'vanguard_resilience'],
        effects: [{ type: 'CHEAT_DEATH', value: 1 }]
    },
    {
        id: 'solaris_energy_overload',
        name: 'ENERGY OVERLOAD',
        description: 'Energy Efficiency + Rapid Capacitor = 25% reduced energy costs.',
        augmentationIds: ['solaris_energy_efficiency', 'solaris_rapid_capacitor'],
        effects: [{ type: 'ENERGY_COST_REDUCTION', value: 25 }]
    },
    {
        id: 'hydra_phantom_protocol',
        name: 'PHANTOM PROTOCOL',
        description: 'Evasive Maneuvers + Tactical Advantage = 30% counter chance on dodge.',
        augmentationIds: ['hydra_evasive_maneuvers', 'hydra_tactical_advantage'],
        effects: [{ type: 'COUNTER_ON_DODGE', value: 30 }]
    },
    {
        id: 'wyrm_living_tank',
        name: 'LIVING TANK',
        description: 'Bulwark + Power Core = Regenerate HP when taking damage.',
        augmentationIds: ['wyrm_bulwark', 'wyrm_power_core'],
        effects: [{ type: 'REGEN_ON_DAMAGE', value: 5 }]
    },
    {
        id: 'ghost_shadow_assassin',
        name: 'SHADOW ASSASSIN',
        description: 'Phantom Reflexes + Assassination Training = Guaranteed crit from stealth.',
        augmentationIds: ['ghost_phantom_reflexes', 'ghost_assassination_training'],
        effects: [{ type: 'STEALTH_CRIT', value: 100 }]
    }
];

export const getTalentTree = (pilotId: PilotId): Talent[] => {
    switch (pilotId) {
        case PilotId.VANGUARD:
            return VANGUARD_TALENTS;
        case PilotId.SOLARIS:
            return SOLARIS_TALENTS;
        case PilotId.HYDRA:
            return HYDRA_TALENTS;
        case PilotId.WYRM:
            return WYRM_TALENTS;
        case PilotId.GHOST:
            return GHOST_TALENTS;
        default:
            return [];
    }
};