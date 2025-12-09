import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const TutorialModal: React.FC = () => {
    const { settings, updateSettings } = useGame();
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Welcome to Neon Vanguard: Sector Zero!",
            text: "This tutorial will guide you through the basics of combat."
        },
        {
            title: "Abilities",
            text: "Your main abilities are on the left. Use them with SPACE and SHIFT keys. They have cooldowns, so use them wisely."
        },
        {
            title: "Consumables",
            text: "Your consumables are on the right. Use them by clicking on them. They are limited, so save them for when you really need them."
        },
        {
            title: "Charge",
            text: "The bar in the middle is your charge bar. When it's full, you can use your abilities."
        },
        {
            title: "Enemies",
            text: "Enemies will appear on the left. They have a health bar and a charge bar. When their charge bar is full, they will attack."
        },
        {
            title: "Good Luck!",
            text: "You are now ready to face the challenges of Sector Zero. Good luck, pilot!"
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
                        {step < tutorialSteps.length - 1 ? "Next" : "Finish"}
                    </button>
                    {step < tutorialSteps.length - 1 && (
                        <button
                            onClick={() => updateSettings({ tutorialCompleted: true })}
                            className="px-8 py-3 border border-gray-500 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                        >
                            Skip Tutorial
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
