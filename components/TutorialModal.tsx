import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';
import { audio } from '../services/audioService';

interface TutorialStep {
    icon: string;
    title: string;
    text: string;
}

export const TutorialModal: React.FC = () => {
    const { settings, updateSettings } = useGame();
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    const tutorialSteps: TutorialStep[] = [
        {
            icon: '🚀',
            title: t('tutorial.welcome.title'),
            text: t('tutorial.welcome.text')
        },
        {
            icon: '⚔️',
            title: t('tutorial.abilities.title'),
            text: t('tutorial.abilities.text')
        },
        {
            icon: '💊',
            title: t('tutorial.consumables.title'),
            text: t('tutorial.consumables.text')
        },
        {
            icon: '⚡',
            title: t('tutorial.charge.title'),
            text: t('tutorial.charge.text')
        },
        {
            icon: '👾',
            title: t('tutorial.enemies.title'),
            text: t('tutorial.enemies.text')
        },
        {
            icon: '🎯',
            title: t('tutorial.goodLuck.title'),
            text: t('tutorial.goodLuck.text')
        }
    ];

    const currentStep = tutorialSteps[step];

    const handleNext = () => {
        audio.playBlip();
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            updateSettings({ tutorialCompleted: true });
        }
    };

    const handlePrev = () => {
        audio.playBlip();
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleSkip = () => {
        audio.playBlip();
        updateSettings({ tutorialCompleted: true });
    };

    if (settings.tutorialCompleted) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 font-mono">
            <div className="bg-gray-900 border-2 border-cyan-500 p-8 max-w-2xl w-full mx-4 relative overflow-hidden">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 animate-pulse" />

                {/* Content */}
                <div className="relative z-10">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {tutorialSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => { setStep(index); audio.playBlip(); }}
                                className={`w-3 h-3 rounded-full transition-all ${index === step
                                        ? 'bg-cyan-400 scale-125 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                                        : index < step
                                            ? 'bg-cyan-600'
                                            : 'bg-gray-600'
                                    }`}
                                aria-label={`Go to step ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <div className="text-6xl text-center mb-4 animate-bounce">
                        {currentStep.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center tracking-wider">
                        {currentStep.title}
                    </h2>

                    {/* Text */}
                    <p className="text-lg text-gray-300 mb-8 text-center leading-relaxed">
                        {currentStep.text}
                    </p>

                    {/* Step counter */}
                    <div className="text-center text-sm text-gray-500 mb-4">
                        STEP {step + 1} / {tutorialSteps.length}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-center">
                        {step > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-6 py-3 border border-gray-500 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                            >
                                ← {t('common.back') || 'BACK'}
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            {step < tutorialSteps.length - 1 ? t('common.next') : t('common.finish')} →
                        </button>
                    </div>

                    {/* Skip button */}
                    {step < tutorialSteps.length - 1 && (
                        <div className="text-center mt-4">
                            <button
                                onClick={handleSkip}
                                className="text-sm text-gray-500 hover:text-gray-300 underline transition-colors"
                            >
                                {t('tutorial.skipTutorial')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
