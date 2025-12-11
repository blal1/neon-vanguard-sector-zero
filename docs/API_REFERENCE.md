# API Reference

Reference documentation for the main APIs of **Neon Vanguard: Sector Zero**.

## GameContext API

The `GameContext` is the heart of state management. It provides global state and actions to modify it.

### Usage

```typescript
import { useGame } from './context/GameContext';

const MyComponent = () => {
  const { profile, addXp, startRun } = useGame();
  
  // Use state and actions
};
```

### State

#### `profile: PlayerProfile`

Persisted player profile.

```typescript
interface PlayerProfile {
  xp: number;              // Experience points
  level: number;           // Current level
  missionsCompleted: number;
  totalKills: number;
}
```

#### `settings: GameSettings`

Game configuration.

```typescript
interface GameSettings {
  // Audio
  volume: number;              // 0.0 - 1.0
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  voiceLinesEnabled: boolean;
  
  // Visual
  showDamageNumbers: boolean;
  screenShake: boolean;
  reduceMotion: boolean;
  performanceMode: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Gameplay
  combatSpeed: 'slow' | 'normal' | 'fast';
  tutorialCompleted: boolean;
  combatLogFontSize: number;
  keybindings: Record<string, string>;
}
```

#### `runState: RunState`

Active run state.

```typescript
interface RunState {
  isActive: boolean;
  currentStage: number;        // 1-5
  scrap: number;
  currentHp: number;
  maxHpUpgrade: number;
  damageUpgrade: number;
  consumables: Consumable[];
  augmentations: string[];     // IDs
  pilotId?: PilotId;
  moduleId?: PilotModule;
  missionType?: MissionType;
}
```

#### `stats: GameStats`

Detailed game statistics.

```typescript
interface GameStats {
  // Combat
  totalDamageDealt: number;
  totalDamageTaken: number;
  criticalHits: number;
  abilitiesUsed: number;
  
  // Victories
  fastestWinTime: number;
  longestWinStreak: number;
  currentWinStreak: number;
  perfectRuns: number;
  
  // Boss
  bossesDefeated: number;
  bossesDefeatedLowHp: number;
  bossesPerfect: number;
  
  // Items
  consumablesUsed: number;
  augmentationsOwned: string[];
  pilotsUnlocked: string[];
  
  // Detailed statistics
  runsCompleted: number;
  runsFailed: number;
  pilotStats: Record<string, PilotStats>;
  enemiesKilledByType: Record<string, number>;
  // ... see types.ts for complete list
}
```

#### `achievements: AchievementProgress[]`

Unlocked achievements.

```typescript
interface AchievementProgress {
  achievementId: string;
  unlockedAt: number;          // Timestamp
  justUnlocked?: boolean;      // For notifications
}
```

#### `loadouts: Loadout[]`

Saved configurations.

```typescript
interface Loadout {
  id: string;
  name: string;
  pilotId: PilotId;
  module: PilotModule;
  consumables: Consumable[];
  color: string;
  createdAt: number;
  lastUsed?: number;
}
```

#### `difficulty: DifficultyLevel`

Current difficulty level.

```typescript
type DifficultyLevel = 'RECRUIT' | 'VETERAN' | 'ELITE' | 'NIGHTMARE';
```

#### `lives: number`

Remaining lives (depending on difficulty).

#### `endlessState: EndlessRunState`

Endless mode state.

```typescript
interface EndlessRunState {
  isActive: boolean;
  currentWave: number;
  totalKills: number;
  waveKills: number;
  startTime: number;
  currentHp: number;
  maxHp: number;
  baseDamage: number;
  scrap: number;
  consumables: Consumable[];
  augmentations: string[];
  appliedUpgrades: string[];
  cooldownReduction: number;
}
```

### Actions

#### Profile & Progression

##### `addXp(amount: number): void`

Adds XP and levels up if necessary.

```typescript
addXp(50); // Adds 50 XP
```

##### `addKill(): void`

Increments the kill counter.

```typescript
addKill();
```

#### Run Management

##### `startRun(pilot: PilotConfig, module: PilotModule, consumables: Consumable[]): void`

Starts a new run.

```typescript
const pilot = getPilotById('vanguard');
startRun(pilot, 'ASSAULT', [medKit, empGrenade]);
```

##### `endRun(): void`

Ends the active run.

```typescript
endRun();
```

##### `advanceStage(): void`

Advances to the next sector.

```typescript
advanceStage(); // Stage 1 -> 2
```

##### `updateRunHp(hp: number): void`

Updates the run's HP.

```typescript
updateRunHp(80);
```

##### `updateRunConsumables(consumables: Consumable[]): void`

Updates the run's consumables.

```typescript
updateRunConsumables([...newConsumables]);
```

##### `updateRunState(updates: Partial<RunState>): void`

Partial update of the run state.

```typescript
updateRunState({ scrap: runState.scrap + 100 });
```

#### Shop & Upgrades

##### `addScrap(amount: number): void`

Adds scrap to the active run.

```typescript
addScrap(50);
```

##### `purchaseUpgrade(type: 'hp' | 'dmg' | 'repair' | 'item' | 'aug', itemId?: string, cost?: number): void`

Purchases an upgrade at the hangar.

```typescript
purchaseUpgrade('hp'); // +20 Max HP
purchaseUpgrade('repair'); // Full heal
purchaseUpgrade('aug', 'shield-boost', 30); // Augmentation
```

##### `purchaseAugmentation(augmentationId: string, cost: number): void`

Purchases an augmentation.

```typescript
purchaseAugmentation('shield-matrix', 40);
```

#### Settings

##### `toggleSetting(setting: keyof GameSettings): void`

Toggles a boolean setting.

```typescript
toggleSetting('isMuted');
toggleSetting('showDamageNumbers');
```

##### `updateSettings(updates: Partial<GameSettings>): void`

Updates multiple settings.

```typescript
updateSettings({
  volume: 0.7,
  musicVolume: 0.5,
  colorblindMode: 'protanopia'
});
```

#### Achievements

##### `checkAchievements(): AchievementProgress[]`

Checks and unlocks achievements.

```typescript
const newAchievements = checkAchievements();
```

##### `recordStat(stat: keyof GameStats, value: number | string | string[]): void`

Records a statistic.

```typescript
recordStat('fastestWinTime', 180);
```

##### `incrementStat(stat: keyof GameStats, amount?: number): void`

Increments a statistic.

```typescript
incrementStat('bossesDefeated');
incrementStat('totalKills', 1);
```

##### `recordDamageDealt(amount: number): void`

Records damage dealt.

```typescript
recordDamageDealt(150);
```

##### `recordDamageTaken(amount: number): void`

Records damage taken.

```typescript
recordDamageTaken(50);
```

##### `recordCriticalHit(): void`

Records a critical hit.

```typescript
recordCriticalHit();
```

#### Loadouts

##### `createLoadout(name: string, pilotId: PilotId, module: PilotModule, consumables: Consumable[], color: string): void`

Creates a loadout.

```typescript
createLoadout('Tank Build', 'vanguard', 'DEFENSE', consumables, '#00ff00');
```

##### `updateLoadout(id: string, updates: Partial<Loadout>): void`

Updates a loadout.

```typescript
updateLoadout('loadout-123', { name: 'New Name' });
```

##### `deleteLoadout(id: string): void`

Deletes a loadout.

```typescript
deleteLoadout('loadout-123');
```

##### `applyLoadout(id: string): { pilot, module, consumables } | null`

Loads a loadout.

```typescript
const applied = applyLoadout('loadout-123');
if (applied) {
  startRun(applied.pilot, applied.module, applied.consumables);
}
```

#### Difficulty

##### `setDifficulty(level: DifficultyLevel): void`

Changes the difficulty level.

```typescript
setDifficulty('VETERAN');
```

##### `loseLife(): void`

Loses a life (modes with limited lives).

```typescript
loseLife();
```

#### Endless Mode

##### `startEndlessRun(pilot: PilotConfig, module: PilotModule, consumables: Consumable[]): void`

Starts an Endless run.

```typescript
startEndlessRun(pilot, 'ASSAULT', consumables);
```

##### `endEndlessRun(): void`

Ends the Endless run and records the score.

```typescript
endEndlessRun();
```

##### `advanceEndlessWave(): void`

Advances to the next wave.

```typescript
advanceEndlessWave();
```

##### `applyEndlessUpgrade(upgradeId: string): void`

Applies an Endless upgrade.

```typescript
applyEndlessUpgrade('damage-boost');
```

## Services API

### AudioService

Service for managing game audio.

#### Imports

```typescript
import { audio } from './services/audioService';
```

#### Methods

##### `preloadAssets(): Promise<void>`

Preloads all audio assets.

```typescript
await audio.preloadAssets();
```

##### `playBlip(): void`

Plays a UI sound.

```typescript
audio.playBlip();
```

##### `playMusic(type: 'combat' | 'stage' | 'boss' | 'victory' | 'defeat'): void`

Plays music.

```typescript
audio.playMusic('combat');
```

##### `stopMusic(): void`

Stops the music.

```typescript
audio.stopMusic();
```

##### `playSound(soundId: string): void`

Plays a sound effect.

```typescript
audio.playSound('explosion');
```

##### `setVolume(volume: number): void`

Changes the master volume (0.0 - 1.0).

```typescript
audio.setVolume(0.8);
```

### TTSService

Text-to-Speech service.

#### Imports

```typescript
import { tts, gameTTS } from './services/ttsService';
```

#### Methods

##### `tts.speak(text: string, options?: SpeechOptions): void`

Reads text aloud.

```typescript
tts.speak('Welcome to Neon Vanguard', { rate: 1.0, pitch: 1.0 });
```

##### `gameTTS.announce(message: string, priority?: 'polite' | 'assertive'): void`

Announces a message with priority.

```typescript
gameTTS.announce('Enemy defeated', 'polite');
```

## Utils API

### combatUtils

Combat calculation functions.

#### Imports

```typescript
import { calculateDamage, applyConsumableEffect } from './utils/combatUtils';
```

#### Functions

##### `calculateDamage(baseDamage: number, multiplier: number, isCritical: boolean, isWeakPoint?: boolean): number`

Calculates attack damage.

```typescript
const damage = calculateDamage(100, 1.5, true, false);
// = 100 * 1.5 * 1.5 (crit) = 225
```

##### `applyConsumableEffect(consumableId: string, player: Player, enemies: Enemy[]): void`

Applies a consumable's effect.

```typescript
applyConsumableEffect('med-kit', playerState, enemyList);
```

### synergyUtils

Augmentation synergy management.

#### Imports

```typescript
import { getActiveSynergies, applySynergyEffect } from './utils/synergyUtils';
```

#### Functions

##### `getActiveSynergies(augmentationIds: string[]): Synergy[]`

Returns active synergies.

```typescript
const synergies = getActiveSynergies(['shield-boost', 'armor-plating']);
```

##### `applySynergyEffect(synergyId: SynergyId, state: CombatState): void`

Applies a synergy effect.

```typescript
applySynergyEffect('INFERNO', combatState);
```

---

## Quick Type Reference

### Enums

```typescript
enum GameState {
  MENU, BRIEFING, COMBAT, HANGAR, EVENT, VICTORY, DEFEAT, ENDLESS
}

enum PilotId {
  VANGUARD, SOLARIS, HYDRA, WYRM, GHOST
}

type PilotModule = 'ASSAULT' | 'DEFENSE';
type HazardType = 'NONE' | 'ACID_RAIN' | 'ION_STORM' | 'SEISMIC_ACTIVITY';
type DifficultyLevel = 'RECRUIT' | 'VETERAN' | 'ELITE' | 'NIGHTMARE';
```

### Main Interfaces

See [`types.ts`](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App/neon-vanguard_-sector-zero/types.ts) for the complete list.

---

**Last Updated**: 2025-12-11
