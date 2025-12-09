import React, { useState, useRef, useLayoutEffect } from 'react';
import { PilotId } from '../types';
import { Talent } from '../types/talents';
import { getTalentTree } from '../constants/talents';
import { RUN_CONFIG } from '../constants';
import { useGame } from '../context/GameContext';
import { getTalentRank, canUnlockTalent } from '../utils/talentUtils';
import { audio } from '../services/audioService';

interface TalentNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}
interface TalentLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    unlocked: boolean;
}

interface TalentTreeScreenProps {
    pilotId: PilotId;
    onBack: () => void;
}

export const TalentTreeScreen: React.FC<TalentTreeScreenProps> = ({ pilotId, onBack }) => {
    const { 
        talentState, 
        unlockTalent, 
        resetTalents, 
        getTalentSynergies,
        saveTalentPreset,
        loadTalentPreset,
        deleteTalentPreset
    } = useGame();
    const tree = getTalentTree(pilotId);

    const [lines, setLines] = useState<TalentLine[]>([]);
    const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [newPresetName, setNewPresetName] = useState<string>("");
    const talentRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    // Group talents by tier
    const talentsByTier = tree.talents.reduce((acc, talent) => {
        if (!acc[talent.tier]) acc[talent.tier] = [];
        acc[talent.tier].push(talent);
        return acc;
    }, {} as Record<number, Talent[]>);

    useLayoutEffect(() => {
        const newLines: TalentLine[] = [];
        const nodes: Record<string, TalentNode> = {};
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // First, populate all node positions
        for (const talent of tree.talents) {
            const el = talentRefs.current[talent.id];
            if (el) {
                const rect = el.getBoundingClientRect();
                nodes[talent.id] = {
                    id: talent.id,
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top + rect.height / 2,
                    width: rect.width,
                    height: rect.height
                };
            }
        }

        // Then, create lines
        for (const talent of tree.talents) {
            if (talent.requires) {
                const targetNode = nodes[talent.id];
                const targetRank = getTalentRank(talentState, pilotId, talent.id);

                if (targetNode) {
                    for (const reqId of talent.requires) {
                        const sourceNode = nodes[reqId];
                        const sourceRank = getTalentRank(talentState, pilotId, reqId);
                        if (sourceNode) {
                            newLines.push({
                                x1: sourceNode.x,
                                y1: sourceNode.y + sourceNode.height / 2,
                                x2: targetNode.x,
                                y2: targetNode.y - targetNode.height / 2,
                                unlocked: sourceRank > 0 && targetRank > 0,
                            });
                        }
                    }
                }
            }
        }
        setLines(newLines);
    }, [tree, pilotId, talentState]);

    const handleUnlock = (talent: Talent) => {
        const check = canUnlockTalent(talentState, pilotId, talent);
        if (check.canUnlock) {
            unlockTalent(pilotId, talent);
            audio.playSound('power_up', 0.8);
            setJustUnlocked(talent.id);
            setTimeout(() => setJustUnlocked(null), 1000); // Animation duration
        } else {
            audio.playAlarm();
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your talents? All points will be refunded.")) {
            resetTalents(pilotId);
            audio.playBlip();
        }
    };

    const handleSavePreset = () => {
        if (newPresetName.trim()) {
            saveTalentPreset(pilotId, newPresetName.trim());
            setNewPresetName("");
            audio.playBlip();
        }
    };

    const handleLoadPreset = () => {
        if (selectedPreset) {
            if (window.confirm("Loading a loadout will overwrite your current talents. Are you sure?")) {
                loadTalentPreset(pilotId, selectedPreset);
                audio.playBlip();
            }
        }
    };

    const handleDeletePreset = () => {
        if (selectedPreset) {
            if (window.confirm("Are you sure you want to delete this loadout?")) {
                deleteTalentPreset(pilotId, selectedPreset);
                setSelectedPreset("");
                audio.playBlip();
            }
        }
    };

    const pilotTalentTree = getTalentTree(pilotId);
    const totalSpent = talentState[pilotId].totalPointsSpent;
    const activeSynergies = getTalentSynergies(pilotId);

    return (
        <div className="w-full h-full bg-black text-cyan-400 font-mono p-6 overflow-y-auto" style={{
            '--glow-color': 'rgba(0, 255, 255, 0.7)'
        } as React.CSSProperties}>
             <style>{`
                .talent-node-active {
                    box-shadow: 0 0 15px var(--glow-color), 0 0 25px var(--glow-color);
                }
                .talent-line-unlocked {
                    filter: drop-shadow(0 0 5px var(--glow-color));
                }
                .talent-node-just-unlocked {
                    animation: pulse-glow 1s ease-out;
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
                    50% { box-shadow: 0 0 20px 10px rgba(0, 255, 255, 0.5); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
                }
            `}</style>
            {/* Header */}
            <div className="border-2 border-cyan-500 p-4 mb-6 bg-gray-900/20">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-wider">{pilotTalentTree.name}</h1>
                        <p className="text-gray-400 text-sm mt-1">{pilotTalentTree.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                            {talentState.availablePoints} POINTS AVAILABLE
                        </div>
                        <div className="text-xs text-gray-500">
                            {totalSpent} spent on this tree
                        </div>
                    </div>
                </div>
                 {activeSynergies.length > 0 && (
                    <div className="border-t-2 border-cyan-700 mt-3 pt-3">
                        <h3 className="text-lg font-bold text-yellow-400 mb-1">Active Synergies:</h3>
                        {activeSynergies.map(synergy => (
                            <div key={synergy.id} className="text-sm text-yellow-200">
                                <span className="font-bold">{synergy.name}:</span> {synergy.description}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Talent Presets */}
            <div className="border-2 border-cyan-800 p-4 my-6 bg-gray-900/20">
                <h2 className="text-xl font-bold mb-2 text-cyan-300">TALENT LOADOUTS</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <select 
                            className="w-full bg-gray-800 border border-cyan-700 p-2 text-white"
                            onChange={(e) => setSelectedPreset(e.target.value)}
                            value={selectedPreset}
                        >
                            <option value="">-- Select a Loadout --</option>
                            {talentState[pilotId].presets.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleLoadPreset}
                            disabled={!selectedPreset}
                            className="px-4 py-2 border-2 border-green-500 text-green-400 hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            LOAD
                        </button>
                        <button 
                            onClick={handleDeletePreset}
                            disabled={!selectedPreset}
                            className="px-4 py-2 border-2 border-red-500 text-red-400 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            DELETE
                        </button>
                    </div>
                    <div className="flex-1 flex gap-2">
                         <input 
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="New loadout name..."
                            className="flex-1 bg-gray-800 border border-cyan-700 p-2 text-white"
                         />
                         <button 
                            onClick={handleSavePreset}
                            disabled={!newPresetName.trim()}
                            className="px-4 py-2 border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            SAVE
                        </button>
                    </div>
                </div>
            </div>

            {/* Talent Grid by Tier */}
            <div className="space-y-8 relative" ref={containerRef}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <linearGradient id="unlocked-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0891b2" />
                            <stop offset="100%" stopColor="#fde047" />
                        </linearGradient>
                         <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {lines.map((line, i) => (
                        <line
                            key={i}
                            x1={line.x1} y1={line.y1}
                            x2={line.x2} y2={line.y2}
                            stroke={line.unlocked ? "url(#unlocked-gradient)" : "#374151"}
                            strokeWidth={line.unlocked ? "3" : "2"}
                            className={line.unlocked ? 'talent-line-unlocked transition-all duration-500' : ''}
                            style={{ filter: line.unlocked ? 'url(#glow)' : 'none' }}
                        />
                    ))}
                </svg>
                {[1, 2, 3, 4, 5].map(tier => {
                    const tieredTalents = talentsByTier[tier] || [];
                    if (tieredTalents.length === 0) return null;

                    const isTierUnlocked = tieredTalents.some(t => getTalentRank(talentState, pilotId, t.id) > 0) 
                                        || (tier === 1 && talentState.availablePoints > 0)
                                        || tieredTalents.some(t => t.requires?.every(r => getTalentRank(talentState, pilotId, r) > 0));

                    return (
                        <div key={tier} className={`border-t-2 pt-4 transition-opacity duration-500 ${isTierUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                             <div className="relative text-center mb-4">
                                <span className="text-xl font-bold text-cyan-300 bg-black px-4 z-10 relative">TIER {tier}</span>
                                <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-800" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tieredTalents.map(talent => {
                                    const currentRank = getTalentRank(talentState, pilotId, talent.id);
                                    const check = canUnlockTalent(talentState, pilotId, talent);
                                    const isMaxed = currentRank >= talent.maxRank;
                                    const canAfford = talentState.availablePoints >= talent.cost;
                                    const isJustUnlocked = justUnlocked === talent.id;

                                    // Check prerequisites
                                    let prereqsMet = true;
                                    let prereqText = '';
                                    if (talent.requires) {
                                        prereqsMet = talent.requires.every(reqId =>
                                            getTalentRank(talentState, pilotId, reqId) > 0
                                        );
                                        if (!prereqsMet) {
                                            prereqText = 'Requires: ' + talent.requires.map(id => {
                                                const req = tree.talents.find(t => t.id === id);
                                                return req?.name || id;
                                            }).join(', ');
                                        }
                                    }

                                    const nodeClasses = [
                                        "border-2 p-3 transition-all duration-300 z-10 bg-gray-900",
                                        isMaxed ? 'border-yellow-400 talent-node-active' : '',
                                        currentRank > 0 ? 'border-cyan-400 talent-node-active' : '',
                                        !isMaxed && check.canUnlock ? 'hover:bg-cyan-900/40 hover:border-cyan-300' : '',
                                        !prereqsMet || !canAfford && !isMaxed ? 'border-gray-700 bg-black/30 opacity-60' : 'border-gray-600',
                                        isJustUnlocked ? 'talent-node-just-unlocked' : ''
                                    ].filter(Boolean).join(' ');


                                    return (
                                        <div
                                            key={talent.id}
                                            ref={el => talentRefs.current[talent.id] = el}
                                            className={nodeClasses}
                                        >
                                            {/* Talent Header */}
                                            <div className="flex items-start gap-3 mb-2">
                                                <span className={`text-3xl transition-colors duration-300 ${currentRank > 0 ? 'text-cyan-300' : 'text-gray-600'}`}>{talent.icon}</span>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-sm ${isMaxed ? 'text-yellow-400' : currentRank > 0 ? 'text-white' : 'text-gray-300'}`}>{talent.name}</h3>
                                                    <p className="text-xs text-gray-400">{talent.description}</p>
                                                </div>
                                            </div>

                                            {/* Rank Display */}
                                            <div className="flex items-center justify-between mt-2 text-xs">
                                                <span className="text-gray-400">
                                                    Rank: {currentRank}/{talent.maxRank}
                                                </span>
                                                <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    Cost: {talent.cost} pts
                                                </span>
                                            </div>

                                            {/* Prerequisites warning */}
                                            {!prereqsMet && (
                                                <div className="mt-2 text-xs text-red-400 border-t border-gray-700 pt-2">
                                                    {prereqText}
                                                </div>
                                            )}

                                            {/* Unlock Button */}
                                            <button
                                                onClick={() => handleUnlock(talent)}
                                                disabled={!check.canUnlock}
                                                className={`w-full mt-3 py-1.5 text-xs font-bold border-t-2 transition-all ${isMaxed
                                                    ? 'border-yellow-800 bg-black/20 text-yellow-500 cursor-not-allowed'
                                                    : check.canUnlock
                                                        ? 'border-cyan-500 bg-cyan-900/50 hover:bg-cyan-700 text-white'
                                                        : 'border-gray-700 bg-black/30 text-gray-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isMaxed ? 'MAX RANK' : check.canUnlock ? `UNLOCK RANK ${currentRank + 1}` : check.reason?.toUpperCase()}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex gap-4 border-t-2 border-cyan-800 pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-900/30 transition-colors font-bold tracking-wider"
                >
                    &lt; BACK
                </button>

                {totalSpent > 0 && (
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 border-2 border-red-500 text-red-400 hover:bg-red-900/30 transition-colors font-bold tracking-wider"
                    >
                        RESET TREE ({totalSpent} pts)
                    </button>
                )}

                <div className="flex-1"></div>

                <div className="text-right text-sm text-gray-500">
                    <div>Total Earned: {talentState.totalPointsEarned} points</div>
                    <div>Next Point: Level {Math.floor(talentState.totalPointsEarned / (RUN_CONFIG.XP_PER_LEVEL || 100)) + 2}</div>
                </div>
            </div>
        </div>
    );
};