import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';

export const TutorialModal: React.FC = () => {
    const { settings, updateSettings } = useGame();
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: t('tutorial.welcome.title'),
            text: t('tutorial.welcome.text')
        },
        {
            title: t('tutorial.abilities.title'),
            text: t('tutorial.abilities.text')
        },
        {
            title: t('tutorial.consumables.title'),
            text: t('tutorial.consumables.text')
        },
        {
            title: t('tutorial.charge.title'),
            text: t('tutorial.charge.text')
        },
        {
            title: t('tutorial.enemies.title'),
            text: t('tutorial.enemies.text')
        },
        {
            title: t('tutorial.goodLuck.title'),
            text: t('tutorial.goodLuck.text')
        }
    ];

    const currentStep = tutorialSteps[step];

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            updateSettings({ tutorialCompleted: true });
        }
    };

    if (settings.tutorialCompleted) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-cyan-500 p-8 rounded-lg max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">{currentStep.title}</h2>
                <p className="text-lg text-white mb-6">{currentStep.text}</p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all"
                    >
                        {step < tutorialSteps.length - 1 ? t('common.next') : t('common.finish')}
                    </button>
                    {step < tutorialSteps.length - 1 && (
                        <button
                            onClick={() => updateSettings({ tutorialCompleted: true })}
                            className="px-8 py-3 border border-gray-500 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                        >
                            {t('tutorial.skipTutorial')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
