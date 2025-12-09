import React, { useState } from 'react';
import { CONSUMABLES } from '../constants';
import { getAllPilots } from '../data/dataManager';
import { PilotConfig, PilotModule, Consumable } from '../types';
import { audio } from '../services/audioService';
import { useGame } from '../context/GameContext';
import { LoadoutManager } from './LoadoutManager';
import { DifficultySelect } from './DifficultySelect';
import { DIFFICULTIES } from '../constants';

interface CharacterSelectProps {
  onSelect: (pilot: PilotConfig, module: PilotModule, consumables: Consumable[]) => void;
  onRunTests: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onRunTests }) => {
  const { profile, settings, toggleSetting, isPilotUnlocked, applyLoadout, difficulty, dailyModifier } = useGame();
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [selectedModule, setSelectedModule] = useState<PilotModule>('ASSAULT');
  const [selectedConsumables, setSelectedConsumables] = useState<string[]>([]);
  const [showLoadoutManager, setShowLoadoutManager] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);

  const current = getAllPilots()[hoveredIndex];
  const isUnlocked = isPilotUnlocked(current);

  const toggleConsumable = (id: string) => {
    setSelectedConsumables(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      if (prev.length < 2) {
        audio.playHover();
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleApplyLoadout = (loadoutId: string) => {
    const result = applyLoadout(loadoutId);
    if (result) {
      // Find pilot index
      const pilotIndex = getAllPilots().findIndex(p => p.id === result.pilot.id);
      if (pilotIndex !== -1) {
        setHoveredIndex(pilotIndex);
      }
      setSelectedModule(result.module);
      setSelectedConsumables(result.consumables.map(c => c.id));
      audio.playBlip();
    }
  };

  const handleLaunch = () => {
    if (!isUnlocked) {
      audio.playAlarm();
      return;
    }
    audio.playBlip();
    const consumables = CONSUMABLES.filter(c => selectedConsumables.includes(c.id));
    onSelect(current, selectedModule, consumables);
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <header className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold animate-pulse text-white" style={{ textShadow: '0 0 10px white' }}>
            NEON VANGUARD: SECTOR ZERO
          </h1>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm font-mono text-gray-400 mt-2">
            <span>OPERATOR LEVEL: <span className="text-white font-bold">{profile.level}</span></span>
            <span>XP: {profile.xp}/{profile.level * 100}</span>
            <span>KILLS: {profile.totalKills}</span>
            <span>MISSIONS: {profile.missionsCompleted}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => toggleSetting('slowLogs')}
              className={`text-[10px] border px-2 py-1 ${settings.slowLogs ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-500'}`}
            >
              SLOW LOGS
            </button>
            <button
              onClick={() => toggleSetting('reduceMotion')}
              className={`text-[10px] border px-2 py-1 ${settings.reduceMotion ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-500'}`}
            >
              REDUCE MOTION
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { audio.playBlip(); setShowDifficultySelect(true); }}
              className="text-[10px] md:text-xs border border-yellow-500 text-yellow-400 px-3 py-1 hover:bg-yellow-900/50 uppercase tracking-widest"
            >
              {DIFFICULTIES[difficulty].icon} {DIFFICULTIES[difficulty].name}
            </button>
            <button
              onClick={() => { audio.playBlip(); setShowLoadoutManager(true); }}
              className="text-[10px] md:text-xs border border-cyan-500 text-cyan-400 px-3 py-1 hover:bg-cyan-900/50 uppercase tracking-widest"
            >
              💾 LOADOUTS
            </button>
          </div>
          {dailyModifier !== 'NONE' && (
            <div className="text-[10px] border border-purple-500 text-purple-400 px-3 py-1 uppercase tracking-widest bg-purple-900/20">
              📅 Daily: {dailyModifier.replace('_', ' ')}
            </div>
          )}
          <button
            onClick={onRunTests}
            className="text-[10px] md:text-xs border border-gray-700 text-gray-500 px-3 py-1 hover:border-red-500 hover:text-red-500 uppercase tracking-widest"
          >
            [RUN DIAGNOSTICS]
          </button>
        </div>
      </header>

      <main className="flex flex-col md:flex-row border-y border-white/20 bg-black/50 backdrop-blur-sm flex-1" role="main">
        {/* Pilot List */}
        <div className="w-full md:w-1/4 border-r border-white/20 flex flex-col" role="region" aria-label="Pilot Selection">
          <div role="list" aria-label="Select Pilot" className="overflow-y-auto flex-1 md:h-auto h-48">
            {getAllPilots().map((pilot, idx) => {
              const pilotUnlocked = isPilotUnlocked(pilot);
              return (
                <button
                  key={pilot.id}
                  role="listitem"
                  aria-selected={idx === hoveredIndex}
                  className={`w-full text-left px-4 py-4 cursor-pointer transition-all border-l-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 ${idx === hoveredIndex
                    ? `bg-white text-black font-bold border-${pilot.color.replace('#', '')} pl-6`
                    : 'border-transparent text-gray-400 hover:text-white hover:pl-5 focus:pl-5 focus:text-white'
                    } ${!pilotUnlocked ? 'opacity-50' : ''}`}
                  onClick={() => { setHoveredIndex(idx); audio.playBlip(); }}
                  onMouseEnter={() => { setHoveredIndex(idx); audio.playHover(); }}
                  onFocus={() => { setHoveredIndex(idx); audio.playHover(); }}
                >
                  <div className="flex justify-between items-center">
                    <span>{pilot.name}</span>
                    {!pilotUnlocked && <span className="text-[10px] border border-gray-600 px-1 text-gray-500">LOCKED</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Details Panel */}
        <section
          className="w-full md:w-3/4 p-6 flex flex-col relative overflow-hidden transition-colors duration-500"
          style={{ color: isUnlocked ? current.color : '#555' }}
          aria-live="polite"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-4xl font-bold mb-1 ${isUnlocked ? current.textColor : 'text-gray-500'} drop-shadow-md`}>
                {isUnlocked ? current.mechName : 'CLASSIFIED DATA'}
              </h2>
              <div className="text-sm uppercase tracking-widest mb-4 border-b border-current pb-2 inline-block opacity-80">
                {isUnlocked ? current.statsDescription : 'ENCRYPTION ACTIVE'}
              </div>
            </div>
            <div className="text-6xl font-bold opacity-20 select-none hidden md:block">0{hoveredIndex + 1}</div>
          </div>

          {isUnlocked ? (
            <>
              <p className="mb-4 text-base leading-relaxed text-white font-light italic">"{current.flavor}"</p>

              {/* Config Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Module Select */}
                <div role="group" aria-label="Combat Module">
                  <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest border-b border-gray-800">Combat Module</div>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 border p-2 text-left transition-all focus:outline-none ${selectedModule === 'ASSAULT' ? 'bg-white/20 border-white ring-1 ring-white' : 'border-gray-700 opacity-50 hover:bg-white/10 hover:opacity-100'
                        }`}
                      aria-pressed={selectedModule === 'ASSAULT'}
                      onClick={() => { setSelectedModule('ASSAULT'); audio.playHover(); }}
                    >
                      <div className="font-bold text-white text-sm">ASSAULT</div>
                      <div className="text-[10px] text-red-300">+DMG / -HP</div>
                    </button>
                    <button
                      className={`flex-1 border p-2 text-left transition-all focus:outline-none ${selectedModule === 'DEFENSE' ? 'bg-white/20 border-white ring-1 ring-white' : 'border-gray-700 opacity-50 hover:bg-white/10 hover:opacity-100'
                        }`}
                      aria-pressed={selectedModule === 'DEFENSE'}
                      onClick={() => { setSelectedModule('DEFENSE'); audio.playHover(); }}
                    >
                      <div className="font-bold text-white text-sm">DEFENSE</div>
                      <div className="text-[10px] text-blue-300">+HP / -SPD</div>
                    </button>
                  </div>
                </div>

                {/* Consumables Select */}
                <div role="group" aria-label="Loadout">
                  <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest border-b border-gray-800 flex justify-between">
                    <span>Loadout</span>
                    <span className={selectedConsumables.length === 2 ? 'text-white' : ''}>{selectedConsumables.length}/2 SLOTS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CONSUMABLES.map(item => {
                      const isSelected = selectedConsumables.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleConsumable(item.id)}
                          disabled={!isSelected && selectedConsumables.length >= 2}
                          className={`text-left border p-1 px-2 text-[10px] transition-all flex justify-between items-center ${isSelected ? `border-white bg-white/10 ${item.color.split(' ')[0]}` : 'border-gray-800 text-gray-500 hover:border-gray-600'
                            } ${!isSelected && selectedConsumables.length >= 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <span>{item.name}</span>
                          {isSelected && <span className="text-white">Equipped</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-gray-900/80 p-3 border border-current shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <strong className="block mb-1 text-xs opacity-70 text-white">TACTICAL SYSTEMS:</strong>
                <p className="font-mono text-xs md:text-sm text-gray-300">{current.mechanicDescription}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full border border-gray-800 bg-gray-900/50 p-6 text-center">
              <div className="text-red-500 font-bold text-2xl mb-2 animate-pulse">ACCESS DENIED</div>
              <p className="text-gray-400 mb-4">PILOT CLEARANCE INSUFFICIENT.</p>
              <div className="border border-red-900 p-2 text-sm text-red-300">
                REQUIRED: <br />
                {current.unlockLevel ? `OPERATOR LEVEL ${current.unlockLevel}` : ''}
                {current.unlockKills ? `${current.unlockKills} TOTAL KILLS` : ''}
              </div>
            </div>
          )}

          <button
            onClick={handleLaunch}
            disabled={!isUnlocked}
            className={`mt-4 py-3 px-6 border-2 font-bold transition-all duration-200 uppercase tracking-wider w-full focus:outline-none focus:ring-4 focus:ring-white/50 ${isUnlocked
              ? `${current.borderColor} ${current.textColor} hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]`
              : 'border-gray-800 text-gray-600 cursor-not-allowed'
              }`}
          >
            {isUnlocked ? 'Initialize Neural Link [ENTER]' : 'LOCKED'}
          </button>
        </section>
      </main>

      {/* Loadout Manager Modal */}
      {showLoadoutManager && (
        <LoadoutManager
          onClose={() => setShowLoadoutManager(false)}
          onApplyLoadout={handleApplyLoadout}
        />
      )}

      {/* Difficulty Select Modal */}
      {showDifficultySelect && (
        <DifficultySelect onClose={() => setShowDifficultySelect(false)} />
      )}
    </div>
  );
};
