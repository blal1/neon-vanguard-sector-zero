import React, { useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';

interface TerminalLayoutProps {
  children: React.ReactNode;
  color: string; // Hex color for the glow
}

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({ children, color }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col font-mono selection:bg-white selection:text-black">
      {/* CRT Effects */}
      <div className="absolute inset-0 z-50 pointer-events-none crt-flicker mix-blend-hard-light opacity-50 bg-[radial-gradient(circle,rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_100%)]" aria-hidden="true"></div>
      <div className="absolute inset-0 z-50 pointer-events-none scanline" aria-hidden="true"></div>
      <div
        className="absolute inset-0 z-40 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
        aria-hidden="true"
      ></div>

      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        className="absolute top-4 right-4 z-[60] text-[10px] md:text-xs border border-white/20 px-2 py-1 bg-black text-white/50 hover:bg-white hover:text-black hover:opacity-100 focus:opacity-100 focus:bg-white focus:text-black transition-all uppercase tracking-wider"
      >
        {isFullscreen ? '[EXIT FULLSCREEN]' : '[FULLSCREEN]'}
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8 mx-auto w-full h-screen">
        {children}
      </div>

      {/* Audio Visualizer */}
      <AudioVisualizer />
    </div>
  );
};