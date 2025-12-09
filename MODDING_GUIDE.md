# Neon Vanguard - Sector Zero: Modding Guide

## Introduction

Welcome to the Neon Vanguard - Sector Zero modding guide! This document will walk you through the process of adding your own custom content to the game. The game is designed with a data-driven approach, allowing you to easily add new enemies, pilots, and events by creating simple JSON or TypeScript files.

## Getting Started

All mod files are located in the `/mods` directory. The game will automatically detect and load any new files you add to the subdirectories within `/mods`.

### Directory Structure

*   `/mods/enemies/`: Contains JSON files for new enemies.
*   `/mods/pilots/`: Contains JSON files for new pilots.
*   `/mods/events/`: Contains TypeScript files for new game events.

## Creating a New Enemy

To create a new enemy, simply add a new JSON file to the `/mods/enemies/` directory. The JSON file should have the following structure:

```json
{
  "name": "YOUR_ENEMY_NAME",
  "maxHp": 100,
  "speed": 1.0,
  "damage": 10,
  "flavorText": "A description of your enemy's attack.",
  "scrapValue": 20
}
```

### Enemy Properties

*   `name` (string): The name of your enemy.
*   `maxHp` (number): The maximum health of your enemy.
*   `speed` (number): The speed of your enemy's attacks (higher is faster).
*   `damage` (number): The base damage of your enemy's attacks.
*   `flavorText` (string): A short description of your enemy's attack, displayed in the combat log.
*   `scrapValue` (number): The amount of scrap dropped when the enemy is defeated.

**Example:** See `/mods/enemies/berserker.json`

## Creating a New Pilot

To create a new pilot, add a new JSON file to the `/mods/pilots/` directory. The JSON file should have the following structure:

```json
{
  "id": "your_pilot_id",
  "name": "Your Pilot Name",
  "mechName": "Your Mech Name",
  "flavor": "A short, flavorful description of your pilot.",
  "color": "#RRGGBB",
  "textColor": "text-your-color-500",
  "borderColor": "border-your-color-500",
  "statsDescription": "A brief overview of the pilot's stats.",
  "mechanicDescription": "A description of the pilot's unique mechanic.",
  "baseHp": 100,
  "baseSpeed": 100,
  "baseDamage": 10,
  "abilities": [
    {
      "id": "ability_id",
      "name": "Ability Name",
      "description": "A description of the ability.",
      "damageMult": 1.0,
      "cooldownMs": 5000,
      "energyCost": 20,
      "isAoe": false,
      "stuns": false
    }
  ],
  "unlockLevel": 1,
  "unlockKills": 0
}
```

### Pilot Properties

*   `id` (string): A unique identifier for your pilot.
*   `name` (string): The name of your pilot.
*   `mechName` (string): The name of your pilot's mech.
*   `flavor` (string): A short, flavorful description of your pilot.
*   `color` (string): A hex color code for your pilot's UI theme.
*   `textColor` (string): A Tailwind CSS class for your pilot's text color.
*   `borderColor` (string): A Tailwind CSS class for your pilot's border color.
*   `statsDescription` (string): A brief overview of the pilot's stats.
*   `mechanicDescription` (string): A description of the pilot's unique mechanic.
*   `baseHp` (number): The base health of the pilot.
*   `baseSpeed` (number): The base speed of the pilot.
*   `baseDamage` (number): The base damage of the pilot.
*   `abilities` (array): An array of ability objects.
    *   `id` (string): A unique identifier for the ability.
    *   `name` (string): The name of the ability.
    *   `description` (string): A description of the ability.
    *   `damageMult` (number): A multiplier for the pilot's base damage.
    *   `cooldownMs` (number): The cooldown of the ability in milliseconds.
    *   `energyCost` (number): The energy cost of the ability.
    *   `isAoe` (boolean): Whether the ability affects all enemies.
    *   `stuns` (boolean): Whether the ability stuns enemies.
*   `unlockLevel` (number): The player level required to unlock the pilot.
*   `unlockKills` (number): The number of kills required to unlock the pilot.

**Example:** See `/mods/pilots/ghost.json`

## Creating a New Event

To create a new event, add a new TypeScript file to the `/mods/events/` directory. The file should export a `GameEvent` object.

```typescript
import { GameEvent, RunState } from '../../types';

const myCustomEvent: GameEvent = {
  id: 'my-custom-event',
  title: 'MY CUSTOM EVENT',
  text: 'A description of the event that occurred.',
  choices: [
    {
      text: 'CHOICE 1',
      outcomeText: 'The outcome of choice 1.',
      effect: (state: RunState): Partial<RunState> => {
        // Modify the game state here
        return {
          scrap: state.scrap + 10,
        };
      },
    },
    {
      text: 'CHOICE 2',
      outcomeText: 'The outcome of choice 2.',
      effect: (state: RunState): Partial<RunState> => {
        // Modify the game state here
        return {
          currentHp: state.currentHp - 10,
        };
      },
    },
  ],
};

export default myCustomEvent;
```

### Event Properties

*   `id` (string): A unique identifier for the event.
*   `title` (string): The title of the event.
*   `text` (string): The main text of the event.
*   `choices` (array): An array of choice objects.
    *   `text` (string): The text for the choice button.
    *   `outcomeText` (string): The text displayed after the choice is made.
    *   `effect` (function): A function that takes the current `RunState` and returns a `Partial<RunState>` with the modified state.

**Example:** See `/mods/events/derelict-ship.ts`

## Next Steps

Now that you have the knowledge to create your own mods, it's time to start experimenting! Try creating a new enemy, pilot, or event and see it come to life in the game. If you have any questions, feel free to consult the existing mod files for examples.
