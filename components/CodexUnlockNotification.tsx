import React, { useEffect, useState } from 'react';

interface CodexUnlockNotificationProps {
    title: string;
    category: string;
    onView: () => void;
    onDismiss: () => void;
}

export const CodexUnlockNotification: React.FC<CodexUnlockNotificationProps> = ({
    title,
    category,
    onView,
    onDismiss
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in
        setTimeout(() => setIsVisible(true), 100);

        // Auto dismiss after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const getCategoryIcon = () => {
        switch (category) {
            case 'PILOT': return '👤';
            case 'ENEMY': return '👾';
            case 'LORE': return '📖';
            case 'AUDIO_LOG': return '🎙️';
            default: return '📄';
        }
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
        >
            <div className="bg-black border-2 border-green-500 p-4 min-w-80 font-mono text-green-500 shadow-xl">
                {/* Scanline effect */}
                <div className="absolute inset-0 terminal-scanline pointer-events-none opacity-30" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon()}</span>
                        <div className="text-yellow-400 font-bold animate-pulse">
                            📖 NEW CODEX ENTRY UNLOCKED
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-sm mb-1 text-cyan-400">
                        &gt; {category.replace('_', ' ')}
                    </div>
                    <div className="text-lg font-bold mb-3 text-white">
                        {title}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onView, 300);
                            }}
                            className="px-3 py-1 border-2 border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-all text-sm"
                        >
                            [VIEW NOW]
                        </button>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onDismiss, 300);
                            }}
                            className="px-3 py-1 border-2 border-gray-600 text-gray-400 hover:border-gray-500 transition-all text-sm"
                        >
                            [LATER]
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
