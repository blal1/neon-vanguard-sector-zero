import React, { useState, useEffect } from 'react';
import { CombatReplay } from '../types/replay';
import { audio } from '../services/audioService';
import { CombatEffectsLayer, useCombatEffects } from './CombatEffectsLayer';
import { AnimatedPortrait } from './AnimatedPortrait';
import { ReplayEnemy } from './ReplayEnemy';

interface ReplayViewerProps {
    replay: CombatReplay;
    onClose: () => void;
}

// Simplified enemy representation for the replay viewer
interface ReplayEnemyDisplay {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    isTarget?: boolean;
}

interface KeyMoment {
    index: number;
    type: 'CRITICAL' | 'BOSS' | 'VICTORY';
}

export const ReplayViewer: React.FC<ReplayViewerProps> = ({ replay, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4 | 8>(2);
    const { effects, screenFlash, screenShake, spawnParticles, triggerFlash, triggerScreenShake } = useCombatEffects();
    const [replayEnemies, setReplayEnemies] = useState<ReplayEnemyDisplay[]>([]);
    const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    // Scan for key moments
    useEffect(() => {
        const moments: KeyMoment[] = [];
        replay.actions.forEach((action, index) => {
            if (action.isCritical) {
                moments.push({ index, type: 'CRITICAL' });
            }
            if (action.result.toLowerCase().includes('boss')) {
                moments.push({ index, type: 'BOSS' });
            }
        });
        if (replay.outcome === 'VICTORY') {
            moments.push({ index: replay.actions.length - 1, type: 'VICTORY' });
        }
        setKeyMoments(moments);
    }, [replay]);

    // Recalculate full state up to current index whenever it changes
    useEffect(() => {
        const firstAction = replay.actions[0];
        if (!firstAction) return;

        let enemies: ReplayEnemyDisplay[] = Array.from({ length: firstAction.enemyCount }, (_, i) => ({
            id: `enemy-${i}`,
            name: `Enemy ${i + 1}`, // Generic name
            hp: 100, // Assumption
            maxHp: 100, // Assumption
        }));

        for (let i = 0; i <= currentIndex; i++) {
            const action = replay.actions[i];
            const { result, damage, actor } = action;

            if (damage && actor === 'PLAYER') {
                const match = result.match(/hits (.*?)(?:\s>>>|$)/);
                if (match) {
                    const enemyName = match[1];
                    const targetIndex = enemies.findIndex(e => e.name.toLowerCase() === enemyName.toLowerCase().trim());
                    if (targetIndex !== -1) {
                        enemies[targetIndex] = { ...enemies[targetIndex], hp: Math.max(0, enemies[targetIndex].hp - damage) };
                    } else {
                        const aliveEnemy = enemies.find(e => e.hp > 0);
                        if (aliveEnemy) aliveEnemy.hp = Math.max(0, aliveEnemy.hp - damage);
                    }
                } else {
                    const aliveEnemy = enemies.find(e => e.hp > 0);
                    if (aliveEnemy) aliveEnemy.hp = Math.max(0, aliveEnemy.hp - damage);
                }
            }
        }

        enemies = enemies.map(e => ({ ...e, isTarget: false }));

        const currentAction = replay.actions[currentIndex];
        if (currentAction.damage && currentAction.actor === 'PLAYER') {
            const match = currentAction.result.match(/hits (.*?)(?:\s>>>|$)/);
            if (match) {
                const enemyName = match[1];
                const targetIndex = enemies.findIndex(e => e.name.toLowerCase() === enemyName.toLowerCase().trim());
                if (targetIndex !== -1) {
                    enemies[targetIndex].isTarget = true;
                }
            }
        }

        setReplayEnemies(enemies);

    }, [currentIndex, replay.actions]);


    // Auto-advance when playing
    useEffect(() => {
        if (!isPlaying || currentIndex >= replay.actions.length - 1) {
            if (currentIndex >= replay.actions.length - 1) {
                setIsPlaying(false);
            }
            return;
        }

        const currentAction = replay.actions[currentIndex];
        const nextAction = replay.actions[currentIndex + 1];
        const delay = Math.max(50, (nextAction.timestamp - currentAction.timestamp) / playbackSpeed);

        const timer = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, delay);

        return () => clearTimeout(timer);
    }, [isPlaying, currentIndex, playbackSpeed, replay.actions]);

    // Sound and Visual Effects for actions
    useEffect(() => {
        const currentAction = replay.actions[currentIndex];
        if (!isPlaying || !currentAction) return;

        const { result, damage, isCritical, healing } = currentAction;
        const resultLower = result.toLowerCase();

        if (damage) {
            if (isCritical) {
                audio.playSound('crit_hit', 0.9);
                triggerScreenShake('rumble');
                spawnParticles('critical', 50, 50);
                triggerFlash('critical');
            } else {
                audio.playEnemyHit();
                spawnParticles('hit', 80, Math.random() * 80 + 10);
                triggerFlash('damage');
            }
        } else if (healing) {
            audio.playSound('power_up', 0.7);
            spawnParticles('heal', 30, 50);
            triggerFlash('heal');
        } else if (resultLower.includes('fires') || resultLower.includes('shoots')) {
            if (resultLower.includes('laser')) {
                audio.playShoot('laser');
                spawnParticles('laser', 50, 50);
            } else if (resultLower.includes('heavy')) {
                audio.playShoot('heavy');
                spawnParticles('heavy_shot', 50, 50);
                triggerScreenShake('light');
            } else {
                audio.playShoot('standard');
                spawnParticles('standard_shot', 50, 50);
            }
        } else if (resultLower.includes('activates') || resultLower.includes('overloads')) {
            audio.playSound('charge_up');
            triggerFlash('energy');
        } else if (resultLower.includes('destroyed')) {
            spawnParticles('enemy_explosion', 80, Math.random() * 80 + 10);
            triggerScreenShake('rumble');
        }

    }, [currentIndex, isPlaying, spawnParticles, triggerFlash, triggerScreenShake, replay.actions]);

    const currentAction = replay.actions[currentIndex];
    const progress = ((currentIndex + 1) / replay.actions.length) * 100;

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        audio.playBlip();
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsPlaying(false);
        audio.playBlip();
    };

    const handleSpeedChange = (speed: 1 | 2 | 4 | 8) => {
        setPlaybackSpeed(speed);
        audio.playBlip();
    };

    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newIndex = Math.floor((clickX / rect.width) * replay.actions.length);
        setCurrentIndex(Math.max(0, Math.min(replay.actions.length - 1, newIndex)));
        setIsPlaying(false); // Pause when scrubbing
    };

    const handleCopy = () => {
        try {
            const replayJson = JSON.stringify(replay, null, 2);
            navigator.clipboard.writeText(replayJson);
            setNotification('Replay data copied to clipboard!');
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("Failed to copy replay data:", error);
            setNotification('Error copying data.');
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleDownload = () => {
        try {
            const replayJson = JSON.stringify(replay, null, 2);
            const blob = new Blob([replayJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NeonVanguard_Replay_${replay.id.substring(0, 8)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setNotification('Replay downloaded!');
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("Failed to download replay data:", error);
            setNotification('Error downloading data.');
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <CombatEffectsLayer effects={effects} screenFlash={screenFlash} screenShake={screenShake}>
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border-2 border-cyan-500 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col font-mono">
                    {/* Header */}
                    <div className="border-b-2 border-cyan-500 p-4 flex justify-between items-center bg-cyan-900/20">
                        <div>
                            <h2 className="text-2xl text-cyan-400 font-bold tracking-wider">
                                ⏯ COMBAT REPLAY
                            </h2>
                            <div className="text-sm text-gray-400 mt-1 flex gap-4">
                                <span>{replay.pilotName}</span>
                                <span>|</span>
                                <span>Stage {replay.stage}</span>
                                <span>|</span>
                                <span className={replay.outcome === 'VICTORY' ? 'text-green-400' : 'text-red-400'}>
                                    {replay.outcome}
                                </span>
                                <span>|</span>
                                <span>{formatTime(replay.duration)}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-red-400 text-xl px-3 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Battlefield */}
                    <div className="flex-1 flex p-4 gap-4 bg-black/80">
                        {/* Player Side */}
                        <div className="w-1/3 flex flex-col items-center justify-center">
                            <AnimatedPortrait
                                pilotId={replay.pilotId}
                                currentHp={currentAction.playerHp}
                                maxHp={currentAction.playerMaxHp}
                                size="large"
                            />
                            <div className="text-center mt-2">
                                <h3 className="text-lg font-bold text-cyan-400">{replay.pilotName}</h3>
                                <div className="text-sm text-gray-400">
                                    HP: {currentAction.playerHp} / {currentAction.playerMaxHp}
                                </div>
                            </div>
                        </div>
                        {/* Enemy Side */}
                        <div className="w-2/3 grid grid-cols-2 gap-2 content-start">
                            {replayEnemies.map(enemy => (
                                <ReplayEnemy key={enemy.id} enemy={enemy} />
                            ))}
                        </div>
                    </div>

                    {/* Timeline Progress */}
                    <div className="p-4 border-b border-cyan-700 bg-gray-900">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-cyan-400 w-24">
                                Action {currentIndex + 1} / {replay.actions.length}
                            </span>
                            <div
                                className="flex-1 bg-gray-800 h-3 rounded-sm border border-cyan-700 overflow-hidden cursor-pointer relative"
                                onClick={handleScrub}
                            >
                                <div
                                    className="bg-cyan-500 h-full transition-all duration-100"
                                    style={{ width: `${progress}%` }}
                                />
                                {keyMoments.map(moment => (
                                    <div
                                        key={moment.index}
                                        className={`absolute top-0 h-full w-1 ${moment.type === 'CRITICAL' ? 'bg-yellow-500' :
                                            moment.type === 'BOSS' ? 'bg-red-500' : 'bg-green-500'
                                            }`}
                                        style={{ left: `${(moment.index / replay.actions.length) * 100}%` }}
                                        title={`${moment.type} at action ${moment.index + 1}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-cyan-400 w-16 text-right">
                                {formatTime(currentAction?.timestamp || 0)}
                            </span>
                        </div>
                        {/* Current Action Highlight */}
                        {currentAction && (
                            <div className={`text-center py-2 px-4 border-2 ${currentAction.actor === 'PLAYER'
                                ? 'border-cyan-500 bg-cyan-900/30'
                                : currentAction.actor === 'ENEMY'
                                    ? 'border-red-500 bg-red-900/30'
                                    : 'border-yellow-500 bg-yellow-900/20'
                                }`}>
                                <div className="font-bold text-lg">
                                    {currentAction.result}
                                </div>
                                {currentAction.damage && (
                                    <div className="text-sm text-orange-400 mt-1">
                                        💥 Damage: {currentAction.damage} {currentAction.isCritical && '⚡ CRITICAL!'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Log */}
                    <div className="flex-1 overflow-y-auto p-4 bg-black">
                        <div className="space-y-1">
                            {replay.actions.slice(0, currentIndex + 1).reverse().map((action, reverseIdx) => {
                                const idx = currentIndex - reverseIdx;
                                const isCurrentAction = idx === currentIndex;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-2 border-l-4 transition-all ${action.actor === 'PLAYER'
                                            ? 'border-cyan-500'
                                            : action.actor === 'ENEMY'
                                                ? 'border-red-500'
                                                : 'border-yellow-500'
                                            } ${isCurrentAction
                                                ? 'bg-cyan-900/30 opacity-100 scale-[1.02]'
                                                : 'opacity-50 hover:opacity-75'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500">
                                                    Turn {action.turn} • {formatTime(action.timestamp)}
                                                    {action.playerHp !== undefined && ` • HP: ${action.playerHp}/${action.playerMaxHp}`}
                                                    {action.enemyCount !== undefined && ` • Enemies: ${action.enemyCount}`}
                                                </div>
                                                <div className={`${action.actor === 'PLAYER'
                                                    ? 'text-cyan-400'
                                                    : action.actor === 'ENEMY'
                                                        ? 'text-red-400'
                                                        : 'text-yellow-400'
                                                    } font-medium`}>
                                                    {currentAction.result}
                                                </div>
                                                {action.damage && (
                                                    <div className="text-xs text-orange-300 mt-1">
                                                        💥 {action.damage} damage {action.isCritical && '⚡'}
                                                    </div>
                                                )}
                                                {action.healing && (
                                                    <div className="text-xs text-green-400 mt-1">
                                                        ❤️ +{action.healing} HP
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Final Stats */}
                    <div className="border-t border-cyan-700 p-3 bg-gray-900 text-sm">
                        <div className="flex gap-6 justify-center text-gray-400">
                            <span>Damage: <span className="text-orange-400">{replay.finalStats.damageDealt}</span></span>
                            <span>Taken: <span className="text-red-400">{replay.finalStats.damageTaken}</span></span>
                            <span>Kills: <span className="text-green-400">{replay.finalStats.enemiesKilled}</span></span>
                            <span>Items: <span className="text-cyan-400">{replay.finalStats.itemsUsed}</span></span>
                            <span>Crits: <span className="text-yellow-400">{replay.finalStats.criticalHits}</span></span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="border-t-2 border-cyan-500 p-4 flex justify-between items-center bg-cyan-900/20">
                        <div className="flex gap-2">
                            <button
                                onClick={handlePlayPause}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-colors"
                            >
                                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                            </button>
                            <button
                                onClick={handleRestart}
                                className="px-4 py-2 border-2 border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
                            >
                                ⏮ RESTART
                            </button>
                        </div>

                        <div className="flex gap-2 items-center">
                            <button onClick={handleCopy} className="text-xs border border-cyan-700 text-cyan-400 px-2 py-1 hover:bg-cyan-900/30">COPY</button>
                            <button onClick={handleDownload} className="text-xs border border-cyan-700 text-cyan-400 px-2 py-1 hover:bg-cyan-900/30">JSON</button>
                            <span className="text-sm text-gray-400 mr-2">| Speed:</span>
                            {([1, 2, 4, 8] as const).map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`px-3 py-1 transition-colors ${playbackSpeed === speed
                                        ? 'bg-cyan-600 text-white font-bold'
                                        : 'border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30'
                                        }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {notification && (
                    <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-pulse">
                        {notification}
                    </div>
                )}
            </div>
        </CombatEffectsLayer>
    );
};