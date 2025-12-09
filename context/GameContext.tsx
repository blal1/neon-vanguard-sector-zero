import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GameContextType, PlayerProfile, GameSettings, RunState, PilotConfig, PilotModule, Consumable, MissionType, GameStats, AchievementProgress, PilotId, HazardType, Loadout, DifficultyLevel, DailyModifier, EndlessRunState, EndlessLeaderboardEntry } from '../types';
import { CodexState } from '../types/codex';
import { ReplayState, CombatReplay } from '../types/replay';
import { PlayerTalentState, Talent } from '../types/talents';
import { calculateMaxHp } from '../utils/combatUtils';
import { ACHIEVEMENTS, DIFFICULTIES, CRAFTING_RECIPES, CONSUMABLES, ENDLESS_CONFIG, ENDLESS_UPGRADES } from '../constants/index';
import { getAllPilots } from '../data/dataManager';
import {
  initializeCodex,
  calculateCodexProgress,
  unlockPilotBio,
  recordEnemyDefeat,
  unlockLoreEntry,
  tryUnlockRandomAudioLog,
  markEntryAsRead
} from '../utils/codexUtils';
import {
  initializeReplayState,
  addReplay,
  deleteReplay as deleteReplayUtil,
  clearAllReplays as clearAllReplaysUtil,
  getReplayById as getReplayByIdUtil
} from '../utils/replayUtils';
import {
  initializeTalentState,
  unlockTalent as unlockTalentUtil,
  resetTalentsForPilot,
  getTalentRank,
  canUnlockTalent,
  calculateTalentBonuses,
  awardPilotPoints
} from '../utils/talentUtils';
import { useGameStore } from '../src/state/store';

const defaultProfile: PlayerProfile = {
  xp: 0,
  level: 1,
  missionsCompleted: 0,
  totalKills: 0
};

const defaultSettings: GameSettings = {
  reduceMotion: false,
  slowLogs: false,
  volume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  isMuted: false,
  voiceLinesEnabled: true,
  showDamageNumbers: true,
  screenShake: true,
  combatSpeed: 'normal',
  tutorialCompleted: false,
  autoSaveInterval: 30,
  keybindings: {
    primaryAbility: 'Space',
    specialAbility: 'Shift',
    consumable1: '1',
    consumable2: '2',
    consumable3: '3',
    consumable4: '4',
    toggleHelp: 'F1',
  },
};

const defaultRunState: RunState = {
  isActive: false,
  currentStage: 1,
  scrap: 0,
  currentHp: 0,
  maxHpUpgrade: 0,
  damageUpgrade: 0,
  consumables: [],
  augmentations: []
};

const defaultStats: GameStats = {
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  criticalHits: 0,
  abilitiesUsed: 0,
  fastestWinTime: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  perfectRuns: 0,
  bossesDefeated: 0,
  bossesDefeatedLowHp: 0,
  bossesPerfect: 0,
  consumablesUsed: 0,
  augmentationsOwned: [],
  pilotsUnlocked: ['vanguard'], // Default pilot
  survivalWins: 0,
  defenseWins: 0,
  highestStageReached: 0,
  totalPlayTimeSeconds: 0,
  noDamageTakenThisRun: true,
  noConsumablesUsedThisRun: true,
  runsCompleted: 0,
  runsFailed: 0,
  pilotUsageCount: {},
  pilotStats: {},
  enemiesKilledByType: {},
  hazardsSurvived: {},
  itemsUsedByType: {},
  abilitiesUsedByType: {},
  stageStats: {},
  killTimestamps: [],
  // Endless mode stats
  endlessHighestWave: 0,
  endlessHighScore: 0,
  endlessRunsCompleted: 0
};

const defaultEndlessState: EndlessRunState = {
  isActive: false,
  currentWave: 0,
  totalKills: 0,
  waveKills: 0,
  startTime: 0,
  lastUpgradeWave: 0,
  currentHp: 0,
  maxHp: 0,
  baseDamage: 0,
  scrap: 0,
  consumables: [],
  augmentations: [],
  appliedUpgrades: [],
  cooldownReduction: 0
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export { GameContext };

const isPilotUnlocked = (pilot: PilotConfig, profile: PlayerProfile): boolean => {
    if (pilot.unlockLevel && profile.level < pilot.unlockLevel) return false;
    if (pilot.unlockKills && profile.totalKills < pilot.unlockKills) return false;
    return true;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runState, setRunState] = useState<RunState>(defaultRunState);
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);

  // NEW: Difficulty & Crafting State
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>('VETERAN');
  const [lives, setLives] = useState(999);
  const [craftedItems, setCraftedItems] = useState<Consumable[]>([]);

  // NEW: Endless Mode State
  const [endlessState, setEndlessState] = useState<EndlessRunState>(defaultEndlessState);
  const [leaderboard, setLeaderboard] = useState<EndlessLeaderboardEntry[]>([]);
  const [currentDailyModifier, setCurrentDailyModifier] = useState<DailyModifier>('NONE');
  const [lastModifierUpdateDate, setLastModifierUpdateDate] = useState<string>('');

  // NEW: Codex/Lore State
  const [codex, setCodex] = useState<CodexState>(initializeCodex());

  // NEW: Replay System State
  const [replayState, setReplayState] = useState<ReplayState>(initializeReplayState());

  // NEW: Talent System State
  const [talentState, setTalentState] = useState<PlayerTalentState>(initializeTalentState());

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('NV_SECTOR_ZERO_DATA_V8') || localStorage.getItem('NV_SECTOR_ZERO_DATA_V7');
    const version = localStorage.getItem('NV_SECTOR_ZERO_DATA_V8') ? 8 : 7;

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.profile) useGameStore.getState().setProfile({ ...defaultProfile, ...parsed.profile });
        if (parsed.settings) useGameStore.getState().setSettings(parsed.settings);
        if (parsed.runState) setRunState(parsed.runState);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.loadouts) setLoadouts(parsed.loadouts);
        if (parsed.difficulty) setDifficultyState(parsed.difficulty);
        if (parsed.lives) setLives(parsed.lives);
        if (parsed.craftedItems) setCraftedItems(parsed.craftedItems);
        if (parsed.endlessState) setEndlessState(parsed.endlessState);
        if (parsed.leaderboard) setLeaderboard(parsed.leaderboard);
        if (parsed.codex) setCodex(parsed.codex);
        if (parsed.replays) setReplayState(parsed.replays);
        if (parsed.talents) setTalentState(parsed.talents);
        if (parsed.currentDailyModifier) setCurrentDailyModifier(parsed.currentDailyModifier);
        if (parsed.lastModifierUpdateDate) setLastModifierUpdateDate(parsed.lastModifierUpdateDate);

        // If migrated from older version, log it
        if (version < 8) {
          console.log(`Migrated save data from V${version} to V8`);
        }
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
  }, []);

  // Save to LocalStorage on a timer
  useEffect(() => {
    const saveGame = () => {
      const { profile, settings } = useGameStore.getState();
      const data = { profile, settings, runState, stats, achievements, loadouts, difficulty, lives, craftedItems, endlessState, leaderboard, codex, replays: replayState, talents: talentState, currentDailyModifier, lastModifierUpdateDate };
      localStorage.setItem('NV_SECTOR_ZERO_DATA_V8', JSON.stringify(data));
      console.log('Game saved');
    };

    const interval = setInterval(saveGame, (useGameStore.getState().settings.autoSaveInterval || 30) * 1000);

    return () => clearInterval(interval);
  }, [runState, stats, achievements, loadouts, difficulty, lives, craftedItems, endlessState, leaderboard, codex, replayState, talentState, currentDailyModifier, lastModifierUpdateDate]);



  // --- Run Management ---

  const startRun = (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => {
    const maxHp = calculateMaxHp(pilot, module, { ...defaultRunState });
    setRunState({
      isActive: true,
      currentStage: 1,
      scrap: 0,
      currentHp: maxHp,
      maxHpUpgrade: 0,
      damageUpgrade: 0,
      consumables: consumables,
      augmentations: [],
      pilotId: pilot.id,
      moduleId: module,
      missionType: 'ASSAULT'
    });

    // Reset run-specific flags
    setStats(prev => ({
      ...prev,
      noDamageTakenThisRun: true,
      noConsumablesUsedThisRun: true,
      runStartTime: Date.now()
    }));

    // Track pilot usage
    recordPilotUsage(pilot.id);

    // Set lives based on difficulty
    setLives(DIFFICULTIES[difficulty].lives);
  };

  const endRun = () => {
    setRunState(prev => ({ ...prev, isActive: false }));
    const currentProfile = useGameStore.getState().profile;
    useGameStore.getState().setProfile({ ...currentProfile, missionsCompleted: currentProfile.missionsCompleted + 1 });

    // Check for perfect run
    if (stats.noDamageTakenThisRun) {
      setStats(prev => ({ ...prev, perfectRuns: prev.perfectRuns + 1 }));
    }

    // Apply daily modifier bonuses
    if (dailyModifier === 'DOUBLE_HAZARDS') {
        const bonusScrap = Math.floor(runState.scrap * 0.25);
        addScrap(bonusScrap);
    } else if (dailyModifier === 'BOSS_RUSH') {
        const bonusXp = 500; // Flat XP bonus for boss rush
        addXp(bonusXp);
    } else if (dailyModifier === 'PACIFIST') {
        const bonusScrap = Math.floor(runState.scrap * 0.5);
        addScrap(bonusScrap);
        const bonusXp = 250;
        addXp(bonusXp);
    }


    // Update highest stage reached
    setStats(prev => ({
      ...prev,
      highestStageReached: Math.max(prev.highestStageReached, runState.currentStage)
    }));

    // Check achievements
    checkAchievements();
  };

  const addScrap = (amount: number) => {
    setRunState(prev => ({ ...prev, scrap: prev.scrap + amount }));
  };

  const addKill = () => {
    const currentProfile = useGameStore.getState().profile;
    useGameStore.getState().setProfile({
      ...currentProfile,
      totalKills: (currentProfile.totalKills || 0) + 1
    });

    if (runState.pilotId) {
        setStats(prev => {
            const pilotStats = prev.pilotStats[runState.pilotId!] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
            const stageStats = prev.stageStats[runState.currentStage] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
            return {
                ...prev,
                pilotStats: {
                    ...prev.pilotStats,
                    [runState.pilotId!]: { ...pilotStats, kills: pilotStats.kills + 1 }
                },
                stageStats: {
                    ...prev.stageStats,
                    [runState.currentStage]: { ...stageStats, kills: stageStats.kills + 1 }
                }
            }
        })
    }
  };

  const updateRunHp = (hp: number) => {
    setRunState(prev => ({ ...prev, currentHp: hp }));
  };

  const updateRunConsumables = (consumables: Consumable[]) => {
    setRunState(prev => ({ ...prev, consumables }));
  };

  const updateRunState = (updates: Partial<RunState>) => {
    setRunState(prev => ({ ...prev, ...updates }));
  };

  const advanceStage = () => {
    const types: MissionType[] = ['ASSAULT', 'DEFENSE', 'SURVIVAL'];
    const nextType = types[Math.floor(Math.random() * types.length)];
    setRunState(prev => ({
      ...prev,
      currentStage: prev.currentStage + 1,
      missionType: nextType
    }));
  };

  const purchaseUpgrade = (type: 'hp' | 'dmg' | 'repair' | 'item', itemId?: string, cost: number = 0) => {
    setRunState(prev => {
      if (prev.scrap < cost) return prev;

      let newState = { ...prev, scrap: prev.scrap - cost };

      if (type === 'hp') {
        newState.maxHpUpgrade += 10;
        newState.currentHp += 10;
      } else if (type === 'dmg') {
        newState.damageUpgrade += 1;
      } else if (type === 'repair') {
        newState.currentHp += 20;
      } else if (type === 'item' && itemId) {
        const idx = newState.consumables.findIndex(c => c.id === itemId);
        if (idx >= 0) {
          const newCons = [...newState.consumables];
          newCons[idx] = { ...newCons[idx], count: newCons[idx].count + 1 };
          newState.consumables = newCons;
        }
      }
      return newState;
    });
  };

  const purchaseAugmentation = (augmentationId: string, cost: number) => {
    setRunState(prev => {
      if (prev.scrap < cost) return prev;
      if (prev.augmentations.includes(augmentationId)) return prev;

      const newState = {
        ...prev,
        scrap: prev.scrap - cost,
        augmentations: [...prev.augmentations, augmentationId]
      };

      // Track augmentations
      setStats(prevStats => ({
        ...prevStats,
        augmentationsOwned: newState.augmentations
      }));

      // Unlock Codex entry for this augmentation
      setCodex(prevCodex => {
        const entryId = `augmentation-${augmentationId}`;
        const entry = prevCodex.entries[entryId];
        if (entry && !entry.isUnlocked) {
          return {
            ...prevCodex,
            entries: {
              ...prevCodex.entries,
              [entryId]: {
                ...entry,
                isUnlocked: true,
                isNew: true,
                unlockedDate: Date.now()
              }
            },
            unlockedCount: prevCodex.unlockedCount + 1,
            lastUnlockedId: entryId,
            newEntryIds: [...prevCodex.newEntryIds, entryId]
          };
        }
        return prevCodex;
      });

      return newState;
    });
  };

  // --- Achievement System ---

  const recordStat = (stat: keyof GameStats, value: number | string | string[]) => {
    setStats(prev => ({
      ...prev,
      [stat]: value
    }));
  };

  const incrementStat = (stat: keyof GameStats, amount: number = 1) => {
    setStats(prev => {
      const currentValue = prev[stat];
      if (typeof currentValue === 'number') {
        return {
          ...prev,
          [stat]: currentValue + amount
        };
      }
      return prev;
    });
  };

  const recordDamageDealt = (amount: number) => {
    setStats(prev => {
        const pilotStats = prev.pilotStats[runState.pilotId!] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
        const stageStats = prev.stageStats[runState.currentStage] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
        return {
            ...prev,
            totalDamageDealt: prev.totalDamageDealt + amount,
            pilotStats: {
                ...prev.pilotStats,
                [runState.pilotId!]: { ...pilotStats, totalDamageDealt: pilotStats.totalDamageDealt + amount }
            },
            stageStats: {
                ...prev.stageStats,
                [runState.currentStage]: { ...stageStats, totalDamageDealt: stageStats.totalDamageDealt + amount }
            }
        }
    });
  };

  const recordDamageTaken = (amount: number) => {
    setStats(prev => {
        const pilotStats = prev.pilotStats[runState.pilotId!] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
        const stageStats = prev.stageStats[runState.currentStage] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
        return {
            ...prev,
            totalDamageTaken: prev.totalDamageTaken + amount,
            noDamageTakenThisRun: false,
            pilotStats: {
                ...prev.pilotStats,
                [runState.pilotId!]: { ...pilotStats, totalDamageTaken: pilotStats.totalDamageTaken + amount }
            },
            stageStats: {
                ...prev.stageStats,
                [runState.currentStage]: { ...stageStats, totalDamageTaken: stageStats.totalDamageTaken + amount }
            }
        }
    });
  };

  const recordCriticalHit = () => {
    setStats(prev => ({
      ...prev,
      criticalHits: prev.criticalHits + 1
    }));
  };

  const startRunTimer = () => {
    setStats(prev => ({ ...prev, runStartTime: Date.now() }));
  };

  const endRunTimer = (): number => {
    if (stats.runStartTime) {
      const runTime = Math.floor((Date.now() - stats.runStartTime) / 1000);
      setStats(prev => {
        const newStats = { ...prev, runStartTime: undefined };
        if (runTime < prev.fastestWinTime || prev.fastestWinTime === 0) {
          newStats.fastestWinTime = runTime;
        }
        if(runState.pilotId){
            const pilotStats = prev.pilotStats[runState.pilotId!] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
            newStats.pilotStats = {
                ...prev.pilotStats,
                [runState.pilotId!]: { ...pilotStats, timePlayed: pilotStats.timePlayed + runTime }
            }
        }
        return newStats;
      });
      return runTime;
    }
    return 0;
  };

  const checkAchievements = (): AchievementProgress[] => {
    const newlyUnlocked: AchievementProgress[] = [];
    const { profile } = useGameStore.getState();

    ACHIEVEMENTS.forEach(achievement => {
      const alreadyUnlocked = achievements.some(a => a.achievementId === achievement.id);

      if (!alreadyUnlocked && achievement.condition(stats, profile)) {
        const progress: AchievementProgress = {
          achievementId: achievement.id,
          unlockedAt: Date.now(),
          justUnlocked: true
        };
        newlyUnlocked.push(progress);
      }
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(prev => [...prev, ...newlyUnlocked]);
    }

    return newlyUnlocked;
  };

  // NEW: Detailed statistics tracking methods
  const recordRunOutcome = (success: boolean) => {
    setStats(prev => {
        const pilotStats = prev.pilotStats[runState.pilotId!] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
        const stageStats = prev.stageStats[runState.currentStage] || { wins: 0, losses: 0, totalDamageDealt: 0, totalDamageTaken: 0, kills: 0, timePlayed: 0 };
        return {
            ...prev,
            runsCompleted: success ? prev.runsCompleted + 1 : prev.runsCompleted,
            runsFailed: success ? prev.runsFailed : prev.runsFailed + 1,
            currentWinStreak: success ? prev.currentWinStreak + 1 : 0,
            longestWinStreak: success ? Math.max(prev.longestWinStreak, prev.currentWinStreak + 1) : prev.longestWinStreak,
            pilotStats: {
                ...prev.pilotStats,
                [runState.pilotId!]: { ...pilotStats, wins: success ? pilotStats.wins + 1 : pilotStats.wins, losses: !success ? pilotStats.losses + 1 : pilotStats.losses }
            },
            stageStats: {
                ...prev.stageStats,
                [runState.currentStage]: { ...stageStats, wins: success ? stageStats.wins + 1 : stageStats.wins, losses: !success ? stageStats.losses + 1 : stageStats.losses }
            }
        }
    });
  };

  const recordPilotUsage = (pilotId: PilotId) => {
    setStats(prev => ({
      ...prev,
      pilotUsageCount: {
        ...prev.pilotUsageCount,
        [pilotId]: (prev.pilotUsageCount[pilotId] || 0) + 1
      }
    }));
  };

  const recordEnemyKill = (enemyName: string) => {
    setStats(prev => ({
      ...prev,
      enemiesKilledByType: {
        ...prev.enemiesKilledByType,
        [enemyName]: (prev.enemiesKilledByType[enemyName] || 0) + 1
      },
      killTimestamps: [...(prev.killTimestamps || []), { enemyName, timestamp: Date.now() }]
    }));
    recordCodexEnemyKill(enemyName); // Unlock codex entry for this enemy
  };

  const recordHazardSurvival = (hazardType: HazardType) => {
    if (hazardType === 'NONE') return;
    setStats(prev => ({
      ...prev,
      hazardsSurvived: {
        ...prev.hazardsSurvived,
        [hazardType]: (prev.hazardsSurvived[hazardType] || 0) + 1
      }
    }));
  };

  const recordItemUsage = (itemId: string) => {
    setStats(prev => ({
      ...prev,
      itemsUsedByType: {
        ...prev.itemsUsedByType,
        [itemId]: (prev.itemsUsedByType[itemId] || 0) + 1
      },
      consumablesUsed: prev.consumablesUsed + 1,
      noConsumablesUsedThisRun: false
    }));
  };

  const recordAbilityUsage = (abilityId: string) => {
    setStats(prev => ({
      ...prev,
      abilitiesUsed: prev.abilitiesUsed + 1,
      abilitiesUsedByType: {
        ...prev.abilitiesUsedByType,
        [abilityId]: (prev.abilitiesUsedByType[abilityId] || 0) + 1
      }
    }));
  };

  // Loadout management methods
  const createLoadout = (name: string, pilotId: PilotId, module: PilotModule, consumables: Consumable[], color: string) => {
    const newLoadout: Loadout = {
      id: `loadout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      pilotId,
      module,
      consumables: consumables.map(c => ({ ...c })), // Clone to prevent mutation
      color,
      createdAt: Date.now()
    };
    setLoadouts(prev => [...prev, newLoadout]);
  };

  const updateLoadout = (id: string, updates: Partial<Loadout>) => {
    setLoadouts(prev => prev.map(loadout =>
      loadout.id === id ? { ...loadout, ...updates } : loadout
    ));
  };

  const deleteLoadout = (id: string) => {
    setLoadouts(prev => prev.filter(loadout => loadout.id !== id));
  };

  const applyLoadout = (id: string): { pilot: PilotConfig, module: PilotModule, consumables: Consumable[] } | null => {
    const loadout = loadouts.find(l => l.id === id);
    if (!loadout) return null;

    const pilot = getAllPilots().find(p => p.id === loadout.pilotId);
    if (!pilot) return null;

    // VALIDATION LOGIC
    const { profile } = useGameStore.getState();
    if (!isPilotUnlocked(pilot, profile)) {
        console.warn(`Cannot apply loadout: Pilot "${pilot.name}" is locked.`);
        alert(`Cannot apply loadout: Pilot "${pilot.name}" is locked.`);
        return null;
    }

    // Update last used timestamp
    updateLoadout(id, { lastUsed: Date.now() });

    return {
      pilot,
      module: loadout.module,
      consumables: loadout.consumables.map(c => ({ ...c })) // Clone
    };
  };

  // NEW: Difficulty & Modifiers System
  const setDifficulty = (level: DifficultyLevel) => {
    const config = DIFFICULTIES[level];
    setDifficultyState(level);
    setLives(config.lives);
  };

  const getDailyModifier = useCallback((): DailyModifier => {
    const today = new Date();
    const todayDateString = today.toDateString(); // YYYY-MM-DD

    if (lastModifierUpdateDate === todayDateString && currentDailyModifier !== 'NONE') {
      return currentDailyModifier;
    }

    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    const modifiers: DailyModifier[] = ['DOUBLE_HAZARDS', 'BOSS_RUSH', 'PACIFIST', 'NONE'];
    const newModifier = modifiers[dayOfYear % modifiers.length];

    setLastModifierUpdateDate(todayDateString);
    setCurrentDailyModifier(newModifier);

    return newModifier;
  }, [currentDailyModifier, lastModifierUpdateDate, setCurrentDailyModifier, setLastModifierUpdateDate]);

  const dailyModifier = getDailyModifier();

  const loseLife = () => {
    const newLives = Math.max(0, lives - 1);
    setLives(newLives);
    if (newLives <= 0 && DIFFICULTIES[difficulty].permadeath) {
      // Permadeath: Reset progress
      useGameStore.getState().setProfile(defaultProfile);
      setStats(defaultStats);
      setRunState(defaultRunState);
    }
  };

  // NEW: Crafting System
  const canCraft = (recipeId: string): boolean => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;

    // Check if the recipe is unlocked by stage progression
    if (recipe.unlockedAtStage && runState.currentStage < recipe.unlockedAtStage) {
      return false;
    }

    // Check requirements
    for (const req of recipe.requirements) {
      if (req.scrap && runState.scrap < req.scrap) return false;
      if (req.consumableId) {
        const consumable = runState.consumables.find(c => c.id === req.consumableId);
        if (!consumable || consumable.count < req.count) return false;
      }
    }
    return true;
  };

  const craftItem = (recipeId: string): boolean => {
    if (!canCraft(recipeId)) return false;

    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;

    // Consume materials
    setRunState(prev => {
      let newState = { ...prev };

      // Deduct scrap
      for (const req of recipe.requirements) {
        if (req.scrap) {
          newState.scrap -= req.scrap;
        }
        if (req.consumableId) {
          const idx = newState.consumables.findIndex(c => c.id === req.consumableId);
          if (idx >= 0) {
            const newCons = [...newState.consumables];
            newCons[idx] = { ...newCons[idx], count: newCons[idx].count - req.count };
            newState.consumables = newCons;
          }
        }
      }

      // Add crafted item to consumables
      const existingIdx = newState.consumables.findIndex(c => c.id === recipe.result.id);
      if (existingIdx >= 0) {
        const newCons = [...newState.consumables];
        newCons[existingIdx] = {
          ...newCons[existingIdx],
          count: Math.min(newCons[existingIdx].count + 1, newCons[existingIdx].maxCount)
        };
        newState.consumables = newCons;
      } else {
        newState.consumables = [...newState.consumables, { ...recipe.result }];
      }

      return newState;
    });

    // Special handling for scrap_converter
    if (recipe.id === 'scrap_converter') {
      setRunState(prev => ({ ...prev, scrap: prev.scrap + 75 })); // Add scrap
    } else {
      // Track crafted item (only if it's an actual consumable)
      setCraftedItems(prev => {
        const exists = prev.find(c => c.id === recipe.result.id);
        if (exists) return prev;
        return [...prev, recipe.result];
      });
    }

    return true;
  };

  // --- Endless Mode System ---

  const startEndlessRun = (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => {
    const maxHp = calculateMaxHp(pilot, module, { ...defaultRunState });
    const baseDamage = pilot.baseDamage + (module === 'ASSAULT' ? 2 : 0);

    setEndlessState({
      isActive: true,
      currentWave: 1,
      totalKills: 0,
      waveKills: 0,
      startTime: Date.now(),
      lastUpgradeWave: 0,
      currentHp: maxHp,
      maxHp: maxHp,
      baseDamage: baseDamage,
      scrap: 0,
      consumables: consumables.map(c => ({ ...c })),
      augmentations: [],
      pilotId: pilot.id,
      moduleId: module,
      appliedUpgrades: [],
      cooldownReduction: 0
    });

    // Track pilot usage
    recordPilotUsage(pilot.id);
  };

  const endEndlessRun = () => {
    if (!endlessState.isActive) return;

    const score = calculateEndlessScore();
    const survivalTime = Math.floor((Date.now() - endlessState.startTime) / 1000);

    // Create leaderboard entry
    const entry: EndlessLeaderboardEntry = {
      id: `endless-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wave: endlessState.currentWave,
      kills: endlessState.totalKills,
      score: score,
      pilotId: endlessState.pilotId!,
      difficulty: difficulty,
      date: Date.now(),
      survivalTimeSeconds: survivalTime
    };

    // Add to leaderboard and keep top 100
    setLeaderboard(prev => {
      const updated = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, 100);
      return updated;
    });

    // Update stats
    setStats(prev => ({
      ...prev,
      endlessHighestWave: Math.max(prev.endlessHighestWave || 0, endlessState.currentWave),
      endlessHighScore: Math.max(prev.endlessHighScore || 0, score),
      endlessRunsCompleted: (prev.endlessRunsCompleted || 0) + 1
    }));

    // Deactivate endless state
    setEndlessState(prev => ({ ...prev, isActive: false }));

    // Check achievements
    checkAchievements();
  };

  const advanceEndlessWave = () => {
    setEndlessState(prev => ({
      ...prev,
      currentWave: prev.currentWave + 1,
      waveKills: 0,
      currentHp: Math.min(prev.maxHp, prev.currentHp + ENDLESS_CONFIG.WAVE_CLEAR_HP_BONUS)
    }));
  };

  const applyEndlessUpgrade = (upgradeId: string) => {
    const upgrade = ENDLESS_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    setEndlessState(prev => {
      const updated = upgrade.apply(prev);
      return {
        ...updated,
        appliedUpgrades: [...prev.appliedUpgrades, upgradeId],
        lastUpgradeWave: prev.currentWave
      };
    });
  };

  const getLeaderboard = (filters?: { difficulty?: DifficultyLevel; pilotId?: PilotId }): EndlessLeaderboardEntry[] => {
    let filtered = [...leaderboard];

    if (filters?.difficulty) {
      filtered = filtered.filter(e => e.difficulty === filters.difficulty);
    }

    if (filters?.pilotId) {
      filtered = filtered.filter(e => e.pilotId === filters.pilotId);
    }

    return filtered.sort((a, b) => b.score - a.score);
  };

  const calculateEndlessScore = (): number => {
    const survivalMinutes = Math.floor((Date.now() - endlessState.startTime) / 60000);
    const waveScore = endlessState.currentWave * ENDLESS_CONFIG.SCORE_PER_WAVE;
    const killScore = endlessState.totalKills * ENDLESS_CONFIG.SCORE_PER_KILL;
    const timeBonus = survivalMinutes * ENDLESS_CONFIG.SCORE_TIME_BONUS_PER_MINUTE;

    return waveScore + killScore + timeBonus;
  };

  const updateEndlessState = (updates: Partial<EndlessRunState>) => {
    setEndlessState(prev => ({ ...prev, ...updates }));
  };

  // --- Codex Management ---

  const unlockCodexPilot = (pilotId: PilotId) => {
    setCodex(prev => unlockPilotBio(prev, pilotId));
  };

  const unlockCodexLore = (loreId: string) => {
    setCodex(prev => unlockLoreEntry(prev, loreId));
  };

  const unlockCodexAudioLog = (chance: number = 0.15) => {
    setCodex(prev => tryUnlockRandomAudioLog(prev, chance));
  };

  const recordCodexEnemyKill = (enemyType: string) => {
    setCodex(prev => recordEnemyDefeat(prev, enemyType));
  };

  const markCodexEntryRead = (entryId: string) => {
    setCodex(prev => markEntryAsRead(prev, entryId));
  };

  const getCodexProgress = () => {
    return calculateCodexProgress(codex);
  };

  // --- Replay Management ---

  const saveReplay = (replay: CombatReplay) => {
    setReplayState(prev => addReplay(prev, replay));
  };

  const deleteReplay = (replayId: string) => {
    setReplayState(prev => deleteReplayUtil(prev, replayId));
  };

  const clearAllReplays = () => {
    setReplayState(prev => clearAllReplaysUtil(prev));
  };

  const getReplayById = (id: string) => {
    return getReplayByIdUtil(replayState, id);
  };

  // --- Talent Management ---

  const unlockTalent = (pilotId: PilotId, talent: Talent) => {
    setTalentState(prev => unlockTalentUtil(prev, pilotId, talent));
  };

  const resetTalents = (pilotId: PilotId) => {
    setTalentState(prev => resetTalentsForPilot(prev, pilotId));
  };

  const saveTalentPreset = (pilotId: PilotId, name: string) => {
    setTalentState(prev => {
        const pilotState = prev[pilotId];
        const newPreset = {
            id: `${pilotId}-${name}-${Date.now()}`,
            name,
            talents: [...pilotState.unlockedTalents],
        };
        return {
            ...prev,
            [pilotId]: {
                ...pilotState,
                presets: [...pilotState.presets, newPreset],
            },
        };
    });
};

const loadTalentPreset = (pilotId: PilotId, presetId: string) => {
    setTalentState(prev => {
        const pilotState = prev[pilotId];
        const preset = pilotState.presets.find(p => p.id === presetId);
        if (!preset) return prev;

        // 1. Refund current points
        const pointsRefunded = pilotState.totalPointsSpent;
        let newAvailablePoints = prev.availablePoints + pointsRefunded;

        // 2. Calculate cost of new preset
        const presetCost = preset.talents.reduce((acc, p) => {
            const talent = getAllPilots().find(p => p.id === pilotId)?.talents.find(t => t.id === p.talentId);
            return acc + (talent ? talent.cost * p.currentRank : 0);
        }, 0);


        if (newAvailablePoints < presetCost) {
            console.warn("Not enough points to load preset");
            return prev; // Or show an error to the user
        }

        // 3. Apply preset
        return {
            ...prev,
            [pilotId]: {
                ...pilotState,
                unlockedTalents: [...preset.talents],
                totalPointsSpent: presetCost,
            },
            availablePoints: newAvailablePoints - presetCost,
        };
    });
};

const deleteTalentPreset = (pilotId: PilotId, presetId: string) => {
    setTalentState(prev => {
        const pilotState = prev[pilotId];
        return {
            ...prev,
            [pilotId]: {
                ...pilotState,
                presets: pilotState.presets.filter(p => p.id !== presetId),
            },
        };
    });
};

  const addXp = (amount: number) => {
    useGameStore.getState().addXp(amount); // Update profile XP/level in Zustand

    const { profile } = useGameStore.getState();
    const xpReq = profile.level * 100;
    if ((profile.xp + amount) >= xpReq) { // Check if leveling up
      setTalentState(prevTalents => awardPilotPoints(prevTalents, 1));
    }
  };


  return (
    <GameContext.Provider value={{
      runState,
      hasActiveRun: runState.isActive,
      stats,
      achievements,
      loadouts,
      addXp,
      addKill,
      addScrap,
      startRun,
      endRun,
      updateRunHp,
      updateRunConsumables,
      updateRunState,
      advanceStage,
      purchaseUpgrade,
      purchaseAugmentation,
      isPilotUnlocked: (pilot) => isPilotUnlocked(pilot, useGameStore.getState().profile),
      checkAchievements,
      recordStat,
      incrementStat,
      startRunTimer,
      endRunTimer,
      recordDamageDealt,
      recordDamageTaken,
      recordCriticalHit,
      recordRunOutcome,
      recordPilotUsage,
      recordEnemyKill,
      recordHazardSurvival,
      recordItemUsage,
      recordAbilityUsage,
      createLoadout,
      updateLoadout,
      deleteLoadout,
      applyLoadout,
      // NEW: Difficulty & Modifiers
      difficulty,
      dailyModifier,
      lives,
      setDifficulty,
      getDailyModifier,
      loseLife,
      // NEW: Crafting
      craftedItems,
      craftItem,
      canCraft,
      // NEW: Endless Mode
      endlessState,
      leaderboard,
      startEndlessRun,
      endEndlessRun,
      advanceEndlessWave,
      applyEndlessUpgrade,
      getLeaderboard,
      calculateEndlessScore,
      updateEndlessState,
      // NEW: Codex
      codex,
      unlockCodexPilot,
      unlockCodexLore,
      unlockCodexAudioLog,
      recordCodexEnemyKill,
      markCodexEntryRead,
      getCodexProgress,
      // NEW: Replay System
      replayState,
      saveReplay,
      deleteReplay,
      clearAllReplays,
      getReplayById,
      // NEW: Talent System
      talentState,
      unlockTalent,
      resetTalents,
      saveTalentPreset,
      loadTalentPreset,
      deleteTalentPreset
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  const { profile, settings, addXp, addKill, toggleSetting, updateSettings } = useGameStore();

  return {
    ...context,
    profile,
    settings,
    addXp,
    addKill,
    toggleSetting,
    updateSettings,
  };
};