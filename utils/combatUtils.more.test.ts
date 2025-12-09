import { describe, it, expect, vi } from 'vitest';
import { calculateMaxHp, calculatePassiveRegen, calculateHazardEffect, calculateDamage, calculateAbilityResult, resolveEnemyAction, processStatusEffects, applyConsumableEffect, Enemy } from './combatUtils';
import { PILOTS, COMBAT_CONFIG } from '../constants';
import { PilotId, HazardType, RunState, PilotModule, ActiveStatus } from '../types';

describe('combatUtils', () => {
  describe('calculateMaxHp', () => {
    it('should calculate the max HP for a pilot and module', () => {
      const vanguard = PILOTS.find(p => p.id === PilotId.VANGUARD);
      const runState: RunState = { currentStage: 1, scrap: 0, currentHp: 150, maxHpUpgrade: 20, damageUpgrade: 0, consumables: [], augmentations: [], isActive: true };
      const maxHp = calculateMaxHp(vanguard!, 'STRIKE', runState);
      expect(maxHp).toBe(150 + 20); // Base 150 + 20 from upgrade
    });

    it('should handle different modules', () => {
        const solaris = PILOTS.find(p => p.id === PilotId.SOLARIS);
        const runState: RunState = { currentStage: 1, scrap: 0, currentHp: 85, maxHpUpgrade: 0, damageUpgrade: 0, consumables: [], augmentations: [], isActive: true };
        const maxHp = calculateMaxHp(solaris!, 'DEFENSE', runState);
        expect(maxHp).toBe(85 + 30); // Base 85 + 30 for defense module
      });
  });

  describe('calculatePassiveRegen', () => {
    it('should calculate passive regen for Vanguard', () => {
      const newHp = calculatePassiveRegen(PilotId.VANGUARD, 90, 150);
      expect(newHp).toBe(90 + COMBAT_CONFIG.VANGUARD_REGEN_PER_TICK);
    });

    it('should not regenerate for other pilots', () => {
      const newHp = calculatePassiveRegen(PilotId.SOLARIS, 80, 80);
      expect(newHp).toBe(80);
    });

    it('should not regenerate beyond max HP', () => {
        const newHp = calculatePassiveRegen(PilotId.VANGUARD, 149.95, 150);
        expect(newHp).toBe(150);
      });
  });

  describe('calculateHazardEffect', () => {
    it('should return correct effect for ACID_RAIN', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      const effect = calculateHazardEffect('ACID_RAIN', PilotId.VANGUARD);
      expect(effect.hpDamage).toBe(1);
      expect(effect.log).toContain('ACID RAIN CORRODES ARMOR');
      vi.spyOn(Math, 'random').mockRestore();
    });

    it('should return correct effect for ION_STORM', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.01);
        const effect = calculateHazardEffect('ION_STORM', PilotId.SOLARIS);
        expect(effect.energyDrain).toBe(5);
        expect(effect.log).toContain('ION INTERFERENCE DRAINS POWER');
        vi.spyOn(Math, 'random').mockRestore();
    });

    it('should return correct effect for SEISMIC_ACTIVITY', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.01);
        const effect = calculateHazardEffect('SEISMIC_ACTIVITY', PilotId.HYDRA);
        expect(effect.hpDamage).toBe(2);
        expect(effect.log).toContain('SEISMIC IMPACT DAMAGES HULL');
        vi.spyOn(Math, 'random').mockRestore();
    });

    it('should return no effect for NONE', () => {
        const effect = calculateHazardEffect('NONE', PilotId.VANGUARD);
        expect(effect.hpDamage).toBe(0);
        expect(effect.energyDrain).toBe(0);
        expect(effect.chargeDrain).toBe(0);
      });
  });

  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const solaris = PILOTS.find(p => p.id === PilotId.SOLARIS);
      const runState: RunState = { currentStage: 1, scrap: 0, currentHp: 85, maxHpUpgrade: 0, damageUpgrade: 5, consumables: [], augmentations: [], isActive: true };
      const damage = calculateDamage(solaris!, 'STRIKE', [], runState);
      expect(damage).toBe(10 + 5); // Base 10 + 5 from upgrade
    });

    it('should apply module modifiers', () => {
      const vanguard = PILOTS.find(p => p.id === PilotId.VANGUARD);
      const runState: RunState = { currentStage: 1, scrap: 0, currentHp: 150, maxHpUpgrade: 0, damageUpgrade: 0, consumables: [], augmentations: [], isActive: true };
      
      const assaultDamage = calculateDamage(vanguard!, 'ASSAULT', [], runState);
      expect(assaultDamage).toBe(12 + 3);

      const defenseDamage = calculateDamage(vanguard!, 'DEFENSE', [], runState);
      expect(defenseDamage).toBe(12 - 2);
    });
  });

  describe('calculateAbilityResult', () => {
    const solaris = PILOTS.find(p => p.id === PilotId.SOLARIS);
    const ability = solaris!.abilities[0]; // PHOTON RAY

    it('should calculate a successful ability use', () => {
      const result = calculateAbilityResult(solaris!, ability, 10, 100, 0, false, false, []);
      expect(result.resourceConsumed).toBe(true);
      expect(result.newEnergy).toBe(80);
      expect(result.damage).toBe(12); // 10 * 1.2
    });

    it('should fail with low energy', () => {
      const result = calculateAbilityResult(solaris!, ability, 10, 10, 0, false, false, []);
      expect(result.resourceConsumed).toBe(false);
      expect(result.error).toBe('LOW_ENERGY');
    });

    it('should handle Wyrm ambush crit', () => {
        const wyrm = PILOTS.find(p => p.id === PilotId.WYRM);
        const wyrmAbility = wyrm!.abilities[1];
        const result = calculateAbilityResult(wyrm!, wyrmAbility, 14, 100, 0, false, true, []);
        expect(result.damage).toBe(Math.floor(14 * 1.5 * 2.5));
        expect(result.burrowedState).toBe(false);
        expect(result.logMessage).toContain('AMBUSH CRIT');
      });
  });

  describe('resolveEnemyAction', () => {
    const enemy: Enemy = { id: '1', name: 'Test', maxHp: 100, currentHp: 100, damage: 10, speed: 1, actionCharge: 100, intent: 'ATTACK', isCharged: false, scrapValue: 5, statuses: [] };

    it('should perform a standard attack', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = resolveEnemyAction({ ...enemy, intent: 'ATTACK' }, false, 'NONE');
      expect(result.healed).toBe(false);
      expect(result.charged).toBe(false);
      expect(result.damage).toBeGreaterThan(0);
      vi.spyOn(Math, 'random').mockRestore();
    });

    it('should heal when intended', () => {
        const result = resolveEnemyAction({ ...enemy, intent: 'HEAL' }, false, 'NONE');
        expect(result.healed).toBe(true);
        expect(result.damage).toBe(0);
    });

    it('should miss if player is burrowed', () => {
        const result = resolveEnemyAction({ ...enemy, intent: 'ATTACK' }, true, 'NONE');
        expect(result.missed).toBe(true);
    });

    it('should apply lifesteal for Vampiric affix', () => {
        const vampiricEnemy = { ...enemy, affix: 'VAMPIRIC' as any};
        const result = resolveEnemyAction(vampiricEnemy, false, 'NONE');
        expect(result.lifesteal).toBeGreaterThan(0);
    });
  });

  describe('processStatusEffects', () => {
    it('should process burning and overdrive damage', () => {
      const statuses: ActiveStatus[] = [
        { id: 'burn1', type: 'BURNING', durationMs: 1000, value: 5 },
        { id: 'over1', type: 'OVERDRIVE', durationMs: 1000, value: 2 }
      ];
      const { newStatuses, damageTaken } = processStatusEffects(statuses, 100, []);
      expect(damageTaken).toBe(7);
      expect(newStatuses.length).toBe(2);
      expect(newStatuses[0].durationMs).toBe(900);
    });
  });

  describe('applyConsumableEffect', () => {
    it('should apply nano_stim correctly', () => {
      const { newHp, log } = applyConsumableEffect('nano_stim', 50, 100, 100, 0, [], []);
      expect(newHp).toBe(100);
      expect(log).toContain('NANO-STIM APPLIED');
    });

    it('should apply overdrive_inj correctly', () => {
        const { newPlayerStatuses, log } = applyConsumableEffect('overdrive_inj', 100, 100, 100, 0, [], []);
        expect(newPlayerStatuses.length).toBe(1);
        expect(newPlayerStatuses[0].type).toBe('OVERDRIVE');
        expect(log).toContain('OVERDRIVE ENGAGED');
    });
  });
});
