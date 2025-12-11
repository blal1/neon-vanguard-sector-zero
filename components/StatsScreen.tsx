import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PILOTS } from '../constants';
import { audio } from '../services/audioService';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import { PilotId } from '../types';
import { useTranslation } from 'react-i18next';

interface StatsScreenProps {
    onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { stats, profile } = useGame();
    const [selectedPilot, setSelectedPilot] = useState<PilotId | 'all'>('all');

    // Format play time
    const formatPlayTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const getDisplayStats = () => {
        if (selectedPilot === 'all' || !stats.pilotStats[selectedPilot]) {
            return {
                totalDamageDealt: stats.totalDamageDealt,
                totalDamageTaken: stats.totalDamageTaken,
                runsCompleted: stats.runsCompleted,
                runsFailed: stats.runsFailed,
                kills: profile.totalKills,
                playTime: stats.totalPlayTimeSeconds,
                winRate: stats.runsCompleted + stats.runsFailed > 0 ? ((stats.runsCompleted / (stats.runsCompleted + stats.runsFailed)) * 100).toFixed(1) : '0.0'
            };
        }
        const pilotStats = stats.pilotStats[selectedPilot];
        return {
            totalDamageDealt: pilotStats.totalDamageDealt,
            totalDamageTaken: pilotStats.totalDamageTaken,
            runsCompleted: pilotStats.wins,
            runsFailed: pilotStats.losses,
            kills: pilotStats.kills,
            playTime: pilotStats.timePlayed,
            winRate: pilotStats.wins + pilotStats.losses > 0 ? ((pilotStats.wins / (pilotStats.wins + pilotStats.losses)) * 100).toFixed(1) : '0.0'
        }
    }

    const displayStats = getDisplayStats();

    // Prepare data for charts
    const winLossData = [
        { name: 'Victories', value: displayStats.runsCompleted, fill: '#22c55e' },
        { name: 'Defeats', value: displayStats.runsFailed, fill: '#ef4444' }
    ];

    const pilotUsageData = PILOTS.map(pilot => ({
        name: pilot.name,
        usage: stats.pilotUsageCount[pilot.id] || 0,
        fill: pilot.color
    })).filter(p => p.usage > 0);

    const enemyKillsData = Object.entries(stats.enemiesKilledByType)
        .map(([name, count]) => ({ name, kills: count }))
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 10); // Top 10

    const hazardData = Object.entries(stats.hazardsSurvived)
        .map(([type, count]) => ({ name: type.replace(/_/g, ' '), survived: count }));

    const itemsData = Object.entries(stats.itemsUsedByType)
        .map(([id, count]) => ({
            name: id.toUpperCase().replace(/_/g, ' '),
            value: count,
            fill: id === 'nanite_repair' ? '#3b82f6' : id === 'emp_grenade' ? '#eab308' : '#8b5cf6'
        }));

    const abilitiesData = Object.entries(stats.abilitiesUsedByType)
        .map(([id, count]) => ({
            name: id.toUpperCase().replace(/_/g, ' '),
            value: count,
            fill: '#8b5cf6'
        }));

    const stageStatsData = Object.entries(stats.stageStats).map(([stage, data]) => ({
        name: `Stage ${stage}`,
        wins: data.wins,
        losses: data.losses
    }));

    const timeToKillData = stats.killTimestamps ? Object.entries(
        stats.killTimestamps.reduce((acc, { enemyName, timestamp }) => {
            if (!acc[enemyName]) {
                acc[enemyName] = { totalTime: 0, count: 0 };
            }
            acc[enemyName].totalTime += timestamp - (stats.runStartTime || 0);
            acc[enemyName].count++;
            return acc;
        }, {} as Record<string, { totalTime: number, count: number }>)
    ).map(([name, data]) => ({
        name,
        avgTime: (data.totalTime / data.count / 1000).toFixed(1)
    })) : [];

    return (
        <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b-2 border-cyan-500 pb-4">
                <h1 className="text-4xl font-bold text-cyan-400 tracking-widest">
                    📊 COMBAT ANALYTICS
                </h1>
                <button
                    onClick={() => { audio.playBlip(); onBack(); }}
                    className="border border-white text-white px-6 py-2 hover:bg-white hover:text-black transition-all"
                >
                    [ BACK ]
                </button>
            </div>

            {/* Pilot Selector */}
            <div className="mb-4">
                <select
                    value={selectedPilot}
                    onChange={(e) => setSelectedPilot(e.target.value as PilotId | 'all')}
                    className="bg-gray-800 border border-cyan-500 text-white p-2"
                >
                    <option value="all">{t('stats.allPilots')}</option>
                    {PILOTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="border border-cyan-500 bg-cyan-900/20 p-4">
                    <div className="text-xs text-cyan-300 uppercase mb-1">{t('stats.totalDamage')}</div>
                    <div className="text-2xl font-bold text-white">{displayStats.totalDamageDealt.toLocaleString()}</div>
                </div>
                <div className="border border-green-500 bg-green-900/20 p-4">
                    <div className="text-xs text-green-300 uppercase mb-1">{t('stats.playTime')}</div>
                    <div className="text-2xl font-bold text-white">{formatPlayTime(displayStats.playTime)}</div>
                </div>
                <div className="border border-purple-500 bg-purple-900/20 p-4">
                    <div className="text-xs text-purple-300 uppercase mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-white">{displayStats.winRate}%</div>
                </div>
                <div className="border border-yellow-500 bg-yellow-900/20 p-4">
                    <div className="text-xs text-yellow-300 uppercase mb-1">{t('stats.totalKills')}</div>
                    <div className="text-2xl font-bold text-white">{displayStats.kills}</div>
                </div>
            </div>

            {/* Personal Bests */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                    PERSONAL BESTS
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">{t('stats.fastestWin')}</div>
                        <div className="text-xl font-bold text-white">{formatPlayTime(stats.fastestWinTime)}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">{t('stats.longestStreak')}</div>
                        <div className="text-xl font-bold text-white">{stats.longestWinStreak}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">{t('stats.highestStage')}</div>
                        <div className="text-xl font-bold text-white">{stats.highestStageReached}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">{t('stats.perfectRuns')}</div>
                        <div className="text-xl font-bold text-white">{stats.perfectRuns}</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Win/Loss Pie Chart */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        RUN OUTCOMES
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={winLossData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                dataKey="value"
                            >
                                {winLossData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                labelStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center text-sm text-gray-400 mt-2">
                        Total Runs: {displayStats.runsCompleted + displayStats.runsFailed}
                    </div>
                </div>

                {/* Pilot Usage Bar Chart */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        PILOT USAGE
                    </h3>
                    {pilotUsageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pilotUsageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="usage" fill="#8884d8">
                                    {pilotUsageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No pilot data yet
                        </div>
                    )}
                </div>

                {/* Stage-by-stage analysis */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        STAGE ANALYSIS
                    </h3>
                    {stageStatsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stageStatsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="wins" fill="#22c55e" name="Victories" />
                                <Bar dataKey="losses" fill="#ef4444" name="Defeats" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No stage data yet
                        </div>
                    )}
                </div>

                {/* Time to kill chart */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        AVG. TIME TO KILL (SECONDS)
                    </h3>
                    {timeToKillData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeToKillData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis type="number" stroke="#888" />
                                <YAxis type="category" dataKey="name" stroke="#888" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="avgTime" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No data yet
                        </div>
                    )}
                </div>

                {/* Enemy Kills Bar Chart */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        ENEMIES DESTROYED (TOP 10)
                    </h3>
                    {enemyKillsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={enemyKillsData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis type="number" stroke="#888" />
                                <YAxis type="category" dataKey="name" stroke="#888" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="kills" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No enemy kills recorded
                        </div>
                    )}
                </div>

                {/* Hazards Survived */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        HAZARDS SURVIVED
                    </h3>
                    {hazardData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hazardData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="survived" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No hazards survived
                        </div>
                    )}
                </div>

                {/* Abilities Used Pie Chart */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        ABILITIES USED
                    </h3>
                    {abilitiesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={abilitiesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {abilitiesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No abilities used yet
                        </div>
                    )}
                </div>

                {/* Items Used Pie Chart */}
                <div className="border border-gray-700 bg-black/50 p-4 flex flex-col col-span-2">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 border-b border-gray-700 pb-2">
                        CONSUMABLES USED
                    </h3>
                    {itemsData.length > 0 ? (
                        <div className="flex-1 flex items-center">
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={itemsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {itemsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #444' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-1/2 pl-8">
                                <div className="text-sm text-gray-300 space-y-2">
                                    <div className="flex justify-between">
                                        <span>{t('stats.totalUsed')}</span>
                                        <span className="font-bold text-white">{stats.consumablesUsed}</span>
                                    </div>
                                    {itemsData.map((item) => (
                                        <div key={item.name} className="flex justify-between">
                                            <span className="flex items-center">
                                                <span className="w-3 h-3 mr-2" style={{ backgroundColor: item.fill }}></span>
                                                {item.name}:
                                            </span>
                                            <span className="font-bold text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            No items used yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
