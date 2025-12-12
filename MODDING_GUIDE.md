# Neon Vanguard - Sector Zero: Modding Guide

## Introduction

Welcome to the Neon Vanguard - Sector Zero modding guide! This document will walk you through the process of adding your own custom content to the game. The game is designed with a data-driven approach, allowing you to easily add new enemies, pilots, events, augmentations, talents, and more.

## Getting Started

All mod files are located in the `/mods` directory. The game will automatically detect and load any new files you add to the subdirectories within `/mods`.

### Directory Structure

*   `/mods/enemies/`: Contains JSON files for new enemies.
*   `/mods/pilots/`: Contains JSON files for new pilots.
*   `/mods/events/`: Contains TypeScript files for new game events.
*   `/mods/augmentations/`: Contains JSON files for new augmentations.
*   `/mods/talents/`: Contains TypeScript files for new talent trees.
*   `/mods/consumables/`: Contains JSON files for new consumables.

---

## Creating a New Enemy

To create a new enemy, simply add a new JSON file to the `/mods/enemies/` directory.

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

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | The name of your enemy |
| `maxHp` | number | Maximum health |
| `speed` | number | Attack speed (higher = faster) |
| `damage` | number | Base attack damage |
| `flavorText` | string | Combat log description |
| `scrapValue` | number | Scrap dropped on defeat |

---

## Creating a New Pilot

Add a JSON file to `/mods/pilots/`:

```json
{
  "id": "your_pilot_id",
  "name": "Your Pilot Name",
  "mechName": "Your Mech Name",
  "flavor": "A short description.",
  "color": "#RRGGBB",
  "textColor": "text-your-color-500",
  "borderColor": "border-your-color-500",
  "statsDescription": "Brief stat overview.",
  "mechanicDescription": "Unique mechanic description.",
  "baseHp": 100,
  "baseSpeed": 100,
  "baseDamage": 10,
  "abilities": [
    {
      "id": "ability_id",
      "name": "Ability Name",
      "description": "What it does.",
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

---

## Creating a New Event

Add a TypeScript file to `/mods/events/`:

```typescript
import { GameEvent, RunState } from '../../types';

const myCustomEvent: GameEvent = {
  id: 'my-custom-event',
  title: 'MY CUSTOM EVENT',
  text: 'Description of the event.',
  choices: [
    {
      text: 'CHOICE 1',
      outcomeText: 'Outcome for choice 1.',
      effect: (state: RunState): Partial<RunState> => ({
        scrap: state.scrap + 10,
      }),
    },
    {
      text: 'CHOICE 2',
      outcomeText: 'Outcome for choice 2.',
      effect: (state: RunState): Partial<RunState> => ({
        currentHp: state.currentHp - 10,
      }),
    },
  ],
};

export default myCustomEvent;
```

---

## Creating a New Augmentation

Augmentations are permanent upgrades purchased at the Hangar. Add a JSON file to `/mods/augmentations/`:

```json
{
  "id": "your_augmentation_id",
  "name": "AUGMENTATION NAME",
  "description": "+Effect description.",
  "rarity": "COMMON",
  "cost": 100,
  "icon": "[A+]",
  "synergyId": "OPTIONAL_SYNERGY_ID"
}
```

### Augmentation Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | Effect description |
| `rarity` | `"COMMON"` \| `"RARE"` \| `"LEGENDARY"` | Rarity tier |
| `cost` | number | Scrap cost |
| `icon` | string | Icon displayed in UI |
| `synergyId` | string? | Optional synergy this belongs to |

### Example Augmentations

```json
// Thermal Converter - Damage scales with heat
{
  "id": "thermal_conv",
  "name": "THERMAL CONVERTER",
  "description": "+1 DMG per 10% HEAT.",
  "rarity": "RARE",
  "cost": 120,
  "icon": "[H+]",
  "synergyId": "INFERNO"
}
```

---

## Creating a New Synergy

Synergies provide bonus effects when specific augmentations or talents are combined. Add to `constants.ts`:

```typescript
export const SYNERGIES: Synergy[] = [
  {
    id: 'YOUR_SYNERGY',
    name: 'SYNERGY NAME',
    description: 'Effect when activated',
    augmentationIds: ['aug_id_1', 'aug_id_2']
  }
];
```

### Synergy Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | SynergyId | Unique identifier |
| `name` | string | Display name |
| `description` | string | Effect description |
| `augmentationIds` | string[] | Required augmentations/talents |
| `effects` | SynergyEffect[]? | Optional effect definitions |

---

## Creating New Talents

Talents are pilot-specific upgrades purchased with Pilot Points. Add to `/constants/talents.ts`:

```typescript
const YOUR_PILOT_TALENTS: Talent[] = [
  {
    id: 'pilot_talent_name',
    name: 'Talent Name',
    description: '+Effect per rank',
    icon: '🔥',
    tier: 1,
    maxRank: 3,
    cost: 1,
    effects: [{ type: 'DAMAGE_PERCENT', value: 10 }]
  },
  {
    id: 'pilot_advanced_talent',
    name: 'Advanced Talent',
    description: 'Requires previous talent',
    icon: '⚡',
    tier: 2,
    maxRank: 2,
    cost: 2,
    effects: [{ type: 'CRIT_CHANCE', value: 5 }],
    requires: ['pilot_talent_name']
  }
];
```

### Talent Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | Effect description |
| `icon` | string | Emoji icon |
| `tier` | 1 \| 2 \| 3 | Talent tier (unlock order) |
| `maxRank` | number | Maximum ranks purchasable |
| `cost` | number | Pilot Points per rank |
| `effects` | TalentEffect[] | Effect type and value |
| `requires` | string[]? | Prerequisite talent IDs |

### Available Effect Types

| Effect Type | Description |
|-------------|-------------|
| `MAX_HP_PERCENT` | +X% maximum HP |
| `MAX_HP_FLAT` | +X flat HP |
| `DAMAGE_PERCENT` | +X% damage |
| `CRIT_CHANCE` | +X% crit chance |
| `CRIT_DAMAGE` | +X% crit damage |
| `DODGE_CHANCE` | +X% dodge chance |
| `ENERGY_MAX` | +X max energy |
| `COOLDOWN_REDUCTION` | -X% cooldowns |
| `THORNS_DAMAGE` | Reflect X% damage |

---

## Creating New Consumables

Consumables are single-use items. Add to `/mods/consumables/`:

```json
{
  "id": "custom_item",
  "name": "CUSTOM ITEM",
  "description": "Effect description.",
  "count": 2,
  "maxCount": 2,
  "color": "text-green-400 border-green-400",
  "cost": 30
}
```

### Consumable Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | Effect description |
| `count` | number | Starting quantity |
| `maxCount` | number | Maximum stack size |
| `color` | string | Tailwind CSS classes |
| `cost` | number | Shop purchase price |

---

## API Reference

### RunState Object

The `RunState` object represents the current game state:

```typescript
interface RunState {
  isActive: boolean;
  pilotId: PilotId;
  moduleId: PilotModule;
  currentStage: number;
  currentHp: number;
  maxHpUpgrade: number;
  damageUpgrade: number;
  scrap: number;
  augmentations: string[];
  consumables: Consumable[];
}
```

### Combat Modifiers

When implementing effects, you can modify:

| Modifier | Where | Effect |
|----------|-------|--------|
| Damage | `combatUtils.ts` | Multiply/add to damage |
| HP | `calculateMaxHp()` | Increase max HP |
| Cooldowns | Ability usage | Reduce ability cooldowns |
| Status Effects | Enemy/player | Apply BURN, STUN, etc. |

---

## Best Practices

1. **Test thoroughly** - Use the Test Runner to verify your mods work
2. **Use unique IDs** - Prefix with your mod name (e.g., `mymod_fire_enemy`)
3. **Balance carefully** - Compare stats to existing content
4. **Document effects** - Clear descriptions help players

## Next Steps

Now that you have the knowledge to create your own mods, start experimenting! Create new enemies, pilots, talents, or events. Consult existing files in `/constants` and `/data` for examples.

