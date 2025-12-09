import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getAllEvents } from '../data/dataManager';
import { audio } from '../services/audioService';

interface NarrativeScreenProps {
  onContinue: () => void;
}

export const NarrativeScreen: React.FC<NarrativeScreenProps> = ({ onContinue }) => {
  const { updateRunState, runState } = useGame();
  const [event, setEvent] = useState(getAllEvents()[0]);
  const [outcome, setOutcome] = useState<string | null>(null);

  useEffect(() => {
    const allEvents = getAllEvents();
    const randomEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
    setEvent(randomEvent);
  }, []);

  const handleChoice = (index: number) => {
    const choice = event.choices[index];
    const updates = choice.effect(runState);
    updateRunState(updates);
    setOutcome(choice.outcomeText);
    audio.playBlip();
  };

  return (
    <div className="flex flex-col h-full text-white font-mono p-4 md:p-12 justify-center max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-2">{event.title}</h1>
      
      {!outcome ? (
        <>
          <p className="text-lg leading-relaxed mb-8 text-gray-300">{event.text}</p>
          <div className="grid gap-4">
            {event.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className="text-left border border-gray-600 p-4 hover:bg-gray-800 hover:border-white transition-all focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="font-bold block mb-1">» {choice.text}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-pulse">
           <p className="text-lg leading-relaxed mb-8 text-gray-300 border-l-4 border-white pl-4 italic">
             "{outcome}"
           </p>
           <button 
             onClick={onContinue}
             className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200"
           >
             CONTINUE MISSION
           </button>
        </div>
      )}
    </div>
  );
};