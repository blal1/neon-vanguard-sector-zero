import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PilotConfig, PilotModule, Enemy, CombatLogEntry, Ability, ActiveStatus, Consumable } from '../types';
import { useGame } from '../context/GameContext';
import { audio } from '../services/audioService';
import { COMBAT_CONFIG, ENDLESS_CONFIG, DIFFICULTIES } from '../constants';
import {
    calculateMaxHp,
    calculateDamage,
    calculateAbilityResult,
    calculatePassiveRegen,
    resolveEnemyAction,
    processStatusEffects,
    applyConsumableEffect,
    generateEndlessWaveEnemies
} from '../utils/combatUtils';
import { UpgradeSelectionModal } from './UpgradeSelectionModal';
import { WaveCompleteModal } from './WaveCompleteModal';
import { EndlessGameOverModal } from './EndlessGameOverModal';
import { useTranslation } from 'react-i18next';

interface EndlessWaveScreenProps {
    pilot: PilotConfig;
    module: PilotModule;
    onBackToMenu: () => void;
}

export const EndlessWaveScreen: React.FC<EndlessWaveScreenProps> = ({ pilot, module, onBackToMenu }) => {
    const {
        endlessState,
        updateEndlessState,
        advanceEndlessWave,
        applyEndlessUpgrade,
        endEndlessRun,
        calculateEndlessScore,
        getLeaderboard,
        difficulty,
        dailyModifier, // Added dailyModifier
        recordEnemyKill,
        recordCodexEnemyKill
    } = useGame();

    const { t } = useTranslation();
    const maxHp = endlessState.maxHp;

    // UI State
    const [playerHp, setPlayerHp] = useState(endlessState.currentHp);
    const [playerCharge, setPlayerCharge] = useState(0);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
    const [energy, setEnergy] = useState(100);
    const [heat, setHeat] = useState(0);
    const [isJammed, setIsJammed] = useState(false);
    const [isBurrowed, setIsBurrowed] = useState(false);
    const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
    const [playerStatuses, setPlayerStatuses] = useState<ActiveStatus[]>([]);
    const [consumables, setConsumables] = useState<Consumable[]>(endlessState.consumables);
    const [shakeIntensity, setShakeIntensity] = useState(0);

    // Modal States
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showWaveComplete, setShowWaveComplete] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);
    const [waveStartTime, setWaveStartTime] = useState(Date.now());

    // Mutable State Ref
    const stateRef = useRef({
        playerHp: endlessState.currentHp,
        playerCharge: 0,
        enemies: [] as Enemy[],
        energy: 100,
        heat: 0,
        isJammed: false,
        isBurrowed: false,
        gameOver: false,
        cooldowns: {} as Record<string, number>,
        playerStatuses: [] as ActiveStatus[],
        consumables: endlessState.consumables
    });

    const logEndRef = useRef<HTMLDivElement>(null);

    // Initialize Wave
    useEffect(() => {
        spawnWave();
        setWaveStartTime(Date.now());
        const initialCDs: Record<string, number> = {};
        pilot.abilities.forEach(ab => initialCDs[ab.id] = 0);
        stateRef.current.cooldowns = initialCDs;
        setCooldowns(initialCDs);
        audio.startAmbientDrone();

        return () => audio.stopAmbientDrone();
    }, []);

    const spawnWave = () => {
        const difficultyConfig = DIFFICULTIES[difficulty];
        const newEnemies = generateEndlessWaveEnemies(
            endlessState.currentWave,
            difficultyConfig.enemyHpMult,
            difficultyConfig.enemyDmgMult,
            dailyModifier // Pass dailyModifier
        );
        setEnemies(newEnemies);
        stateRef.current.enemies = newEnemies;
        addLog(`⚔ WAVE ${endlessState.currentWave} INCOMING`, 'alert');
    };

    const addLog = (text: string, type: CombatLogEntry['type'] = 'info') => {
        const id = Date.now().toString() + Math.random();
        setCombatLog(prev => [...prev.slice(-20), { id, text, type, timestamp: Date.now() }]);
    };

    const triggerShake = (magnitude: number) => {
        setShakeIntensity(magnitude);
        setTimeout(() => setShakeIntensity(0), 300);
    };

    // Handle Ability Use (simplified from CombatScreen)
    const handleAbilityUse = useCallback((ability: Ability) => {
        const current = stateRef.current;
        if (current.gameOver || current.playerCharge < 100) return;
        if (current.cooldowns[ability.id] > 0) {
            addLog(`${ability.name} IS RECHARGING.`, 'info');
            return;
        }

        const baseDamage = endlessState.baseDamage + (module === 'ASSAULT' ? 2 : -2);
        const result = calculateAbilityResult(pilot, ability, baseDamage, current.energy, current.heat, current.isJammed, current.isBurrowed, current.enemies);

        if (!result.resourceConsumed) {
            addLog(result.logMessage, 'alert');
            return;
        }

        // Apply resource changes
        current.energy = result.newEnergy;
        setEnergy(current.energy);
        current.heat = result.newHeat;
        setHeat(current.heat);
        current.isJammed = result.jammed;
        setIsJammed(result.jammed);
        current.isBurrowed = result.burrowedState;
        setIsBurrowed(result.burrowedState);

        current.playerCharge = 0;
        setPlayerCharge(0);

        if (ability.cooldownMs > 0) {
            current.cooldowns[ability.id] = ability.cooldownMs;
            setCooldowns({ ...current.cooldowns });
        }

        audio.playShoot('standard');
        triggerShake(1);

        // Apply damage
        const enemiesCopy = [...current.enemies];
        let deadCount = 0;

        result.targetsHit.forEach(idx => {
            if (enemiesCopy[idx]) {
                enemiesCopy[idx].currentHp -= result.damage;
                if (enemiesCopy[idx].currentHp <= 0) {
                    deadCount++;
                    recordEnemyKill(enemiesCopy[idx].name);
                }
            }
        });

        addLog(`${result.logMessage} >>> [${result.damage} DMG]`, 'damage');

        const aliveEnemies = enemiesCopy.filter(e => e.currentHp > 0);
        current.enemies = aliveEnemies;
        setEnemies(aliveEnemies);

        // Update endless state kills
        if (deadCount > 0) {
            updateEndlessState({
                totalKills: endlessState.totalKills + deadCount,
                waveKills: endlessState.waveKills + deadCount
            });
        }

        // Wave Complete
        if (aliveEnemies.length === 0) {
            handleWaveComplete();
        }
    }, [pilot, module, endlessState]);

    const handleSpecial = useCallback(() => {
        const current = stateRef.current;
        if (pilot.id === 'solaris') {
            current.energy = 100;
            setEnergy(100);
            current.playerCharge = 0;
            setPlayerCharge(0);
            addLog('ENERGY RESTORED', 'special');
        } else if (pilot.id === 'hydra') {
            current.heat = 0;
            setHeat(0);
            current.isJammed = false;
            setIsJammed(false);
            addLog('HEAT VENTED', 'special');
        }
        audio.playBlip();
    }, [pilot]);

    const handleConsumable = useCallback((itemIndex: number) => {
        const current = stateRef.current;
        const item = current.consumables[itemIndex];
        if (!item || item.count <= 0 || current.playerCharge < 50) return;

        item.count--;
        setConsumables([...current.consumables]);
        current.playerCharge -= 50;
        setPlayerCharge(current.playerCharge);

        const result = applyConsumableEffect(item.id, current.playerHp, maxHp, current.energy, current.heat, current.enemies, current.playerStatuses);

        current.playerHp = result.newHp;
        setPlayerHp(result.newHp);
        current.energy = result.newEnergy;
        setEnergy(result.newEnergy);
        current.heat = result.newHeat;
        setHeat(result.newHeat);
        current.enemies = result.newEnemies;
        setEnemies(result.newEnemies);

        addLog(result.log, 'special');
        audio.playBlip();

        // Update endless state consumables
        updateEndlessState({ consumables: current.consumables });
    }, [maxHp, updateEndlessState]);

    const handleWaveComplete = () => {
        audio.playBlip();
        stateRef.current.gameOver = true;

        // Check for upgrade (every 5 waves)
        if (endlessState.currentWave % ENDLESS_CONFIG.UPGRADE_INTERVAL === 0) {
            setShowUpgradeModal(true);
        } else {
            setShowWaveComplete(true);
        }
    };

    const handleUpgradeSelect = (upgradeId: string) => {
        applyEndlessUpgrade(upgradeId);
        setShowUpgradeModal(false);

        // Refresh player stats from endless state
        setPlayerHp(endlessState.currentHp);

        setShowWaveComplete(true);
    };

    const handleContinueToNextWave = () => {
        setShowWaveComplete(false);
        advanceEndlessWave();

        // Reset wave state
        stateRef.current.gameOver = false;
        stateRef.current.playerCharge = 0;
        setPlayerCharge(0);
        setWaveStartTime(Date.now());

        spawnWave();
    };

    const handleGameOver = () => {
        endEndlessRun();
        setShowGameOver(true);
    };

    const handleRetry = () => {
        // This would restart endless run - for now just go back
        onBackToMenu();
    };

    // Game Loop
    useEffect(() => {
        const loop = () => {
            const current = stateRef.current;
            if (current.gameOver) return;

            // Player charge
            current.playerCharge = Math.min(100, current.playerCharge + (COMBAT_CONFIG.BASE_CHARGE_RATE * pilot.baseSpeed));
            setPlayerCharge(current.playerCharge);

            // Enemy ATB
            const newEnemies = current.enemies.map(enemy => {
                enemy.actionCharge = Math.min(100, enemy.actionCharge + (COMBAT_CONFIG.ENEMY_AI.CHARGE_RATE_BASE * enemy.speed));

                if (enemy.actionCharge >= 100) {
                    enemy.actionCharge = 0;
                    const actionResult = resolveEnemyAction(enemy, current.isBurrowed, 'NONE');

                    if (!actionResult.missed && !actionResult.healed && !actionResult.charged) {
                        current.playerHp -= actionResult.damage;
                        setPlayerHp(current.playerHp);
                        addLog(`${enemy.name} ${actionResult.flavor} [${actionResult.damage} DMG]`, 'enemy');
                        audio.playEnemyHit();
                        triggerShake(2);

                        if (current.playerHp <= 0) {
                            current.gameOver = true;
                            setTimeout(handleGameOver, 1000);
                        }
                    }
                }
                return enemy;
            });

            setEnemies([...newEnemies]);
        };

        const interval = setInterval(loop, COMBAT_CONFIG.TICK_RATE_MS);
        return () => clearInterval(interval);
    }, [pilot, handleGameOver]);

    // Sync endless state HP changes
    useEffect(() => {
        stateRef.current.playerHp = playerHp;
        updateEndlessState({ currentHp: playerHp });
    }, [playerHp, updateEndlessState]);

    const currentScore = calculateEndlessScore();
    const leaderboardRank = getLeaderboard().findIndex(entry => entry.score < currentScore) + 1;

    const waveTime = Math.floor((Date.now() - waveStartTime) / 1000);
    const waveTimeString = `${Math.floor(waveTime / 60)}m ${waveTime % 60}s`;

    const survivalTime = Math.floor((Date.now() - endlessState.startTime) / 1000);
    const survivalTimeString = `${Math.floor(survivalTime / 60)}m ${survivalTime % 60}s`;

    return (
        <div className={`w-full h-full flex flex-col ${shakeIntensity > 0 ? `animate-shake-${Math.min(shakeIntensity, 5)}` : ''}`}>
            {/* Header - Wave Info */}
            <div className="border-b-2 border-purple-500 bg-black/90 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-purple-400">🌊 WAVE {endlessState.currentWave}</h1>
                        <p className="text-sm text-gray-400">{enemies.length} enemies remaining</p>
                    </div>
                    <div className="text-right">
                        <div className="text-yellow-400 text-2xl font-bold">{currentScore.toLocaleString()} PTS</div>
                        <div className="text-sm text-gray-400">Kills: {endlessState.totalKills}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Player Status */}
                <div className="w-80 border-r border-gray-700 bg-black/50 p-4 overflow-y-auto">
                    <div className={`border-2 ${pilot.borderColor} p-3 mb-4`}>
                        <div className={`text-xl font-bold ${pilot.textColor} mb-2`}>{pilot.mechName}</div>
                        <div className="text-sm mb-2">
                            HP: {playerHp} / {maxHp}
                            <div className="w-full bg-gray-800 h-2 mt-1">
                                <div className="bg-green-500 h-2" style={{ width: `${(playerHp / maxHp) * 100}%` }} />
                            </div>
                        </div>
                        <div className="text-sm">
                            Charge: {playerCharge.toFixed(0)}%
                            <div className="w-full bg-gray-800 h-2 mt-1">
                                <div className="bg-blue-500 h-2" style={{ width: `${playerCharge}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Abilities */}
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-400 mb-2">{t('endless.abilities')}</h3>
                        {pilot.abilities.map((ability, idx) => (
                            <button
                                key={ability.id}
                                onClick={() => handleAbilityUse(ability)}
                                disabled={playerCharge < 100 || cooldowns[ability.id] > 0}
                                className={`w-full p-2 mb-2 border ${playerCharge >= 100 && cooldowns[ability.id] === 0
                                    ? 'border-green-500 hover:bg-green-900/30'
                                    : 'border-gray-700 opacity-50'
                                    } text-left text-sm`}
                            >
                                <div className="font-bold">[{idx + 1}] {ability.name}</div>
                                {cooldowns[ability.id] > 0 && <div className="text-xs text-red-400">CD: {(cooldowns[ability.id] / 1000).toFixed(1)}s</div>}
                            </button>
                        ))}
                    </div>

                    {/* Consumables */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-2">{t('endless.items')}</h3>
                        {consumables.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleConsumable(idx)}
                                disabled={item.count === 0 || playerCharge < 50}
                                className={`w-full p-2 mb-2 ${item.color} text-left text-xs ${item.count === 0 ? 'opacity-30' : ''}`}
                            >
                                {item.name} x{item.count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center - Combat View */}
                <div className="flex-1 flex flex-col">
                    {/* Enemies */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-4">
                            {enemies.map((enemy) => (
                                <div key={enemy.id} className="border border-red-500 p-3 bg-black/70">
                                    <div className="text-lg font-bold text-red-400 mb-1">{enemy.name}</div>
                                    <div className="text-sm text-white">HP: {enemy.currentHp} / {enemy.maxHp}</div>
                                    <div className="w-full bg-gray-800 h-2 mt-1">
                                        <div className="bg-red-500 h-2" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
                                    </div>
                                    <div className="text-xs text-yellow-400 mt-1">ATB: {enemy.actionCharge.toFixed(0)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Combat Log */}
                    <div className="h-40 border-t border-gray-700 bg-black/70 p-2 overflow-y-auto">
                        {combatLog.map((log) => (
                            <div key={log.id} className={`text-xs mb-1 ${log.type === 'damage' ? 'text-yellow-400' :
                                log.type === 'enemy' ? 'text-red-400' :
                                    log.type === 'alert' ? 'text-orange-500' :
                                        log.type === 'special' ? 'text-cyan-400' :
                                            'text-gray-400'
                                }`}>
                                {log.text}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showUpgradeModal && (
                <UpgradeSelectionModal
                    wave={endlessState.currentWave}
                    onSelectUpgrade={handleUpgradeSelect}
                />
            )}

            {showWaveComplete && (
                <WaveCompleteModal
                    wave={endlessState.currentWave}
                    kills={endlessState.waveKills}
                    timeElapsed={waveTimeString}
                    onContinue={handleContinueToNextWave}
                />
            )}

            {showGameOver && (
                <EndlessGameOverModal
                    wave={endlessState.currentWave}
                    kills={endlessState.totalKills}
                    score={currentScore}
                    survivalTime={survivalTimeString}
                    pilotId={endlessState.pilotId!}
                    leaderboardRank={leaderboardRank}
                    onRetry={handleRetry}
                    onBackToMenu={onBackToMenu}
                    onViewLeaderboard={onBackToMenu}
                />
            )}
        </div>
    );
};
