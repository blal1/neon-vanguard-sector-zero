# Features Documentation

Detailed guide to all features of **Neon Vanguard: Sector Zero**.

## 📋 Table of Contents

- [Combat System](#combat-system)
- [Pilots and Modules](#pilots-and-modules)
- [Achievement System](#achievement-system)
- [Talent System](#talent-system)
- [Endless Mode](#endless-mode)
- [Replay System](#replay-system)
- [Codex / Lore](#codex--lore)
- [Crafting](#crafting)
- [Difficulty and Modifiers](#difficulty-and-modifiers)
- [Accessibility](#accessibility)

---

## Combat System

### Active Time Battle (ATB)

Combat uses a **real-time ATB system**:

- Each enemy has a **charge gauge** (0-100%)
- Charge speed depends on the enemy's `speed` stat
- When an enemy reaches 100%, they attack the player
- The player can attack at any time (no gauge)

**Charge Formula**:
```
chargeRate = enemySpeed * combatSpeedMultiplier * deltaTime
```

### Enemy Intentions

Enemies display their **intention** before attacking:

| Intention | Icon | Description |
|-----------|------|-------------|
| `ATTACK` | ⚔️ | Will deal damage |
| `HEAL` | 💚 | Will heal themselves |
| `CHARGE` | ⚡ | Charging a powerful attack |
| `DEFEND` | 🛡️ | Gains temporary shield |

### Combo System

Chain attacks for **multipliers**:

- **0.5s between hits** to maintain combo
- Multiplier: `1.0 + (comboCount * 0.1)` (max 2.0x)
- Visually displayed: `x2 COMBO!`, `x5 COMBO!`

```typescript
interface ComboState {
  count: number;
  lastHitTime: number;
  multiplier: number; // 1.0 - 2.0
}
```

### Weak Points

Certain enemies have **vulnerabilities** to specific attack types:

```typescript
interface WeakPoint {
  abilityType?: string;     // 'laser', 'emp', etc.
  damageMultiplier: number; // Generally 2.0x
  description: string;
}
```

**Examples**:
- **SENTINEL**: Weak to EMP (2x damage)
- **WYRM BOSS**: Weak to laser attacks

### Critical Damage

- **Chance**: 15% base (can be increased by talents/augs)
- **Multiplier**: 1.5x damage
- **Visual**: Visual effect + special sound

### Status Effects

#### SHIELDED
- Absorbs X damage before breaking
- Visual: 🛡️ blue icon

#### OVERDRIVE
- +50% damage dealt
- -25% damage taken
- Duration: 10 seconds

#### STUNNED
- Enemy cannot attack
- ATB locked at 0%
- Duration: 3-5 seconds

#### BURNING
- DoT: 10 damage per second
- Duration: 5 seconds
- Stackable

### Damage Calculation

**Complete Formula**:
```typescript
finalDamage = baseDamage 
  * augmentationMultiplier 
  * comboMultiplier
  * (isCritical ? 1.5 : 1.0)
  * (isWeakPoint ? 2.0 : 1.0)
  * difficultyMultiplier
```

---

## Pilots and Modules

### 5 Unique Pilots

#### 1. VANGUARD - "The Aegis"
- **HP**: 120 (High)
- **Speed**: 100 (Normal)
- **Damage**: 15 (Normal)
- **Mechanic**: Shield Generation
  - Gains 20 shield every 5 kills
  - Max shield: 50
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Shield Bash (1.2x dmg, stun if shield active)
    - Special: Aegis Strike (1.5x dmg AoE)
  - **DEFENSE MODULE**:
    - Primary: Fortify (gain 20 shield)
    - Special: Reactive Armor (reflect 50% dmg)

#### 2. SOLARIS - "The Dynamo"
- **HP**: 100 (Normal)
- **Speed**: 120 (Fast)
- **Damage**: 18 (High)
- **Mechanic**: Energy Management
  - Max Energy: 100
  - Regen: 10/sec
  - Abilities cost energy
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Energy Bolt (30 energy, 1.8x dmg)
    - Special: Overcharge (50 energy, OVERDRIVE status)
  - **DEFENSE MODULE**:
    - Primary: Battery Siphon (drain 20 energy from enemy)
    - Special: Static Field (AoE stun)

#### 3. HYDRA - "The Inferno"
- **HP**: 100 (Normal)
- **Speed**: 100 (Normal)
- **Damage**: 20 (Very High)
- **Mechanic**: Heat Management
  - Heat builds with attacks
  - Too much heat = self damage
  - Can vent heat manually
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Flamethrower (+15 heat, 1.5x dmg, apply BURNING)
    - Special: Thermal Detonation (all heat -> AoE explosion)
  - **DEFENSE MODULE**:
    - Primary: Heat Sink (vent 50 heat)
    - Special: Molten Armor (convert heat to shield)

#### 4. WYRM - "The Leech"
- **HP**: 90 (Low)
- **Speed**: 110 (Fast)
- **Damage**: 12 (Low)
- **Mechanic**: Bio-Regeneration
  - Regen 2 HP/sec in combat
  - Regen 5 HP/sec out of combat
  - Vampiric attacks
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Drain (1.0x dmg, heal 50% dmg dealt)
    - Special: Swarm (summon heal drones)
  - **DEFENSE MODULE**:
    - Primary: Regenerate (heal 30 HP over 5s)
    - Special: Adaptive Shell (immune to next attack)

#### 5. GHOST - "The Phantom"
- **HP**: 80 (Very Low)
- **Speed**: 140 (Very Fast)
- **Damage**: 25 (Extreme)
- **Mechanic**: Stealth & Burst
  - +50% crit chance
  - First hit before ATB starts
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Shadow Strike (2.0x dmg, guaranteed crit)
    - Special: Phase Shift (dodge next 3 attacks)
  - **DEFENSE MODULE**:
    - Primary: Smoke Bomb (reset all enemy ATB)
    - Special: Vanish (become untargetable 5s)

### Pilot Unlocking

- **VANGUARD**: Unlocked by default
- **SOLARIS**: Level 2 OR 10 kills
- **HYDRA**: Level 4 OR 25 kills
- **WYRM**: Level 6 OR 50 kills
- **GHOST**: Level 8 OR Complete 1 run

---

## Achievement System

### 18 Achievements

#### Combat (5)
1. **FIRST BLOOD**: Defeat your first enemy
2. **CENTURION**: Defeat 100 enemies total
3. **EXTERMINATOR**: Defeat 500 enemies total
4. **CRIT MASTER**: Land 50 critical hits
5. **COMBO KING**: Achieve a x10 combo

#### Survival (4)
6. **SECTOR CLEAR**: Complete Sector 1
7. **HALFWAY THERE**: Complete Sector 3
8. **VICTOR**: Complete all 5 sectors
9. **UNTOUCHABLE**: Complete a sector without taking damage

#### Speed (2)
10. **SPEEDRUNNER**: Complete run in under 15 minutes
11. **LIGHTNING FAST**: Complete run in under 10 minutes

#### Collection (4)
12. **HOARDER**: Own 10 augmentations in a single run
13. **SYNERGY SEEKER**: Activate your first synergy
14. **COLLECTOR**: Unlock 20 codex entries
15. **ARCHIVIST**: Unlock all codex entries

#### Mastery (3)
16. **BOSS SLAYER**: Defeat 10 bosses
17. **PERFECTIONIST**: Complete a perfect run (no damage, no consumables)
18. **ENDLESS WARRIOR**: Reach wave 25 in Endless Mode

### Unlock Conditions

Achievements unlock automatically via `checkAchievements()` called after each significant action.

**Example**:
```typescript
const FIRST_BLOOD: Achievement = {
  id: 'first-blood',
  condition: (stats) => stats.totalKills >= 1,
  reward: { type: 'XP', value: 100 }
};
```

---

## Talent System

### Talent Trees Per Pilot

Each pilot has their own **talent tree** with 15-20 talents.

#### Structure

```typescript
interface Talent {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  cost: number;                // Required points
  prerequisiteId?: string;     // Parent talent
  effect: TalentEffect;
}
```

#### Effect Types

- **STAT_BOOST**: +X HP, +Y dmg, etc.
- **ABILITY_ENHANCE**: Improves an ability
- **UNLOCK_FEATURE**: Unlocks a mechanic
- **PASSIVE_BONUS**: Permanent bonus

#### Example: VANGUARD Talent Tree

**Tier 1** (1 point):
- **Reinforced Plating**: +20 Max HP
- **Combat Training**: +10% crit chance

**Tier 2** (2 points, requires Tier 1):
- **Shield Mastery**: +25% shield generation rate
- **Aegis Aura**: Allies within 5m gain 10 shield

**Tier 3** (3 points, requires Tier 2):
- **Unbreakable**: Shield breaks grant OVERDRIVE (5s)
- **Fortress**: While shield > 50%, take 25% less dmg

**Tier 4** (5 points, requires Tier 3):
- **Guardian Angel**: Auto-revive once per run at 1 HP

### Talent Points

- Earned by leveling up
- 1 point per level
- Can be reset (cost: scrap)

---

## Endless Mode

### How It Works

- **Infinite waves** of enemies
- Difficulty increases each wave
- Upgrades between waves (every 5 waves)
- Score based on: waves, kills, survival time

### Enemy Scaling

```
enemyHP = baseHP * (1 + wave * 0.15)
enemyDamage = baseDamage * (1 + wave * 0.10)
```

### Endless Upgrades

Every 5 waves, choose between 3 random upgrades:

#### Common (60% chance)
- +20 Max HP
- +10% Damage
- +1 Consumable

#### Rare (30% chance)
- +15% Cooldown Reduction
- Random augmentation
- +50 Scrap

#### Legendary (10% chance)
- Full Heal
- Extra Life
- Random Synergy

### Leaderboard

Score is calculated:
```typescript
score = (wave * 100) + (kills * 10) + (survivalTime / 60 * 50)
```

**Filters**:
- By difficulty
- By pilot
- Global / All-time

---

## Replay System

### Features

- Automatically records the **last 5 combats**
- Saves: Boss kills, Victories, Defeats (optional)
- Replays in real-time with controls (play/pause/speed)

### Recorded Data

```typescript
interface CombatReplay {
  id: string;
  timestamp: number;
  pilotId: PilotId;
  moduleId: PilotModule;
  stage: number;
  difficulty: DifficultyLevel;
  events: ReplayEvent[];      // Timestamped actions
  outcome: 'VICTORY' | 'DEFEAT';
  duration: number;           // Seconds
}
```

### Events

```typescript
type ReplayEvent =
  | { type: 'PLAYER_ATTACK', targetId: string, damage: number }
  | { type: 'ENEMY_ATTACK', enemyId: string, damage: number }
  | { type: 'ABILITY_USED', abilityId: string }
  | { type: 'CONSUMABLE_USED', consumableId: string }
  | { type: 'ENEMY_SPAWNED', enemy: Enemy }
  | { type: 'ENEMY_DEFEATED', enemyId: string };
```

---

## Codex / Lore

### Categories

#### Pilots (5 entries)
Complete bio for each pilot, unlocked by selecting them.

#### Enemies (20+ entries)
Data on each enemy type, unlocked by killing them.

```typescript
interface CodexEnemyEntry {
  id: string;
  name: string;
  description: string;
  stats: { hp, damage, speed };
  killCount: number;         // Tracking
  firstKill?: number;        // Timestamp
}
```

#### Lore (15+ entries)
Story fragments unlocked by progressing.

#### Audio Logs (10 entries)
Audio logs (TTS) discovered randomly (15% chance after victory).

### Unlock System

```typescript
// Unlock pilot bio
unlockCodexPilot(pilotId);

// Unlock lore
unlockCodexLore('lore-the-fall');

// Audio log chance
unlockCodexAudioLog(0.15); // 15%

// Track enemy kills
recordCodexEnemyKill('SENTINEL');
```

### Progression

"NEW!" badge on unread entries.

```typescript
interface CodexProgress {
  pilotsUnlocked: number;    // X/5
  enemiesUnlocked: number;   // X/20
  loreUnlocked: number;      // X/15
  audioLogsFound: number;    // X/10
  totalEntries: number;
  completionPercentage: number;
}
```

---

## Crafting

### Recipes

Combine consumables to create more powerful items.

#### Examples

**MEGA-STIM** (Rare):
- Cost: 2x Med-Kit + 50 scrap
- Effect: Restore 100 HP (vs 50 for normal Med-Kit)

**CRYO-BOMB** (Legendary):
- Cost: 2x EMP Grenade + 2x Frag Grenade + 100 scrap
- Effect: AoE stun + slow (5s)

### Recipe Unlocking

- Certain recipes unlocked by stage
- Others by achievements
- Visible in the hangar

```typescript
interface CraftingRecipe {
  id: string;
  requirements: { consumableId?: string, count: number, scrap?: number }[];
  result: Consumable;
  unlockedAtStage?: number;
}
```

---

## Difficulty and Modifiers

### 4 Difficulty Levels

| Level | Enemy HP | Enemy Dmg | Scrap | Permadeath | Lives |
|-------|----------|-----------|-------|------------|-------|
| RECRUIT | 1.0x | 1.0x | 1.5x | ❌ | ∞ |
| VETERAN | 1.3x | 1.2x | 1.2x | ❌ | 3 |
| ELITE | 1.6x | 1.5x | 1.0x | ❌ | 1 |
| NIGHTMARE | 2.0x | 2.0x | 0.8x | ✅ | 1 |

### Daily Modifiers

One random modifier per day (rotation):

#### BOSS RUSH
- All enemies become mini-bosses
- HP: -50%, Dmg: +25%
- Boss fights more frequent

#### DOUBLE HAZARDS
- 2x chance of environmental hazards
- Hazard effects +50% stronger

#### PACIFIST
- Offensive consumables hidden
- +100% scrap rewards
- Focus on defensive abilities

---

## Accessibility

### Screen Reader Support (NVDA)

- **ARIA labels** on all interactive elements
- **Live regions** for dynamic announcements
- **Skip links** for quick navigation
- **Descriptions** for images and icons

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Navigate between elements |
| Enter | Select / Confirm |
| Space | Activate / Toggle |
| Escape | Close / Back |
| Arrows | Navigate lists |
| 1-4 | Use consumable (in combat) |
| P | Pause |
| H | Contextual help |

### Colorblind Modes

3 modes for different types:

- **Protanopia** (red-green): Adjusted palette red → orange
- **Deuteranopia** (red-green): Adjusted palette green → blue
- **Tritanopia** (blue-yellow): Adjusted palette blue → purple

### 3D Spatial Audio

Audio positioning based on enemy position:
- Enemies on left → sound on left
- Enemies on right → sound on right
- Boss → amplified center sound

### Performance Options

**Performance Mode**:
- Disables complex animations
- Reduces particles
- Disables blur/glow effects
- +30% FPS on low-end machines

---

**Last Updated**: 2025-12-11
