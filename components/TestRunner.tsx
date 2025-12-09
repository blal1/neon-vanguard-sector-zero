import React, { useEffect, useState } from 'react';
import { PILOTS, COMBAT_CONFIG } from '../constants';
import { 
  calculateMaxHp, 
  calculateDamage, 
  calculateAbilityResult, 
  determineEnemyIntent,
  resolveEnemyAction,
  applyConsumableEffect,
  processStatusEffects,
  calculatePassiveRegen,
  calculateHazardEffect
} from '../utils/combatUtils';
import { PilotId, Enemy, RunState, Ability, ActiveStatus, Consumable } from '../types';

interface TestResult {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
}

export const TestRunner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const runTests = () => {
      const tests: TestResult[] = [];
      const originalRandom = Math.random; // Cache original random
      
      const mockRunState: RunState = {
        isActive: true,
        currentStage: 1,
        scrap: 0,
        currentHp: 100,
        maxHpUpgrade: 0,
        damageUpgrade: 0,
        consumables: []
      };

      // ==========================================
      // 1. STATS & PROGRESSION
      // ==========================================
      const vanguard = PILOTS.find(p => p.id === PilotId.VANGUARD)!;
      tests.push({
        name: "[Stats] Vanguard HP w/ Assault Module",
        passed: calculateMaxHp(vanguard, 'ASSAULT', mockRunState) === 130, // 150 - 20 = 130
        expected: 130,
        actual: calculateMaxHp(vanguard, 'ASSAULT', mockRunState)
      });

      const upgradedRunState = { ...mockRunState, maxHpUpgrade: 50, damageUpgrade: 5 };
      tests.push({
        name: "[Progression] Max HP Calculation with Run Upgrades",
        passed: calculateMaxHp(vanguard, 'ASSAULT', upgradedRunState) === 180, // 130 + 50
        expected: 180,
        actual: calculateMaxHp(vanguard, 'ASSAULT', upgradedRunState)
      });

      const baseDmg = calculateDamage(vanguard, 'ASSAULT', [], mockRunState); // 12 + 3 = 15
      const upgradedDmg = calculateDamage(vanguard, 'ASSAULT', [], upgradedRunState); // 15 + 5 = 20
      tests.push({
        name: "[Progression] Damage Calculation with Run Upgrades",
        passed: upgradedDmg === 20,
        expected: 20,
        actual: upgradedDmg
      });

      // ==========================================
      // 2. PILOT MECHANICS
      // ==========================================
      
      // --- VANGUARD ---
      const regenHp = calculatePassiveRegen(PilotId.VANGUARD, 50, 100);
      tests.push({
        name: "[Vanguard] Passive Regen Tick",
        passed: regenHp > 50 && regenHp <= 50 + COMBAT_CONFIG.VANGUARD_REGEN_PER_TICK + 0.01,
        expected: "> 50",
        actual: regenHp
      });

      // --- HYDRA (Heat) ---
      const hydra = PILOTS.find(p => p.id === PilotId.HYDRA)!;
      const spinAbility = hydra.abilities[0]; // Heat Cost: 15
      const hydraResult = calculateAbilityResult(
        hydra, spinAbility, 10, 100, 80, false, false, []
      );
      tests.push({
        name: "[Hydra] Ability Increases Heat",
        passed: hydraResult.newHeat === 95, // 80 + 15
        expected: 95,
        actual: hydraResult.newHeat
      });
      
      const hydraJamResult = calculateAbilityResult(
        hydra, spinAbility, 10, 100, 90, false, false, []
      );
      tests.push({
        name: "[Hydra] Overheat Triggers Jamming",
        passed: hydraJamResult.jammed === true,
        expected: true,
        actual: hydraJamResult.jammed
      });

      const hydraJammedAction = calculateAbilityResult(
        hydra, spinAbility, 10, 100, 100, true, false, []
      );
      tests.push({
        name: "[Hydra] Cannot Fire While Jammed",
        passed: hydraJammedAction.resourceConsumed === false && hydraJammedAction.error === "JAMMED",
        expected: "Error: JAMMED",
        actual: `Error: ${hydraJammedAction.error}`
      });

      // --- SOLARIS (Energy) ---
      const solaris = PILOTS.find(p => p.id === PilotId.SOLARIS)!;
      const photonRay = solaris.abilities[0]; // Energy Cost: 20
      const solarisResult = calculateAbilityResult(
        solaris, photonRay, 10, 10, 0, false, false, []
      );
      tests.push({
        name: "[Solaris] Attack Fails Low Energy",
        passed: solarisResult.resourceConsumed === false && solarisResult.error === 'LOW_ENERGY',
        expected: "Error: LOW_ENERGY",
        actual: `Error: ${solarisResult.error}`
      });

      // --- WYRM (Burrow) ---
      const wyrm = PILOTS.find(p => p.id === PilotId.WYRM)!;
      const biteAbility = wyrm.abilities[1]; // Tectonic Bite
      const wyrmNormalDmg = calculateAbilityResult(
        wyrm, biteAbility, 10, 100, 0, false, false, []
      ).damage;
      const wyrmBurrowDmg = calculateAbilityResult(
        wyrm, biteAbility, 10, 100, 0, false, true, [] // isBurrowed = true
      );
      
      tests.push({
        name: "[Wyrm] Burrowed Attack Bonus Damage",
        passed: wyrmBurrowDmg.damage > wyrmNormalDmg,
        expected: `> ${wyrmNormalDmg}`,
        actual: wyrmBurrowDmg.damage
      });

      tests.push({
        name: "[Wyrm] Attack Unburrows Pilot",
        passed: wyrmBurrowDmg.burrowedState === false,
        expected: false,
        actual: wyrmBurrowDmg.burrowedState
      });

      // ==========================================
      // 3. COMBAT & AI LOGIC
      // ==========================================
      const mockEnemy: Enemy = {
        id: 'test', name: 'Test Bot', maxHp: 100, currentHp: 20, speed: 1, damage: 10, flavorText: 'test',
        intent: 'ATTACK', isCharged: false, actionCharge: 0, statuses: [], scrapValue: 10
      };

      // Test Heal Logic (<30% HP)
      Math.random = () => 0.01; // Force heal chance check pass
      const healIntent = determineEnemyIntent(mockEnemy);
      tests.push({
        name: "[AI] Low HP triggers HEAL check (mocked RNG)",
        passed: healIntent === 'HEAL',
        expected: 'HEAL',
        actual: healIntent
      });

      // Enemy Attack Resolution
      Math.random = () => 0.99; // Force miss (if hit chance is 0.9)
      const missResult = resolveEnemyAction(mockEnemy, false, 'NONE');
      tests.push({
        name: "[AI] High Roll causes Miss",
        passed: missResult.missed === true && missResult.damage === 0,
        expected: "Missed",
        actual: missResult.missed ? "Missed" : "Hit"
      });

      Math.random = () => 0.05; // Force hit & Crit check
      const critResult = resolveEnemyAction(mockEnemy, false, 'NONE');
      tests.push({
        name: "[AI] Low Roll triggers Crit (mocked RNG)",
        passed: critResult.damage > mockEnemy.damage && critResult.isCrit,
        expected: "Crit",
        actual: critResult.isCrit ? "Crit" : "Normal"
      });

      // ==========================================
      // 4. CONSUMABLES
      // ==========================================
      
      // Nano Stim
      const stimResult = applyConsumableEffect('nano_stim', 50, 100, 100, 0, [], []);
      tests.push({
        name: "[Consumable] Nano-Stim Heals",
        passed: stimResult.newHp === 100, // 50 + 50
        expected: 100,
        actual: stimResult.newHp
      });

      // Coolant
      const coolantResult = applyConsumableEffect('coolant', 100, 100, 20, 80, [], []);
      tests.push({
        name: "[Consumable] Coolant Reduces Heat / Adds Energy",
        passed: coolantResult.newHeat === 30 && coolantResult.newEnergy === 40, // 80-50=30, 20+20=40
        expected: "Heat 30, Energy 40",
        actual: `Heat ${coolantResult.newHeat}, Energy ${coolantResult.newEnergy}`
      });

      // EMP
      const empEnemies = [{...mockEnemy, actionCharge: 50}];
      const empResult = applyConsumableEffect('emp_grenade', 100, 100, 100, 0, empEnemies, []);
      tests.push({
        name: "[Consumable] EMP Stuns Enemy & Resets Charge",
        passed: empResult.newEnemies[0].statuses.some(s => s.type === 'STUNNED') && empResult.newEnemies[0].actionCharge === 0,
        expected: "Stunned & 0 Charge",
        actual: `Stunned: ${empResult.newEnemies[0].statuses.length > 0}, Charge: ${empResult.newEnemies[0].actionCharge}`
      });

      // ==========================================
      // 5. STATUS EFFECTS
      // ==========================================
      const burnStatus: ActiveStatus = { id: '1', type: 'BURNING', durationMs: 1000, value: 5 };
      const { damageTaken: burnDmg, newStatuses: nextStatuses } = processStatusEffects([burnStatus], 100);
      
      tests.push({
        name: "[Status] Burning DoT Application",
        passed: burnDmg === 5,
        expected: 5,
        actual: burnDmg
      });
      
      tests.push({
        name: "[Status] Duration Tick Down",
        passed: nextStatuses[0].durationMs === 900,
        expected: 900,
        actual: nextStatuses[0].durationMs
      });

      // ==========================================
      // 6. HAZARDS
      // ==========================================
      Math.random = () => 0.01; // Force hazard proc (0.01 < 0.05)
      const acidResult = calculateHazardEffect('ACID_RAIN', PilotId.VANGUARD);
      tests.push({
        name: "[Hazard] Acid Rain Deals Damage",
        passed: acidResult.hpDamage > 0,
        expected: "Damage > 0",
        actual: acidResult.hpDamage
      });

      // Cleanup
      Math.random = originalRandom;

      setResults(tests);
    };

    runTests();
  }, []);

  return (
    <div className="h-full flex flex-col p-4 font-mono text-sm overflow-hidden bg-gray-900 text-gray-100">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
         <h1 className="text-2xl font-bold text-white">SYSTEM DIAGNOSTICS [FULL SUITE]</h1>
         <button onClick={onBack} className="border border-white px-4 py-1 hover:bg-white hover:text-black transition-colors">CLOSE</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {results.map((res, idx) => (
          <div key={idx} className={`flex justify-between p-3 border-l-4 ${res.passed ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
            <span className="font-semibold text-gray-300 w-2/3">{res.name}</span>
            <div className="text-right w-1/3">
               <span className={`font-bold mr-4 ${res.passed ? 'text-green-400' : 'text-red-500'}`}>
                 {res.passed ? 'PASS' : 'FAIL'}
               </span>
               {!res.passed && (
                 <div className="text-[10px] text-gray-400 mt-1">
                   Exp: {JSON.stringify(res.expected)} <br/> Act: {JSON.stringify(res.actual)}
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
        <span>Unit Testing Module v1.0.4</span>
        <span>
           TOTAL: <span className="text-white">{results.length}</span> | 
           PASSED: <span className="text-green-500">{results.filter(r => r.passed).length}</span> | 
           FAILED: <span className="text-red-500">{results.filter(r => !r.passed).length}</span>
        </span>
      </div>
    </div>
  );
};
