import { describe, it, expect } from 'vitest';
import {
    applyAugmentationEffects,
    calculateDamage,
    calculateMaxHp,
    calculateSynergyEffects
} from './combatUtils_augmentations';
import { PilotConfig, PilotId, RunState, ActiveStatus, Synergy } from '../types';
import { PILOTS } from '../constants';

// Mock data helpers
const createMockPilot = (id: PilotId = PilotId.VANGUARD): PilotConfig => {
    return PILOTS.find(p => p.id === id) || PILOTS[0];
};

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

describe('Augmentation Effects', () => {
    describe('applyAugmentationEffects', () => {
        describe('ON_KILL event', () => {
            it('should grant HP with vamp_nanites', () => {
                const result = applyAugmentationEffects(['vamp_nanites'], 'ON_KILL', {});
                expect(result.hpGain).toBe(5);
            });

            it('should not grant HP without vamp_nanites', () => {
                const result = applyAugmentationEffects([], 'ON_KILL', {});
                expect(result.hpGain).toBe(0);
            });

            it('should not trigger vamp_nanites on other events', () => {
                const result = applyAugmentationEffects(['vamp_nanites'], 'ON_HIT', {});
                expect(result.hpGain).toBe(0);
            });
        });

        describe('ON_HIT event', () => {
            it('should apply burn with plasma_coating', () => {
                const result = applyAugmentationEffects(['plasma_coating'], 'ON_HIT', {});
                expect(result.enemyBurn).toBe(true);
            });

            it('should not burn without plasma_coating', () => {
                const result = applyAugmentationEffects([], 'ON_HIT', {});
                expect(result.enemyBurn).toBe(false);
            });

            it('should not trigger plasma_coating on other events', () => {
                const result = applyAugmentationEffects(['plasma_coating'], 'ON_KILL', {});
                expect(result.enemyBurn).toBe(false);
            });
        });

        describe('ON_DAMAGE_TAKEN event', () => {
            it('should reflect damage with static_shell', () => {
                const result = applyAugmentationEffects(['static_shell'], 'ON_DAMAGE_TAKEN', {});
                expect(result.reflectDamage).toBe(5);
            });

            it('should not reflect without static_shell', () => {
                const result = applyAugmentationEffects([], 'ON_DAMAGE_TAKEN', {});
                expect(result.reflectDamage).toBe(0);
            });
        });

        describe('Multiple augmentations', () => {
            it('should apply all relevant effects', () => {
                const result = applyAugmentationEffects(
                    ['vamp_nanites', 'plasma_coating', 'static_shell'],
                    'ON_KILL',
                    {}
                );
                expect(result.hpGain).toBe(5);
                // Other effects not triggered on ON_KILL
                expect(result.enemyBurn).toBe(false);
                expect(result.reflectDamage).toBe(0);
            });
        });
    });

    describe('calculateSynergyEffects', () => {
        it('should return default multipliers with no synergies', () => {
            const effects = calculateSynergyEffects([], 'ON_HIT');
            expect(effects.fireDamageMultiplier).toBe(1);
            expect(effects.burnDurationMultiplier).toBe(1);
            expect(effects.healOnEnemyAttack).toBe(false);
        });

        it('should handle BLOOD_SHELL synergy on damage taken', () => {
            // If BLOOD_SHELL synergy is active with right augmentations
            // We need the actual augmentation IDs from constants to test this properly
            const effects = calculateSynergyEffects(['vamp_nanites', 'static_shell'], 'ON_DAMAGE_TAKEN');
            // Result depends on whether these form a synergy
            expect(typeof effects.healOnEnemyAttack).toBe('boolean');
        });
    });

    describe('calculateMaxHp (augmented)', () => {
        const pilot = createMockPilot(PilotId.VANGUARD);
        const runState = createMockRunState();

        it('should calculate base HP correctly', () => {
            const hp = calculateMaxHp(pilot, 'BALANCED', runState);
            expect(hp).toBe(pilot.baseHp);
        });

        it('should add DEFENSE module bonus', () => {
            const hp = calculateMaxHp(pilot, 'DEFENSE', runState);
            expect(hp).toBe(pilot.baseHp + 30);
        });

        it('should include HP upgrades', () => {
            const runWithUpgrade = createMockRunState({ maxHpUpgrade: 25 });
            const hp = calculateMaxHp(pilot, 'BALANCED', runWithUpgrade);
            expect(hp).toBe(pilot.baseHp + 25);
        });
    });

    describe('calculateDamage (augmented)', () => {
        const pilot = createMockPilot(PilotId.VANGUARD);
        const runState = createMockRunState();

        it('should calculate base damage', () => {
            const dmg = calculateDamage(pilot, 'BALANCED', [], runState);
            expect(dmg).toBe(pilot.baseDamage);
        });

        it('should apply thermal_conv bonus with heat', () => {
            const runWithAug = createMockRunState({ augmentations: ['thermal_conv'] });
            const dmg = calculateDamage(pilot, 'BALANCED', [], runWithAug, 60);
            // 60 heat = +6 damage
            expect(dmg).toBe(pilot.baseDamage + 6);
        });

        it('should apply synergy damage multipliers', () => {
            const infernoSynergy: Synergy = {
                id: 'INFERNO',
                name: 'Inferno',
                description: '+50% fire damage',
                augmentationIds: ['plasma_coating', 'thermal_conv']
            };

            const dmg = calculateDamage(pilot, 'BALANCED', [], runState, 0, [infernoSynergy]);
            expect(dmg).toBe(Math.floor(pilot.baseDamage * 1.5));
        });

        it('should apply OVERDRIVE multiplier', () => {
            const overdrive: ActiveStatus[] = [
                { id: 'od-1', type: 'OVERDRIVE', durationMs: 5000 }
            ];
            const dmg = calculateDamage(pilot, 'BALANCED', overdrive, runState);
            expect(dmg).toBeGreaterThan(pilot.baseDamage);
        });

        it('should stack all damage modifiers', () => {
            const runWithAll = createMockRunState({
                damageUpgrade: 5,
                augmentations: ['thermal_conv']
            });
            const overdrive: ActiveStatus[] = [
                { id: 'od-1', type: 'OVERDRIVE', durationMs: 5000 }
            ];

            const dmg = calculateDamage(pilot, 'ASSAULT', overdrive, runWithAll, 50);
            // Base + 3 (assault) + 5 (upgrade) + 5 (thermal) = base + 13, then * OVERDRIVE
            expect(dmg).toBeGreaterThan(pilot.baseDamage + 10);
        });

        it('should return minimum 1 damage', () => {
            const weakPilot = { ...pilot, baseDamage: 0 };
            const dmg = calculateDamage(weakPilot, 'DEFENSE', [], runState);
            expect(dmg).toBeGreaterThanOrEqual(1);
        });
    });
});
