import React from 'react';

// A simplified representation of an enemy for the replay viewer
interface ReplayEnemyDisplay {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    isTarget?: boolean;
}

interface ReplayEnemyProps {
    enemy: ReplayEnemyDisplay;
}

export const ReplayEnemy: React.FC<ReplayEnemyProps> = ({ enemy }) => {
    const hpPercent = (enemy.hp / enemy.maxHp) * 100;

    return (
        <div className={`p-2 border rounded-md transition-all ${enemy.isTarget ? 'bg-red-900/50 border-yellow-400 scale-105' : 'bg-gray-800/50 border-red-800'}`}>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className={`font-bold ${enemy.isTarget ? 'text-yellow-400' : 'text-red-400'}`}>{enemy.name}</span>
            </div>
            <div className="h-2 w-full bg-gray-900 border border-black/50">
                <div 
                    className="h-full bg-red-600 transition-all duration-300" 
                    style={{ width: `${hpPercent}%` }} 
                />
            </div>
            <div className="text-xs text-gray-500 mt-1">
                {enemy.hp} / {enemy.maxHp}
            </div>
        </div>
    );
};
