import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    calculateMaxHp,
    calculateDamage,
    calculateAbilityResult,
    calculatePassiveRegen,
    calculateHazardEffect,
    determineEnemyIntent,
    resolveEnemyAction,
    processStatusEffects,
    applyConsumableEffect,
    generateEnemies,
    getBossForStage,
    checkBossPhaseTransition,
    applySurvivalScaling,
    calculateDefenseTarget,
    generateEndlessWaveEnemies
} from './combatUtils';
import { PilotConfig, PilotId, RunState, Enemy, ActiveStatus, Ability, HazardType, EnemyIntent } from '../types';
import { PILOTS, COMBAT_CONFIG } from '../constants';

// Mock pilot for testing
const createMockPilot = (id: PilotId = PilotId.VANGUARD): PilotConfig => {
    return PILOTS.find(p => p.id === id) || PILOTS[0];
};

// Mock run state for testing
const createMockRunState = (overrides?: Partial<RunState>): RunState => ({
    isActive: true,
    currentStage: 1,
    scrap: 100,
    currentHp: 100,
    maxHpUpgrade: 0,
    damageUpgrade: 0,
    consumables: [],
    augmentations: [],
    ...overrides
});

// Mock enemy for testing
const createMockEnemy = (overrides?: Partial<Enemy>): Enemy => ({
    id: 'test-enemy-1',
    name: 'Test Drone',
    maxHp: 50,
    currentHp: 50,
    speed: 1.0,
    damage: 10,
    scrapValue: 15,
    flavorText: 'attacks with precision',
    intent: 'ATTACK' as EnemyIntent,
    isCharged: false,
    actionCharge: 0,
    statuses: [],
    ...overrides
});

describe('Combat Utilities - HP Calculations', () => {
    describe('calculateMaxHp', () => {
        const pilot = createMockPilot(PilotId.VANGUARD);
        const runState = createMockRunState();

        it('should return base HP for BALANCED module', () => {
            const hp = calculateMaxHp(pilot, 'BALANCED', runState);
            expect(hp).toBe(pilot.baseHp);
        });

        it('should add 30 HP for DEFENSE module', () => {
            const hp = calculateMaxHp(pilot, 'DEFENSE', runState);
            expect(hp).toBe(pilot.baseHp + 30);
        });

        it('should subtract 20 HP for ASSAULT module', () => {
            const hp = calculateMaxHp(pilot, 'ASSAULT', runState);
            expect(hp).toBe(pilot.baseHp - 20);
        });

        it('should include run HP upgrades', () => {
            const runWithUpgrade = createMockRunState({ maxHpUpgrade: 20 });
            const hp = calculateMaxHp(pilot, 'BALANCED', runWithUpgrade);
            expect(hp).toBe(pilot.baseHp + 20);
        });

        it('should stack module bonus with upgrades', () => {
            const runWithUpgrade = createMockRunState({ maxHpUpgrade: 15 });
            const hp = calculateMaxHp(pilot, 'DEFENSE', runWithUpgrade);
            expect(hp).toBe(pilot.baseHp + 30 + 15);
        });
    });
});

describe('Combat Utilities - Damage Calculations', () => {
    describe('calculateDamage', () => {
        const pilot = createMockPilot(PilotId.VANGUARD);
        const runState = createMockRunState();

        it('should return base damage for BALANCED module', () => {
            const dmg = calculateDamage(pilot, 'BALANCED', [], runState);
            expect(dmg).toBe(pilot.baseDamage);
        });

        it('should add 3 damage for ASSAULT module', () => {
            const dmg = calculateDamage(pilot, 'ASSAULT', [], runState);
            expect(dmg).toBe(pilot.baseDamage + 3);
        });

        it('should subtract 2 damage for DEFENSE module', () => {
            const dmg = calculateDamage(pilot, 'DEFENSE', [], runState);
            expect(dmg).toBe(pilot.baseDamage - 2);
        });

        it('should include run damage upgrades', () => {
            const runWithUpgrade = createMockRunState({ damageUpgrade: 5 });
            const dmg = calculateDamage(pilot, 'BALANCED', [], runWithUpgrade);
            expect(dmg).toBe(pilot.baseDamage + 5);
        });

        it('should multiply damage with OVERDRIVE status', () => {
            const overdrivestatus: ActiveStatus[] = [
                { id: 'od-1', type: 'OVERDRIVE', durationMs: 5000 }
            ];
            const dmg = calculateDamage(pilot, 'BALANCED', overdrivestatus, runState);
            expect(dmg).toBe(Math.floor(pilot.baseDamage * COMBAT_CONFIG.STATUS.OVERDRIVE_DMG_MULT));
        });

        it('should add heat-based damage with thermal_conv augmentation', () => {
            const runWithAug = createMockRunState({ augmentations: ['thermal_conv'] });
            const dmg = calculateDamage(pilot, 'BALANCED', [], runWithAug, 50);
            // +5 damage (50/10=5)
            expect(dmg).toBe(pilot.baseDamage + 5);
        });

        it('should always return at least 1 damage', () => {
            const lowDamagePilot = { ...pilot, baseDamage: 0 };
            const dmg = calculateDamage(lowDamagePilot, 'DEFENSE', [], runState);
            expect(dmg).toBeGreaterThanOrEqual(1);
        });
    });
});

describe('Combat Utilities - Passive Regeneration', () => {
    describe('calculatePassiveRegen', () => {
        it('should regenerate HP for VANGUARD when below max', () => {
            const newHp = calculatePassiveRegen(PilotId.VANGUARD, 80, 100);
            expect(newHp).toBe(80 + COMBAT_CONFIG.VANGUARD_REGEN_PER_TICK);
        });

        it('should not regenerate above max HP', () => {
            const newHp = calculatePassiveRegen(PilotId.VANGUARD, 99, 100);
            expect(newHp).toBeLessThanOrEqual(100);
        });

        it('should not regenerate at full HP', () => {
            const newHp = calculatePassiveRegen(PilotId.VANGUARD, 100, 100);
            expect(newHp).toBe(100);
        });

        it('should not regenerate when dead', () => {
            const newHp = calculatePassiveRegen(PilotId.VANGUARD, 0, 100);
            expect(newHp).toBe(0);
        });

        it('should not regenerate for non-VANGUARD pilots', () => {
            const newHp = calculatePassiveRegen(PilotId.SOLARIS, 80, 100);
            expect(newHp).toBe(80);
        });
    });
});

describe('Combat Utilities - Hazard Effects', () => {
    describe('calculateHazardEffect', () => {
        beforeEach(() => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force hazard to trigger
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should damage HP from ACID_RAIN', () => {
            const effect = calculateHazardEffect('ACID_RAIN', PilotId.VANGUARD);
            expect(effect.hpDamage).toBe(1);
            expect(effect.log).toContain('ACID');
        });

        it('should drain charge from ION_STORM', () => {
            const effect = calculateHazardEffect('ION_STORM', PilotId.VANGUARD);
            expect(effect.chargeDrain).toBe(5);
        });

        it('should drain energy for SOLARIS in ION_STORM', () => {
            const effect = calculateHazardEffect('ION_STORM', PilotId.SOLARIS);
            expect(effect.energyDrain).toBe(5);
        });

        it('should have no effect with NONE hazard', () => {
            const effect = calculateHazardEffect('NONE', PilotId.VANGUARD);
            expect(effect.hpDamage).toBe(0);
            expect(effect.chargeDrain).toBe(0);
        });
    });
});

describe('Combat Utilities - Enemy Intent', () => {
    describe('determineEnemyIntent', () => {
        it('should attack if charged', () => {
            const enemy = createMockEnemy({ isCharged: true });
            expect(determineEnemyIntent(enemy)).toBe('ATTACK');
        });

        it('should potentially heal when low HP', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force heal
            const enemy = createMockEnemy({ currentHp: 10, maxHp: 100 }); // 10% HP
            const intent = determineEnemyIntent(enemy);
            expect(['HEAL', 'CHARGE', 'ATTACK']).toContain(intent);
            vi.restoreAllMocks();
        });

        it('should potentially charge', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.05); // Force charge
            const enemy = createMockEnemy({ currentHp: 100, maxHp: 100 });
            const intent = determineEnemyIntent(enemy);
            expect(['CHARGE', 'ATTACK']).toContain(intent);
            vi.restoreAllMocks();
        });
    });
});

describe('Combat Utilities - Enemy Action Resolution', () => {
    describe('resolveEnemyAction', () => {
        it('should return heal result for HEAL intent', () => {
            const enemy = createMockEnemy({ intent: 'HEAL' });
            const result = resolveEnemyAction(enemy, false, 'NONE');
            expect(result.healed).toBe(true);
            expect(result.damage).toBe(0);
        });

        it('should return charged result for CHARGE intent', () => {
            const enemy = createMockEnemy({ intent: 'CHARGE' });
            const result = resolveEnemyAction(enemy, false, 'NONE');
            expect(result.charged).toBe(true);
            expect(result.damage).toBe(0);
        });

        it('should miss when player is burrowed', () => {
            const enemy = createMockEnemy({ intent: 'ATTACK' });
            const result = resolveEnemyAction(enemy, true, 'NONE'); // isBurrowed = true
            expect(result.missed).toBe(true);
            expect(result.damage).toBe(0);
        });

        it('should not act when stunned', () => {
            const enemy = createMockEnemy({
                intent: 'ATTACK',
                statuses: [{ id: 'stun-1', type: 'STUNNED', durationMs: 3000 }]
            });
            const result = resolveEnemyAction(enemy, false, 'NONE');
            expect(result.missed).toBe(true);
        });

        it('should deal more damage when charged', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.95); // Force hit, no crit
            const enemy = createMockEnemy({ intent: 'ATTACK', isCharged: true, damage: 10 });
            const result = resolveEnemyAction(enemy, false, 'NONE');
            expect(result.damage).toBe(Math.floor(10 * 2.5)); // Charged multiplier
            vi.restoreAllMocks();
        });
    });
});

describe('Combat Utilities - Status Effects', () => {
    describe('processStatusEffects', () => {
        it('should reduce duration of status effects', () => {
            const statuses: ActiveStatus[] = [
                { id: 'stun-1', type: 'STUNNED', durationMs: 5000 }
            ];
            const { newStatuses } = processStatusEffects(statuses, 1000);
            expect(newStatuses[0].durationMs).toBe(4000);
        });

        it('should remove expired status effects', () => {
            const statuses: ActiveStatus[] = [
                { id: 'stun-1', type: 'STUNNED', durationMs: 500 }
            ];
            const { newStatuses } = processStatusEffects(statuses, 1000);
            expect(newStatuses.length).toBe(0);
        });

        it('should apply DoT damage from BURNING', () => {
            const statuses: ActiveStatus[] = [
                { id: 'burn-1', type: 'BURNING', durationMs: 5000, value: 5 }
            ];
            const { damageTaken } = processStatusEffects(statuses, 1000);
            expect(damageTaken).toBe(5);
        });
    });
});

describe('Combat Utilities - Consumable Effects', () => {
    describe('applyConsumableEffect', () => {
        const enemies = [createMockEnemy()];
        const playerStatuses: ActiveStatus[] = [];

        it('should heal with nano_stim', () => {
            const result = applyConsumableEffect('nano_stim', 50, 100, 100, 0, enemies, playerStatuses);
            expect(result.newHp).toBe(100); // 50 + 50 = 100
            expect(result.log).toContain('NANO-STIM');
        });

        it('should heal to max HP with nano_stim', () => {
            const result = applyConsumableEffect('nano_stim', 80, 100, 100, 0, enemies, playerStatuses);
            expect(result.newHp).toBe(100); // Capped at max
        });

        it('should reduce heat and add energy with coolant', () => {
            const result = applyConsumableEffect('coolant', 100, 100, 80, 80, enemies, playerStatuses);
            expect(result.newHeat).toBe(30); // 80 - 50
            expect(result.newEnergy).toBe(100); // 80 + 20
        });

        it('should stun all enemies with emp_grenade', () => {
            const result = applyConsumableEffect('emp_grenade', 100, 100, 100, 0, enemies, playerStatuses);
            expect(result.newEnemies[0].statuses.some(s => s.type === 'STUNNED')).toBe(true);
            expect(result.log).toContain('EMP');
        });

        it('should apply OVERDRIVE status with overdrive_inj', () => {
            const result = applyConsumableEffect('overdrive_inj', 100, 100, 100, 0, enemies, playerStatuses);
            expect(result.newPlayerStatuses.some(s => s.type === 'OVERDRIVE')).toBe(true);
        });

        it('should heal 100 HP with mega_stim', () => {
            const result = applyConsumableEffect('mega_stim', 0, 150, 100, 0, enemies, playerStatuses);
            expect(result.newHp).toBe(100);
        });

        it('should stun and slow enemies with cryo_bomb', () => {
            const result = applyConsumableEffect('cryo_bomb', 100, 100, 100, 0, enemies, playerStatuses);
            expect(result.newEnemies[0].statuses.some(s => s.type === 'STUNNED')).toBe(true);
            expect(result.log).toContain('CRYO-BOMB');
        });
    });
});

describe('Combat Utilities - Enemy Generation', () => {
    describe('generateEnemies', () => {
        it('should generate 2-3 enemies for non-boss stages', () => {
            const enemies = generateEnemies(1);
            expect(enemies.length).toBeGreaterThanOrEqual(2);
            expect(enemies.length).toBeLessThanOrEqual(3);
        });

        it('should generate boss on stage 5', () => {
            const enemies = generateEnemies(5);
            expect(enemies.some(e => e.isBoss)).toBe(true);
        });

        it('should generate boss on stage 10', () => {
            const enemies = generateEnemies(10);
            expect(enemies.some(e => e.isBoss)).toBe(true);
        });

        it('should not generate boss on stage 3', () => {
            const enemies = generateEnemies(3);
            expect(enemies.some(e => e.isBoss)).toBe(false);
        });

        it('should apply difficulty multipliers', () => {
            const normalEnemies = generateEnemies(1, 1.0, 1.0, 1.0);
            const hardEnemies = generateEnemies(1, 1.5, 1.5, 1.0);
            // Hard enemies should have more HP on average
            const normalHp = normalEnemies[0].maxHp;
            const hardHp = hardEnemies[0].maxHp;
            expect(hardHp).toBeGreaterThan(normalHp * 1.4); // ~1.5x
        });

        it('should apply BOSS_RUSH modifier (all elites)', () => {
            const enemies = generateEnemies(1, 1.0, 1.0, 1.0, 'BOSS_RUSH');
            // All non-boss enemies should be elites with [ELITE] prefix
            enemies.forEach(e => {
                if (!e.isBoss) {
                    expect(e.name).toContain('[');
                }
            });
        });
    });

    describe('generateEndlessWaveEnemies', () => {
        it('should scale with wave number', () => {
            const wave1 = generateEndlessWaveEnemies(1);
            const wave10 = generateEndlessWaveEnemies(10);
            // Wave 10 boss should exist
            expect(wave10.some(e => e.isBoss)).toBe(true);
        });
    });
});

describe('Combat Utilities - Boss System', () => {
    describe('getBossForStage', () => {
        it('should return boss for stage 5', () => {
            const boss = getBossForStage(5);
            expect(boss).not.toBeNull();
            expect(boss?.isBoss).toBe(true);
        });

        it('should return null for non-boss stages', () => {
            const boss = getBossForStage(3);
            expect(boss).toBeNull();
        });

        it('should scale boss HP for later cycles', () => {
            const boss5 = getBossForStage(5);
            const boss10 = getBossForStage(10);
            // Stage 10 boss should have more HP
            expect(boss10!.maxHp).toBeGreaterThan(boss5!.maxHp);
        });
    });

    describe('checkBossPhaseTransition', () => {
        it('should not transition for non-boss', () => {
            const enemy = createMockEnemy({ isBoss: false });
            const result = checkBossPhaseTransition(enemy);
            expect(result.shouldTransition).toBe(false);
        });

        it('should check phases based on HP', () => {
            const boss = getBossForStage(5);
            if (boss) {
                boss.currentHp = boss.maxHp * 0.4; // Below 50% threshold
                const result = checkBossPhaseTransition(boss);
                // Might trigger phase 2 depending on boss template
                expect(typeof result.shouldTransition).toBe('boolean');
            }
        });
    });
});

describe('Combat Utilities - Defense Mission', () => {
    describe('calculateDefenseTarget', () => {
        it('should prioritize player when boss', () => {
            const target = calculateDefenseTarget(80, 100, 80, 100, 'Boss', true);
            expect(target).toBe('PLAYER');
        });

        it('should prioritize core when core HP is critical', () => {
            const target = calculateDefenseTarget(80, 100, 20, 100, 'Drone', false);
            expect(target).toBe('CORE');
        });

        it('should mostly target player when player HP is critical', () => {
            // Run multiple times to test probability
            let playerTargets = 0;
            for (let i = 0; i < 100; i++) {
                const target = calculateDefenseTarget(15, 100, 80, 100, 'Drone', false);
                if (target === 'PLAYER') playerTargets++;
            }
            expect(playerTargets).toBeGreaterThan(70); // ~85% chance
        });
    });
});

describe('Combat Utilities - Survival Mode', () => {
    describe('applySurvivalScaling', () => {
        it('should increase HP with wave number', () => {
            const baseEnemy = createMockEnemy({ maxHp: 50, damage: 10 });
            const scaled = applySurvivalScaling(baseEnemy, 5);
            expect(scaled.maxHp).toBeGreaterThan(50);
        });

        it('should increase damage with wave number', () => {
            const baseEnemy = createMockEnemy({ maxHp: 50, damage: 10 });
            const scaled = applySurvivalScaling(baseEnemy, 5);
            expect(scaled.damage).toBeGreaterThan(10);
        });

        it('should not modify wave 0 enemy', () => {
            const baseEnemy = createMockEnemy({ maxHp: 50, damage: 10 });
            const scaled = applySurvivalScaling(baseEnemy, 0);
            expect(scaled.maxHp).toBe(50);
            expect(scaled.damage).toBe(10);
        });
    });
});

describe('Combat Utilities - Ability Results', () => {
    describe('calculateAbilityResult', () => {
        const pilot = createMockPilot(PilotId.SOLARIS);
        const enemies = [createMockEnemy()];

        // Find the basic attack ability
        const basicAbility: Ability = pilot.abilities[0];

        it('should calculate base damage from ability', () => {
            const result = calculateAbilityResult(
                pilot, basicAbility, 10, 100, 0, false, false, enemies
            );
            expect(result.damage).toBe(Math.floor(10 * basicAbility.damageMult));
        });

        it('should fail with LOW_ENERGY error', () => {
            const energyAbility = pilot.abilities.find(a => a.energyCost && a.energyCost > 0);
            if (energyAbility) {
                const result = calculateAbilityResult(
                    pilot, energyAbility, 10, 0, 0, false, false, enemies
                );
                expect(result.error).toBe('LOW_ENERGY');
                expect(result.damage).toBe(0);
            }
        });

        it('should fail with JAMMED error for HYDRA', () => {
            const hydraPilot = createMockPilot(PilotId.HYDRA);
            const hydraAbility = hydraPilot.abilities[0];
            const result = calculateAbilityResult(
                hydraPilot, hydraAbility, 10, 100, 100, true, false, enemies
            );
            expect(result.error).toBe('JAMMED');
        });

        it('should hit all enemies with AOE', () => {
            const aoeAbility = pilot.abilities.find(a => a.isAoe);
            if (aoeAbility) {
                const multipleEnemies = [createMockEnemy(), createMockEnemy(), createMockEnemy()];
                const result = calculateAbilityResult(
                    pilot, aoeAbility, 10, 100, 0, false, false, multipleEnemies
                );
                expect(result.targetsHit.length).toBe(3);
            }
        });

        it('should deal bonus damage when WYRM is burrowed', () => {
            const wyrmPilot = createMockPilot(PilotId.WYRM);
            const wyrmAbility = wyrmPilot.abilities[0];
            const normalResult = calculateAbilityResult(
                wyrmPilot, wyrmAbility, 10, 100, 0, false, false, enemies
            );
            const burrowedResult = calculateAbilityResult(
                wyrmPilot, wyrmAbility, 10, 100, 0, false, true, enemies
            );
            expect(burrowedResult.damage).toBe(Math.floor(normalResult.damage * 2.5));
        });
    });
});
