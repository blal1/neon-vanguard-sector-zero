import { GameEvent, RunState } from '../../types';

const derelictShipEvent: GameEvent = {
  id: 'derelict-ship',
  title: 'DERELICT FREIGHTER',
  text: 'You come across the silent, drifting hulk of a massive freighter. Its cargo bay doors are slightly ajar, revealing stacks of containers. The ship is eerily quiet.',
  choices: [
    {
      text: 'SALVAGE THE CARGO',
      outcomeText: 'You carefully pry open a container and find a stash of valuable components and a working consumable.',
      effect: (state: RunState): Partial<RunState> => {
        const newConsumables = [...state.consumables];
        const stim = newConsumables.find(c => c.id === 'nano_stim');
        if (stim) {
          stim.count = Math.min(stim.maxCount, stim.count + 1);
        }
        return {
          scrap: state.scrap + 50,
          consumables: newConsumables,
        };
      },
    },
    {
      text: 'SCAN FOR SURVIVORS',
      outcomeText: 'Your scans reveal no signs of life, but you do detect a faint energy signature. You trace it to a corrupted data log, which you download.',
      effect: (state: RunState): Partial<RunState> => {
        // This could potentially unlock a codex entry in a more advanced implementation
        return {
          scrap: state.scrap + 10,
        };
      },
    },
    {
      text: 'LEAVE IT BE',
      outcomeText: 'The silence feels wrong. You trust your instincts and steer clear of the ghost ship.',
      effect: (state: RunState): Partial<RunState> => ({}),
    },
  ],
};

export default derelictShipEvent;
