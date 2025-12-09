import { GameEvent, RunState } from '../../types';

const distressSignalEvent: GameEvent = {
  id: 'distress-signal',
  title: 'DISTRESS SIGNAL',
  text: 'A faint distress signal pings on your comms system. It seems to be coming from a nearby asteroid field. The signal is weak and intermittent, suggesting low power or heavy interference.',
  choices: [
    {
      text: 'INVESTIGATE THE SIGNAL',
      outcomeText: 'You navigate the treacherous asteroid field and find a small, heavily damaged escape pod. Inside, you find a grateful pilot who offers you some spare parts.',
      effect: (state: RunState): Partial<RunState> => {
        return {
          scrap: state.scrap + 75,
        };
      },
    },
    {
      text: 'IGNORE THE SIGNAL',
      outcomeText: 'The risk is too great. You prioritize your mission and continue on your path, the faint signal eventually fading behind you.',
      effect: (state: RunState): Partial<RunState> => ({}),
    },
    {
      text: 'JAM THE SIGNAL',
      outcomeText: 'You suspect a trap and decide to jam the signal to prevent anyone else from falling for it. This consumes some of your energy, but provides peace of mind.',
      effect: (state: RunState): Partial<RunState> => {
        // This could be more meaningful if energy was part of the RunState
        return {
          scrap: state.scrap - 5, // Representing energy cost
        };
      },
    },
  ],
};

export default distressSignalEvent;
