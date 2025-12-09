
export enum GameState {
  MENU = 'MENU',
  BRIEFING = 'BRIEFING',
  COMBAT = 'COMBAT',
  HANGAR = 'HANGAR',
  EVENT = 'EVENT',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
  ENDLESS = 'ENDLESS'
}

export enum PilotId {
  VANGUARD = 'vanguard',
  SOLARIS = 'solaris',
  HYDRA = 'hydra',
  WYRM = 'wyrm',
  GHOST = 'ghost'
}

export type PilotModule = 'ASSAULT' | 'DEFENSE';

export type HazardType = 'NONE' | 'ACID_RAIN' | 'ION_STORM' | 'SEISMIC_ACTIVITY';

export type EnemyIntent = 'ATTACK' | 'HEAL' | 'CHARGE' | 'DEFEND';

export type StatusType = 'SHIELDED' | 'OVERDRIVE' | 'STUNNED' | 'BURNING';

export type MissionType = 'ASSAULT' | 'DEFENSE' | 'SURVIVAL';

export type EnemyAffix = 'NONE' | 'VOLATILE' | 'SHIELDED' | 'VAMPIRIC' | 'SWIFT' | 'ARMORED';

// Difficulty & Modifiers System
export type DifficultyLevel = 'RECRUIT' | 'VETERAN' | 'ELITE' | 'NIGHTMARE';

export type DailyModifier = 'DOUBLE_HAZARDS' | 'BOSS_RUSH' | 'PACIFIST' | 'NONE';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  icon: string;
  enemyHpMult: number;
  enemyDmgMult: number;
  scrapMult: number;
  permadeath: boolean;
  lives: number;
  description: string;
}

// Crafting System
export interface CraftingRecipe {
  id: string;
  name: string;
  result: Consumable;
  requirements: {
    consumableId?: string;
    count: number;
    scrap?: number;
  }[];
  description: string;
  unlockedAtStage?: number; // New property: stage at which the recipe unlocks
}


export type BossAbilityType =
  | 'AOE_LASER_BARRAGE'     // Damages player (multi-hit)
  | 'SHIELD_WALL'           // Gains temporary invulnerability
  | 'SUMMON_ADDS'           // Spawns minion enemies
  | 'OVERLOAD'              // High damage single target
  | 'REGENERATE'            // Heals HP over time
  | 'PHASE_SHIFT'           // Becomes evasive
  | 'GRAVITY_WELL'          // Slows player charge rate
  | 'CORRUPTED_DATA'        // DoT effect on player
  | 'ENERGY_DRAIN'          // Drains player energy (Solaris)
  | 'HEAT_SURGE';           // Increases player heat (Hydra)

export interface BossPhase {
  hpThreshold: number;           // HP% to trigger this phase (100, 66, 33, 0)
  abilities: BossAbilityType[];  // Available abilities in this phase
  pattern: 'AGGRESSIVE' | 'DEFENSIVE' | 'BERSERK' | 'TACTICAL';
  statusImmunities?: StatusType[]; // Immune to specific statuses
  dialogue?: string;               // Phase transition dialogue
  damageMultiplier?: number;       // Optional damage modifier
  speedMultiplier?: number;        // Optional speed modifier
}

export interface BossDialogue {
  intro: string[];        // Lines before combat
  phaseTransitions: string[]; // Lines when changing phases
  defeat: string;         // Final words
  victory?: string;       // If player loses
}

export interface BossTemplate {
  id: string;
  name: string;
  title: string;          // e.g., "ALPHA SENTINEL: PERIMETER GUARDIAN"
  maxHp: number;
  speed: number;
  damage: number;
  flavorText: string;
  scrapValue: number;
  phases: BossPhase[];
  dialogue: BossDialogue;
  minionsTemplate?: {     // For bosses that summon
    name: string;
    maxHp: number;
    damage: number;
    speed: number;
  };
}

export interface BossData {
  templateId: string;
  currentPhaseIndex: number;
  phasesTriggered: number[];
  lastAbilityUsed: number; // timestamp
  abilityChargeProgress: number; // 0-100 for charged abilities
}

export interface ActiveStatus {
  id: string;
  type: StatusType;
  durationMs: number;
  value?: number; // e.g., burn damage per tick
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  count: number;
  maxCount: number;
  color: string;
  cost: number;
}

export interface Loadout {
  id: string; // Unique identifier
  name: string;
  pilotId: PilotId;
  module: PilotModule;
  consumables: Consumable[];
  color: string; // Hex color for customization
  createdAt: number; // Timestamp
  lastUsed?: number; // Track usage
}

export interface Augmentation {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  cost: number;
  icon: string; // Brief ASCII or Symbol representation
  synergyId?: SynergyId;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  damageMult: number;
  cooldownMs: number; // Time in MS before reuse
  energyCost?: number;
  heatCost?: number;
  isAoe?: boolean; // Hits all enemies?
  stuns?: boolean; // Resets enemy ATB?
}

export interface PilotConfig {
  id: PilotId;
  name: string;
  mechName: string;
  flavor: string;
  color: string;
  textColor: string;
  borderColor: string;
  statsDescription: string;
  mechanicDescription: string;
  baseHp: number;
  baseSpeed: number;
  baseDamage: number;
  abilities: Ability[];
  unlockLevel?: number;
  unlockKills?: number;
}

export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'info' | 'damage' | 'enemy' | 'alert' | 'special' | 'hazard' | 'crit' | 'status' | 'loot';
  timestamp: number;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  speed: number;
  damage: number;
  scrapValue: number;
  flavorText: string;
  intent: EnemyIntent;
  isCharged: boolean;
  actionCharge: number; // 0-100% ATB Gauge
  statuses: ActiveStatus[];
  isBoss?: boolean;
  affix?: EnemyAffix; // Elite modifier
  bossData?: BossData; // Only for boss enemies
  weakPoint?: WeakPoint; // NEW: Optional weak point for advanced combat
}

// Combo state tracking for combo system
export interface ComboState {
  count: number;
  lastHitTime: number;
  multiplier: number;
}

// Enemy weak point definition 
export interface WeakPoint {
  abilityType?: string; // Specific ability ID substring that triggers (e.g., 'emp', 'laser')
  damageMultiplier: number; // Usually 2.0
  description: string;
}

export type CombatEffect = 'NORMAL' | 'CRITICAL' | 'COUNTER' | 'WEAK_POINT' | 'COMBO';

// Synergy System
export type SynergyId = 'INFERNO' | 'BLOOD_SHELL';

export interface Synergy {
  id: SynergyId;
  name: string;
  description: string;
  augmentationIds: string[]; // Augmentations required for this synergy
}

export interface PlayerProfile {
  xp: number;
  level: number;
  missionsCompleted: number;
  totalKills: number;
}

export interface RunState {
  isActive: boolean;
  currentStage: number; // 1 to 5
  scrap: number;
  currentHp: number; // Persist HP between stages
  maxHpUpgrade: number;
  damageUpgrade: number;
  consumables: Consumable[];
  augmentations: string[]; // IDs of acquired augmentations
  pilotId?: PilotId;
  moduleId?: PilotModule;
  missionType?: MissionType;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  choices: {
    text: string;
    outcomeText: string;
    effect: (runState: RunState) => Partial<RunState>; // Returns state updates
  }[];
}

export interface GameSettings {
  reduceMotion: boolean;
  slowLogs: boolean;
  // Audio Settings
  volume: number;        // 0.0 - 1.0
  musicVolume: number;         // 0.0 - 1.0
  sfxVolume: number;          // 0.0 - 1.0
  isMuted: boolean;
  voiceLinesEnabled: boolean;
  // Visual Settings
  showDamageNumbers: boolean;
  screenShake: boolean;
  performanceMode?: boolean;
  combatLogFontSize?: number;
  colorblindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  keybindings?: Record<string, string>;
  // Gameplay Settings
  combatSpeed: 'slow' | 'normal' | 'fast';
  tutorialCompleted: boolean;
  autoSaveInterval?: number;
}

export interface GameStats {
  // Combat Stats
  totalDamageDealt: number;
  totalDamageTaken: number;
  criticalHits: number;
  abilitiesUsed: number;

  // Victory Stats
  fastestWinTime: number; // in seconds, 0 = not set
  longestWinStreak: number;
  currentWinStreak: number;
  perfectRuns: number; // Runs completed without taking damage

  // Boss Stats
  bossesDefeated: number;
  bossesDefeatedLowHp: number; // < 20% HP
  bossesPerfect: number; // No damage taken

  // Item Stats
  consumablesUsed: number;
  augmentationsOwned: string[];
  pilotsUnlocked: string[];

  // Survival Stats
  survivalWins: number;
  defenseWins: number;
  highestStageReached: number;

  // Time Stats
  totalPlayTimeSeconds: number;
  runStartTime?: number; // Track current run start

  // Flags for specific achievements
  noDamageTakenThisRun: boolean;
  noConsumablesUsedThisRun: boolean;

  // NEW: Detailed Statistics
  runsCompleted: number;
  runsFailed: number;
  pilotUsageCount: Record<string, number>; // PilotId -> count
  pilotStats: Record<string, {
    wins: number;
    losses: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    kills: number;
    timePlayed: number;
  }>;
  enemiesKilledByType: Record<string, number>; // Enemy name -> count
  hazardsSurvived: Record<string, number>; // HazardType -> count
  itemsUsedByType: Record<string, number>; // Consumable ID -> count
  abilitiesUsedByType: Record<string, number>; // Ability ID -> count
  stageStats: Record<number, {
    wins: number;
    losses: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    kills: number;
    timePlayed: number;
  }>;
  killTimestamps: { enemyName: string, timestamp: number }[];

  // Endless Mode Stats
  endlessHighestWave?: number;
  endlessHighScore?: number;
  endlessRunsCompleted?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'COMBAT' | 'SURVIVAL' | 'SPEED' | 'COLLECTION' | 'MASTERY';
  icon: string; // Emoji or symbol
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  hidden?: boolean; // Hide from UI until unlocked
  condition: (stats: GameStats, profile: PlayerProfile) => boolean;
  reward?: {
    type: 'TITLE' | 'XP' | 'UNLOCK';
    value: string | number;
  };
}

export interface AchievementProgress {
  achievementId: string;
  unlockedAt: number; // Timestamp
  justUnlocked?: boolean; // For notification display
}

export interface GameContextType {
  profile: PlayerProfile;
  settings: GameSettings;
  runState: RunState;
  hasActiveRun: boolean;
  stats: GameStats;
  achievements: AchievementProgress[];
  loadouts: Loadout[];
  addXp: (amount: number) => void;
  addKill: () => void;
  addScrap: (amount: number) => void;
  startRun: (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => void;
  endRun: () => void;
  updateRunHp: (hp: number) => void;
  updateRunConsumables: (consumables: Consumable[]) => void;
  updateRunState: (updates: Partial<RunState>) => void;
  purchaseUpgrade: (type: 'hp' | 'dmg' | 'repair' | 'item' | 'aug', itemId?: string, cost?: number) => void;
  purchaseAugmentation: (augmentationId: string, cost: number) => void;
  advanceStage: () => void;
  toggleSetting: (setting: keyof GameSettings) => void;
  updateSettings: (updates: Partial<GameSettings>) => void;
  isPilotUnlocked: (pilot: PilotConfig) => boolean;
  // Achievement system
  checkAchievements: () => AchievementProgress[];
  recordStat: (stat: keyof GameStats, value: number | string | string[]) => void;
  incrementStat: (stat: keyof GameStats, amount?: number) => void;
  startRunTimer: () => void;
  endRunTimer: () => number;
  recordDamageDealt: (amount: number) => void;
  recordDamageTaken: (amount: number) => void;
  recordCriticalHit: () => void;
  // NEW: Detailed statistics tracking
  recordRunOutcome: (success: boolean) => void;
  recordPilotUsage: (pilotId: PilotId) => void;
  recordEnemyKill: (enemyName: string) => void;
  recordHazardSurvival: (hazardType: HazardType) => void;
  recordItemUsage: (itemId: string) => void;
  recordAbilityUsage: (abilityId: string) => void;
  // NEW: Loadout management
  createLoadout: (name: string, pilotId: PilotId, module: PilotModule, consumables: Consumable[], color: string) => void;
  updateLoadout: (id: string, updates: Partial<Loadout>) => void;
  deleteLoadout: (id: string) => void;
  applyLoadout: (id: string) => { pilot: PilotConfig, module: PilotModule, consumables: Consumable[] } | null;
  // NEW: Difficulty & Modifiers System
  difficulty: DifficultyLevel;
  dailyModifier: DailyModifier;
  lives: number;
  setDifficulty: (level: DifficultyLevel) => void;
  getDailyModifier: () => DailyModifier;
  loseLife: () => void;
  // NEW: Crafting System
  craftedItems: Consumable[];
  craftItem: (recipeId: string) => boolean;
  canCraft: (recipeId: string) => boolean;
  // NEW: Endless Mode System
  endlessState: EndlessRunState;
  leaderboard: EndlessLeaderboardEntry[];
  startEndlessRun: (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => void;
  endEndlessRun: () => void;
  advanceEndlessWave: () => void;
  applyEndlessUpgrade: (upgradeId: string) => void;
  getLeaderboard: (filters?: { difficulty?: DifficultyLevel; pilotId?: PilotId }) => EndlessLeaderboardEntry[];
  calculateEndlessScore: () => number;
  updateEndlessState: (updates: Partial<EndlessRunState>) => void;
  // NEW: Codex/Lore System
  codex: import('./types/codex').CodexState;
  unlockCodexPilot: (pilotId: PilotId) => void;
  unlockCodexLore: (loreId: string) => void;
  unlockCodexAudioLog: (chance?: number) => void;
  recordCodexEnemyKill: (enemyType: string) => void;
  markCodexEntryRead: (entryId: string) => void;
  getCodexProgress: () => import('./types/codex').CodexProgress;
  // NEW: Replay System
  replayState: import('./types/replay').ReplayState;
  saveReplay: (replay: import('./types/replay').CombatReplay) => void;
  deleteReplay: (replayId: string) => void;
  clearAllReplays: () => void;
  getReplayById: (id: string) => import('./types/replay').CombatReplay | undefined;
  // NEW: Talent System
  talentState: import('./types/talents').PlayerTalentState;
  unlockTalent: (pilotId: PilotId, talent: import('./types/talents').Talent) => void;
  resetTalents: (pilotId: PilotId) => void;
}

// Endless Mode System Types
export interface EndlessRunState {
  isActive: boolean;
  currentWave: number;
  totalKills: number;
  waveKills: number;
  startTime: number;
  lastUpgradeWave: number;
  currentHp: number;
  maxHp: number;
  baseDamage: number;
  scrap: number;
  consumables: Consumable[];
  augmentations: string[];
  pilotId?: PilotId;
  moduleId?: PilotModule;
  appliedUpgrades: string[]; // Track which upgrades have been applied
  cooldownReduction: number; // Percentage cooldown reduction from upgrades
}

export interface EndlessLeaderboardEntry {
  id: string;
  wave: number;
  kills: number;
  score: number;
  pilotId: PilotId;
  difficulty: DifficultyLevel;
  date: number;
  survivalTimeSeconds: number;
}

export interface EndlessUpgrade {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  icon: string;
  apply: (state: EndlessRunState) => EndlessRunState;
}

