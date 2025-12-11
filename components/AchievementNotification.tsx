import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../types';
import { getRarityColor } from '../constants/achievements';
import { audio } from '../services/audioService';
import { useTranslation } from 'react-i18next';

interface AchievementNotificationProps {
    achievement: Achievement;
    onDismiss: () => void;
    autoDismissMs?: number;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
    achievement,
    onDismiss,
    autoDismissMs = 5000
}) => {
    const { t } = useTranslation();
    useEffect(() => {
        // Play sound on mount
        audio.playBlip();

        // Auto-dismiss
        const dismissTimer = setTimeout(() => {
            onDismiss();
        }, autoDismissMs);

        return () => clearTimeout(dismissTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rarityColor = getRarityColor(achievement.rarity);
    const borderColor = {
        'COMMON': 'border-gray-500',
        'RARE': 'border-blue-500',
        'EPIC': 'border-purple-500',
        'LEGENDARY': 'border-yellow-500'
    }[achievement.rarity];

    const glowColor = {
        'COMMON': 'shadow-gray-500/50',
        'RARE': 'shadow-blue-500/50',
        'EPIC': 'shadow-purple-500/50',
        'LEGENDARY': 'shadow-yellow-500/50'
    }[achievement.rarity];

    return (
        <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50"
            onClick={onDismiss}
            role="alert"
            aria-live="assertive"
        >
            <div
                className={`
          bg-black/95 border-2 ${borderColor} p-4 min-w-[320px] max-w-[400px]
          cursor-pointer hover:scale-105 transition-transform
          shadow-[0_0_20px] ${glowColor}
        `}
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-2">
                    <span className="text-2xl animate-bounce">🏆</span>
                    <span className="text-yellow-400 font-bold tracking-wider uppercase text-sm">
                        {t('achievements.unlocked')}
                    </span>
                </div>

                {/* Achievement Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{achievement.icon}</span>
                        <div className="flex-1">
                            <div className={`font-bold text-lg ${rarityColor}`}>
                                {achievement.name}
                            </div>
                            <div className="text-gray-400 text-xs uppercase tracking-wide">
                                {achievement.rarity}
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed">
                        {achievement.description}
                    </div>
                </div>

                {/* Dismiss Hint */}
                <div className="text-xs text-gray-600 text-right mt-2">
                    {t('ui.clickToDismiss')}
                </div>
            </div>
        </motion.div>
    );
};
