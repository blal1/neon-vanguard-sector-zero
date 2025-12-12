import { PilotConfig, PilotModule, PilotId, HazardType, Enemy, EnemyIntent, Ability, ActiveStatus, Consumable, RunState, EnemyAffix, BossTemplate, BossPhase, BossAbilityType, BossData, Synergy, WeakPoint } from '../types';
import { COMBAT_CONFIG, RUN_CONFIG, BOSS_TEMPLATES, ENEMY_AFFIXES, ENDLESS_CONFIG } from '../constants';
import { getActiveSynergies } from './synergyUtils';
import { calculateSynergyEffects } from './combatUtils_augmentations';
import { getAllEnemyTemplates } from '../data/dataManager';

// Weak Point Templates - define enemy vulnerabilities
export const WEAK_POINT_TEMPLATES: Record<string, WeakPoint> = {
  electronic: {
    abilityType: 'emp',
    damageMultiplier: 2.0,
    description: 'VULNERABLE TO EMP'
  },
  armored: {
    abilityType: 'heavy',
    damageMultiplier: 1.75,
    description: 'WEAK TO HEAVY WEAPONS'
  },
  organic: {
    abilityType: 'bio',
    damageMultiplier: 2.0,
    description: 'VULNERABLE TO BIO ATTACKS'
  },
  shielded: {
    abilityType: 'overcharge',
    damageMultiplier: 1.5,
    description: 'SHIELD DISRUPTION WEAKNESS'
  },
  thermal: {
    abilityType: 'laser',
    damageMultiplier: 1.75,
    description: 'WEAK TO THERMAL DAMAGE'
  }
};

// Map enemy name patterns to weak point types
const ENEMY_WEAK_POINT_MAP: Record<string, string> = {
  'drone': 'electronic',
  'sentinel': 'electronic',
  'mech': 'armored',
  'tank': 'armored',
  'behemoth': 'armored',
  'crawler': 'organic',
  'swarm': 'organic',
  'hunter': 'organic',
  'guardian': 'shielded',
  'defender': 'shielded',
  'wraith': 'thermal',
  'shadow': 'thermal'
};

/**
 * Determines the weak point for an enemy based on its name/type
 */
export const getWeakPointForEnemy = (enemyName: string, isElite: boolean = false): WeakPoint | undefined => {
  const nameLower = enemyName.toLowerCase();

  // Check for matching weak point
  for (const [pattern, weakPointType] of Object.entries(ENEMY_WEAK_POINT_MAP)) {
    if (nameLower.includes(pattern)) {
      return WEAK_POINT_TEMPLATES[weakPointType];
    }
  }

  // Elite enemies always have a weak point (random if not mapped)
  if (isElite) {
    const types = Object.keys(WEAK_POINT_TEMPLATES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return WEAK_POINT_TEMPLATES[randomType];
  }

  // Regular enemies have 40% chance of a random weak point
  if (Math.random() < 0.4) {
    const types = Object.keys(WEAK_POINT_TEMPLATES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return WEAK_POINT_TEMPLATES[randomType];
  }

  return undefined;
};

/**
 * Checks if an ability hits an enemy's weak point
 */
export const checkWeakPointHit = (ability: Ability, enemy: Enemy): { hit: boolean; multiplier: number } => {
  if (!enemy.weakPoint || !enemy.weakPoint.abilityType) {
    return { hit: false, multiplier: 1.0 };
  }

  // Check if ability ID contains the weak point trigger
  const abilityIdLower = ability.id.toLowerCase();
  const triggerLower = enemy.weakPoint.abilityType.toLowerCase();

  if (abilityIdLower.includes(triggerLower)) {
    return { hit: true, multiplier: enemy.weakPoint.damageMultiplier };
  }

  return { hit: false, multiplier: 1.0 };
};

/**
 * Calculates the maximum HP of a pilot based on module and run upgrades.
 */
export const calculateMaxHp = (pilot: PilotConfig, module: PilotModule, runState: RunState): number => {
  let hp = pilot.baseHp;
  if (module === 'DEFENSE') hp += 30;
  if (module === 'ASSAULT') hp -= 20;

  // Apply Run Upgrades
  hp += runState.maxHpUpgrade;

  return hp;
};

/**
 * Calculates the base damage of a pilot based on module and run upgrades.
 */
export const calculateDamage = (
  pilot: PilotConfig,
  module: PilotModule,
  statuses: ActiveStatus[],
  runState: RunState,
  currentHeat: number = 0,
  activeSynergies: Synergy[] = []
): number => {
  let dmg = pilot.baseDamage;
  if (module === 'ASSAULT') dmg += 3;
  if (module === 'DEFENSE') dmg -= 2;

  // Apply Run Upgrades
  dmg += runState.damageUpgrade;

  // Check for Overdrive
  if (statuses.some(s => s.type === 'OVERDRIVE')) {
    dmg *= COMBAT_CONFIG.STATUS.OVERDRIVE_DMG_MULT;
  }

  // Apply Augmentations
  if (runState.augmentations.includes('thermal_conv')) {
    // +1 DMG per 10% heat
    dmg += Math.floor(currentHeat / 10);
  }

  // Apply Synergy effects
  if (activeSynergies.some(s => s.id === 'INFERNO')) {
    dmg *= 1.5; // +50% fire damage
  }

  return Math.max(1, Math.floor(dmg));
};

export interface AbilityResult {
  damage: number;
  resourceConsumed: boolean;
  error: string | null;
  newEnergy: number;
  newHeat: number;
  jammed: boolean;
  burrowedState: boolean;
  logMessage: string;
  targetsHit: number[]; // Indices of enemies hit
  stunApplied: boolean;
  weakPointHit: boolean; // Track if weak point was triggered
  weakPointMultiplier: number; // The multiplier applied
  isCritical: boolean; // Track critical hits
}

export const calculateAbilityResult = (
  pilot: PilotConfig,
  ability: Ability,
  baseDamage: number,
  currentEnergy: number,
  currentHeat: number,
  isJammed: boolean,
  isBurrowed: boolean,
  enemies: Enemy[]
): AbilityResult => {

  let damage = Math.floor(baseDamage * ability.damageMult);
  let resourceConsumed = true;
  let error: string | null = null;
  let newEnergy = currentEnergy;
  let newHeat = currentHeat;
  let jammed = isJammed;
  let burrowedState = isBurrowed;
  let logMessage = "";
  let targetsHit: number[] = [0]; // Default single target
  let stunApplied = ability.stuns || false;
  let weakPointHit = false;
  let weakPointMultiplier = 1.0;
  let isCritical = false;

  // 1. Resource Checks
  if (ability.energyCost && currentEnergy < ability.energyCost) {
    return { damage: 0, resourceConsumed: false, error: "LOW_ENERGY", newEnergy, newHeat, jammed, burrowedState, logMessage: "INSUFFICIENT ENERGY!", targetsHit: [], stunApplied: false, weakPointHit: false, weakPointMultiplier: 1.0, isCritical: false };
  }

  if (isJammed && pilot.id === PilotId.HYDRA) {
    return { damage: 0, resourceConsumed: false, error: "JAMMED", newEnergy, newHeat, jammed, burrowedState, logMessage: "WEAPONS JAMMED!", targetsHit: [], stunApplied: false, weakPointHit: false, weakPointMultiplier: 1.0, isCritical: false };
  }

  // 2. Resource Consumption
  if (ability.energyCost) newEnergy -= ability.energyCost;
  if (ability.heatCost) {
    newHeat += ability.heatCost;
    if (newHeat >= 100) jammed = true;
  }

  // 3. Mechanic Specifics
  if (pilot.id === PilotId.WYRM) {
    if (isBurrowed) {
      damage = Math.floor(damage * 2.5); // Stealth Crit Bonus
      burrowedState = false; // Unburrow
      logMessage = `${ability.name}: AMBUSH CRIT!`;
      isCritical = true;
    } else {
      logMessage = `${ability.name} hits.`;
    }
  } else {
    logMessage = `${ability.name} firing.`;
  }

  // 4. Targeting (AOE)
  if (ability.isAoe) {
    targetsHit = enemies.map((_, index) => index);
    logMessage += ` [AOE: ${targetsHit.length} TARGETS]`;
  }

  // 5. Check for Weak Point hits on all targets
  for (const targetIdx of targetsHit) {
    const enemy = enemies[targetIdx];
    if (enemy) {
      const wpResult = checkWeakPointHit(ability, enemy);
      if (wpResult.hit) {
        weakPointHit = true;
        weakPointMultiplier = Math.max(weakPointMultiplier, wpResult.multiplier);
      }
    }
  }

  // 6. Apply weak point damage multiplier
  if (weakPointHit) {
    damage = Math.floor(damage * weakPointMultiplier);
    logMessage += ` [WEAK POINT! x${weakPointMultiplier}]`;
  }

  // 7. Critical hit chance (10% base, not on WYRM ambush which is already a crit)
  if (!isCritical && Math.random() < 0.1) {
    damage = Math.floor(damage * 1.5);
    isCritical = true;
    logMessage += ` [CRITICAL!]`;
  }

  return { damage, resourceConsumed, error, newEnergy, newHeat, jammed, burrowedState, logMessage, targetsHit, stunApplied, weakPointHit, weakPointMultiplier, isCritical };
};

/**
 * Calculates passive regeneration for specific pilots (Vanguard).
 */
export const calculatePassiveRegen = (pilotId: PilotId, currentHp: number, maxHp: number): number => {
  if (pilotId === PilotId.VANGUARD && currentHp < maxHp && currentHp > 0) {
    return Math.min(maxHp, currentHp + COMBAT_CONFIG.VANGUARD_REGEN_PER_TICK);
  }
  return currentHp;
};

interface HazardEffect {
  hpDamage: number;
  chargeDrain: number;
  energyDrain: number;
  log: string | null;
}

export const calculateHazardEffect = (
  hazard: HazardType,
  pilotId: PilotId
): HazardEffect => {
  let hpDamage = 0;
  let chargeDrain = 0;
  let energyDrain = 0;
  let log = null;

  const roll = Math.random();

  if (hazard === 'ACID_RAIN') {
    if (roll < 0.05) {
      hpDamage = 1;
      log = "ACID RAIN CORRODES ARMOR.";
    }
  }
  else if (hazard === 'ION_STORM') {
    if (roll < 0.05) {
      chargeDrain = 5;
      if (pilotId === PilotId.SOLARIS) energyDrain = 5;
      log = "ION INTERFERENCE DRAINS POWER.";
    }
  }
  else if (hazard === 'SEISMIC_ACTIVITY') {
    if (roll < 0.02) {
      hpDamage = 2;
      log = "SEISMIC IMPACT DAMAGES HULL.";
    }
  }

  return { hpDamage, chargeDrain, energyDrain, log };
};

interface EnemyAttackResult {
  damage: number;
  flavor: string;
  isCrit: boolean;
  missed: boolean;
  healed: boolean;
  charged: boolean;
  newIntent?: EnemyIntent;
  lifesteal?: number;
}

/**
 * Decides what the enemy wants to do based on its current state.
 */
export const determineEnemyIntent = (enemy: Enemy): EnemyIntent => {
  // If charged, it MUST attack
  if (enemy.isCharged) return 'ATTACK';

  const hpPercent = enemy.currentHp / enemy.maxHp;

  // Low HP Logic
  if (hpPercent < COMBAT_CONFIG.ENEMY_AI.HEAL_THRESHOLD) {
    if (Math.random() < COMBAT_CONFIG.ENEMY_AI.HEAL_CHANCE) return 'HEAL';
  }

  // Charge Logic
  if (Math.random() < COMBAT_CONFIG.ENEMY_AI.CHARGE_CHANCE) return 'CHARGE';

  return 'ATTACK';
};

/**
 * Calculates which target an enemy should prioritize in DEFENSE missions.
 * Uses intelligent decision-making based on HP ratios, enemy type, and tactical priorities.
 */
export const calculateDefenseTarget = (
  playerHp: number,
  playerMaxHp: number,
  coreHp: number,
  maxCoreHp: number,
  enemyName: string,
  isBoss: boolean
): 'PLAYER' | 'CORE' => {
  // Bosses always prioritize the player (tactical challenge)
  if (isBoss) return 'PLAYER';

  const playerHpPercent = (playerHp / playerMaxHp) * 100;
  const coreHpPercent = coreHp;

  // Critical Core Protection: If core is below 25%, all enemies swarm it
  if (coreHpPercent < 25) {
    return 'CORE';
  }

  // Opportunistic Kill: If player is critically low, most enemies target player
  if (playerHpPercent < 20) {
    return Math.random() < 0.85 ? 'PLAYER' : 'CORE';
  }

  // Calculate threat weights for decision-making
  const coreWeight = 100 - coreHpPercent; // Lower core HP = higher threat
  const playerWeight = 100 - playerHpPercent; // Lower player HP = higher threat

  // Elite enemies are smarter and prefer the weaker target
  if (enemyName.includes('[')) { // Elites have [AFFIX] prefix
    const totalWeight = coreWeight + playerWeight;
    if (totalWeight === 0) return Math.random() < 0.5 ? 'PLAYER' : 'CORE';

    // Weighted decision: target the more vulnerable one
    return Math.random() < (playerWeight / totalWeight) ? 'PLAYER' : 'CORE';
  }

  return Math.random() < 0.6 ? 'CORE' : 'PLAYER';
};

/**
 * Applies difficulty scaling to enemies in SURVIVAL missions based on wave number.
 */
export const applySurvivalScaling = (enemy: Enemy, waveNumber: number): Enemy => {
  const hpMultiplier = 1 + (waveNumber * 0.1); // +10% HP per wave
  const dmgMultiplier = 1 + (waveNumber * 0.05); // +5% damage per wave
  return {
    ...enemy,
    maxHp: Math.floor(enemy.maxHp * hpMultiplier),
    currentHp: Math.floor(enemy.maxHp * hpMultiplier),
    damage: Math.floor(enemy.damage * dmgMultiplier)
  };
};

/**
 * Resolves an enemy action based on its intent.
 */
export const resolveEnemyAction = (enemy: Enemy, isBurrowed: boolean, hazard: HazardType, activeTalentSynergies: Synergy[] = []): EnemyAttackResult => {
  // 1. Handle Non-Attack Actions
  if (enemy.intent === 'HEAL') {
    return { damage: 0, flavor: "repairs critical systems.", isCrit: false, missed: false, healed: true, charged: false, newIntent: 'ATTACK' };
  }
  if (enemy.intent === 'CHARGE') {
    return { damage: 0, flavor: "is gathering energy!", isCrit: false, missed: false, healed: false, charged: true, newIntent: 'ATTACK' };
  }

  // 2. Handle Attack
  // Base hit chance
  let hitChance = 0.9;
  if (hazard === 'SEISMIC_ACTIVITY') hitChance -= 0.3;
  if (isBurrowed) hitChance = 0;

  // Stunned enemies cannot act (should be caught before this function, but safe guard)
  if (enemy.statuses.some(s => s.type === 'STUNNED')) {
    return { damage: 0, flavor: "is STUNNED and cannot move!", isCrit: false, missed: true, healed: false, charged: false, newIntent: 'ATTACK' };
  }

  if (Math.random() > hitChance) {
    return { damage: 0, flavor: "attacks but misses!", isCrit: false, missed: true, healed: false, charged: false, newIntent: determineEnemyIntent(enemy) };
  }

  // Crit / Damage Logic
  const isCrit = Math.random() < 0.15;
  let damage = enemy.damage;
  let flavor = enemy.flavorText;

  if (enemy.isCharged) {
    damage = Math.floor(damage * 2.5); // Charged shot
    flavor = "unleashes a CHARGED BLAST!";
  } else if (isCrit) {
    damage = Math.ceil(damage * 1.5);
    flavor = "lands a CRITICAL HIT!";
  } else if (Math.random() < 0.2) {
    damage = Math.ceil(damage * 0.5);
    flavor = "grazes your armor.";
  }

  // Apply VANGUARD's UNBREAKABLE synergy
  if (activeTalentSynergies.some(s => s.id === 'vanguard_unbreakable')) {
    damage = Math.floor(damage * 0.9); // 10% damage reduction
  }

  // Apply VAMPIRIC lifesteal if applicable
  let lifesteal = 0;
  if (enemy.affix === 'VAMPIRIC' && damage > 0) {
    lifesteal = Math.max(1, Math.floor(damage * 0.3)); // Lifesteal 30% of damage dealt
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + lifesteal); // Heal enemy
  }

  return { damage, flavor, isCrit: isCrit || enemy.isCharged, missed: false, healed: false, charged: false, newIntent: determineEnemyIntent(enemy), lifesteal };
};


/**
 * Processes status effects (duration tick, dot damage)
 */
export const processStatusEffects = (
  statuses: ActiveStatus[],
  tickMs: number,
  activeSynergies: Synergy[] = []
): { newStatuses: ActiveStatus[], damageTaken: number } => {
  let damageTaken = 0;
  const newStatuses: ActiveStatus[] = [];

  const infernoSynergyActive = activeSynergies.some(s => s.id === 'INFERNO');

  for (const status of statuses) {
    let remaining = status.durationMs - tickMs;

    // Apply INFERNO synergy: enemies burn longer
    if (status.type === 'BURNING' && infernoSynergyActive) {
      remaining += tickMs * 0.5; // +50% burn duration
    }

    // Process Effects
    if (status.type === 'BURNING' || status.type === 'OVERDRIVE') {
      damageTaken += (status.value || 0);
    }

    if (remaining > 0) {
      newStatuses.push({ ...status, durationMs: remaining });
    }
  }

  return { newStatuses, damageTaken };
};

/**
 * Applies a consumable effect
 */
export const applyConsumableEffect = (
  consumableId: string,
  currentHp: number,
  maxHp: number,
  currentEnergy: number,
  currentHeat: number,
  enemies: Enemy[],
  playerStatuses: ActiveStatus[]
) => {
  let newHp = currentHp;
  let newEnergy = currentEnergy;
  let newHeat = currentHeat;
  const newPlayerStatuses = [...playerStatuses];
  const newEnemies = enemies.map(e => ({ ...e, statuses: [...e.statuses] }));
  let log = "";

  switch (consumableId) {
    case 'nano_stim':
      newHp = Math.min(maxHp, currentHp + 50);
      log = "NANO-STIM APPLIED: +50 HP";
      break;
    case 'coolant':
      newHeat = Math.max(0, currentHeat - 50);
      newEnergy = Math.min(100, currentEnergy + 20);
      log = "COOLANT FLUSHED. SYSTEMS STABLE.";
      break;
    case 'emp_grenade':
      newEnemies.forEach(e => {
        e.statuses.push({ id: `stun-${Date.now()}`, type: 'STUNNED', durationMs: 5000 });
        e.actionCharge = 0; // Reset charge
      });
      log = "EMP DETONATED. ALL TARGETS STUNNED.";
      break;
    case 'overdrive_inj':
      newPlayerStatuses.push({
        id: `od-${Date.now()}`,
        type: 'OVERDRIVE',
        durationMs: 10000,
        value: COMBAT_CONFIG.STATUS.OVERDRIVE_SELF_DMG_PER_TICK
      });
      log = "OVERDRIVE ENGAGED. DAMAGE OUTPUT INCREASED.";
      break;
    case 'mega_stim':
      newHp = Math.min(maxHp, currentHp + 100);
      log = "MEGA-STIM APPLIED: +100 HP";
      break;
    case 'cryo_bomb':
      newEnemies.forEach(e => {
        e.statuses.push({ id: `stun-${Date.now()}`, type: 'STUNNED', durationMs: 8000 });
        e.actionCharge = 0; // Reset charge
        e.speed = e.speed * 0.5; // Slow effect (reduce speed by 50%)
      });
      log = "CRYO-BOMB DETONATED. ALL TARGETS STUNNED & SLOWED.";
      break;
    case 'scrap_converter':
      // This consumable is handled by the craftItem function directly in terms of consuming materials,
      // here we only need to provide the scrap gain effect.
      // This is a special case: the effect directly modifies runState.scrap in craftItem
      // so this will only log.
      log = "NANO-STIMS CONVERTED TO SCRAP.";
      break;
    case 'repair_kit':
      newHp = Math.min(maxHp, currentHp + 40);
      log = "REPAIR KIT USED: +40 HP.";
      break;
    case 'overcharge_cell':
      newPlayerStatuses.push({ id: `overcharge-${Date.now()}`, type: 'OVERDRIVE', durationMs: 15000, value: 0 });
      log = "OVERCHARGE CELL ACTIVATED: +50% DAMAGE (15s)!";
      break;
    case 'shield_matrix':
      for (let i = 0; i < 3; i++) { newPlayerStatuses.push({ id: `shield-matrix-${Date.now()}-${i}`, type: 'SHIELDED', durationMs: 999999 }); }
      log = "SHIELD MATRIX DEPLOYED: 3-HIT SHIELD ACTIVE!";
      break;
    case 'plasma_grenade':
      newEnemies.forEach(e => { e.currentHp = Math.max(0, e.currentHp - 25); e.statuses.push({ id: `burn-plasma-${Date.now()}`, type: 'BURNING', durationMs: 8000, value: COMBAT_CONFIG.STATUS.BURN_DAMAGE_PER_TICK }); });
      log = "PLASMA GRENADE DETONATED! ALL ENEMIES BURNING!";
      break;
    case 'emergency_beacon':
      newHp = maxHp; newPlayerStatuses.push({ id: `emergency-shield-${Date.now()}`, type: 'SHIELDED', durationMs: 10000 });
      log = "EMERGENCY BEACON ACTIVATED: FULL HEAL + SHIELD!";
      break;
    case 'energy_battery':
      newEnergy = 100; newHeat = 0;
      log = "ENERGY BATTERY USED: ENERGY RESTORED, HEAT CLEARED!";
      break;
    case 'scrap_magnet':
      log = "SCRAP MAGNET ACTIVATED: +50% SCRAP FOR NEXT 3 COMBATS!";
      break;
    case 'tactical_scanner':
      log = "TACTICAL SCANNER ACTIVE: ENEMY INTENTS REVEALED!";
      break;
    default:
      break;
  }

  return { newHp, newEnergy, newHeat, newPlayerStatuses, newEnemies, log };
};

/**
 * Gets the boss for a specific stage
 */
export const getBossForStage = (stage: number): Enemy | null => {
  // Boss appears every 5 stages
  if (stage % 5 !== 0) return null;

  // Determine which boss based on stage (1-5 map to boss indices 0-4)
  const bossIndex = Math.min(Math.floor((stage - 1) / 5), BOSS_TEMPLATES.length - 1);
  const template = BOSS_TEMPLATES[bossIndex];

  // Scale boss for higher cycles (stage > 5)
  const scale = 1 + ((stage - 5) * 0.1);
  const scaledHp = Math.floor(template.maxHp * Math.max(1, scale));

  const boss: Enemy = {
    id: `boss-${template.id}-${Date.now()}`,
    name: template.name,
    maxHp: scaledHp,
    currentHp: scaledHp,
    speed: template.speed,
    damage: Math.floor(template.damage * Math.max(1, scale)),
    scrapValue: template.scrapValue,
    flavorText: template.flavorText,
    intent: 'ATTACK',
    isCharged: false,
    actionCharge: 0,
    statuses: [],
    isBoss: true,
    bossData: {
      templateId: template.id,
      currentPhaseIndex: 0,
      phasesTriggered: [],
      lastAbilityUsed: 0,
      abilityChargeProgress: 0
    }
  };

  return boss;
};

export const generateEnemies = (
  stage: number,
  difficultyHpMult: number = 1.0,
  difficultyDmgMult: number = 1.0,
  difficultyScrapMult: number = 1.0,
  dailyModifier: string = 'NONE' // New parameter
): Enemy[] => {
  // Boss Round (Every 5 stages)
  const boss = getBossForStage(stage);
  if (boss) {
    // Apply difficulty multipliers to boss
    boss.maxHp = Math.floor(boss.maxHp * difficultyHpMult);
    boss.currentHp = boss.maxHp;
    boss.damage = Math.floor(boss.damage * difficultyDmgMult);
    boss.scrapValue = Math.floor(boss.scrapValue * difficultyScrapMult);
    return [boss];
  }

  const ENEMY_TEMPLATES = getAllEnemyTemplates();

  // Difficulty Scaling (stage-based + difficulty multipliers)
  const hpMult = (1 + ((stage - 1) * RUN_CONFIG.DIFFICULTY_SCALING_HP)) * difficultyHpMult;
  const dmgMult = (1 + ((stage - 1) * RUN_CONFIG.DIFFICULTY_SCALING_DMG)) * difficultyDmgMult;

  const count = 2 + Math.floor(Math.random() * 2); // 2-3 enemies
  const newEnemies: Enemy[] = [];

  for (let i = 0; i < count; i++) {
    const template = ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];
    const hpVariance = Math.floor(Math.random() * 10) - 5;

    // Elite Logic
    let isElite = Math.random() < 0.2;
    let affix: EnemyAffix = 'NONE';
    let eliteHpMult = 1;
    let eliteDmgMult = 1;
    let eliteScrapMult = 1;
    let namePrefix = "";

    // BOSS_RUSH Modifier: Convert regular enemies to mini-bosses
    if (dailyModifier === 'BOSS_RUSH' && !isElite) {
      isElite = true; // Force elite
      affix = 'ARMORED'; // Default affix for BOSS_RUSH
      eliteHpMult = 1.5;
      eliteDmgMult = 1.3;
      eliteScrapMult = 1.5;
      namePrefix = '[ELITE] ';
    }

    if (isElite && affix === 'NONE') { // Only pick a random affix if not already set by BOSS_RUSH
      const keys = Object.keys(ENEMY_AFFIXES) as (keyof typeof ENEMY_AFFIXES)[];
      const key = keys[Math.floor(Math.random() * keys.length)];
      affix = key;
      const data = ENEMY_AFFIXES[key];
      eliteHpMult = data.hpMult;
      eliteDmgMult = data.dmgMult;
      eliteScrapMult = data.scrapMult;
      namePrefix = `[${data.name}] `;
    }

    const finalHp = Math.floor((template.maxHp + hpVariance) * hpMult * eliteHpMult);

    const newEnemy: Enemy = {
      id: `enemy-${i}-${Date.now()}`,
      ...template,
      name: `${namePrefix}${template.name}`,
      maxHp: finalHp,
      currentHp: finalHp,
      damage: Math.floor(template.damage * dmgMult * eliteDmgMult),
      scrapValue: Math.floor(template.scrapValue * difficultyScrapMult * eliteScrapMult),
      intent: 'ATTACK',
      isCharged: false,
      actionCharge: Math.floor(Math.random() * 30),
      statuses: [],
      affix: affix
    };

    // Special Init
    if (affix === 'SHIELDED') {
      newEnemy.statuses.push({ id: `shield-${Date.now()}`, type: 'SHIELDED', durationMs: 999999 });
    }

    // Assign weak point to enemy
    newEnemy.weakPoint = getWeakPointForEnemy(template.name, isElite);

    newEnemies.push(newEnemy);
  }
  return newEnemies;
};

/**
 * Checks if a boss should transition to the next phase based on HP
 */
export const checkBossPhaseTransition = (boss: Enemy): {
  shouldTransition: boolean;
  newPhase: BossPhase | null;
  dialogue: string | null;
  phaseIndex: number;
} => {
  if (!boss.bossData || !boss.isBoss) {
    return { shouldTransition: false, newPhase: null, dialogue: null, phaseIndex: 0 };
  }

  const template = BOSS_TEMPLATES.find(t => t.id === boss.bossData!.templateId);
  if (!template) {
    return { shouldTransition: false, newPhase: null, dialogue: null, phaseIndex: 0 };
  }

  const hpPercent = (boss.currentHp / boss.maxHp) * 100;

  // Find the appropriate phase based on HP threshold
  for (let i = template.phases.length - 1; i >= 0; i--) {
    const phase = template.phases[i];

    // Check if we should be in this phase and haven't triggered it yet
    if (hpPercent <= phase.hpThreshold && !boss.bossData.phasesTriggered.includes(i)) {
      return {
        shouldTransition: true,
        newPhase: phase,
        dialogue: phase.dialogue || null,
        phaseIndex: i
      };
    }
  }

  return { shouldTransition: false, newPhase: null, dialogue: null, phaseIndex: boss.bossData.currentPhaseIndex };
};

/**
 * Executes a boss special ability
 */
export const executeBossAbility = (
  boss: Enemy,
  ability: BossAbilityType,
  playerHp: number,
  playerEnergy: number,
  playerHeat: number,
  enemies: Enemy[]
): {
  playerDamage: number;
  playerEnergyDrain: number;
  playerHeatIncrease: number;
  effect: string;
  newEnemies?: Enemy[];
  statusApplied?: ActiveStatus;
  bossHealed?: number;
  appliesPlayerChargeSlow?: boolean;
  bossEvade?: boolean;
} => {
  let result = {
    playerDamage: 0,
    playerEnergyDrain: 0,
    playerHeatIncrease: 0,
    effect: '',
    newEnemies: undefined as Enemy[] | undefined,
    statusApplied: undefined as ActiveStatus | undefined,
    bossHealed: undefined as number | undefined,
    appliesPlayerChargeSlow: undefined as boolean | undefined,
    bossEvade: undefined as boolean | undefined
  };

  switch (ability) {
    case 'AOE_LASER_BARRAGE':
      result.playerDamage = Math.floor(boss.damage * 0.8);
      result.effect = `${boss.name} UNLEASHES LASER BARRAGE!`;
      break;

    case 'SHIELD_WALL':
      result.statusApplied = {
        id: `boss-shield-${Date.now()}`,
        type: 'SHIELDED',
        durationMs: 5000
      };
      result.effect = `${boss.name} ACTIVATES SHIELD WALL!`;
      break;

    case 'SUMMON_ADDS':
      const template = BOSS_TEMPLATES.find(t => t.id === boss.bossData!.templateId);
      if (template?.minionsTemplate) {
        const minionCount = Math.random() > 0.5 ? 2 : 1;
        const newMinions: Enemy[] = [];

        for (let i = 0; i < minionCount; i++) {
          const minion: Enemy = {
            id: `minion-${Date.now()}-${i}`,
            name: template.minionsTemplate.name,
            maxHp: template.minionsTemplate.maxHp,
            currentHp: template.minionsTemplate.maxHp,
            speed: template.minionsTemplate.speed,
            damage: template.minionsTemplate.damage,
            scrapValue: 5,
            flavorText: 'swarms the target',
            intent: 'ATTACK',
            isCharged: false,
            actionCharge: Math.floor(Math.random() * 40),
            statuses: []
          };
          newMinions.push(minion);
        }

        result.newEnemies = newMinions;
        result.effect = `${boss.name} SUMMONS ${minionCount} REINFORCEMENT(S)!`;
      }
      break;

    case 'OVERLOAD':
      result.playerDamage = Math.floor(boss.damage * 1.8);
      result.effect = `${boss.name} RELEASES OVERLOAD STRIKE!`;
      break;

    case 'REGENERATE':
      result.bossHealed = Math.floor(boss.maxHp * 0.15);
      result.effect = `${boss.name} INITIATES REGENERATION SEQUENCE!`;
      break;

    case 'PHASE_SHIFT':
      result.bossEvade = true;
      result.effect = `${boss.name} PHASES OUT - DODGE CHANCE INCREASED!`;
      break;

    case 'GRAVITY_WELL':
      result.appliesPlayerChargeSlow = true;
      result.effect = `${boss.name} DEPLOYS GRAVITY WELL - CHARGE RATE REDUCED!`;
      break;

    case 'CORRUPTED_DATA':
      result.statusApplied = {
        id: `corrupted-${Date.now()}`,
        type: 'BURNING',
        durationMs: 6000,
        value: 0.8
      };
      result.effect = `${boss.name} INJECTS CORRUPTED DATA!`;
      break;

    case 'ENERGY_DRAIN':
      result.playerEnergyDrain = 30;
      result.playerDamage = Math.floor(boss.damage * 0.5);
      result.effect = `${boss.name} DRAINS YOUR ENERGY!`;
      break;

    case 'HEAT_SURGE':
      result.playerHeatIncrease = 25;
      result.playerDamage = Math.floor(boss.damage * 0.5);
      result.effect = `${boss.name} CAUSES THERMAL SURGE!`;
      break;
  }


  return result;
};

/**
 * Generates enemies for endless mode waves with progressive difficulty scaling
 */
export const generateEndlessWaveEnemies = (
  wave: number,
  difficultyHpMult: number = 1.0,
  difficultyDmgMult: number = 1.0,
  dailyModifier: string = 'NONE' // New parameter
): Enemy[] => {
  const ENEMY_TEMPLATES = getAllEnemyTemplates();

  // Boss Wave (every 10 waves)
  if (wave % ENDLESS_CONFIG.BOSS_WAVE_INTERVAL === 0) {
    const bossIndex = Math.min(Math.floor(wave / ENDLESS_CONFIG.BOSS_WAVE_INTERVAL) - 1, BOSS_TEMPLATES.length - 1);
    const template = BOSS_TEMPLATES[Math.max(0, bossIndex)];

    // Scale boss for endless mode
    const scale = 1 + (wave * ENDLESS_CONFIG.WAVE_HP_SCALING);
    const scaledHp = Math.floor(template.maxHp * scale * difficultyHpMult);

    const boss: Enemy = {
      id: `endless-boss-${wave}-${Date.now()}`,
      name: `[WAVE ${wave}] ${template.name}`,
      maxHp: scaledHp,
      currentHp: scaledHp,
      damage: Math.floor(template.damage * (1 + (wave * ENDLESS_CONFIG.WAVE_DMG_SCALING)) * difficultyDmgMult),
      scrapValue: template.scrapValue * 2,
      flavorText: template.flavorText,
      intent: 'ATTACK',
      isCharged: false,
      actionCharge: 0,
      statuses: [],
      isBoss: true,
      bossData: {
        templateId: template.id,
        currentPhaseIndex: 0,
        phasesTriggered: [],
        lastAbilityUsed: 0,
        abilityChargeProgress: 0
      }
    };

    return [boss];
  }

  // Calculate progressive scaling
  const waveHpMult = 1 + (wave * ENDLESS_CONFIG.WAVE_HP_SCALING);
  const waveDmgMult = 1 + (wave * ENDLESS_CONFIG.WAVE_DMG_SCALING);
  const finalHpMult = waveHpMult * difficultyHpMult;
  const finalDmgMult = waveDmgMult * difficultyDmgMult;

  // Calculate enemy count (increases over time)
  const enemyCount = Math.min(
    8, // Cap at 8 enemies
    ENDLESS_CONFIG.BASE_ENEMIES_PER_WAVE + Math.floor(wave * ENDLESS_CONFIG.ENEMY_SCALING_PER_WAVE)
  );

  // Elite chance increases with wave number (caps at 60%)
  const eliteChance = Math.min(0.6, 0.15 + (wave * 0.02));

  const enemies: Enemy[] = [];

  for (let i = 0; i < enemyCount; i++) {
    const template = ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];
    const hpVariance = Math.floor(Math.random() * 10) - 5;

    // Elite Logic
    let isElite = Math.random() < eliteChance;
    let affix: EnemyAffix = 'NONE';
    let eliteHpMult = 1;
    let eliteDmgMult = 1;
    let eliteScrapMult = 1;
    let namePrefix = "";

    // BOSS_RUSH Modifier: Convert regular enemies to mini-bosses
    if (dailyModifier === 'BOSS_RUSH' && !isElite) {
      isElite = true; // Force elite
      affix = 'ARMORED'; // Default affix for BOSS_RUSH
      eliteHpMult = 1.5;
      eliteDmgMult = 1.3;
      eliteScrapMult = 1.5;
      namePrefix = '[ELITE] ';
    }

    if (isElite && affix === 'NONE') { // Only pick a random affix if not already set by BOSS_RUSH
      const keys = Object.keys(ENEMY_AFFIXES) as (keyof typeof ENEMY_AFFIXES)[];
      const key = keys[Math.floor(Math.random() * keys.length)];
      affix = key;
      const data = ENEMY_AFFIXES[key];
      eliteHpMult = data.hpMult;
      eliteDmgMult = data.dmgMult;
      eliteScrapMult = data.scrapMult;
      namePrefix = `[${data.name}] `;
    }

    const finalHp = Math.floor((template.maxHp + hpVariance) * finalHpMult * eliteHpMult);

    const enemy: Enemy = {
      id: `endless-enemy-${wave}-${i}-${Date.now()}`,
      ...template,
      name: `${namePrefix}${template.name}`,
      maxHp: finalHp,
      currentHp: finalHp,
      damage: Math.floor(template.damage * finalDmgMult * eliteDmgMult),
      scrapValue: Math.floor(template.scrapValue * 1.5 * eliteScrapMult),
      intent: 'ATTACK',
      isCharged: false,
      actionCharge: Math.floor(Math.random() * 30),
      statuses: [],
      affix: affix
    };

    // Special Init
    if (affix === 'SHIELDED') {
      enemy.statuses.push({ id: `shield-${Date.now()}`, type: 'SHIELDED', durationMs: 999999 });
    }

    enemies.push(enemy);
  }

  return enemies;
};