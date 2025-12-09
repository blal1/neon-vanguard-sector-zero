import React from 'react';
import { ComboState } from '../types';

interface ComboDisplayProps {
    comboState: ComboState;
    visible: boolean;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ comboState, visible }) => {
    if (!visible || comboState.count < 2) return null;

    const bonusPercent = Math.floor((comboState.multiplier - 1) * 100);

    return (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-50 animate-bounce pointer-events-none">
            <div className="text-6xl font-bold text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,1)] animate-pulse">
                COMBO x{comboState.count}!
            </div>
            <div className="text-2xl text-center text-white mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                +{bonusPercent}% DAMAGE
            </div>
        </div>
    );
};

interface CritFlashProps {
    visible: boolean;
}

export const CritFlash: React.FC<CritFlashProps> = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-red-500 opacity-30 pointer-events-none animate-ping z-40" />
    );
};

interface ScreenShakeProps {
    active: boolean;
    children: React.ReactNode;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({ active, children }) => {
    return (
        <div className={active ? 'animate-shake' : ''}>
            {children}
        </div>
    );
};

interface WeakPointIndicatorProps {
    visible: boolean;
}

export const WeakPointIndicator: React.FC<WeakPointIndicatorProps> = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="text-4xl font-bold text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,1)] animate-pulse">
                ⚡ WEAK POINT HIT! ⚡
            </div>
            <div className="text-xl text-center text-white mt-2">
                2x DAMAGE
            </div>
        </div>
    );
};

interface CounterAttackIndicatorProps {
    visible: boolean;
}

export const CounterAttackIndicator: React.FC<CounterAttackIndicatorProps> = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="text-5xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,1)] animate-bounce">
                ⚔️ COUNTER! ⚔️
            </div>
        </div>
    );
};
