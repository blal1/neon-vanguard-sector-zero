import { PilotConfig, PilotModule, PilotId, HazardType, Enemy, EnemyIntent, Ability, ActiveStatus, Consumable, RunState, EnemyAffix, Augmentation, SynergyId, Synergy } from '../types';
import { COMBAT_CONFIG, RUN_CONFIG, BOSS_TEMPLATES, ENEMY_AFFIXES, AUGMENTATIONS, SYNERGIES } from '../constants';
import { getActiveSynergies } from './synergyUtils';

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
 * Calculates the base damage with augmentations and synergies applied
 */
export const calculateDamage = (
    pilot: PilotConfig,
    module: PilotModule,
    statuses: ActiveStatus[],
    runState: RunState,
    currentHeat?: number,
    activeSynergies: Synergy[] = [] // New parameter for active synergies
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
    if (runState.augmentations.includes('thermal_conv') && currentHeat !== undefined) {
        // +1 DMG per 10% heat
        dmg += Math.floor(currentHeat / 10);
    }
    
    // Apply Synergy effects
    if (activeSynergies.some(s => s.id === 'INFERNO')) {
      dmg *= 1.5; // +50% fire damage
    }

    return Math.max(1, Math.floor(dmg));
};

/**
 * Calculates the effects of active synergies.
 */
export const calculateSynergyEffects = (
  equippedAugmentations: string[],
  eventType: 'ON_KILL' | 'ON_HIT' | 'ON_DAMAGE_TAKEN'
) => {
  const activeSynergies = getActiveSynergies(equippedAugmentations);
  let fireDamageMultiplier = 1;
  let burnDurationMultiplier = 1;
  let healOnEnemyAttack = false;

  activeSynergies.forEach(synergy => {
    switch (synergy.id) {
      case 'INFERNO':
        fireDamageMultiplier = 1.5;
        burnDurationMultiplier = 1.5; // Enemies burn longer
        break;
      case 'BLOOD_SHELL':
        if (eventType === 'ON_DAMAGE_TAKEN') {
          healOnEnemyAttack = true; // Heal when enemies attack you
        }
        break;
      default:
        break;
    }
  });

  return { fireDamageMultiplier, burnDurationMultiplier, healOnEnemyAttack };
}

/**
 * Apply augmentation and synergy effects when applicable
 */
export const applyAugmentationEffects = (
    augmentations: string[],
    eventType: 'ON_KILL' | 'ON_HIT' | 'ON_DAMAGE_TAKEN',
    context: {
        currentHp?: number;
        maxHp?: number;
        enemyDamage?: number;
        pilot?: PilotConfig;
    }
): {
    hpGain: number;
    enemyBurn: boolean;
    reflectDamage: number;
    synergyEffects: {
      fireDamageMultiplier: number;
      burnDurationMultiplier: number;
      healOnEnemyAttack: boolean;
    }
} => {
    let hpGain = 0;
    let enemyBurn = false;
    let reflectDamage = 0;

    const synergyEffects = calculateSynergyEffects(augmentations, eventType);

    if (eventType === 'ON_KILL' && augmentations.includes('vamp_nanites')) {
        hpGain = 5; // Vampiric Nanites
    }

    if (eventType === 'ON_HIT' && augmentations.includes('plasma_coating')) {
        enemyBurn = true; // Plasma Coating
    }

    if (eventType === 'ON_DAMAGE_TAKEN' && augmentations.includes('static_shell')) {
        reflectDamage = 5; // Static Shell
    }

    // Apply synergy effects to relevant returns
    if (synergyEffects.healOnEnemyAttack && eventType === 'ON_DAMAGE_TAKEN') {
      hpGain += (context.enemyDamage ? context.enemyDamage * 0.5 : 0); // Example: Heal for 50% of damage taken
    }

    return { hpGain, enemyBurn, reflectDamage, synergyEffects };
};
