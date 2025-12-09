# API Reference

Documentation de référence des APIs principales de **Neon Vanguard: Sector Zero**.

## GameContext API

Le `GameContext` est le cœur du state management. Il fournit l'état global et les actions pour le modifier.

### Utilisation

```typescript
import { useGame } from './context/GameContext';

const MyComponent = () => {
  const { profile, addXp, startRun } = useGame();
  
  // Utiliser l'état et les actions
};
```

### État (State)

#### `profile: PlayerProfile`

Profil du joueur persisté.

```typescript
interface PlayerProfile {
  xp: number;              // Points d'expérience
  level: number;           // Niveau actuel
  missionsCompleted: number;
  totalKills: number;
}
```

#### `settings: GameSettings`

Configuration du jeu.

```typescript
interface GameSettings {
  // Audio
  volume: number;              // 0.0 - 1.0
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  voiceLinesEnabled: boolean;
  
  // Visuel
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

État du run actif.

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

Statistiques de jeu détaillées.

```typescript
interface GameStats {
  // Combat
  totalDamageDealt: number;
  totalDamageTaken: number;
  criticalHits: number;
  abilitiesUsed: number;
  
  // Victoires
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
  
  // Statistiques détaillées
  runsCompleted: number;
  runsFailed: number;
  pilotStats: Record<string, PilotStats>;
  enemiesKilledByType: Record<string, number>;
  // ... voir types.ts pour liste complète
}
```

#### `achievements: AchievementProgress[]`

Achievements débloqués.

```typescript
interface AchievementProgress {
  achievementId: string;
  unlockedAt: number;          // Timestamp
  justUnlocked?: boolean;      // Pour notifications
}
```

#### `loadouts: Loadout[]`

Configurations sauvegardées.

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

Niveau de difficulté actuel.

```typescript
type DifficultyLevel = 'RECRUIT' | 'VETERAN' | 'ELITE' | 'NIGHTMARE';
```

#### `lives: number`

Vies restantes (selon difficulté).

#### `endlessState: EndlessRunState`

État du mode Endless.

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

#### Profil & Progression

##### `addXp(amount: number): void`

Ajoute de l'XP et level up si nécessaire.

```typescript
addXp(50); // Ajoute 50 XP
```

##### `addKill(): void`

Incrémente le compteur de kills.

```typescript
addKill();
```

#### Run Management

##### `startRun(pilot: PilotConfig, module: PilotModule, consumables: Consumable[]): void`

Démarre un nouveau run.

```typescript
const pilot = getPilotById('vanguard');
startRun(pilot, 'ASSAULT', [medKit, empGrenade]);
```

##### `endRun(): void`

Termine le run actif.

```typescript
endRun();
```

##### `advanceStage(): void`

Passe au secteur suivant.

```typescript
advanceStage(); // Stage 1 -> 2
```

##### `updateRunHp(hp: number): void`

Met à jour les HP du run.

```typescript
updateRunHp(80);
```

##### `updateRunConsumables(consumables: Consumable[]): void`

Met à jour les consommables du run.

```typescript
updateRunConsumables([...newConsumables]);
```

##### `updateRunState(updates: Partial<RunState>): void`

Mise à jour partielle du run state.

```typescript
updateRunState({ scrap: runState.scrap + 100 });
```

#### Shop & Upgrades

##### `addScrap(amount: number): void`

Ajoute du scrap au run actif.

```typescript
addScrap(50);
```

##### `purchaseUpgrade(type: 'hp' | 'dmg' | 'repair' | 'item' | 'aug', itemId?: string, cost?: number): void`

Achète un upgrade au hangar.

```typescript
purchaseUpgrade('hp'); // +20 Max HP
purchaseUpgrade('repair'); // Full heal
purchaseUpgrade('aug', 'shield-boost', 30); // Augmentation
```

##### `purchaseAugmentation(augmentationId: string, cost: number): void`

Achète une augmentation.

```typescript
purchaseAugmentation('shield-matrix', 40);
```

#### Settings

##### `toggleSetting(setting: keyof GameSettings): void`

Toggle un setting boolean.

```typescript
toggleSetting('isMuted');
toggleSetting('showDamageNumbers');
```

##### `updateSettings(updates: Partial<GameSettings>): void`

Met à jour plusieurs settings.

```typescript
updateSettings({
  volume: 0.7,
  musicVolume: 0.5,
  colorblindMode: 'protanopia'
});
```

#### Achievements

##### `checkAchievements(): AchievementProgress[]`

Vérifie et unlock les achievements.

```typescript
const newAchievements = checkAchievements();
```

##### `recordStat(stat: keyof GameStats, value: number | string | string[]): void`

Enregistre une statistique.

```typescript
recordStat('fastestWinTime', 180);
```

##### `incrementStat(stat: keyof GameStats, amount?: number): void`

Incrémente une statistique.

```typescript
incrementStat('bossesDefeated');
incrementStat('totalKills', 1);
```

##### `recordDamageDealt(amount: number): void`

Enregistre dégâts infligés.

```typescript
recordDamageDealt(150);
```

##### `recordDamageTaken(amount: number): void`

Enregistre dégâts reçus.

```typescript
recordDamageTaken(50);
```

##### `recordCriticalHit(): void`

Enregistre un coup critique.

```typescript
recordCriticalHit();
```

#### Loadouts

##### `createLoadout(name: string, pilotId: PilotId, module: PilotModule, consumables: Consumable[], color: string): void`

Crée un loadout.

```typescript
createLoadout('Tank Build', 'vanguard', 'DEFENSE', consumables, '#00ff00');
```

##### `updateLoadout(id: string, updates: Partial<Loadout>): void`

Met à jour un loadout.

```typescript
updateLoadout('loadout-123', { name: 'New Name' });
```

##### `deleteLoadout(id: string): void`

Supprime un loadout.

```typescript
deleteLoadout('loadout-123');
```

##### `applyLoadout(id: string): { pilot, module, consumables } | null`

Charge un loadout.

```typescript
const applied = applyLoadout('loadout-123');
if (applied) {
  startRun(applied.pilot, applied.module, applied.consumables);
}
```

#### Difficulty

##### `setDifficulty(level: DifficultyLevel): void`

Change le niveau de difficulté.

```typescript
setDifficulty('VETERAN');
```

##### `loseLife(): void`

Perd une vie (modes avec vies limitées).

```typescript
loseLife();
```

#### Endless Mode

##### `startEndlessRun(pilot: PilotConfig, module: PilotModule, consumables: Consumable[]): void`

Démarre un run Endless.

```typescript
startEndlessRun(pilot, 'ASSAULT', consumables);
```

##### `endEndlessRun(): void`

Termine le run Endless et enregistre le score.

```typescript
endEndlessRun();
```

##### `advanceEndlessWave(): void`

Passe à la vague suivante.

```typescript
advanceEndlessWave();
```

##### `applyEndlessUpgrade(upgradeId: string): void`

Applique un upgrade Endless.

```typescript
applyEndlessUpgrade('damage-boost');
```

## Services API

### AudioService

Service pour gérer l'audio du jeu.

#### Imports

```typescript
import { audio } from './services/audioService';
```

#### Méthodes

##### `preloadAssets(): Promise<void>`

Précharge tous les assets audio.

```typescript
await audio.preloadAssets();
```

##### `playBlip(): void`

Joue un son UI.

```typescript
audio.playBlip();
```

##### `playMusic(type: 'combat' | 'stage' | 'boss' | 'victory' | 'defeat'): void`

Joue une musique.

```typescript
audio.playMusic('combat');
```

##### `stopMusic(): void`

Arrête la musique.

```typescript
audio.stopMusic();
```

##### `playSound(soundId: string): void`

Joue un effet sonore.

```typescript
audio.playSound('explosion');
```

##### `setVolume(volume: number): void`

Change le volume master (0.0 - 1.0).

```typescript
audio.setVolume(0.8);
```

### TTSService

Service Text-to-Speech.

#### Imports

```typescript
import { tts, gameTTS } from './services/ttsService';
```

#### Méthodes

##### `tts.speak(text: string, options?: SpeechOptions): void`

Lit du texte.

```typescript
tts.speak('Welcome to Neon Vanguard', { rate: 1.0, pitch: 1.0 });
```

##### `gameTTS.announce(message: string, priority?: 'polite' | 'assertive'): void`

Annonce un message avec priorité.

```typescript
gameTTS.announce('Enemy defeated', 'polite');
```

## Utils API

### combatUtils

Fonctions de calcul de combat.

#### Imports

```typescript
import { calculateDamage, applyConsumableEffect } from './utils/combatUtils';
```

#### Fonctions

##### `calculateDamage(baseDamage: number, multiplier: number, isCritical: boolean, isWeakPoint?: boolean): number`

Calcule les dégâts d'une attaque.

```typescript
const damage = calculateDamage(100, 1.5, true, false);
// = 100 * 1.5 * 1.5 (crit) = 225
```

##### `applyConsumableEffect(consumableId: string, player: Player, enemies: Enemy[]): void`

Applique l'effet d'un consommable.

```typescript
applyConsumableEffect('med-kit', playerState, enemyList);
```

### synergyUtils

Gestion des synergies d'augmentations.

#### Imports

```typescript
import { getActiveSynergies, applySynergyEffect } from './utils/synergyUtils';
```

#### Fonctions

##### `getActiveSynergies(augmentationIds: string[]): Synergy[]`

Retourne les synergies actives.

```typescript
const synergies = getActiveSynergies(['shield-boost', 'armor-plating']);
```

##### `applySynergyEffect(synergyId: SynergyId, state: CombatState): void`

Applique un effet de synergie.

```typescript
applySynergyEffect('INFERNO', combatState);
```

---

## Types Référence Rapide

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

### Interfaces Principales

Voir [`types.ts`](file:///c:/Users/bilal/Downloads/38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App/neon-vanguard_-sector-zero/types.ts) pour la liste complète.

---

**Dernière mise à jour**: 2025-12-09
