import React, { useState, useEffect } from 'react';
import { BossTemplate } from '../types';
import { useTranslation } from 'react-i18next';

interface BossIntroModalProps {
    boss: BossTemplate;
    onComplete: () => void;
}

export const BossIntroModal: React.FC<BossIntroModalProps> = ({ boss, onComplete }) => {
    const { t } = useTranslation();
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isSkipped, setIsSkipped] = useState(false);

    useEffect(() => {
        if (isSkipped) {
            onComplete();
            return;
        }

        // Auto-advance dialogue lines
        if (currentLineIndex < boss.dialogue.intro.length) {
            const timer = setTimeout(() => {
                setCurrentLineIndex(prev => prev + 1);
            }, 2000); // 2 seconds per line

            return () => clearTimeout(timer);
        } else {
            // All lines shown, wait a bit then complete
            const timer = setTimeout(onComplete, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentLineIndex, boss.dialogue.intro.length, onComplete, isSkipped]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Escape' || e.code === 'Space' || e.code === 'Enter') {
                setIsSkipped(true);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    if (isSkipped) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
            role="dialog"
            aria-label="Boss Introduction"
        >
            <div className="max-w-3xl w-full px-8">
                {/* Boss Title */}
                <div className="text-center mb-12 animate-pulse">
                    <div className="text-sm text-red-500 mb-2 tracking-widest">
                        {t('bossIntro.warningDetected')}
                    </div>
                    <h1 className="text-6xl font-bold text-red-600 mb-2 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] tracking-wider">
                        {boss.name}
                    </h1>
                    <div className="text-xl text-red-400/80 tracking-wide">
                        {boss.title}
                    </div>
                </div>

                {/* ASCII Art Placeholder */}
                <div className="border-2 border-red-600/50 bg-black/50 p-6 mb-8 font-mono text-red-500/70 text-center">
                    <pre className="text-xs leading-tight">
                        {`    ╔═══════════════════════════╗
    ║   ███████   ███████   ║
    ║   ██   ██   ██   ██   ║
    ║   ███████   ███████   ║
    ║       ██ █████ ██       ║
    ║     ████████████████     ║
    ╚═══════════════════════════╝`}
                    </pre>
                </div>

                {/* Dialogue Lines */}
                <div className="space-y-4 mb-8 min-h-[200px]">
                    {boss.dialogue.intro.slice(0, currentLineIndex + 1).map((line, index) => (
                        <div
                            key={index}
                            className={`text-2xl font-mono text-red-400 text-center animate-slide-in ${index === currentLineIndex ? 'opacity-100' : 'opacity-70'
                                }`}
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>

                {/* Skip hint */}
                <div className="text-center text-gray-600 text-sm animate-pulse">
                    {t('bossIntro.skipHint')}
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
};
