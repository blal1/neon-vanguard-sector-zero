import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../services/audioService';

export const AudioVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get audio analyser if available
        const analyser = audio.getAnalyser();
        if (!analyser) {
            setIsActive(false);
            return;
        }

        setIsActive(true);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!canvas || !ctx) return;

            // Get frequency data
            analyser.getByteFrequencyData(dataArray);

            // Clear canvas
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw bars
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

                // Cyberpunk neon green gradient
                const hue = 120; // Green
                const saturation = 100;
                const lightness = 30 + (dataArray[i] / 255) * 40;

                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }

            requestAnimationFrame(draw);
        };

        draw();
    }, []);

    return (
        <div className="w-full h-12 bg-black border-t border-gray-800 relative overflow-hidden">
            <canvas
                ref={canvasRef}
                width={800}
                height={48}
                className="w-full h-full"
            />
            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-700 uppercase tracking-wider">
                    AUDIO VISUALIZER INACTIVE
                </div>
            )}
        </div>
    );
};
