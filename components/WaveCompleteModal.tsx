import React from 'react';

interface WaveCompleteModalProps {
    wave: number;
    kills: number;
    timeElapsed: string;
    onContinue: () => void;
}

export const WaveCompleteModal: React.FC<WaveCompleteModalProps> = ({
    wave,
    kills,
    timeElapsed,
    onContinue
}) => {
    const [countdown, setCountdown] = React.useState(3);

    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
            <div className="border-2 border-green-500 bg-black/95 p-8 max-w-2xl w-full shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-green-400 mb-2">
                        ✓ WAVE {wave} CLEARED
                    </h2>
                    <p className="text-green-300/70">Preparing next wave...</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 border-y border-green-500/30 py-4">
                    <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Wave Kills</div>
                        <div className="text-white text-2xl font-bold">{kills}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Time Elapsed</div>
                        <div className="text-white text-2xl font-bold">{timeElapsed}</div>
                    </div>
                </div>

                {/* HP Bonus Notification */}
                <div className="text-center mb-6 p-3 border border-green-500/50 bg-green-900/20">
                    <span className="text-green-400 text-sm">
                        💚 +10 HP restored
                    </span>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    disabled={countdown > 0}
                    className={`w-full py-4 border-2 font-bold text-lg transition-all ${countdown > 0
                            ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                            : 'border-green-500 text-green-400 hover:bg-green-500/20 hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-pulse'
                        }`}
                >
                    {countdown > 0 ? `CONTINUE IN ${countdown}...` : 'NEXT WAVE →'}
                </button>
            </div>
        </div>
    );
};
