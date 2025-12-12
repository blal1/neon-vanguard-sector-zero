import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PilotConfig, PilotId, CombatLogEntry, Enemy, PilotModule, HazardType, Ability, ActiveStatus, Consumable, BossTemplate } from '../types';
import { CombatAction, CombatReplay } from '../types/replay';
import { COMBAT_CONFIG, RUN_CONFIG, STAGE_CONFIG, ENEMY_AFFIXES, AUGMENTATIONS, BOSS_TEMPLATES, DIFFICULTIES } from '../constants';
import { audio } from '../services/audioService';
import { voiceLines } from '../services/voiceLineService';
import { useGame } from '../context/GameContext';
import {
  calculateMaxHp,
  calculateDamage,
  calculateAbilityResult,
  calculatePassiveRegen,
  calculateHazardEffect,
  resolveEnemyAction,
  processStatusEffects,
  applyConsumableEffect,
  generateEnemies,
  checkBossPhaseTransition,
  executeBossAbility,
  calculateDefenseTarget,
  applySurvivalScaling
} from '../utils/combatUtils';
import { applyAugmentationEffects } from '../utils/combatUtils_augmentations';
import { COMBAT_MECHANICS } from '../constants';
import { BossIntroModal } from './BossIntroModal';
import { Tooltip } from './Tooltip';
import { getActiveSynergies } from '../utils/synergyUtils';
import { getActiveTalentSynergies } from '../utils/talentUtils';
import { Synergy } from '../types';
import { useCombatEffects, CombatEffectsLayer, VisualEffect } from './CombatEffectsLayer';
import { AnimatedPortrait } from './AnimatedPortrait';
import { ChargeAura } from './ChargeAura';
import { CombatEffects } from './CombatEffects';
import { gameTTS } from '../services/ttsService';
import { AccessibilityAnnouncer } from './AccessibilityAnnouncer';
import { ScreenReaderOnly } from './ScreenReaderOnly';
import { useTranslation } from 'react-i18next';

interface CombatScreenProps {
  pilot: PilotConfig;
  module: PilotModule;
  onVictory: () => void;
  onDefeat: () => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({ pilot, module, onVictory, onDefeat }) => {
  const { t } = useTranslation();

  const {
    addXp, addKill, addScrap, updateRunHp, updateRunConsumables, runState, settings,
    recordDamageDealt, recordEnemyKill, recordHazardSurvival, recordItemUsage, recordAbilityUsage,
    difficulty, dailyModifier, recordCodexEnemyKill, saveReplay, updateRunState, talentState
  } = useGame();

  // Voice lines flag to prevent spam
  const lowHpWarnedRef = useRef(false);
  const maxHp = calculateMaxHp(pilot, module, runState);
  const stageInfo = STAGE_CONFIG[runState.currentStage] || { mission: 'ASSAULT', title: 'UNKNOWN SECTOR' };

  // React State (used for rendering)
  const [playerHp, setPlayerHp] = useState(runState.currentHp > 0 ? runState.currentHp : maxHp);
  const [playerCharge, setPlayerCharge] = useState(0);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [activeHazard, setActiveHazard] = useState<HazardType>('NONE');
  const [energy, setEnergy] = useState(100);
  const [heat, setHeat] = useState(0);
  const [isJammed, setIsJammed] = useState(false);
  const [isBurrowed, setIsBurrowed] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [playerStatuses, setPlayerStatuses] = useState<ActiveStatus[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>(runState.consumables);

  // Mission Specifics
  const [missionTimer, setMissionTimer] = useState(stageInfo.mission === 'SURVIVAL' ? 60 : 0); // 60s survival
  const [coreHp, setCoreHp] = useState(100); // Defense Objective HP
  const [maxCoreHp] = useState(100);
  const [survivalWave, setSurvivalWave] = useState(1); // Current wave in SURVIVAL
  const [waveEnemiesDefeated, setWaveEnemiesDefeated] = useState(0); // Track wave progress

  // Boss-specific state
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [bossTemplate, setBossTemplate] = useState<BossTemplate | null>(null);
  const [bossChargeSlowActive, setBossChargeSlowActive] = useState(false);
  const [bossEvadeActive, setBossEvadeActive] = useState(false);
  const [telegraphedBossAbility, setTelegraphedBossAbility] = useState<BossAbilityType | null>(null);

  // Advanced Combat Mechanics State
  const [comboCount, setComboCount] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showComboNotification, setShowComboNotification] = useState(false);
  const comboTimeoutRef = useRef<number | null>(null);

  // Visual Effects
  const { effects, screenFlash, screenShake, spawnParticles, triggerFlash, triggerScreenShake } = useCombatEffects();

  // Accessibility - Combat Announcements for TTS
  const [combatAnnouncement, setCombatAnnouncement] = useState<string>('');

  // Replay Recording State
  const [replayActions, setReplayActions] = useState<CombatAction[]>([]);
  const [combatStartTime] = useState(Date.now());
  const turnCountRef = useRef(0);
  const combatStatsRef = useRef({
    damageDealt: 0,
    damageTaken: 0,
    enemiesKilled: 0,
    itemsUsed: 0,
    criticalHits: 0
  });

  const [tickRate, setTickRate] = useState(COMBAT_CONFIG.TICK_RATE_MS);
  const [activeSynergies, setActiveSynergies] = useState<Synergy[]>([]);
  const [activeTalentSynergies, setActiveTalentSynergies] = useState<Synergy[]>([]);

  const stateRef = useRef({
    playerHp: runState.currentHp > 0 ? runState.currentHp : maxHp,
    playerCharge: 0,
    enemies: [] as Enemy[],
    energy: 100,
    heat: 0,
    isJammed: false,
    isBurrowed: false,
    hazard: 'NONE' as HazardType,
    hazardTimer: 0,
    gameOver: false,
    cooldowns: {} as Record<string, number>,
    playerStatuses: [] as ActiveStatus[],
    consumables: runState.consumables,
    missionTimer: stageInfo.mission === 'SURVIVAL' ? 60000 : 0, // ms
    survivalSpawnTimer: 0,
    coreHp: 100,
    survivalWave: 1,
    waveEnemiesDefeated: 0
  });
  const logEndRef = useRef<HTMLDivElement>(null);
  const previousTimeRef = useRef<number>();
  const accumulatorRef = useRef(0);
  const requestRef = useRef(0);

  // --- Initialization ---
  useEffect(() => {
    addLog(`SECTOR ${runState.currentStage}: ${stageInfo.title}`, "info");
    addLog(`MISSION: ${runState.missionType || 'ASSAULT'}`, "special");

    // Voice line: Combat start
    if (settings.voiceLinesEnabled) {
      voiceLines.speakRandom('COMBAT_START', pilot.id as any);
    }

    const difficultyConfig = DIFFICULTIES[difficulty];
    let newEnemies = generateEnemies(
      runState.currentStage,
      difficultyConfig.enemyHpMult,
      difficultyConfig.enemyDmgMult,
      difficultyConfig.scrapMult,
      dailyModifier // Add dailyModifier here
    );

    const isBoss = newEnemies.some(e => e.isBoss);
    audio.playStageMusic(runState.currentStage, isBoss);

    // Daily Modifier Log Messages
    if (dailyModifier === 'BOSS_RUSH' && newEnemies.length > 0 && !newEnemies[0]?.isBoss) {
      addLog("⚠️ DAILY MODIFIER: BOSS RUSH ACTIVE", "alert");
      addLog("WARNING: ELITE ENEMY SIGNATURES DETECTED!", "alert");
    } else if (dailyModifier === 'DOUBLE_HAZARDS') {
      addLog("⚠️ DAILY MODIFIER: DOUBLE HAZARDS ACTIVE", "alert");
      addLog("Environmental hazard frequency DOUBLED!", "hazard");
    } else if (dailyModifier === 'PACIFIST') {
      addLog("🛡️ DAILY MODIFIER: PACIFIST MODE ACTIVE", "special");
      addLog("Offensive consumables unavailable. Defense only!", "info");
    }

    if (newEnemies.some(e => e.isBoss) && !bossTemplate) {
      const boss = newEnemies.find(e => e.isBoss);
      const template = BOSS_TEMPLATES.find(t => t.id === boss?.bossId);
      if (template) {
        setBossTemplate(template);
        setShowBossIntro(true);
        if (settings.voiceLinesEnabled) {
          voiceLines.speakRandom('BOSS_ENCOUNTER', pilot.id as any);
        }
      }
    }

    setEnemies(newEnemies);
    stateRef.current.enemies = newEnemies;

    // Initialize cooldowns to 0
    const initialCDs: Record<string, number> = {};
    pilot.abilities.forEach(ab => initialCDs[ab.id] = 0);
    stateRef.current.cooldowns = initialCDs;
    setCooldowns(initialCDs);

    return () => {
      audio.stopAmbientDrone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unlockedTalentIds = talentState[pilot.id]?.unlockedTalents.map(t => t.talentId) || [];
    const activeTalenSynergies = getActiveTalentSynergies(unlockedTalentIds);
    setActiveTalentSynergies(activeTalenSynergies);
  }, [talentState, pilot.id]);

  // Update Drone
  useEffect(() => {
    // Tension based on HP %
    const tension = 1 - (playerHp / maxHp);
    audio.updateDroneIntensity(tension);

    // Low HP and Near Death voice line triggers
    if (settings.voiceLinesEnabled) {
      const hpPercent = (playerHp / maxHp) * 100;
      if (hpPercent < 15 && !lowHpWarnedRef.current) {
        // Near death - critical urgency
        voiceLines.speakRandom('NEAR_DEATH', pilot.id as any);
        lowHpWarnedRef.current = true;
      } else if (hpPercent < 30 && !lowHpWarnedRef.current) {
        voiceLines.speakRandom('LOW_HP', pilot.id as any);
        lowHpWarnedRef.current = true;
      } else if (hpPercent > 40) {
        // Reset the flag if HP recovers
        lowHpWarnedRef.current = false;
      }
    }
  }, [playerHp, maxHp, settings.voiceLinesEnabled, pilot.id]);



  // Auto-scroll log
  useEffect(() => {
    if (logEndRef.current && typeof logEndRef.current.scrollIntoView === 'function') {
      logEndRef.current.scrollIntoView({ behavior: settings.reduceMotion ? 'auto' : 'smooth' });
    }
  }, [combatLog, settings.reduceMotion]);

  // --- Replay Recording Helper ---
  const recordAction = useCallback((action: Omit<CombatAction, 'turn' | 'timestamp' | 'playerHp' | 'playerMaxHp' | 'enemyCount'>) => {
    const newAction: CombatAction = {
      ...action,
      turn: turnCountRef.current,
      timestamp: Date.now() - combatStartTime,
      playerHp: stateRef.current.playerHp,
      playerMaxHp: maxHp,
      enemyCount: stateRef.current.enemies.filter(e => e.currentHp > 0).length
    };
    setReplayActions(prev => [...prev, newAction]);
  }, [combatStartTime, maxHp]);

  // --- Logging & Effects ---
  const addLog = (text: string, type: CombatLogEntry['type'] = 'info') => {
    if (settings.slowLogs && type === 'info' && text.includes('misses')) return;
    const id = Date.now().toString() + Math.random();
    setCombatLog(prev => [...prev.slice(-20), { id, text, type, timestamp: Date.now() }]);

    // TTS Announcements for accessibility
    setCombatAnnouncement(text);

    // Announce critical combat events with TTS
    if (type === 'damage' || type === 'crit') {
      gameTTS.combatLog(text);
    } else if (type === 'enemy') {
      gameTTS.combatLog(text);
    } else if (type === 'loot') {
      gameTTS.status(text);
    } else if (type === 'alert') {
      gameTTS.notification(text);
    }

    // Also record to replay
    recordAction({
      actor: type === 'enemy' ? 'ENEMY' : type === 'alert' ? 'SYSTEM' : 'PLAYER',
      actionType: 'SPECIAL',
      result: text
    });
  };



  // --- Combat End Handler (with Replay Saving) ---
  const handleCombatEnd = useCallback((outcome: 'VICTORY' | 'DEFEAT') => {
    if (stateRef.current.gameOver) return;
    stateRef.current.gameOver = true;

    // Voice line for outcome
    if (settings.voiceLinesEnabled) {
      voiceLines.speakRandom(outcome, pilot.id as any);
    }

    // Stop music and play end fanfare
    audio.stopMusic();
    if (outcome === 'VICTORY') {
      audio.playVictoryMusic();
    } else {
      audio.playDefeatMusic();
    }

    // Create and save replay
    const replay: CombatReplay = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      pilotId: pilot.id,
      pilotName: pilot.name,
      module,
      stage: runState.currentStage,
      difficulty,
      duration: Date.now() - combatStartTime,
      actions: replayActions,
      outcome,
      finalStats: {
        damageDealt: combatStatsRef.current.damageDealt,
        damageTaken: combatStatsRef.current.damageTaken,
        enemiesKilled: combatStatsRef.current.enemiesKilled,
        itemsUsed: combatStatsRef.current.itemsUsed,
        turnsElapsed: turnCountRef.current,
        criticalHits: combatStatsRef.current.criticalHits
      }
    };

    saveReplay(replay);

    // Apply mission-specific rewards
    if (outcome === 'VICTORY') {
      switch (runState.missionType) {
        case 'ASSAULT':
          addScrap(50);
          addLog("BONUS: +50 SCRAP for Assault Mission.", "loot");
          break;
        case 'DEFENSE':
          addXp(150);
          addLog("BONUS: +150 XP for Defense Mission.", "loot");
          // Add a temporary shield consumable
          const shieldConsumable = {
            id: 'temp_shield',
            name: 'TEMP SHIELD',
            description: 'Grants temporary shield.',
            count: 1,
            maxCount: 1,
            color: 'text-[var(--color-secondary)] border-blue-400',
            cost: 0
          };
          updateRunConsumables([...runState.consumables, shieldConsumable]);
          addLog("BONUS: Temporary Shield Consumable Added.", "loot");
          break;
        case 'SURVIVAL':
          const wavesCompleted = stateRef.current.survivalWave - 1; // Subtract 1 because wave increments before spawning
          const waveBonus = wavesCompleted * 50; // 50 scrap per wave
          const xpBonus = 150 + (wavesCompleted * 30); // Base 150 + 30 per wave

          addScrap(waveBonus);
          addXp(xpBonus);
          addLog(`SURVIVAL COMPLETE! Waves: ${wavesCompleted} | Bonus: +${waveBonus} SCRAP, +${xpBonus} XP`, "loot");
          updateRunState({ maxHpUpgrade: (runState.maxHpUpgrade || 0) + 10 });
          addLog("BONUS: Max HP increased by +10.", "loot");
          break;
        default:
          break;
      }
      onVictory();
    } else {
      onDefeat();
    }
  }, [pilot, module, runState, difficulty, combatStartTime, replayActions, saveReplay, onVictory, onDefeat, addScrap, addXp, updateRunConsumables, updateRunState, settings.voiceLinesEnabled]);

  // --- Player Abilities ---
  const handleAbilityUse = useCallback((ability: Ability) => {
    const current = stateRef.current;

    if (current.gameOver) return;
    if (current.enemies.length === 0 && stageInfo.mission !== 'SURVIVAL') return;
    if (current.playerCharge < 100) return;
    if (current.cooldowns[ability.id] > 0) {
      addLog(`${ability.name} IS RECHARGING.`, "info");
      audio.playHover();
      return;
    }

    recordAbilityUsage(ability.id);

    const baseDamage = calculateDamage(pilot, module, current.playerStatuses, runState, current.heat, activeSynergies);
    const result = calculateAbilityResult(
      pilot, ability, baseDamage, current.energy, current.heat, current.isJammed, current.isBurrowed, current.enemies
    );

    if (!result.resourceConsumed) {
      if (result.error === 'LOW_ENERGY') {
        addLog(result.logMessage, "alert");
        triggerFlash('warning');
        audio.playAlarm();
      } else if (result.error === 'JAMMED') {
        addLog(result.logMessage, "alert");
        triggerFlash('warning');
        audio.playAlarm();
      }
      return;
    }

    // Apply Resource Changes
    if (pilot.id === PilotId.SOLARIS) {
      current.energy = result.newEnergy;
      setEnergy(current.energy);
      audio.playShoot('laser');
      spawnParticles('laser', 50, 50);
      triggerFlash('ability');
    } else if (pilot.id === PilotId.HYDRA) {
      current.heat = result.newHeat;
      setHeat(current.heat);
      if (result.jammed && !current.isJammed) {
        current.isJammed = true;
        setIsJammed(true);
        addLog("CRITICAL OVERHEAT! WEAPONS LOCKED.", "alert");
        audio.playAlarm();
        spawnParticles('overheat', 50, 50);
        triggerFlash('warning');
        triggerScreenShake('rumble');
      } else {
        audio.playShoot('heavy');
        spawnParticles('heavy_shot', 50, 50);
        triggerFlash('ability');
        triggerScreenShake('rumble');
      }
    } else if (pilot.id === PilotId.WYRM) {
      if (result.burrowedState !== current.isBurrowed) {
        current.isBurrowed = false;
        setIsBurrowed(false);
        current.playerCharge = 0;
      }
      audio.playShoot('bio');
      spawnParticles('bio_shot', 50, 50);
      triggerFlash('ability');
      triggerScreenShake('horizontal');
    } else {
      audio.playShoot('standard');
      spawnParticles('standard_shot', 50, 50);
      triggerFlash('ability');
      triggerScreenShake('light');
    }

    // Reset Turn
    current.playerCharge = 0;
    setPlayerCharge(0);

    // Set Cooldown
    if (ability.cooldownMs > 0) {
      current.cooldowns[ability.id] = ability.cooldownMs;
      setCooldowns({ ...current.cooldowns });
    }

    // Combo System Logic
    const now = Date.now();
    const timeSinceLastHit = now - lastHitTime;
    let newComboCount = comboCount;
    let newComboMultiplier = 1;

    if (timeSinceLastHit < COMBAT_MECHANICS.COMBO_TIMEOUT && comboCount > 0) {
      // Continue combo
      newComboCount = comboCount + 1;
    } else {
      // Start new combo
      newComboCount = 1;
    }

    // Calculate combo multiplier
    const multiplierKeys = Object.keys(COMBAT_MECHANICS.COMBO_MULTIPLIERS).map(Number).sort((a, b) => b - a);
    for (const threshold of multiplierKeys) {
      if (newComboCount >= threshold) {
        newComboMultiplier = COMBAT_MECHANICS.COMBO_MULTIPLIERS[threshold];
        break;
      }
    }

    // Apply combo multiplier to damage
    const comboModifiedDamage = Math.floor(result.damage * newComboMultiplier);

    // Update combo state
    setComboCount(newComboCount);
    setLastHitTime(now);
    setComboMultiplier(newComboMultiplier);

    // Show combo notification if multiplier > 1
    if (newComboMultiplier > 1) {
      setShowComboNotification(true);
      setTimeout(() => setShowComboNotification(false), COMBAT_MECHANICS.COMBO_DISPLAY_DURATION);
    }

    // Clear existing combo timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }

    // Set new combo timeout
    comboTimeoutRef.current = window.setTimeout(() => {
      setComboCount(0);
      setComboMultiplier(1);
    }, COMBAT_MECHANICS.COMBO_TIMEOUT);

    // Apply Damage to Targets
    const enemiesCopy = [...current.enemies];
    let deadEnemies = 0;
    let scrapGained = 0;
    let totalHpGain = 0;
    let totalDamageDealt = 0;

    result.targetsHit.forEach((idx, i) => {
      if (enemiesCopy[idx]) {
        // PHASE_SHIFT Dodge Mechanic
        if (enemiesCopy[idx].isBoss && bossEvadeActive && Math.random() < 0.5) {
          addLog(`${enemiesCopy[idx].name} PHASES OUT AND EVADES!`, "info");
          spawnParticles('dodge', 80, 20 + i * 20);
          audio.playHover(); // Swoosh sound for dodge
          return; // Skip damage for this target
        }

        let damageToApply = comboModifiedDamage; // Use combo-modified damage

        // SHIELDED Logic
        const shieldIdx = enemiesCopy[idx].statuses.findIndex(s => s.type === 'SHIELDED');
        if (shieldIdx !== -1) {
          damageToApply = 0;
          enemiesCopy[idx].statuses.splice(shieldIdx, 1);
          addLog(`${enemiesCopy[idx].name} SHIELD BLOCKED ATTACK!`, "special");
          spawnParticles('shield', 80, 20 + i * 20);
        } else {
          // ARMORED Logic
          if (enemiesCopy[idx].affix === 'ARMORED') {
            damageToApply = Math.floor(damageToApply * 0.7);
          }
        }

        // Apply ON_HIT augmentation effects (Plasma Coating)
        const hitEffects = applyAugmentationEffects(runState.augmentations, 'ON_HIT', {});
        if (hitEffects.enemyBurn && damageToApply > 0) {
          enemiesCopy[idx].statuses.push({
            id: `burn-${Date.now()}-${idx}`,
            type: 'BURNING',
            durationMs: 6000,
            value: COMBAT_CONFIG.STATUS.BURN_DAMAGE_PER_TICK
          });
          addLog(`${enemiesCopy[idx].name} IS BURNING!`, "special");
          spawnParticles('burn', 80, 20 + i * 20);
        }

        enemiesCopy[idx] = { ...enemiesCopy[idx], currentHp: enemiesCopy[idx].currentHp - damageToApply };
        totalDamageDealt += damageToApply;
        if (damageToApply > 0) {
          spawnParticles('hit', 80, 20 + i * 20);
        }

        // Stun logic
        if (result.stunApplied && damageToApply > 0) {
          enemiesCopy[idx].statuses.push({ id: `stun-${Date.now()}`, type: 'STUNNED', durationMs: 4000 });
          enemiesCopy[idx].actionCharge = 0;
          enemiesCopy[idx].isCharged = false;
          addLog(`${enemiesCopy[idx].name} STUNNED!`, "special");
          spawnParticles('stun', 80, 20 + i * 20);
        }

        if (enemiesCopy[idx].currentHp <= 0) {
          deadEnemies++;
          const drop = enemiesCopy[idx].scrapValue + Math.floor(Math.random() * RUN_CONFIG.SCRAP_VAR_DROP);
          scrapGained += drop;

          // Apply ON_KILL augmentation effects (Vampiric Nanites)
          const killEffects = applyAugmentationEffects(runState.augmentations, 'ON_KILL', {
            currentHp: current.playerHp,
            maxHp: maxHp
          });
          if (killEffects.hpGain > 0) {
            totalHpGain += killEffects.hpGain;
          }

          // VOLATILE Logic
          if (enemiesCopy[idx].affix === 'VOLATILE') {
            const boomDmg = 15;
            current.playerHp = Math.max(1, current.playerHp - boomDmg);
            setPlayerHp(current.playerHp);
            triggerScreenShake('rumble');
            triggerFlash('damage');
            audio.playSound('hit_player');
            if (settings.showDamageNumbers) addLog(`${enemiesCopy[idx].name} EXPLODES! [${boomDmg} DMG]`, "crit");
          }
        }
      }
    });

    // Apply healing from Vampiric Nanites
    if (totalHpGain > 0) {
      current.playerHp = Math.min(maxHp, current.playerHp + totalHpGain);
      setPlayerHp(current.playerHp);
      addLog(`VAMPIRIC NANITES: +${totalHpGain} HP`, "special");
      spawnParticles('heal', 30, 50);
      triggerFlash('heal');
    }

    // Log damage with combo indicator
    if (settings.showDamageNumbers) {
      let damageLogMessage = `${result.logMessage} >>> [${totalDamageDealt} DMG]`;
      if (newComboMultiplier > 1) {
        damageLogMessage += ` [COMBO x${newComboCount}!]`;
      }
      addLog(damageLogMessage, "damage");
    }

    if (result.isCritical) {
      triggerFlash('critical');
      triggerScreenShake('rumble');
      audio.playSound('crit_hit');
      result.targetsHit.forEach((idx, i) => spawnParticles('critical', 80, 20 + i * 20));

      // Voice line for critical hit
      if (settings.voiceLinesEnabled) {
        voiceLines.speakRandom('CRIT_HIT', pilot.id as any);
      }

      if (activeTalentSynergies.some(s => s.id === 'solaris_solar_flare') && Math.random() < 0.25) {
        result.targetsHit.forEach(idx => {
          if (enemiesCopy[idx]) {
            enemiesCopy[idx].statuses.push({ id: `stun-${Date.now()}`, type: 'STUNNED', durationMs: 1000 });
            enemiesCopy[idx].actionCharge = 0;
            enemiesCopy[idx].isCharged = false;
            addLog(`${enemiesCopy[idx].name} STUNNED by SOLAR FLARE!`, "special");
            spawnParticles('stun', 80, 20 + idx * 20);
          }
        });
      }
    }

    // Voice line for combo milestone
    if (settings.voiceLinesEnabled && newComboCount >= 5 && newComboCount % 5 === 0) {
      voiceLines.speakRandom('COMBO', pilot.id as any);
    }

    // Voice line for weak point hit (COUNTER_ATTACK)
    if (settings.voiceLinesEnabled && result.weakPointHit) {
      voiceLines.speakRandom('COUNTER_ATTACK', pilot.id as any);
    }

    // Record damage dealt
    recordDamageDealt(totalDamageDealt);

    // Filter dead
    const aliveEnemies = enemiesCopy.filter(e => e.currentHp > 0);
    if (aliveEnemies.length < current.enemies.length) {
      const killedCount = current.enemies.length - aliveEnemies.length;

      // Record enemy kills with names
      enemiesCopy.filter(e => e.currentHp <= 0).forEach((enemy, i) => {
        recordEnemyKill(enemy.name);
        recordCodexEnemyKill(enemy.name); // Unlock codex entry
        spawnParticles('enemy_explosion', 80, 20 + i * 20);
        triggerScreenShake('light');
      });

      addLog(`*** ${killedCount} TARGET(S) DESTROYED. +${scrapGained} SCRAP ***`, "loot");
      addXp(20 * killedCount);
      for (let i = 0; i < killedCount; i++) addKill();
      addScrap(scrapGained);
    }

    current.enemies = aliveEnemies;
    setEnemies(aliveEnemies);

    // Win Condition (Assault/Defense)
    if (stageInfo.mission !== 'SURVIVAL' && aliveEnemies.length === 0) {
      current.gameOver = true;
      addXp(100);
      updateRunHp(current.playerHp);
      updateRunConsumables(current.consumables);
      setTimeout(() => handleCombatEnd('VICTORY'), 1500);
    }

  }, [pilot, onVictory, module, addXp, addKill, addScrap, runState, updateRunHp, updateRunConsumables, stageInfo.mission, handleCombatEnd, spawnParticles, triggerFlash, triggerScreenShake, activeSynergies, comboCount, lastHitTime]);


  const handleSpecial = useCallback(() => {
    const current = stateRef.current;

    if (pilot.id === PilotId.SOLARIS) {
      current.energy = 100;
      setEnergy(100);
      current.playerCharge = 0;
      setPlayerCharge(0);
      addLog("HELIOS SYNC: ENERGY RESTORED MAX.", "special");
      spawnParticles('energy', 30, 50);
      triggerFlash('energy');
      audio.playSound('charge_up');
    }
    else if (pilot.id === PilotId.HYDRA) {
      current.heat = 0;
      setHeat(0);
      current.isJammed = false;
      setIsJammed(false);
      addLog("HEAT VENTED. SYSTEMS NORMAL.", "special");
      current.playerCharge = Math.max(0, current.playerCharge - 20);
      setPlayerCharge(current.playerCharge);
      audio.playSound('vent');
    }
    else if (pilot.id === PilotId.WYRM) {
      const newState = !current.isBurrowed;
      current.isBurrowed = newState;
      setIsBurrowed(newState);
      if (newState) {
        addLog("SUBTERRANEAN MODE ENGAGED.", "special");
        audio.playSound('burrow');
      } else {
        addLog("SURFACING...", "info");
      }
    }
    else if (pilot.id === PilotId.VANGUARD) {
      const healAmount = 30;
      current.playerHp = Math.min(maxHp, current.playerHp + healAmount);
      setPlayerHp(current.playerHp);
      current.playerStatuses.push({ id: `shield-${Date.now()}`, type: 'SHIELDED', durationMs: 5000 });
      setPlayerStatuses([...current.playerStatuses]);

      current.playerCharge = 0;
      setPlayerCharge(0);
      addLog(`REPAIRS COMPLETE. +${healAmount} HP. SHIELD ACTIVE.`, "special");
      spawnParticles('heal', 30, 50);
      triggerFlash('heal');
      audio.playSound('power_up');
    }
  }, [pilot, maxHp, spawnParticles, triggerFlash]);

  const handleConsumable = useCallback((itemIndex: number) => {
    const current = stateRef.current;
    const item = current.consumables[itemIndex];
    if (item.count <= 0) return;
    if (current.playerCharge < 50) {
      addLog("NOT ENOUGH CHARGE TO USE ITEM (REQ: 50%)", "alert");
      triggerFlash('warning');
      return;
    }

    item.count--;
    setConsumables([...current.consumables]);
    current.playerCharge -= 50;
    setPlayerCharge(current.playerCharge);

    // Record item usage
    recordItemUsage(item.id);

    const result = applyConsumableEffect(
      item.id, current.playerHp, maxHp, current.energy, current.heat, current.enemies, current.playerStatuses
    );

    if (result.newHp > current.playerHp) {
      spawnParticles('heal', 30, 50);
      triggerFlash('heal');
    }
    if (result.newEnemies.some((e, i) => e.currentHp < current.enemies[i]?.currentHp)) {
      spawnParticles('hit', 80, 50);
      triggerScreenShake('light');
    }

    current.playerHp = result.newHp;
    setPlayerHp(result.newHp);
    current.energy = result.newEnergy;
    setEnergy(result.newEnergy);
    current.heat = result.newHeat;
    setHeat(result.newHeat);
    current.playerStatuses = result.newPlayerStatuses;
    setPlayerStatuses(result.newPlayerStatuses);
    current.enemies = result.newEnemies;
    setEnemies(result.newEnemies);

    addLog(result.log, "special");
    audio.playBlip();

    // Voice line for item use
    if (settings.voiceLinesEnabled) {
      voiceLines.speakRandom('ITEM_USE', pilot.id as any);
    }

  }, [maxHp, recordItemUsage, spawnParticles, triggerFlash, triggerScreenShake, settings.voiceLinesEnabled, pilot.id]);

  // --- Game Loop Update ---
  const updateGame = useCallback(() => {
    const current = stateRef.current;
    if (current.gameOver || (current.enemies.length === 0 && stageInfo.mission !== 'SURVIVAL') || current.playerHp <= 0) return;

    // Mission Timer
    if (runState.missionType === 'SURVIVAL') {
      current.missionTimer -= tickRate;
      setMissionTimer(Math.ceil(current.missionTimer / 1000));

      // Wave-based enemy spawning
      current.survivalSpawnTimer += tickRate;

      // Calculate wave spawn interval (gets faster over time)
      const baseInterval = 10000; // 10 seconds
      const minInterval = 5000; // 5 seconds minimum
      const waveInterval = Math.max(minInterval, baseInterval - (current.survivalWave * 500));

      if (current.survivalSpawnTimer >= waveInterval) {
        // Calculate enemies per wave (increases over time)
        const enemiesPerWave = Math.min(1 + Math.floor(current.survivalWave / 3), 4); // Max 4 enemies

        const difficultyConfig = DIFFICULTIES[difficulty];
        const baseEnemies = generateEnemies(
          runState.currentStage,
          difficultyConfig.enemyHpMult,
          difficultyConfig.enemyDmgMult,
          difficultyConfig.scrapMult
        );

        // Apply survival scaling and add multiple enemies
        for (let i = 0; i < enemiesPerWave; i++) {
          const spawnedEnemy = baseEnemies[i % baseEnemies.length];
          const scaledEnemy = applySurvivalScaling(spawnedEnemy, current.survivalWave);
          current.enemies.push(scaledEnemy);
        }

        current.survivalSpawnTimer = 0;
        current.survivalWave++;
        setSurvivalWave(current.survivalWave);
        setEnemies([...current.enemies]);

        addLog(`⚠️ WAVE ${current.survivalWave}: ${enemiesPerWave} HOSTILES INBOUND!`, "alert");
        audio.playAlarm();
      }

      if (current.missionTimer <= 0) {
        current.gameOver = true;
        addLog("SURVIVAL TIME ACHIEVED. EXFILTRATING.", "special");
        updateRunHp(current.playerHp);
        updateRunConsumables(current.consumables);
        setTimeout(() => handleCombatEnd('VICTORY'), 1500);
        return;
      }
    }

    // 0. Cooldowns
    let cooldownsChanged = false;
    for (const id in current.cooldowns) {
      if (current.cooldowns[id] > 0) {
        current.cooldowns[id] = Math.max(0, current.cooldowns[id] - tickRate);
        cooldownsChanged = true;
      }
    }
    if (cooldownsChanged) setCooldowns({ ...current.cooldowns });

    // 0.5 Status Effects (Player)
    if (current.playerStatuses.length > 0) {
      const { newStatuses, damageTaken } = processStatusEffects(current.playerStatuses, tickRate, activeSynergies);
      if (damageTaken > 0) {
        current.playerHp = Math.max(1, current.playerHp - damageTaken);
        setPlayerHp(current.playerHp);
        triggerFlash('damage');
        triggerScreenShake('light');
      }
      current.playerStatuses = newStatuses;
      setPlayerStatuses(newStatuses);
    }

    // 1. Passive Regen
    const regenHp = calculatePassiveRegen(pilot.id, current.playerHp, maxHp);
    if (regenHp > current.playerHp) {
      current.playerHp = regenHp;
      setPlayerHp(regenHp);
      spawnParticles('heal', 30, 50,);
    }

    if (current.hazardTimer > 0) {
      current.hazardTimer -= tickRate;

      // HAZARD DAMAGE & EFFECTS
      const hazardEffect = calculateHazardEffect(current.hazard, pilot.id);
      if (Math.random() < 0.1) { // Chance per tick for visual effects
        if (hazardEffect.hpDamage > 0) {
          current.playerHp = Math.max(1, current.playerHp - hazardEffect.hpDamage);
          setPlayerHp(current.playerHp);
          triggerFlash('damage');
          audio.playSound('hit_player', 0.5);
          if (settings.showDamageNumbers) addLog(hazardEffect.log || 'Hazard Damage!', "hazard");
        }
        if (current.hazard === 'SEISMIC_ACTIVITY') {
          triggerScreenShake('light');
        }
      }

      // ION STORM LOGIC
      if (current.hazard === 'ION_STORM') {
        if (Math.random() < 0.05 && !current.isJammed) {
          current.isJammed = true;
          setIsJammed(true);
          addLog("ION SURGE DETECTED! SYSTEMS JAMMED.", "alert");
          triggerFlash('warning');
          audio.playAlarm();
        }
      }

      if (hazardEffect.chargeDrain > 0) {
        current.playerCharge = Math.max(0, current.playerCharge - hazardEffect.chargeDrain);
        setPlayerCharge(current.playerCharge);
      }
      if (hazardEffect.energyDrain > 0 && pilot.id === PilotId.SOLARIS) {
        current.energy = Math.max(0, current.energy - hazardEffect.energyDrain);
        setEnergy(current.energy);
      }


      if (current.hazardTimer <= 0) {
        const survivedHazard = current.hazard;
        current.hazard = 'NONE';
        setActiveHazard('NONE');
        addLog("ENVIRONMENTAL LEVELS STABILIZING.", "info");

        // Record hazard survival
        recordHazardSurvival(survivedHazard);
      }
    } else {
      const hazardChanceMultiplier = (dailyModifier === 'DOUBLE_HAZARDS') ? 2 : 1;
      if (Math.random() < COMBAT_CONFIG.HAZARD_CHANCE_PER_TICK * hazardChanceMultiplier) {
        const hazardRoll = Math.random();
        let newHazard: HazardType = 'NONE';
        let hazardName = "";
        if (hazardRoll < 0.33) { newHazard = 'ACID_RAIN'; hazardName = "ACID RAIN"; }
        else if (hazardRoll < 0.66) { newHazard = 'ION_STORM'; hazardName = "ION STORM"; }
        else { newHazard = 'SEISMIC_ACTIVITY'; hazardName = "SEISMIC ACTIVITY"; }

        current.hazard = newHazard;
        current.hazardTimer = COMBAT_CONFIG.HAZARD_DURATION_MS;
        setActiveHazard(newHazard);
        addLog(`WARNING: ${hazardName} DETECTED`, "hazard");
        triggerFlash('warning');
        audio.playHazardWarning();

        // Voice line for hazard
        if (settings.voiceLinesEnabled) {
          voiceLines.speakRandom('HAZARD', pilot.id as any);
        }
      }
    }

    // 3. Player Charge
    let speedMod = 1;
    if (module === 'DEFENSE') speedMod = 0.9;
    if (current.hazard === 'SEISMIC_ACTIVITY') speedMod *= 0.7;
    current.playerCharge = Math.min(100, current.playerCharge + (COMBAT_CONFIG.BASE_CHARGE_RATE * pilot.baseSpeed * speedMod));
    setPlayerCharge(current.playerCharge);

    // Class Passives
    if (pilot.id === PilotId.SOLARIS && current.energy < 100) {
      current.energy = Math.min(100, current.energy + COMBAT_CONFIG.SOLARIS_REGEN_PER_TICK);
      setEnergy(current.energy);
    }
    if (pilot.id === PilotId.HYDRA && current.heat > 0 && !current.isJammed) {
      current.heat = Math.max(0, current.heat - COMBAT_CONFIG.HYDRA_COOL_RATE);
      setHeat(current.heat);
    }

    // 4. Enemy ATB System
    let enemiesUpdated = false;
    const newEnemies = current.enemies.map((enemy, enemyIdx) => {
      // Process Enemy Statuses
      let canAct = true;
      if (enemy.statuses.length > 0) {
        const { newStatuses, damageTaken } = processStatusEffects(enemy.statuses, tickRate, activeSynergies);
        enemy.statuses = newStatuses;
        if (damageTaken > 0) {
          enemy.currentHp -= damageTaken;
          spawnParticles('hit', 80, 20 + enemyIdx * 20);
        }
        if (newStatuses.some(s => s.type === 'STUNNED')) {
          canAct = false;
        }
      }
      if (enemy.currentHp <= 0) {
        enemiesUpdated = true;
        return enemy;
      }

      // Increase Charge if not Stunned
      if (canAct) {
        let chargeRate = COMBAT_CONFIG.ENEMY_AI.CHARGE_RATE_BASE * enemy.speed;
        if (current.hazard === 'SEISMIC_ACTIVITY') chargeRate *= 0.5;
        if (enemy.affix === 'SWIFT') chargeRate *= 2.0;
        enemy.actionCharge = Math.min(100, enemy.actionCharge + chargeRate);
      }

      // Execute Action if Charged
      if (enemy.actionCharge >= 100) {
        enemiesUpdated = true;
        enemy.actionCharge = 0; // Reset Charge

        // --- BOSS ABILITY LOGIC ---
        if (enemy.isBoss && Math.random() < 0.4) { // 40% chance to use special ability
          const template = BOSS_TEMPLATES.find(t => t.id === enemy.bossData?.templateId);
          if (template && template.abilities.length > 0) {
            const abilityToUse = template.abilities[Math.floor(Math.random() * template.abilities.length)];

            addLog(`${enemy.name} is charging ${abilityToUse.replace(/_/g, ' ')}!`, "alert");
            setTelegraphedBossAbility(abilityToUse);
            triggerScreenShake('vertical');

            setTimeout(() => {
              const abilityResult = executeBossAbility(enemy, abilityToUse, current.playerHp, current.energy, current.heat, current.enemies);

              addLog(abilityResult.effect, "crit");
              triggerScreenShake('rumble');
              triggerFlash('damage');

              // Apply Boss Ability Effects
              if (abilityResult.bossEvade) {
                setBossEvadeActive(true);
                // Clear evade flag after 8 seconds
                setTimeout(() => setBossEvadeActive(false), 8000);
              }
              if (abilityResult.playerDamage > 0) {
                current.playerHp = Math.max(1, current.playerHp - abilityResult.playerDamage);
                setPlayerHp(current.playerHp);
              }
              if (abilityResult.playerEnergyDrain > 0) {
                current.energy = Math.max(0, current.energy - abilityResult.playerEnergyDrain);
                setEnergy(current.energy);
              }
              if (abilityResult.playerHeatIncrease > 0) {
                current.heat = Math.min(100, current.heat + abilityResult.playerHeatIncrease);
                setHeat(current.heat);
              }
              if (abilityResult.statusApplied) {
                current.playerStatuses.push(abilityResult.statusApplied);
                setPlayerStatuses([...current.playerStatuses]);
              }
              if (abilityResult.bossHealed) {
                enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + abilityResult.bossHealed);
              }
              if (abilityResult.newEnemies) {
                current.enemies.push(...abilityResult.newEnemies);
                setEnemies([...current.enemies]);
              }


              setTelegraphedBossAbility(null);
            }, 2000); // 2 second telegraph

            return enemy; // Return early to prevent normal attack
          }
        }

        const actionResult = resolveEnemyAction(enemy, current.isBurrowed, current.hazard, activeTalentSynergies);

        if (actionResult.healed) {
          enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + 10);
          addLog(`${enemy.name} ${actionResult.flavor}`, "enemy");
          spawnParticles('heal', 80, 20 + enemyIdx * 20);
        }
        else if (actionResult.lifesteal && actionResult.lifesteal > 0) {
          enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + actionResult.lifesteal);
          if (settings.showDamageNumbers) addLog(`${enemy.name} DRAINS LIFE! [+${actionResult.lifesteal} HP]`, "enemy");
          spawnParticles('heal', 80, 20 + enemyIdx * 20);

          // Deal damage
          current.playerHp -= actionResult.damage;
          setPlayerHp(current.playerHp);
          if (settings.showDamageNumbers) addLog(`${enemy.name} ${actionResult.flavor} [${actionResult.damage} DMG]`, "enemy");
          triggerFlash('damage');
        }
        else if (actionResult.charged) {
          addLog(`${enemy.name} ${actionResult.flavor}`, "alert");
        }
        else if (actionResult.missed) {
          addLog(`${enemy.name} ${actionResult.flavor}`, "info");
        }
        else {
          // DEFENSE MODE LOGIC: Smart AI Targeting
          let targetIsCore = false;
          if (runState.missionType === 'DEFENSE') {
            const target = calculateDefenseTarget(
              current.playerHp,
              maxHp,
              current.coreHp,
              maxCoreHp,
              enemy.name,
              enemy.isBoss || false
            );
            targetIsCore = (target === 'CORE');
          }

          if (targetIsCore) {
            current.coreHp = Math.max(0, current.coreHp - actionResult.damage);
            setCoreHp(current.coreHp);
            if (settings.showDamageNumbers) addLog(`${enemy.name} ATTACKS DATA CORE! [${actionResult.damage} DMG]`, "alert");
            triggerScreenShake('vertical');

            if (current.coreHp <= 0 && !current.gameOver) {
              current.gameOver = true;
              addLog("CRITICAL FAILURE: DATA CORE DESTROYED.", "crit");
              setTimeout(() => handleCombatEnd('DEFEAT'), 1000);
            }
          } else {
            // Check for Shield
            const shieldIndex = current.playerStatuses.findIndex(s => s.type === 'SHIELDED');
            if (shieldIndex !== -1) {
              addLog(`SHIELD BLOCKED DAMAGE FROM ${enemy.name}!`, "special");
              spawnParticles('shield', 30, 50);
              // Remove shield
              const newStatuses = [...current.playerStatuses];
              newStatuses.splice(shieldIndex, 1);
              current.playerStatuses = newStatuses;
              setPlayerStatuses(newStatuses);
            } else {
              // Apply damage to player
              current.playerHp -= actionResult.damage;
              setPlayerHp(current.playerHp);
              triggerFlash('damage');
              if (actionResult.isCrit) {
                audio.playSound('crit_hit');
              } else {
                audio.playSound('hit_player');
              }
              if (actionResult.damage > 20) triggerScreenShake('rumble');
              else if (actionResult.damage > 10) triggerScreenShake('horizontal');
              else triggerScreenShake('light');

              // Reset combo on player damage
              setComboCount(0);
              setComboMultiplier(1);
              if (comboTimeoutRef.current) {
                clearTimeout(comboTimeoutRef.current);
                comboTimeoutRef.current = null;
              }

              // Counter-Attack System
              const hasCounterStatus = current.playerStatuses.some(s =>
                s.type === 'SHIELDED' // Could extend to GUARD, FORTIFIED if we add those
              );

              if (hasCounterStatus && Math.random() < COMBAT_MECHANICS.COUNTER_CHANCE) {
                const counterDamage = Math.floor(actionResult.damage * COMBAT_MECHANICS.COUNTER_DAMAGE_MULTIPLIER);
                enemy.currentHp -= counterDamage;
                if (settings.showDamageNumbers) addLog(`COUNTER-ATTACK! >>> [${counterDamage} DMG to ${enemy.name}]`, "special");
                audio.playShoot('standard');
                spawnParticles('hit', 80, 20 + enemyIdx * 20);
                triggerScreenShake('light');
              }

              // Apply ON_DAMAGE_TAKEN augmentation effects (Static Shell)
              const damageEffects = applyAugmentationEffects(runState.augmentations, 'ON_DAMAGE_TAKEN', {
                enemyDamage: actionResult.damage,
                currentHp: current.playerHp,
                maxHp: maxHp
              }, activeSynergies);

              if (damageEffects.reflectDamage > 0) {
                enemy.currentHp -= damageEffects.reflectDamage;
                if (settings.showDamageNumbers) addLog(`STATIC SHELL: ${enemy.name} takes ${damageEffects.reflectDamage} reflect damage!`, "special");
                spawnParticles('hit', 80, 20 + enemyIdx * 20);
              }
              // Apply BLOOD_SHELL synergy effect
              if (damageEffects.synergyEffects.healOnEnemyAttack && actionResult.damage > 0) {
                const healAmount = Math.floor(actionResult.damage * 0.5); // Heal for 50% of damage taken
                current.playerHp = Math.min(maxHp, current.playerHp + healAmount);
                setPlayerHp(current.playerHp);
                addLog(`BLOOD SHELL: +${healAmount} HP`, "special");
                spawnParticles('heal', 30, 50);
              }

              if (current.playerHp <= 0 && !current.gameOver) {
                current.gameOver = true;
                setTimeout(() => handleCombatEnd('DEFEAT'), 1000);
              }
              if (settings.showDamageNumbers) addLog(`${enemy.name} ${actionResult.flavor} [${actionResult.damage} DMG]`, actionResult.isCrit ? "crit" : "enemy");
              spawnParticles('player_hit', 30, 50);
            }
          }
        }

        // Determine Next Intent immediately after acting
        return {
          ...enemy,
          intent: actionResult.newIntent || 'ATTACK',
          isCharged: actionResult.charged
        };
      }
      return enemy;
    });

    // Check for deaths due to DoTs
    const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length < current.enemies.length) {
      enemiesUpdated = true;
      const deadCount = current.enemies.length - aliveEnemies.length;
      addLog(`${deadCount} TARGET(S) ELIMINATED BY STATUS DAMAGE.`, "info");
      addXp(10 * deadCount);
      for (let i = 0; i < deadCount; i++) addKill();
    }

    // Only update React state if something changed (optimization)
    if (enemiesUpdated || newEnemies.some((e, i) => Math.floor(e.actionCharge) !== Math.floor(current.enemies[i]?.actionCharge || 0))) {
      current.enemies = aliveEnemies;
      setEnemies(aliveEnemies);
    }
    if (aliveEnemies.length === 0 && runState.missionType !== 'SURVIVAL' && !current.gameOver) {
      current.gameOver = true;
      addXp(100);
      updateRunHp(current.playerHp);
      updateRunConsumables(current.consumables);
      setTimeout(() => handleCombatEnd('VICTORY'), 1500);
    }

  }, [pilot, module, maxHp, onDefeat, addXp, addKill, runState, updateRunHp, updateRunConsumables, stageInfo.mission, handleCombatEnd, spawnParticles, triggerFlash, triggerScreenShake, activeSynergies, activeTalentSynergies, difficulty]);

  // --- Animation Frame Loop ---
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      accumulatorRef.current += deltaTime;

      // Fixed time step
      let ticksProcessed = 0;
      while (accumulatorRef.current >= tickRate) {
        updateGame();
        accumulatorRef.current -= tickRate;
        ticksProcessed++;
        if (ticksProcessed > 10) {
          accumulatorRef.current = 0;
          break;
        }
      }
    }
    previousTimeRef.current = time;
    if (!stateRef.current.gameOver) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateGame]);


  // --- Input ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.gameOver) return;

      const keybindings = settings.keybindings || {};

      if (e.code === (keybindings.primaryAbility || 'Space')) {
        e.preventDefault();
        if (pilot.abilities.length > 0) {
          handleAbilityUse(pilot.abilities[0]);
        }
      }
      if (e.code === (keybindings.specialAbility || 'ShiftLeft') || e.code === (keybindings.specialAbility || 'ShiftRight')) {
        e.preventDefault();
        handleSpecial();
      }
      if (e.code === (keybindings.consumable1 || 'Digit1')) handleConsumable(0);
      if (e.code === (keybindings.consumable2 || 'Digit2')) handleConsumable(1);
      if (e.code === (keybindings.consumable3 || 'Digit3')) handleConsumable(2);
      if (e.code === (keybindings.consumable4 || 'Digit4')) handleConsumable(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAbilityUse, handleSpecial, pilot.abilities, settings.keybindings, handleConsumable]);

  // --- RENDER ---
  const hpPercent = (playerHp / maxHp) * 100;

  return (
    <CombatEffectsLayer effects={effects} screenFlash={screenFlash} screenShake={screenShake}>
      {/* Accessibility Announcer for Combat Events */}
      <AccessibilityAnnouncer message={combatAnnouncement} priority="assertive" clearAfter={2000} />

      <div
        className={`relative flex flex-col h-full ${pilot.textColor}`}
        role="application" aria-label="Combat Interface"
      >
        <ScreenReaderOnly>
          <h2>{t('combat.combatInProgress', { stage: runState.currentStage })}</h2>
          <p>{t('combat.useKeysOrClick')}</p>
        </ScreenReaderOnly>

        {/* Hazard Overlays */}
        {activeHazard === 'ACID_RAIN' && <div className="absolute inset-0 pointer-events-none bg-[var(--color-success)]/10 z-0 animate-pulse mix-blend-overlay"></div>}
        {activeHazard === 'ION_STORM' && <div className="absolute inset-0 pointer-events-none bg-[var(--color-secondary)]/10 z-0 animate-pulse mix-blend-color-dodge"></div>}
        {activeHazard === 'SEISMIC_ACTIVITY' && <div className="absolute inset-0 pointer-events-none bg-[var(--color-accent)]/10 z-0 animate-pulse"></div>}

        {/* Combo Notification */}
        {showComboNotification && comboCount > 1 && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="text-6xl font-bold text-[var(--color-accent)] drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse">
              COMBO x{comboCount}!
            </div>
            <div className="text-2xl text-center text-yellow-300 mt-2">
              {(comboMultiplier * 100).toFixed(0)}% DAMAGE
            </div>
          </div>
        )}



        {/* Header (Player Status) */}
        <header className={`border-b-2 ${pilot.borderColor} pb-4 mb-4 flex flex-col md:flex-row justify-between items-end uppercase`}>
          <div className="w-full md:w-1/3">
            <div className="text-xs opacity-70 mb-1 flex justify-between">
              <span>ARMOR {runState.maxHpUpgrade > 0 && <span className="text-[var(--color-secondary)]">+{runState.maxHpUpgrade}</span>}</span>
              {playerStatuses.map(s => (
                <span key={s.id} className={`font-bold ml-2 ${s.type === 'SHIELDED' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-danger)]'}`}>
                  [{s.type}]
                </span>
              ))}
              {pilot.id === PilotId.VANGUARD && <span className="animate-pulse text-green-500 text-[10px]">AUTO-REPAIR</span>}
            </div>
            <Tooltip text="Your mech's health. If it reaches 0, you lose.">
              <div className="h-6 w-full border border-gray-700 bg-gray-900 relative shadow-[0_0_10px_rgba(0,0,0,0.5)_inset]" role="progressbar" aria-valuenow={Math.ceil(playerHp)} aria-valuemin={0} aria-valuemax={maxHp}>
                <div className={`h-full transition-all duration-300 ${playerHp < (maxHp * 0.3) ? 'bg-[var(--color-danger)] animate-pulse' : 'bg-current'}`} style={{ width: `${Math.max(0, hpPercent)}%` }} />
                <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold z-10 mix-blend-difference">
                  {Math.ceil(playerHp)}/{maxHp}
                </span>
              </div>
            </Tooltip>

            {/* Active Augmentations */}
            <div className="flex gap-1 mt-1 flex-wrap">
              {runState.augmentations.map(augId => {
                const aug = AUGMENTATIONS.find(a => a.id === augId);
                if (!aug) return null;
                return (
                  <div key={aug.id} className="text-[10px] bg-purple-900/50 border border-purple-500 text-purple-300 px-1 cursor-help" title={`${aug.name}: ${aug.description}`}>
                    {aug.icon}
                  </div>
                );
              })}
            </div>

            {/* Active Synergies */}
            {(activeSynergies.length > 0 || activeTalentSynergies.length > 0) && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {activeSynergies.map(synergy => (
                  <Tooltip key={synergy.id} content={synergy.description}>
                    <div className="text-[10px] bg-yellow-900/50 border border-yellow-500 text-yellow-300 px-1 cursor-help animate-pulse">
                      ✦ {synergy.name}
                    </div>
                  </Tooltip>
                ))}
                {activeTalentSynergies.map(synergy => (
                  <Tooltip key={synergy.id} content={synergy.description}>
                    <div className="text-[10px] bg-cyan-900/50 border border-cyan-500 text-cyan-300 px-1 cursor-help animate-pulse">
                      ⚡ {synergy.name}
                    </div>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 text-center my-4 md:my-0 relative">
            <AnimatedPortrait
              pilotId={pilot.id}
              currentHp={playerHp}
              maxHp={maxHp}
              size="large"
            />
            <ChargeAura
              isReady={playerCharge >= 100}
              color={pilot.textColor.replace('text-', '')}
              size="large"
            />
            <h2 className="text-xl md:text-2xl font-bold tracking-widest drop-shadow-[0_0_5px_currentColor]">{pilot.mechName}</h2>
            <div className={`text-xs ${activeHazard !== 'NONE' ? 'text-red-500 animate-pulse font-bold' : 'text-gray-500'}`}>
              {activeHazard !== 'NONE' ? `HAZARD ALERT: ${activeHazard}` : 'ENVIRONMENT STABLE'}
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col items-start md:items-end">
            <div className="text-xs opacity-70 mb-1 flex gap-2">
              <span>{DIFFICULTIES[difficulty].icon} {DIFFICULTIES[difficulty].name}</span>
              {dailyModifier !== 'NONE' && (
                <span className="text-purple-400">| {dailyModifier.replace('_', ' ')}</span>
              )}
            </div>
            <div className="text-xs opacity-70 mb-1">
              {pilot.id === PilotId.SOLARIS ? "ENERGY CELL" : pilot.id === PilotId.HYDRA ? "HEAT LEVEL" : "CHARGE"}
            </div>
            <Tooltip text={pilot.id === PilotId.SOLARIS ? "Energy is used for abilities. It regenerates over time." : pilot.id === PilotId.HYDRA ? "Heat builds up when using abilities. Overheating will jam your weapons." : "This pilot does not use energy or heat."}>
              <div className="h-6 w-full border border-gray-700 bg-gray-900 relative">
                {pilot.id === PilotId.SOLARIS && (
                  <>
                    <div className={`h-full transition-all duration-100 ${energy < 25 ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} style={{ width: `${energy}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold z-10">{Math.floor(energy)}%</span>
                  </>
                )}
                {pilot.id === PilotId.HYDRA && (
                  <>
                    <div className={`h-full transition-all duration-100 ${heat > 80 ? 'bg-red-600 animate-pulse' : 'bg-orange-500'}`} style={{ width: `${heat}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold z-10">{Math.floor(heat)}%</span>
                    {isJammed && <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-red-500 font-bold animate-pulse">JAMMED</div>}
                  </>
                )}
                {pilot.id !== PilotId.SOLARIS && pilot.id !== PilotId.HYDRA && (
                  <div className="h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                    N/A
                  </div>
                )}
              </div>
            </Tooltip>
          </div>
        </header>

        {/* Daily Modifier Banner */}
        {dailyModifier !== 'NONE' && (
          <div className={`
            mb-4 p-3 border-2 rounded-lg
            ${dailyModifier === 'BOSS_RUSH' ? 'border-red-500 bg-red-900/20' :
              dailyModifier === 'DOUBLE_HAZARDS' ? 'border-yellow-500 bg-yellow-900/20' :
                dailyModifier === 'PACIFIST' ? 'border-blue-500 bg-blue-900/20' :
                  'border-gray-500 bg-gray-900/20'}
          `} role="alert" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`text-3xl ${dailyModifier === 'BOSS_RUSH' ? '🔴' :
                  dailyModifier === 'DOUBLE_HAZARDS' ? '⚠️' :
                    dailyModifier === 'PACIFIST' ? '🛡️' : ''
                  }`}>
                  {dailyModifier === 'BOSS_RUSH' && '💀'}
                  {dailyModifier === 'DOUBLE_HAZARDS' && '⚠️'}
                  {dailyModifier === 'PACIFIST' && '🛡️'}
                </span>
                <div>
                  <div className={`font-bold text-lg tracking-wider ${dailyModifier === 'BOSS_RUSH' ? 'text-red-400' :
                    dailyModifier === 'DOUBLE_HAZARDS' ? 'text-yellow-400' :
                      dailyModifier === 'PACIFIST' ? 'text-blue-400' :
                        'text-gray-400'
                    }`}>
                    DAILY MODIFIER: {dailyModifier.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {dailyModifier === 'BOSS_RUSH' && 'All enemies are Elite-class units with increased health and damage'}
                    {dailyModifier === 'DOUBLE_HAZARDS' && 'Environmental hazards occur twice as frequently'}
                    {dailyModifier === 'PACIFIST' && 'Offensive consumables unavailable - defensive items only'}
                  </div>
                </div>
              </div>
              <div className={`text-xs font-mono px-2 py-1 border ${dailyModifier === 'BOSS_RUSH' ? 'border-red-700 bg-red-950 text-red-300' :
                dailyModifier === 'DOUBLE_HAZARDS' ? 'border-yellow-700 bg-yellow-950 text-yellow-300' :
                  dailyModifier === 'PACIFIST' ? 'border-blue-700 bg-blue-950 text-blue-300' :
                    'border-gray-700 bg-gray-950 text-gray-300'
                }`}>
                ACTIVE
              </div>
            </div>
          </div>
        )}


        {/* Main Combat Area */}
        <main className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Enemy Display */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 overflow-y-auto pr-2" role="region" aria-label="Enemy Targets">
            {runState.missionType === 'SURVIVAL' && (
              <div className="bg-[var(--color-danger)]/20 border border-[var(--color-danger)] p-3 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[var(--color-danger)] font-bold text-lg">🌊 WAVE {survivalWave}</span>
                  <span className="text-[var(--color-danger)] font-bold text-lg animate-pulse">⏱️ {missionTimer}s</span>
                </div>
                <div className="text-xs text-gray-400 text-center">
                  Enemies get {Math.floor(survivalWave * 10)}% stronger each wave
                </div>
              </div>
            )}
            {runState.missionType === 'DEFENSE' && (
              <div className="bg-blue-900/20 border border-blue-500 p-2 mb-2">
                <div className="flex justify-between text-blue-300 text-xs font-bold mb-1">
                  <span>{t('combat.dataCoreIntegrity')}</span>
                  <span>{coreHp}%</span>
                </div>
                <div className="h-2 w-full bg-gray-900">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${coreHp}%` }} />
                </div>
              </div>
            )}

            {enemies.map((enemy, idx) => {
              const affixData = (enemy.affix && enemy.affix !== 'NONE') ? ENEMY_AFFIXES[enemy.affix] : null;
              const borderColor = affixData ? affixData.color : (enemy.isBoss ? '#dc2626' : '#374151'); // red-600 or gray-700

              return (
                <div key={enemy.id}
                  className={`border p-3 relative transition-all ${enemy.actionCharge >= 90 ? 'bg-red-900/10' : 'bg-black/50'} ${enemy.isBoss ? 'scale-105 my-2' : ''}`}
                  style={{ borderColor: borderColor }}
                >
                  <ChargeAura
                    isReady={enemy.actionCharge >= 100}
                    color={affixData?.color || (enemy.isBoss ? '#ef4444' : '#fde047')}
                    size="medium"
                  />
                  {/* Boss Ability Telegraph */}
                  {enemy.isBoss && telegraphedBossAbility && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none">
                      <div className="text-center p-4 rounded-lg bg-red-900/80 border-2 border-[var(--color-danger)] shadow-lg">
                        <div className="text-2xl font-bold text-[var(--color-danger)] animate-pulse">
                          INCOMING ATTACK!
                        </div>
                        <div className="text-lg text-white mt-2">
                          {telegraphedBossAbility.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold ${enemy.isBoss ? 'text-2xl' : 'text-lg'}`} style={{ color: affixData ? affixData.color : (enemy.isBoss ? '#ef4444' : 'white') }}>
                      {enemy.name}
                    </span>
                    <div className="flex gap-1">
                      {enemy.isBoss && <span className="text-[10px] bg-red-600 text-black px-1 font-bold">BOSS</span>}
                      {affixData && (
                        <span className="text-[10px] bg-gray-900 px-1 font-bold border border-gray-700" style={{ color: affixData.color }}>
                          {affixData.name}
                        </span>
                      )}
                      {enemy.intent === 'ATTACK' && <span className="text-[10px] text-[var(--color-danger)] border border-red-900 px-1">ATTACK</span>}
                      {enemy.intent === 'HEAL' && <span className="text-[10px] text-[var(--color-success)] border border-green-900 px-1">REPAIR</span>}
                      {enemy.intent === 'CHARGE' && <span className="text-[10px] text-[var(--color-accent)] border border-yellow-900 px-1">CHARGE</span>}
                      {enemy.weakPoint && (
                        <Tooltip content={`${enemy.weakPoint.description} (${enemy.weakPoint.damageMultiplier}x DMG)`}>
                          <span className="text-[10px] text-cyan-400 border border-cyan-900 px-1 cursor-help animate-pulse">◎ WEAK</span>
                        </Tooltip>
                      )}
                      {enemy.statuses.map(s => <span key={s.id} className="text-[10px] bg-white text-black px-1 font-bold">{s.type.substr(0, 1)}</span>)}
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="h-2 w-full bg-gray-800 mb-1">
                    <div className="h-full bg-[var(--color-danger)] transition-all" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
                  </div>

                  {/* Action Bar (ATB) */}
                  <div className="h-1 w-full bg-gray-900">
                    <div className="h-full bg-yellow-400 transition-all" style={{ width: `${enemy.actionCharge}%` }} />
                  </div>

                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>HP: {Math.ceil(enemy.currentHp)}</span>
                    <span>THREAT: {Math.floor(enemy.actionCharge)}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Combat Log */}
          <div className="w-full md:w-1/2 border-l-0 md:border-l border-gray-800 pl-0 md:pl-4 flex flex-col relative" role="log" aria-live="polite">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-transparent h-8 z-10"></div>
            <div
              className="overflow-y-auto flex-1 font-mono text-sm space-y-1 pb-2"
              style={{ fontSize: `${settings.combatLogFontSize || 14}px` }}
            >
              {combatLog.map((entry) => (
                <div key={entry.id} className={`log-entry opacity-80 ${entry.type === 'damage' ? 'text-[var(--color-success)]' :
                  entry.type === 'enemy' ? 'text-[var(--color-danger)]' :
                    entry.type === 'crit' ? 'text-[var(--color-accent)] font-bold text-base' :
                      entry.type === 'alert' ? 'text-[var(--color-accent)] font-bold' :
                        entry.type === 'special' ? 'text-[var(--color-secondary)]' :
                          entry.type === 'hazard' ? 'text-[var(--color-warning)]' :
                            entry.type === 'loot' ? 'text-yellow-300 border-y border-yellow-900 py-1' :
                              'text-gray-400'
                  }`}>
                  <span className="opacity-30 mr-2 text-[10px]">{new Date(entry.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</span>
                  {entry.type === 'crit' && <span className="mr-1">⚠</span>}
                  {entry.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
            {/* Export Log Button */}
            <button
              onClick={() => {
                const logText = combatLog.map(e =>
                  `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.text}`
                ).join('\n');
                const blob = new Blob([`NEON VANGUARD - COMBAT LOG\nStage: ${runState.currentStage}\nPilot: ${pilot.name}\n${'='.repeat(40)}\n\n${logText}`], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `combat_log_stage${runState.currentStage}_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                audio.playBlip();
              }}
              className="mt-2 px-3 py-1 text-xs border border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Export combat log as text file"
            >
              📥 EXPORT LOG
            </button>
          </div>
        </main>

        {/* Control Panel (Footer) */}
        <footer className="mt-4 border-t-2 border-gray-800 pt-4" aria-label="Controls">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">

            {/* Charge Bar / Turn Indicator */}
            <Tooltip text="When this reaches 100%, you can use an ability.">
              <div className="w-full md:w-24 flex flex-row md:flex-col justify-center items-center border border-gray-700 bg-gray-900 relative p-2 md:p-0">
                <div className="absolute bottom-0 left-0 right-0 md:right-auto md:top-0 h-full w-full bg-white opacity-20 transition-all" style={{ width: `${playerCharge}%` }} />
                <div className="z-10 text-center md:text-left">
                  <div className="text-[10px] text-gray-500">READY</div>
                  <div className={`text-xl font-bold ${playerCharge >= 100 ? 'text-white animate-pulse' : 'text-gray-600'}`}>{Math.floor(playerCharge)}%</div>
                </div>
              </div>
            </Tooltip>

            {/* Abilities */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {pilot.abilities.map((ability, idx) => {
                const onCooldown = cooldowns[ability.id] > 0;
                const canAfford =
                  (ability.energyCost ? energy >= ability.energyCost : true) &&
                  (ability.heatCost ? (!isJammed) : true);

                return (
                  <Tooltip text={ability.description} key={ability.id}>
                    <button

                      onClick={() => handleAbilityUse(ability)}
                      disabled={playerCharge < 100 || onCooldown || !canAfford || isJammed}
                      className={`border p-2 flex flex-col justify-center relative overflow-hidden group transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${playerCharge >= 100 && !onCooldown && canAfford
                        ? `border-white hover:bg-white hover:text-black cursor-pointer`
                        : 'border-gray-800 text-gray-600 cursor-not-allowed bg-black/50'
                        }`}
                      aria-label={`Use ${ability.name}`}
                    >
                      {onCooldown && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs text-gray-400 z-20">
                          RECHARGING ({(cooldowns[ability.id] / 1000).toFixed(1)}s)
                        </div>
                      )}
                      <div className="flex justify-between items-center z-10 font-bold uppercase">
                        <span>{ability.name}</span>
                        {idx === 0 && <span className="text-[10px] opacity-50">[SPACE]</span>}
                      </div>
                      <div className="text-[10px] opacity-70 z-10 flex gap-2">
                        {ability.energyCost && <span>NRG: -{ability.energyCost}</span>}
                        {ability.heatCost && - <span>HEAT: +{ability.heatCost}</span>}
                        {ability.isAoe && <span className="text-yellow-500">AOE</span>}
                      </div>
                    </button>
                  </Tooltip>
                )
              })}
            </div>

            {/* Consumables */}
            <div className="w-full md:w-1/4 grid grid-cols-2 md:grid-cols-1 gap-1">
              {consumables
                .filter(item => {
                  // Filter out offensive items when PACIFIST modifier is active
                  if (dailyModifier === 'PACIFIST') {
                    return item.id !== 'emp_grenade' &&
                      item.id !== 'overdrive_inj' &&
                      item.id !== 'cryo_bomb' &&
                      item.id !== 'plasma_grenade' &&
                      item.id !== 'emergency_beacon';
                  }
                  return true;
                })
                .map((item, idx) => (
                  <Tooltip text={item.description} key={`${item.id}-${idx}`}>
                    <button
                      key={idx}
                      onClick={() => handleConsumable(idx)}
                      disabled={item.count <= 0 || playerCharge < 50}
                      className={`border text-[10px] px-2 flex justify-between items-center transition-all ${item.count > 0 ? `${item.color.split(' ')[1]} hover:bg-white/10` : 'border-gray-800 text-gray-600'
                        }`}
                      aria-label={`Use ${item.name} (x${item.count}) - Press ${idx + 1}`}
                    >
                      <span className="text-gray-500 mr-1">[{idx + 1}]</span>
                      <span className={item.count > 0 ? item.color.split(' ')[0] : ''}>{item.name}</span>
                      <span>x{item.count}</span>
                    </button>
                  </Tooltip>
                ))}
              {consumables.length === 0 && (
                <div className="border border-gray-800 text-[10px] text-gray-600 flex items-center justify-center">NO ITEMS</div>
              )}
            </div>

            {/* Special */}
            <Tooltip text={pilot.id === PilotId.SOLARIS ? "Fully recharge your energy." : pilot.id === PilotId.HYDRA ? "Vent all heat and clear jams." : pilot.id === PilotId.WYRM ? "Toggle burrowing to evade attacks." : "Repair 30 HP and gain a temporary shield."}>
              <button
                onClick={handleSpecial}
                className={`w-full md:w-24 border border-dashed flex flex-col justify-center items-center text-xs uppercase transition-all hover:bg-gray-800 ${pilot.id === PilotId.HYDRA && heat > 50 ? 'border-[var(--color-danger)] text-red-500 animate-pulse' :
                  pilot.id === PilotId.SOLARIS && energy < 50 ? 'border-yellow-500 text-yellow-500 animate-pulse' :
                    'border-gray-600 text-gray-400'
                  }`}
                aria-label={pilot.id === PilotId.SOLARIS ? 'Recharge Energy' : pilot.id === PilotId.HYDRA ? 'Vent Heat' : pilot.id === PilotId.WYRM ? 'Toggle Burrow' : 'Repair and Shield'}
              >
                <span>{pilot.id === PilotId.SOLARIS ? 'RECHARGE' : pilot.id === PilotId.HYDRA ? 'VENT' : pilot.id === PilotId.WYRM ? 'BURROW' : 'REPAIR'}</span>
                <span className="text-[10px] mt-1">[SHIFT]</span>
              </button>
            </Tooltip>

          </div>
        </footer>

      </div>
    </CombatEffectsLayer>
  );
};