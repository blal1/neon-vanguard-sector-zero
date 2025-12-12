import React, { useState, useEffect, Suspense } from 'react';
import { GameState, PilotConfig, PilotModule, Consumable, AchievementProgress, Achievement, PilotId } from './types';
import { RUN_CONFIG, BRIEFING_TEXT } from './constants';
import { COLOR_PALETTES } from './constants/colors';
import { getAllPilots, initializeDataManager } from './data/dataManager';
import { TerminalLayout } from './components/TerminalLayout';
import { CharacterSelect } from './components/CharacterSelect';
import { CombatScreen } from './components/CombatScreen';
import { HangarScreen } from './components/HangarScreen';
import { NarrativeScreen } from './components/NarrativeScreen';
import { TestRunner } from './components/TestRunner';
import { AchievementsScreen } from './components/AchievementsScreen';
import { AchievementNotification } from './components/AchievementNotification';
import { StatsScreen } from './components/StatsScreen';
import { PostRunStatsModal } from './components/PostRunStatsModal';
import { audio } from './services/audioService';
import { GameProvider, useGame } from './context/GameContext';
import { getAchievementById } from './constants/achievements';
import { EndlessLobby } from './components/EndlessLobby';
import { EndlessWaveScreen } from './components/EndlessWaveScreen';
import { CodexScreen } from './components/CodexScreen';
import { CodexUnlockNotification } from './components/CodexUnlockNotification';
import { ReplayListScreen } from './components/ReplayListScreen';
import { ReplayViewer } from './components/ReplayViewer';
import { TalentTreeScreen } from './components/TalentTreeScreen';
import { TutorialModal } from './components/TutorialModal';
import { AnimatePresence } from 'framer-motion';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { LoadoutManager } from './components/LoadoutManager';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './src/i18n';
import { tts, gameTTS } from './services/ttsService';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { DefaultSkipLinks } from './components/SkipLinks';
import { AccessibilityAnnouncer } from './components/AccessibilityAnnouncer';
import { ScreenReaderOnly } from './components/ScreenReaderOnly';
import { SettingsScreen } from './components/SettingsScreen';


const AppContent: React.FC = () => {
  const {
    startRun, advanceStage, endRun, runState, hasActiveRun, achievements, checkAchievements,
    recordRunOutcome, stats, profile, startEndlessRun, endlessState,
    codex, markCodexEntryRead, getCodexProgress, unlockCodexPilot, unlockCodexLore, unlockCodexAudioLog,
    replayState, deleteReplay, clearAllReplays, getReplayById,
    talentState, settings, applyLoadout
  } = useGame();

  const { t } = useTranslation();

  // Activate keyboard navigation
  const keyboardNav = useKeyboardNavigation(true);

  const [gameState, setGameState] = useState<GameState | 'TESTing' | 'ACHIEVEMENTS' | 'STATISTICS' | 'CODEX' | 'REPLAYS' | 'REPLAY_VIEWER' | 'TALENTS'>(GameState.MENU);
  const [showLoadoutManager, setShowLoadoutManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Staging state for selection before starting run
  const [selectedPilot, setSelectedPilot] = useState<PilotConfig | null>(null);
  const [selectedModule, setSelectedModule] = useState<PilotModule>('ASSAULT');
  const [selectedConsumables, setSelectedConsumables] = useState<Consumable[]>([]);

  // Achievement notifications
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);

  // Codex unlock notification
  const [codexNotification, setCodexNotification] = useState<{ entryId: string; title: string; category: string } | null>(null);

  // Accessibility - Current screen announcement
  const [screenAnnouncement, setScreenAnnouncement] = useState<string>('');

  // Replay viewer
  const [selectedReplayId, setSelectedReplayId] = useState<string | null>(null);

  // Talent tree pilot selection
  const [selectedTalentPilot, setSelectedTalentPilot] = useState<PilotId | null>(null);

  // Post-run stats modal
  const [showPostRunStats, setShowPostRunStats] = useState(false);
  const [postRunStats, setPostRunStats] = useState({
    damageDealt: 0,
    enemiesKilled: 0,
    timeElapsed: '0m 0s',
    hazardsEncountered: 0,
    itemsUsed: 0,
    scrapCollected: 0
  });
  const [isVictoryRun, setIsVictoryRun] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Announce screen changes to screen readers
  useEffect(() => {
    const screenName = t(`screens.${(gameState as string).toLowerCase().replace('_', '')}`) || t('screens.unknownScreen');
    setScreenAnnouncement(screenName);
    gameTTS.screenChange(screenName);
  }, [gameState, t]);

  useEffect(() => {
    const palette = COLOR_PALETTES[settings.colorblindMode || 'none'];
    for (const key in palette) {
      document.documentElement.style.setProperty(key, palette[key as keyof typeof palette]);
    }
  }, [settings.colorblindMode]);

  useEffect(() => {
    if (!settings.tutorialCompleted) {
      setShowTutorial(true);
    }
  }, [settings.tutorialCompleted]);

  const handlePilotSelect = (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => {
    setSelectedPilot(pilot);
    setSelectedModule(module);
    setSelectedConsumables(consumables);
    setGameState(GameState.BRIEFING);

    // Unlock pilot bio in codex on selection
    unlockCodexPilot(pilot.id);
  };

  const engageSystems = () => {
    if (selectedPilot) {
      audio.playBlip();
      startRun(selectedPilot, selectedModule, selectedConsumables);
      setGameState(GameState.COMBAT);
    }
  };

  const handleContinue = () => {
    if (hasActiveRun && runState.pilotId) {
      const pilot = getAllPilots().find(p => p.id === runState.pilotId);
      if (pilot) {
        audio.playBlip();
        setSelectedPilot(pilot);
        setSelectedModule(runState.moduleId || 'ASSAULT');
        setGameState(GameState.HANGAR);
      }
    }
  };

  const handleVictory = () => {
    // Unlock lore based on current stage
    if (runState.currentStage === 1) {
      unlockCodexLore('lore-vanguard-init');
    } else if (runState.currentStage === 3) {
      unlockCodexLore('lore-the-fall');
    } else if (runState.currentStage === 5) {
      unlockCodexLore('lore-neon-corp');
    }

    // Random chance for audio log (15%)
    unlockCodexAudioLog(0.15);

    if (runState.currentStage < RUN_CONFIG.MAX_STAGES) {
      // Random chance for Narrative Event instead of direct Hangar
      if (Math.random() > 0.5) {
        setGameState(GameState.EVENT);
      } else {
        setGameState(GameState.HANGAR);
      }
    } else {
      // Final victory - record success
      recordRunOutcome(true);
      endRun();
      setGameState(GameState.VICTORY);
    }
  };

  const handleDefeat = () => {
    // Record failure
    recordRunOutcome(false);
    endRun();
    setGameState(GameState.DEFEAT);
  };

  const handleHangarContinue = () => {
    advanceStage();
    setGameState(GameState.COMBAT);
  };

  const handleEventContinue = () => {
    setGameState(GameState.HANGAR);
  };

  const resetGame = () => {
    setGameState(GameState.MENU);
    setSelectedPilot(null);
  };

  // Endless Mode Handlers
  const handleEndlessStart = (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => {
    audio.playBlip();
    setSelectedPilot(pilot);
    setSelectedModule(module);
    setSelectedConsumables(consumables);
    startEndlessRun(pilot, module, consumables);
    setGameState('ENDLESS_ACTIVE' as any);
  };

  const handleEndlessBack = () => {
    audio.playBlip();
    setGameState(GameState.MENU);
  };

  const handleApplyLoadout = (loadoutId: string) => {
    const applied = applyLoadout(loadoutId);
    if (applied) {
      setSelectedPilot(applied.pilot);
      setSelectedModule(applied.module);
      setSelectedConsumables(applied.consumables);
      setShowLoadoutManager(false);
      setGameState(GameState.BRIEFING);
    }
  };

  const themeColor = selectedPilot ? selectedPilot.color : '#ffffff';

  // Achievement notification system
  useEffect(() => {
    const newUnlocks = achievements.filter(a => a.justUnlocked);
    if (newUnlocks.length > 0) {
      const achivs = newUnlocks.map(u => getAchievementById(u.achievementId)).filter(Boolean) as Achievement[];
      setNotificationQueue(prev => [...prev, ...achivs]);
    }
  }, [achievements]);

  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      setCurrentNotification(notificationQueue[0]);
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [currentNotification, notificationQueue]);

  const handleNotificationDismiss = () => {
    setCurrentNotification(null);
  };

  return (
    <>
      <DefaultSkipLinks />
      <AccessibilityAnnouncer message={screenAnnouncement} priority="polite" />

      <TerminalLayout color={themeColor}>
        <KeyboardShortcuts />
        {showTutorial && <TutorialModal />}

        <main id="main-content" role="main" aria-label={t('accessibility.mainContent')}>
          <ScreenReaderOnly>
            <h1>NEON VANGUARD: Sector Zero</h1>
            <p>{t('accessibility.screenReaderSupportText')}</p>
          </ScreenReaderOnly>

          <AnimatePresence>
            {currentNotification && (
              <AchievementNotification
                achievement={currentNotification}
                onDismiss={handleNotificationDismiss}
              />
            )}
          </AnimatePresence>

          {showLoadoutManager && (
            <LoadoutManager
              onClose={() => setShowLoadoutManager(false)}
              onApplyLoadout={handleApplyLoadout}
            />
          )}

          {showSettings && (
            <SettingsScreen onClose={() => setShowSettings(false)} />
          )}

          {gameState === GameState.MENU && (
            <div className="relative w-full h-full">
              {hasActiveRun && (
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={handleContinue}
                    className="border border-green-500 text-green-500 px-6 py-2 hover:bg-green-900/50 animate-pulse font-bold tracking-widest"
                    aria-label={t('accessibility.resumeOperation')}
                  >
                    [ RESUME OPERATION ]
                  </button>
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-40 flex gap-2">
                <button
                  onClick={() => { audio.playBlip(); setShowLoadoutManager(true); }}
                  className="border border-yellow-500 text-yellow-400 px-4 py-2 hover:bg-yellow-900/50 transition-colors tracking-wide font-bold"
                  aria-label={t('accessibility.manageLoadouts')}
                >
                  [LOADOUTS]
                </button>
                <button
                  onClick={() => { audio.playBlip(); setGameState(GameState.ENDLESS); }}
                  className="border border-purple-500 text-purple-400 px-4 py-2 hover:bg-purple-900/50 transition-colors tracking-wide font-bold"
                  aria-label={t('accessibility.endlessMode')}
                >
                  🌊 {t('mainMenu.endlessMode')}
                </button>
                <button
                  onClick={() => { audio.playBlip(); setGameState('STATISTICS'); }}
                  className="border border-cyan-500 text-cyan-400 px-4 py-2 hover:bg-cyan-900/50 transition-colors tracking-wide"
                  aria-label={t('accessibility.viewStatistics')}
                >
                  📊 {t('mainMenu.statistics')}
                </button>
                <button
                  onClick={() => { audio.playBlip(); setGameState('ACHIEVEMENTS'); }}
                  className="border border-purple-500 text-purple-400 px-4 py-2 hover:bg-purple-900/50 transition-colors tracking-wide"
                  aria-label={`${t('mainMenu.achievements')} - ${achievements.length}/18 ${t('accessibility.viewAchievements')}`}
                >
                  🏆 {t('mainMenu.achievements')} [{achievements.length}/{18}]
                </button>
                <button
                  onClick={() => { audio.playBlip(); setGameState('CODEX'); }}
                  className="border border-green-500 text-green-400 px-4 py-2 hover:bg-green-900/50 transition-colors tracking-wide"
                >
                  📖 {t('mainMenu.database')} {codex.newEntryIds.length > 0 && <span className="text-yellow-400 animate-pulse">!</span>}
                </button>
                <button
                  onClick={() => { audio.playBlip(); setGameState('REPLAYS'); }}
                  className="border border-cyan-500 text-cyan-400 px-4 py-2 hover:bg-cyan-900/50 transition-colors tracking-wide"
                >
                  🎬 {t('mainMenu.replays')} [{replayState.replays.length}]
                </button>
                <button
                  onClick={() => { audio.playBlip(); setGameState('TALENTS'); }}
                  className="border border-cyan-500 text-cyan-400 px-4 py-2 hover:bg-cyan-900/50 transition-colors tracking-wide"
                >
                  ⭐ {t('mainMenu.talents')} [{talentState.availablePoints}]
                </button>
                <button
                  onClick={() => { audio.playBlip(); setShowSettings(true); }}
                  className="border border-gray-500 text-gray-400 px-4 py-2 hover:bg-gray-900/50 transition-colors tracking-wide"
                  aria-label={t('accessibility.openSettings')}
                >
                  ⚙️ SETTINGS
                </button>
              </div>

              <CharacterSelect onSelect={handlePilotSelect} onRunTests={() => setGameState('TESTing')} />
            </div>
          )}

          {gameState === 'STATISTICS' && (
            <StatsScreen onBack={() => setGameState(GameState.MENU)} />
          )}

          {gameState === 'ACHIEVEMENTS' && (
            <AchievementsScreen onBack={() => setGameState(GameState.MENU)} />
          )}

          {gameState === 'CODEX' && (
            <CodexScreen
              entries={codex.entries}
              progress={getCodexProgress()}
              onBack={() => setGameState(GameState.MENU)}
              onReadEntry={markCodexEntryRead}
            />
          )}

          {gameState === 'REPLAYS' && (
            <ReplayListScreen
              replays={replayState.replays}
              maxReplays={replayState.maxReplays}
              onBack={() => setGameState(GameState.MENU)}
              onSelectReplay={(id) => {
                setSelectedReplayId(id);
                setGameState('REPLAY_VIEWER');
              }}
              onDeleteReplay={deleteReplay}
              onClearAll={clearAllReplays}
            />
          )}

          {gameState === 'REPLAY_VIEWER' && selectedReplayId && getReplayById(selectedReplayId) && (
            <ReplayViewer
              replay={getReplayById(selectedReplayId)!}
              onClose={() => setGameState('REPLAYS')}
            />
          )}

          {gameState === 'TALENTS' && (
            <div className="w-full h-full bg-black text-cyan-400 p-6">
              <h2 className="text-2xl font-bold mb-4">SELECT PILOT TREE</h2>
              <div className="grid grid-cols-2 gap-4">
                {getAllPilots().map(pilot => (
                  <button
                    key={pilot.id}
                    onClick={() => {
                      setSelectedTalentPilot(pilot.id as PilotId);
                      audio.playBlip();
                    }}
                    className="border border-cyan-500 p-4 hover:bg-cyan-900/30 transition-colors"
                  >
                    <div className="text-xl font-bold">{pilot.name}</div>
                    <div className="text-sm text-gray-400">{pilot.bio.substring(0, 100)}...</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setGameState(GameState.MENU)}
                className="mt-6 px-6 py-2 border border-cyan-500 hover:bg-cyan-900/30"
              >
                &lt; BACK
              </button>
            </div>
          )}

          {gameState === 'TALENTS' && selectedTalentPilot && (
            <TalentTreeScreen
              pilotId={selectedTalentPilot}
              onBack={() => {
                setSelectedTalentPilot(null);
                setGameState(GameState.MENU);
              }}
            />
          )}

          {gameState === 'TESTing' && <TestRunner onBack={resetGame} />}

          {gameState === GameState.ENDLESS && (
            <EndlessLobby onStart={handleEndlessStart} onBack={handleEndlessBack} />
          )}

          {gameState === 'ENDLESS_ACTIVE' && selectedPilot && (
            <EndlessWaveScreen
              pilot={selectedPilot}
              module={selectedModule}
              onBackToMenu={resetGame}
            />
          )}

          {gameState === GameState.BRIEFING && selectedPilot && (
            <div className={`flex flex-col justify-center items-center h-full text-center ${selectedPilot.textColor}`}>
              <div className="max-w-2xl border-2 p-8 border-current bg-black/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-current animate-pulse"></div>
                <h2 className="text-3xl mb-6 font-bold border-b border-current pb-2 tracking-[0.2em]">MISSION BRIEFING</h2>
                <div className="flex justify-between text-xs mb-4 opacity-70 font-mono">
                  <span>PILOT: {selectedPilot.name}</span>
                  <span>MODULE: {selectedModule}</span>
                </div>
                <div className="whitespace-pre-line text-left font-mono mb-8 text-white opacity-90 leading-relaxed">{BRIEFING_TEXT}</div>

                <div className="mb-6 text-left border border-gray-700 p-4">
                  <div className="text-xs uppercase text-gray-500 mb-2">Deploying with Gear:</div>
                  <div className="flex gap-4">
                    {selectedConsumables.map((c, i) => (
                      <span key={i} className={`text-sm font-bold ${c.color.split(' ')[0]}`}>{c.name} x{c.count}</span>
                    ))}
                    {selectedConsumables.length === 0 && <span className="text-sm text-gray-600">NO EQUIPMENT SELECTED</span>}
                  </div>
                </div>

                <button onClick={engageSystems} className="px-10 py-4 border border-current font-bold transition-all duration-200 hover:bg-current hover:text-black hover:shadow-[0_0_20px_currentColor] animate-pulse uppercase tracking-widest text-lg">
                  ENGAGE SYSTEMS [START RUN]
                </button>
              </div>
            </div>
          )}

          {gameState === GameState.COMBAT && selectedPilot && (
            <CombatScreen
              pilot={selectedPilot}
              module={selectedModule}
              onVictory={handleVictory}
              onDefeat={handleDefeat}
            />
          )}

          {gameState === GameState.HANGAR && (
            <HangarScreen onContinue={handleHangarContinue} />
          )}

          {gameState === GameState.EVENT && (
            <NarrativeScreen onContinue={handleEventContinue} />
          )}

          {showPostRunStats && (
            <PostRunStatsModal
              runStats={postRunStats}
              isVictory={isVictoryRun}
              onViewFullStats={() => {
                setShowPostRunStats(false);
                setGameState('STATISTICS');
              }}
              onContinue={() => {
                setShowPostRunStats(false);
                if (isVictoryRun) {
                  setGameState(GameState.VICTORY);
                } else {
                  setGameState(GameState.DEFEAT);
                }
              }}
            />
          )}

          {gameState === GameState.VICTORY && selectedPilot && (
            <div className="flex flex-col justify-center items-center h-full text-center animate-pulse">
              <h1 className="text-6xl font-bold text-green-500 mb-4 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">SECTOR SECURED</h1>
              <p className="text-white mb-8 text-xl">UPLINK ESTABLISHED. DATA UPLOADING...</p>

              <div className="border border-green-800 bg-green-900/20 p-6 mb-8 w-full max-w-md">
                <h3 className="text-green-400 border-b border-green-800 pb-2 mb-4 font-bold">MISSION REPORT</h3>
                <div className="flex justify-between text-sm mb-2"><span>PILOT LEVEL</span><span className="text-white">{useGame().profile.level}</span></div>
                <div className="flex justify-between text-sm mb-2"><span>TOTAL KILLS</span><span className="text-white">{useGame().profile.totalKills}</span></div>
                <div className="flex justify-between text-sm mb-2"><span>SCRAP COLLECTED</span><span className="text-white">{runState.scrap}</span></div>
                <div className="flex justify-between text-sm mb-2"><span>AUGMENTATIONS</span><span className="text-white">{runState.augmentations.length}</span></div>
              </div>

              <button onClick={resetGame} className="text-white border border-white px-8 py-3 hover:bg-white hover:text-black transition-all hover:shadow-[0_0_20px_white]">RETURN TO BASE</button>
            </div>
          )}

          {gameState === GameState.DEFEAT && selectedPilot && (
            <div className="flex flex-col justify-center items-center h-full text-center">
              <h1 className="text-6xl font-bold text-red-600 mb-4 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">CRITICAL FAILURE</h1>
              <p className="text-red-400 mb-2 text-xl">SIGNAL LOST. PILOT FLATLINED.</p>

              <div className="border border-red-800 bg-red-900/20 p-6 mb-8 w-full max-w-md">
                <h3 className="text-red-400 border-b border-red-800 pb-2 mb-4 font-bold">CASUALTY REPORT</h3>
                <div className="flex justify-between text-sm mb-2"><span>SECTOR REACHED</span><span className="text-white">{runState.currentStage}</span></div>
                <div className="flex justify-between text-sm mb-2"><span>ENEMIES DESTROYED</span><span className="text-white">{useGame().profile.totalKills}</span></div>
                <div className="flex justify-between text-sm mb-2"><span>AUGMENTATIONS LOST</span><span className="text-white">{runState.augmentations.length}</span></div>
              </div>

              <button onClick={resetGame} className="text-white border border-white px-8 py-3 hover:bg-white hover:text-black transition-all hover:shadow-[0_0_20px_white]">REBOOT SYSTEM</button>
            </div>
          )}
        </main>
      </TerminalLayout>
    </>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeDataManager();
      await audio.preloadAssets(); // Preload audio assets
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <TerminalLayout color="#ffffff">
        <div className="flex flex-col justify-center items-center h-full text-center">
          <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">LOADING DATA...</h1>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback="loading">
        <GameProvider>
          <AppContent />
        </GameProvider>
      </Suspense>
    </I18nextProvider>
  );
};

export default App;
