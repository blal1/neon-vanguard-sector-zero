
import { PilotConfig, PilotId, Consumable, GameEvent, MissionType, Augmentation, BossTemplate, DifficultyLevel, DifficultyConfig, CraftingRecipe, DailyModifier, PilotModule } from './types';

export const MODULES: PilotModule[] = ['ASSAULT', 'DEFENSE'];


export const COMBAT_CONFIG = {
  TICK_RATE_MS: 50, // Faster internal tick for smoother feel, logic scaled accordingly
  BASE_CHARGE_RATE: 1.0,
  HAZARD_CHANCE_PER_TICK: 0.0025, // adjusted for 50ms tick
  HAZARD_DURATION_MS: 8000,
  SOLARIS_REGEN_PER_TICK: 0.1,
  HYDRA_COOL_RATE: 0.5,
  VANGUARD_REGEN_PER_TICK: 0.075,
  ENEMY_AI: {
    CHARGE_RATE_BASE: 0.5, // Base charge per tick
    HEAL_THRESHOLD: 0.3, // 30% HP
    HEAL_CHANCE: 0.4, // Chance to choose heal if low HP
    CHARGE_CHANCE: 0.2, // Chance to charge up
  },
  STATUS: {
    BURN_DAMAGE_PER_TICK: 0.2,
    OVERDRIVE_SELF_DMG_PER_TICK: 0.1,
    OVERDRIVE_DMG_MULT: 1.5
  }
};

// Advanced Combat Mechanics Configuration
export const COMBAT_MECHANICS = {
  // Combo System
  COMBO_TIMEOUT: 2000, // 2 seconds between hits to maintain combo
  COMBO_MULTIPLIERS: {
    2: 1.1,  // 10% bonus at 2 combo
    3: 1.25, // 25% bonus at 3 combo
    5: 1.5,  // 50% bonus at 5 combo
    10: 2.0  // 100% bonus at 10 combo
  } as Record<number, number>,

  // Counter-Attack System
  COUNTER_STATUSES: ['SHIELD', 'GUARD', 'FORTIFIED'] as const,
  COUNTER_CHANCE: 0.3, // 30% chance when under counter-enabled status
  COUNTER_DAMAGE_MULTIPLIER: 1.5,

  // Weak Points
  WEAK_POINT_MULTIPLIER: 2.0,

  // Visual Effects
  CRIT_FLASH_DURATION: 200, // ms
  SCREEN_SHAKE_DURATION: 300, // ms
  COMBO_DISPLAY_DURATION: 1500 // ms
};

export const RUN_CONFIG = {
  MAX_STAGES: 5,
  DIFFICULTY_SCALING_HP: 0.2, // +20% HP per stage
  DIFFICULTY_SCALING_DMG: 0.15, // +15% Dmg per stage
  SCRAP_BASE_DROP: 10,
  SCRAP_VAR_DROP: 5
};

export const SHOP_PRICES = {
  REPAIR: 15, // Repair 20 HP
  UPGRADE_HP: 50, // +10 Max HP
  UPGRADE_DMG: 75, // +1 Base Dmg
};

export const STAGE_CONFIG: Record<number, { mission: MissionType, title: string }> = {
  1: { mission: 'ASSAULT', title: "PERIMETER BREACH" },
  2: { mission: 'DEFENSE', title: "UPLINK DEFENSE" },
  3: { mission: 'ASSAULT', title: "DEEP SECTOR" },
  4: { mission: 'SURVIVAL', title: "SWARM SURVIVAL" },
  5: { mission: 'ASSAULT', title: "CORE ASSAULT" } // Boss logic handled in generator
};

export const CONSUMABLES: Consumable[] = [
  {
    id: 'nano_stim',
    name: 'NANO-STIM',
    description: 'Repair 50 HP.',
    count: 2,
    maxCount: 2,
    color: 'text-green-400 border-green-400',
    cost: 30
  },
  {
    id: 'coolant',
    name: 'L-COOLANT',
    description: '-50 HEAT / +20 ENERGY',
    count: 2,
    maxCount: 2,
    color: 'text-blue-400 border-blue-400',
    cost: 25
  },
  {
    id: 'emp_grenade',
    name: 'EMP CHARGE',
    description: 'STUN all enemies (5s).',
    count: 1,
    maxCount: 1,
    color: 'text-yellow-400 border-yellow-400',
    cost: 40
  },
  {
    id: 'overdrive_inj',
    name: 'OVERDRIVE',
    description: '+50% DMG (10s). Takes HP.',
    count: 1,
    maxCount: 1,
    color: 'text-red-500 border-red-500',
    cost: 45
  }
];

export const SYNERGIES: Synergy[] = [
  {
    id: 'INFERNO',
    name: 'INFERNO',
    description: '+50% fire damage, enemies burn longer',
    augmentationIds: ['thermal_conv', 'plasma_coating']
  },
  {
    id: 'BLOOD_SHELL',
    name: 'BLOOD SHELL',
    description: 'Heal when enemies attack you',
    augmentationIds: ['vamp_nanites', 'static_shell']
  }
];

// Difficulty System Configurations
export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  RECRUIT: {
    id: 'RECRUIT',
    name: 'Recruit',
    icon: '🟢',
    enemyHpMult: 0.5,
    enemyDmgMult: 1.0,
    scrapMult: 1.5,
    permadeath: false,
    lives: 999,
    description: 'Easy mode. Enemies have 50% HP, +50% scrap rewards.'
  },
  VETERAN: {
    id: 'VETERAN',
    name: 'Veteran',
    icon: '🟡',
    enemyHpMult: 1.0,
    enemyDmgMult: 1.0,
    scrapMult: 1.0,
    permadeath: false,
    lives: 999,
    description: 'Normal difficulty. Balanced challenge.'
  },
  ELITE: {
    id: 'ELITE',
    name: 'Elite',
    icon: '🔴',
    enemyHpMult: 1.5,
    enemyDmgMult: 1.5,
    scrapMult: 2.0,
    permadeath: false,
    lives: 999,
    description: 'Hard mode. Enemies +50% HP/DMG, +100% scrap.'
  },
  NIGHTMARE: {
    id: 'NIGHTMARE',
    name: 'Nightmare',
    icon: '⚫',
    enemyHpMult: 2.0,
    enemyDmgMult: 2.0,
    scrapMult: 3.0,
    permadeath: true,
    lives: 1,
    description: 'EXTREME. +100% HP/DMG, Permadeath, 1 life only.'
  }
};

// Endless Mode Configuration
export const ENDLESS_CONFIG = {
  WAVE_HP_SCALING: 0.15,        // +15% HP per wave
  WAVE_DMG_SCALING: 0.10,       // +10% damage per wave
  UPGRADE_INTERVAL: 5,          // Free upgrade every 5 waves
  BASE_ENEMIES_PER_WAVE: 3,     // Starting enemy count
  ENEMY_SCALING_PER_WAVE: 0.2,  // +0.2 enemies per wave (every 5 waves = +1 enemy)
  BOSS_WAVE_INTERVAL: 10,       // Boss every 10 waves
  SCORE_PER_WAVE: 100,
  SCORE_PER_KILL: 10,
  SCORE_TIME_BONUS_PER_MINUTE: 50,
  WAVE_CLEAR_HP_BONUS: 10,      // HP restored per wave clear
  UPGRADE_CHOICES: 3            // Number of upgrade options to present
};

// Endless Mode Upgrades
export const ENDLESS_UPGRADES: any[] = [
  // COMMON Upgrades (70% chance)
  {
    id: 'hp_boost_small',
    name: '+15 MAX HP',
    description: 'Increase maximum health.',
    rarity: 'COMMON',
    icon: '💚',
    apply: (state: any) => ({ ...state, maxHp: state.maxHp + 15, currentHp: state.currentHp + 15 })
  },
  {
    id: 'dmg_boost_small',
    name: '+2 DAMAGE',
    description: 'Increase base damage.',
    rarity: 'COMMON',
    icon: '⚔️',
    apply: (state: any) => ({ ...state, baseDamage: state.baseDamage + 2 })
  },
  {
    id: 'heal_small',
    name: 'HEAL 30 HP',
    description: 'Restore health immediately.',
    rarity: 'COMMON',
    icon: '💉',
    apply: (state: any) => ({ ...state, currentHp: Math.min(state.maxHp, state.currentHp + 30) })
  },
  {
    id: 'scrap_bonus',
    name: '+50 SCRAP',
    description: 'Gain bonus scrap.',
    rarity: 'COMMON',
    icon: '💰',
    apply: (state: any) => ({ ...state, scrap: state.scrap + 50 })
  },

  // RARE Upgrades (25% chance)
  {
    id: 'hp_boost_large',
    name: '+30 MAX HP',
    description: 'Large health increase.',
    rarity: 'RARE',
    icon: '💙',
    apply: (state: any) => ({ ...state, maxHp: state.maxHp + 30, currentHp: state.currentHp + 30 })
  },
  {
    id: 'dmg_boost_large',
    name: '+5 DAMAGE',
    description: 'Significant damage boost.',
    rarity: 'RARE',
    icon: '🗡️',
    apply: (state: any) => ({ ...state, baseDamage: state.baseDamage + 5 })
  },
  {
    id: 'cooldown_redux',
    name: '-15% COOLDOWNS',
    description: 'Reduce all ability cooldowns.',
    rarity: 'RARE',
    icon: '⏱️',
    apply: (state: any) => ({ ...state, cooldownReduction: state.cooldownReduction + 0.15 })
  },
  {
    id: 'free_consumable',
    name: 'FREE ITEM',
    description: 'Choose a free consumable.',
    rarity: 'RARE',
    icon: '🎁',
    apply: (state: any) => state // Handled specially in UI
  },

  // LEGENDARY Upgrades (5% chance)
  {
    id: 'full_heal',
    name: 'FULL RESTORE',
    description: 'Restore to maximum HP.',
    rarity: 'LEGENDARY',
    icon: '✨',
    apply: (state: any) => ({ ...state, currentHp: state.maxHp })
  },
  {
    id: 'mega_boost',
    name: 'MEGA BOOST',
    description: '+50 HP & +10 DMG.',
    rarity: 'LEGENDARY',
    icon: '🌟',
    apply: (state: any) => ({
      ...state,
      maxHp: state.maxHp + 50,
      currentHp: state.currentHp + 50,
      baseDamage: state.baseDamage + 10
    })
  },
  {
    id: 'free_augmentation',
    name: 'FREE AUGMENTATION',
    description: 'Choose a free augmentation.',
    rarity: 'LEGENDARY',
    icon: '⭐',
    apply: (state: any) => state // Handled specially in UI
  }
];


// Crafting Recipes
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'mega_stim',
    name: 'MEGA-STIM',
    result: {
      id: 'mega_stim',
      name: 'MEGA-STIM',
      description: 'Repair 100 HP.',
      count: 1,
      maxCount: 1,
      color: 'text-green-500 border-green-500',
      cost: 0 // Not purchasable, only craftable
    },
    requirements: [
      { consumableId: 'nano_stim', count: 2 },
      { count: 0, scrap: 50 }
    ],
    description: '2x NANO-STIM + 50 Scrap',
    unlockedAtStage: 2 // Unlocks after Stage 1
  },
  {
    id: 'cryo_bomb',
    name: 'CRYO-BOMB',
    result: {
      id: 'cryo_bomb',
      name: 'CRYO-BOMB',
      description: 'STUN all enemies (8s) + SLOW.',
      count: 1,
      maxCount: 1,
      color: 'text-cyan-400 border-cyan-400',
      cost: 0
    },
    requirements: [
      { consumableId: 'emp_grenade', count: 1 },
      { consumableId: 'coolant', count: 1 }
    ],
    description: 'EMP CHARGE + L-COOLANT',
    unlockedAtStage: 3 // Unlocks after Stage 2
  },
  {
    id: 'scrap_converter',
    name: 'SCRAP CONVERTER',
    result: {
      id: 'scrap_converter',
      name: 'SCRAP CONVERTER',
      description: 'Converts 2 NANO-STIM into 75 Scrap.',
      count: 0, // Not a consumable, effect is immediate
      maxCount: 0,
      color: 'text-yellow-500 border-yellow-500',
      cost: 0
    },
    requirements: [
      { consumableId: 'nano_stim', count: 2 }
    ],
    description: '2x NANO-STIM for 75 Scrap',
    unlockedAtStage: 1
  },
  {
    id: 'repair_kit',
    name: 'REPAIR KIT',
    result: {
      id: 'repair_kit',
      name: 'REPAIR KIT',
      description: 'Restores 40 HP.',
      count: 1,
      maxCount: 3,
      color: 'text-green-400 border-green-400',
      cost: 0
    },
    requirements: [
      { scrap: 30 }
    ],
    description: '30 Scrap for 1 REPAIR KIT',
    unlockedAtStage: 1
  }
];

export const AUGMENTATIONS: Augmentation[] = [
  {
    id: 'thermal_conv',
    name: 'THERMAL CONVERTER',
    description: '+1 DMG per 10% HEAT.',
    rarity: 'RARE',
    cost: 120,
    icon: '[H+]',
    synergyId: 'INFERNO'
  },
  {
    id: 'vamp_nanites',
    name: 'VAMPIRIC NANITES',
    description: '+5 HP on KILL.',
    rarity: 'RARE',
    cost: 110,
    icon: '[V+]',
    synergyId: 'BLOOD_SHELL'
  },
  {
    id: 'static_shell',
    name: 'STATIC SHELL',
    description: 'Attackers take 5 DMG.',
    rarity: 'COMMON',
    cost: 80,
    icon: '[S-]',
    synergyId: 'BLOOD_SHELL'
  },
  {
    id: 'adrenaline_inj',
    name: 'ADRENALINE INJECTOR',
    description: '2x SPEED if HP < 30%.',
    rarity: 'LEGENDARY',
    cost: 150,
    icon: '[A*]'
  },
  {
    id: 'overclock_chip',
    name: 'OVERCLOCK CHIP',
    description: '-20% all cooldowns.',
    rarity: 'RARE',
    cost: 100,
    icon: '[C-]'
  },
  {
    id: 'plasma_coating',
    name: 'PLASMA COATING',
    description: 'Burn enemies on hit.',
    rarity: 'RARE',
    cost: 90,
    icon: '[F!]',
    synergyId: 'INFERNO'
  }
];

// Elite Enemy Affixes
export const ENEMY_AFFIXES = {
  VOLATILE: {
    name: 'VOLATILE',
    color: '#ef4444', // red-500
    hpMult: 0.7, // Less HP
    dmgMult: 1.0,
    scrapMult: 1.5,
    effect: 'EXPLODE_ON_DEATH' // Deals AOE damage
  },
  SHIELDED: {
    name: 'SHIELDED',
    color: '#3b82f6', // blue-500
    hpMult: 1.0,
    dmgMult: 0.8,
    scrapMult: 1.3,
    effect: 'IGNORE_FIRST_HIT' // Blocks first attack
  },
  VAMPIRIC: {
    name: 'VAMPIRIC',
    color: '#a855f7', // purple-500
    hpMult: 1.2,
    dmgMult: 1.1,
    scrapMult: 1.8,
    effect: 'LIFESTEAL' // Heals 50% of damage dealt
  },
  SWIFT: {
    name: 'SWIFT',
    color: '#fbbf24', // amber-400
    hpMult: 0.8,
    dmgMult: 0.9,
    scrapMult: 1.2,
    effect: 'DOUBLE_SPEED' // Charges action bar 2x faster
  },
  ARMORED: {
    name: 'ARMORED',
    color: '#6b7280', // gray-500
    hpMult: 1.5,
    dmgMult: 0.7,
    scrapMult: 1.4,
    effect: 'DAMAGE_REDUCTION' // Takes 30% less damage
  }
};

export const NARRATIVE_EVENTS: GameEvent[] = [
  {
    id: 'salvage_pod',
    title: "ABANDONED SUPPLY POD",
    text: "You discover a pristine supply pod half-buried in rubble. It's locked with biometric scanners. Forcing it might damage the contents or trigger a failsafe.",
    choices: [
      {
        text: "FORCE OPEN [STR]",
        outcomeText: "You rip the door open. You find scrap, but shrapnel damages your hull.",
        effect: (state) => ({ scrap: state.scrap + 40, currentHp: Math.max(1, state.currentHp - 15) })
      },
      {
        text: "LEAVE IT",
        outcomeText: "You decide it's not worth the risk and move on.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'strange_signal',
    title: "GHOST SIGNAL",
    text: "Your comms pick up a distress signal from a fallen pilot nearby. It could be a trap, or they might have valuable data.",
    choices: [
      {
        text: "INVESTIGATE",
        outcomeText: "It was a trap! An automated turret fires before you disable it. You salvage its parts.",
        effect: (state) => ({ scrap: state.scrap + 25, currentHp: Math.max(1, state.currentHp - 10) })
      },
      {
        text: "IGNORE",
        outcomeText: "You block the frequency and focus on the mission.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'repair_station',
    title: "AUTO-DOC STATION",
    text: "An active medical repair station hums in the corner of a ruined lab. It has one charge left.",
    choices: [
      {
        text: "USE REPAIR [FREE]",
        outcomeText: "Nanites swarm your hull, knitting metal back together.",
        effect: (state) => ({ currentHp: state.currentHp + 30 })
      },
      {
        text: "SALVAGE FOR PARTS",
        outcomeText: "You strip the valuable components.",
        effect: (state) => ({ scrap: state.scrap + 30 })
      }
    ]
  },
  {
    id: 'ambush_mines',
    title: "MINEFIELD DETECTED",
    text: "Proximity mines litter the corridor ahead. Your sensors detect a safe path, but it's narrow and time-consuming.",
    choices: [
      {
        text: "RUSH THROUGH",
        outcomeText: "Explosions rock your mech! You make it through but at a cost.",
        effect: (state) => ({ currentHp: Math.max(1, state.currentHp - 25) })
      },
      {
        text: "CAREFUL NAVIGATION",
        outcomeText: "You navigate safely but waste precious time. Still, you're intact.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'data_cache',
    title: "ENCRYPTED DATA CACHE",
    text: "You find a secure data terminal with valuable intel. Breaking the encryption might yield tactical advantages—or alert security.",
    choices: [
      {
        text: "HACK TERMINAL [TECH]",
        outcomeText: "Success! You gain access to enemy patrol routes and scrap locations.",
        effect: (state) => ({ scrap: state.scrap + 50 })
      },
      {
        text: "LEAVE IT",
        outcomeText: "Better safe than sorry. You move on without incident.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'rogue_ai',
    title: "ROGUE AI CONTACT",
    text: "A fragmented AI offers you a deal: temporary combat enhancements in exchange for carrying its data core. It might be a trick.",
    choices: [
      {
        text: "ACCEPT DEAL",
        outcomeText: "Your systems surge with power! The AI seems... dormant. For now.",
        effect: (state) => ({ damageUpgrade: state.damageUpgrade + 2 })
      },
      {
        text: "REFUSE",
        outcomeText: "The AI screams in frustration before going silent. You're on your own.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'scavenger_merchant',
    title: "SCAVENGER OUTPOST",
    text: "A wandering merchant offers black market augmentations. Prices are steep but the quality seems genuine.",
    choices: [
      {
        text: "BUY UPGRADE (80 SCRAP)",
        outcomeText: "A risky investment pays off. Your systems feel noticeably improved.",
        effect: (state) => state.scrap >= 80 ? ({ scrap: state.scrap - 80, maxHpUpgrade: state.maxHpUpgrade + 20 }) : ({})
      },
      {
        text: "WALK AWAY",
        outcomeText: "You keep your scrap. The merchant shrugs and disappears into the shadows.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'power_surge',
    title: "UNSTABLE REACTOR",
    text: "You stumble upon a critical power reactor. It's overloading! You could harness the energy or shut it down safely.",
    choices: [
      {
        text: "HARNESS ENERGY",
        outcomeText: "Your shields overload with energy! Max HP increased, but you took feedback damage.",
        effect: (state) => ({ maxHpUpgrade: state.maxHpUpgrade + 15, currentHp: Math.max(1, state.currentHp - 10) })
      },
      {
        text: "SHUT DOWN SAFELY",
        outcomeText: "Crisis averted. The facility powers down without incident.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'memorial',
    title: "PILOT MEMORIAL",
    text: "You find a memorial wall listing fallen pilots. One name stands out—a legendary ace from your training days. Their mech's data core might still be accessible.",
    choices: [
      {
        text: "DOWNLOAD DATA",
        outcomeText: "Combat protocols uploaded. You feel their skill flowing through your systems.",
        effect: (state) => ({ damageUpgrade: state.damageUpgrade + 1 })
      },
      {
        text: "PAY RESPECTS",
        outcomeText: "You take a moment of silence. Some things are more important than upgrades.",
        effect: (state) => ({})
      }
    ]
  },
  {
    id: 'combat_drone',
    title: "FRIENDLY COMBAT DRONE",
    text: "A damaged friendly drone offers to join you for one sector. Its weapons are still functional but its power is limited.",
    choices: [
      {
        text: "ACCEPT HELP",
        outcomeText: "The drone's targeting data improves your accuracy. Damage increased for this stage!",
        effect: (state) => ({ damageUpgrade: state.damageUpgrade + 3 })
      },
      {
        text: "DECLINE",
        outcomeText: "You thank the drone but continue solo. It powers down respectfully.",
        effect: (state) => ({})
      }
    ]
  }
];

export const BOSS_TEMPLATES: BossTemplate[] = [
  // STAGE 1: ALPHA SENTINEL - Tutorial Boss
  {
    id: 'alpha_sentinel',
    name: 'ALPHA SENTINEL',
    title: 'ALPHA SENTINEL: PERIMETER GUARDIAN',
    maxHp: 300,
    speed: 0.5,
    damage: 18,
    flavorText: 'charges fusion cannon',
    scrapValue: 80,
    phases: [
      {
        hpThreshold: 100,
        abilities: ['AOE_LASER_BARRAGE'],
        pattern: 'AGGRESSIVE',
        dialogue: 'ALPHA SENTINEL ONLINE. SCANNING TARGET...'
      },
      {
        hpThreshold: 50,
        abilities: ['AOE_LASER_BARRAGE', 'SHIELD_WALL'],
        pattern: 'DEFENSIVE',
        dialogue: 'DAMAGE DETECTED. ACTIVATING SHIELD PROTOCOLS.',
        damageMultiplier: 0.9,
        speedMultiplier: 1.2
      }
    ],
    dialogue: {
      intro: [
        'ALPHA SENTINEL ONLINE. SCANNING TARGET...',
        'THREAT LEVEL: MODERATE. ENGAGING PROTOCOL SIGMA.',
        'ELIMINATING INTRUDER.'
      ],
      phaseTransitions: [],
      defeat: 'CRITICAL FAILURE... UPLINK... COM__ROMISED...'
    }
  },

  // STAGE 2: HYDRA CORE - Regeneration Boss
  {
    id: 'hydra_core',
    name: 'HYDRA CORE',
    title: 'HYDRA CORE: BIO-MECHANICAL NIGHTMARE',
    maxHp: 400,
    speed: 0.6,
    damage: 20,
    flavorText: 'pulses with corrupted energy',
    scrapValue: 120,
    phases: [
      {
        hpThreshold: 100,
        abilities: ['CORRUPTED_DATA', 'REGENERATE'],
        pattern: 'TACTICAL'
      },
      {
        hpThreshold: 66,
        abilities: ['REGENERATE', 'SUMMON_ADDS'],
        pattern: 'DEFENSIVE',
        dialogue: 'STRUCTURAL INTEGRITY FAILING. DEPLOYING REPAIR DRONES.',
        speedMultiplier: 0.8
      },
      {
        hpThreshold: 33,
        abilities: ['CORRUPTED_DATA', 'SUMMON_ADDS', 'OVERLOAD'],
        pattern: 'AGGRESSIVE',
        dialogue: 'CORE DESTABILIZING. INITIATE EMERGENCY PROTOCOLS.',
        damageMultiplier: 1.3
      }
    ],
    dialogue: {
      intro: [
        'HYDRA CORE ACTIVE. BIOLOGICAL MATTER DETECTED.',
        'ANOMALY SIGNATURE CONFIRMED. NEUTRALIZATION AUTHORIZED.',
        'ASSIMILATION SEQUENCE: COMMENCE.'
      ],
      phaseTransitions: [],
      defeat: 'C-CORE... MELTDOWN... CONTA__INATION SPREAD___'
    },
    minionsTemplate: {
      name: 'REPAIR DRONE',
      maxHp: 40,
      damage: 8,
      speed: 0.9
    }
  },

  // STAGE 3: CRIMSON PHANTOM - Speed/Evasion Boss
  {
    id: 'crimson_phantom',
    name: 'CRIMSON PHANTOM',
    title: 'CRIMSON PHANTOM: STEALTH ASSASSIN',
    maxHp: 350,
    speed: 1.2,
    damage: 25,
    flavorText: 'flickers in and out of reality',
    scrapValue: 150,
    phases: [
      {
        hpThreshold: 100,
        abilities: ['CORRUPTED_DATA', 'ENERGY_DRAIN'],
        pattern: 'AGGRESSIVE',
        speedMultiplier: 1.5
      },
      {
        hpThreshold: 50,
        abilities: ['PHASE_SHIFT', 'CORRUPTED_DATA', 'HEAT_SURGE'],
        pattern: 'TACTICAL',
        dialogue: 'YOU CANNOT HIT WHAT YOU CANNOT SEE.',
        damageMultiplier: 1.2,
        speedMultiplier: 2.0
      }
    ],
    dialogue: {
      intro: [
        '...',
        'TARGET LOCKED. GHOST PROTOCOL ENGAGED.',
        'YOUR DEATH WILL BE... SILENT.'
      ],
      phaseTransitions: [],
      defeat: 'IMPOS__SIBLE... CLOAK... FAILUR___'
    }
  },

  // STAGE 4: OMEGA PRIME - Balanced/All-Rounder Boss
  {
    id: 'omega_prime',
    name: 'OMEGA PRIME',
    title: 'OMEGA PRIME: COMMAND UNIT',
    maxHp: 500,
    speed: 0.7,
    damage: 28,
    flavorText: 'calculates optimal strike vector',
    scrapValue: 200,
    phases: [
      {
        hpThreshold: 100,
        abilities: ['AOE_LASER_BARRAGE', 'GRAVITY_WELL'],
        pattern: 'TACTICAL'
      },
      {
        hpThreshold: 66,
        abilities: ['OVERLOAD', 'SHIELD_WALL', 'GRAVITY_WELL'],
        pattern: 'DEFENSIVE',
        dialogue: 'THREAT ASSESSMENT: ELEVATED. SWITCHING TO SIEGE MODE.',
        damageMultiplier: 1.1
      },
      {
        hpThreshold: 33,
        abilities: ['AOE_LASER_BARRAGE', 'OVERLOAD', 'CORRUPTED_DATA'],
        pattern: 'AGGRESSIVE',
        dialogue: 'CRITICAL DAMAGE. ALL LIMITERS RELEASED.',
        damageMultiplier: 1.4,
        speedMultiplier: 1.3
      }
    ],
    dialogue: {
      intro: [
        'OMEGA PRIME ONLINE. COMMAND AUTHORIZATION VERIFIED.',
        'ANALYZING COMBAT PARAMETERS...',
        'PROBABILITY OF YOUR SURVIVAL: 12.7%. ENGAGING.'
      ],
      phaseTransitions: [],
      defeat: 'UNACCEPTABLE... RECALCULATING... ERR__OR... SHUTTING DO___'
    }
  },

  // STAGE 5: THE ARCHITECT - Final Boss
  {
    id: 'the_architect',
    name: 'THE ARCHITECT',
    title: 'THE ARCHITECT: SECTOR ZERO OVERSEER',
    maxHp: 666,
    speed: 0.8,
    damage: 30,
    flavorText: 'manipulates reality itself',
    scrapValue: 300,
    phases: [
      {
        hpThreshold: 100,
        abilities: ['GRAVITY_WELL', 'CORRUPTED_DATA'],
        pattern: 'TACTICAL',
        statusImmunities: ['STUNNED']
      },
      {
        hpThreshold: 75,
        abilities: ['SUMMON_ADDS', 'SHIELD_WALL', 'ENERGY_DRAIN'],
        pattern: 'DEFENSIVE',
        dialogue: 'FASCINATING. YOU\'VE MADE IT THIS FAR. LET\'S TEST YOUR RESOLVE.',
        speedMultiplier: 0.9
      },
      {
        hpThreshold: 50,
        abilities: ['AOE_LASER_BARRAGE', 'PHASE_SHIFT', 'HEAT_SURGE'],
        pattern: 'AGGRESSIVE',
        dialogue: 'ENOUGH GAMES. WITNESS TRUE POWER.',
        damageMultiplier: 1.3,
        speedMultiplier: 1.2
      },
      {
        hpThreshold: 25,
        abilities: ['OVERLOAD', 'CORRUPTED_DATA', 'AOE_LASER_BARRAGE'],
        pattern: 'BERSERK',
        dialogue: 'IMPOSSIBLE! I AM THE ARCHITECT! I CONTROL EVERYTHING!',
        damageMultiplier: 1.6,
        speedMultiplier: 1.5,
        statusImmunities: ['STUNNED', 'BURNING']
      }
    ],
    dialogue: {
      intro: [
        'AT LAST... A VISITOR.',
        'I AM THE ARCHITECT. THIS IS MY DOMAIN.',
        'YOU HAVE DISRUPTED MY WORK. THAT WAS... UNWISE.',
        'PREPARE TO BE DELETED.'
      ],
      phaseTransitions: [],
      defeat: 'NO... THIS ISN\'T... HOW IT ENDS...',
      victory: 'PREDICTABLE. YOUR STRUGGLE WAS... AMUSING.'
    },
    minionsTemplate: {
      name: 'ELITE ENFORCER',
      maxHp: 80,
      damage: 15,
      speed: 0.8
    }
  }
];

export const PILOTS: PilotConfig[] = [
  {
    id: PilotId.VANGUARD,
    name: "Cpt. Iron Jackson",
    mechName: "IRON VANGUARD",
    flavor: "Battle-scarred veteran with a cybernetic eye. Built for endurance.",
    color: "#ffae00",
    textColor: "text-amber-500",
    borderColor: "border-amber-500",
    statsDescription: "HP++ | SPEED- | REGEN+",
    mechanicDescription: "NANITE REPAIR. Passive Armor Regen. Standard cooldowns.",
    baseHp: 150,
    baseSpeed: 0.8,
    baseDamage: 12,
    abilities: [
      {
        id: 'vanguard_shot',
        name: "AUTOCANNON",
        description: "Standard kinetic round.",
        damageMult: 1.0,
        cooldownMs: 0
      },
      {
        id: 'vanguard_stun',
        name: "SHOCK ROUND",
        description: "Low DMG. Resets enemy Action Bar.",
        damageMult: 0.5,
        cooldownMs: 8000,
        stuns: true
      }
    ]
  },
  {
    id: PilotId.SOLARIS,
    name: "Caelan Spark Voss",
    mechName: "SOLARIS UNIT",
    flavor: "Tech prodigy. Wired directly into the mainframe.",
    color: "#facc15",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-400",
    statsDescription: "HP- | SPEED++ | ENERGY++",
    mechanicDescription: "ENERGY SYSTEM. Attacks drain Energy. SHIFT to Recharge.",
    baseHp: 85,
    baseSpeed: 1.4,
    baseDamage: 10,
    unlockLevel: 3,
    abilities: [
      {
        id: 'solaris_beam',
        name: "PHOTON RAY",
        description: "Precise laser beam. Low Cost.",
        damageMult: 1.2,
        cooldownMs: 0,
        energyCost: 20
      },
      {
        id: 'solaris_aoe',
        name: "CORONA DISCHARGE",
        description: "Hits ALL enemies. High Cost.",
        damageMult: 0.8,
        cooldownMs: 5000,
        energyCost: 45,
        isAoe: true
      }
    ]
  },
  {
    id: PilotId.HYDRA,
    name: "Magnus Hammertoes",
    mechName: "HYDRA M-40",
    flavor: "Mercenary with a love for rotary cannons and noise.",
    color: "#2dd4bf",
    textColor: "text-teal-400",
    borderColor: "border-teal-400",
    statsDescription: "DMG++ | SPEED-- | HEAT!!",
    mechanicDescription: "HEAT SYSTEM. Fire raises Heat. 100% Heat = JAMMED. SHIFT to Vent.",
    baseHp: 110,
    baseSpeed: 0.7,
    baseDamage: 18,
    unlockLevel: 2,
    abilities: [
      {
        id: 'hydra_spin',
        name: "VULCAN SPIN",
        description: "Heavy fire. Builds Heat.",
        damageMult: 1.0,
        cooldownMs: 0,
        heatCost: 15
      },
      {
        id: 'hydra_missile',
        name: "HELLFIRE SALVO",
        description: "Massive DMG. Massive Heat.",
        damageMult: 2.0,
        cooldownMs: 10000,
        heatCost: 40
      }
    ]
  },
  {
    id: PilotId.WYRM,
    name: "Subject 89",
    mechName: "GRAVEL WYRM",
    flavor: "A bio-mechanical horror retrieved from the deep mines.",
    color: "#4ade80",
    textColor: "text-green-400",
    borderColor: "border-green-400",
    statsDescription: "HP+ | SPECIAL++",
    mechanicDescription: "AMBUSH. SHIFT to Burrow (Invulnerable). SPACE to Devour from below.",
    baseHp: 120,
    baseSpeed: 1.0,
    baseDamage: 14,
    unlockKills: 50,
    abilities: [
      {
        id: 'wyrm_spit',
        name: "ACID BILE",
        description: "Corrosive bio-matter.",
        damageMult: 1.0,
        cooldownMs: 0
      },
      {
        id: 'wyrm_tunnel',
        name: "TECTONIC BITE",
        description: "High DMG if Burrowed.",
        damageMult: 1.5,
        cooldownMs: 6000
      }
    ]
  }
];

export const FLAVOR_INTRO = [
  "INITIALIZING NEURAL LINK...",
  "ESTABLISHING SECURE CONNECTION TO SECTOR ZERO...",
  "WARNING: MUTAGENIC ANOMALIES DETECTED. PROCEED WITH CAUTION."
];

export const BRIEFING_TEXT = `SECTOR ZERO: HOSTILE TERRITORY

Intel intercepts show increased activity in this perimeter. Command is sending you in to neutralize all threats and secure the uplink node.

MISSION PARAMETERS:
- ELIMINATE all hostile mechs
- SECURE salvage and scrap materials  
- SURVIVE through 5 escalating combat sectors
- EXFILTRATE with critical data

HAZARD WARNING: Environmental conditions are unstable. Expect acid rain, ion storms, and seismic activity.

AUTHORIZATION CODE: [CLASSIFIED]

Good hunting, Pilot. Sector Command out.`;

export const ENEMY_TEMPLATES = [
  // STAGE 1: Basic Grunts
  {
    name: 'Scout Drone',
    maxHp: 30,
    speed: 1.2,
    damage: 8,
    flavorText: 'whirs and scans',
    scrapValue: 5
  },
  {
    name: 'Security Bot',
    maxHp: 50,
    speed: 0.9,
    damage: 12,
    flavorText: 'clanks with purpose',
    scrapValue: 8
  },
  // STAGE 2: More advanced
  {
    name: 'Assault Mech',
    maxHp: 75,
    speed: 0.8,
    damage: 15,
    flavorText: 'primes its cannon',
    scrapValue: 12
  },
  {
    name: 'Field Medic',
    maxHp: 40,
    speed: 1.0,
    damage: 5,
    flavorText: 'readies repair arm',
    scrapValue: 10,
    behavior: 'HEALER'
  },
  // STAGE 3: Heavies
  {
    name: 'Siege Breaker',
    maxHp: 120,
    speed: 0.6,
    damage: 20,
    flavorText: 'powers up its shields',
    scrapValue: 20,
    behavior: 'TANK'
  },
  {
    name: 'Hunter Killer',
    maxHp: 60,
    speed: 1.5,
    damage: 18,
    flavorText: 'activates stealth field',
    scrapValue: 18
  },
  // STAGE 4: Elites
  {
    name: 'Artillery Cannon',
    maxHp: 90,
    speed: 0.4,
    damage: 25,
    flavorText: 'takes aim...',
    scrapValue: 25,
    behavior: 'CHARGER'
  },
  {
    name: 'Corrupted Myrmidon',
    maxHp: 100,
    speed: 1.1,
    damage: 22,
    flavorText: 'drips with corrosive slime',
    scrapValue: 22
  },
  // STAGE 5: Apex Predators
  {
    name: 'Executioner',
    maxHp: 150,
    speed: 0.7,
    damage: 30,
    flavorText: 'revs its chainblade',
    scrapValue: 35
  },
  {
    name: 'Annihilator',
    maxHp: 200,
    speed: 0.5,
    damage: 40,
    flavorText: 'glows with immense power',
    scrapValue: 50
  }
];