# Documentation des Fonctionnalités

Guide détaillé de toutes les fonctionnalités de **Neon Vanguard: Sector Zero**.

## 📋 Table des Matières

- [Système de Combat](#système-de-combat)
- [Pilotes et Modules](#pilotes-et-modules)
- [Système d'Achievements](#système-dachievements)
- [Système de Talents](#système-de-talents)
- [Mode Endless](#mode-endless)
- [Système de Replay](#système-de-replay)
- [Codex / Lore](#codex--lore)
- [Crafting](#crafting)
- [Difficulté et Modificateurs](#difficulté-et-modificateurs)
- [Accessibilité](#accessibilité)

---

## Système de Combat

### Active Time Battle (ATB)

Le combat utilise un système **ATB en temps réel**:

- Chaque ennemi a une **jauge de charge** (0-100%)
- La vitesse de charge dépend du stat `speed` de l'ennemi
- Quand un ennemi atteint 100%, il attaque le joueur
- Le joueur peut attaquer à tout moment (pas de jauge)

**Formule de charge**:
```
chargeRate = enemySpeed * combatSpeedMultiplier * deltaTime
```

### Intentions Ennemies

Les ennemis affichent leur **intention** avant d'attaquer:

| Intention | Icône | Description |
|-----------|-------|-------------|
| `ATTACK` | ⚔️ | Va infliger des dégâts |
| `HEAL` | 💚 | Va se soigner |
| `CHARGE` | ⚡ | Charge une attaque puissante |
| `DEFEND` | 🛡️ | Gagne un bouclier temporaire |

### Système de Combos

Enchaînez les attaques pour des **multiplicateurs**:

- **0.5s entre hits** pour maintenir le combo
- Multiplicateur: `1.0 + (comboCount * 0.1)` (max 2.0x)
- Affiché visuellement: `x2 COMBO!`, `x5 COMBO!`

```typescript
interface ComboState {
  count: number;
  lastHitTime: number;
  multiplier: number; // 1.0 - 2.0
}
```

### Points Faibles (Weak Points)

Certains ennemis ont des **vulnérabilités** à des types d'attaques:

```typescript
interface WeakPoint {
  abilityType?: string;     // 'laser', 'emp', etc.
  damageMultiplier: number; // Généralement 2.0x
  description: string;
}
```

**Exemples**:
- **SENTINEL**: Faible aux EMP (2x dégâts)
- **WYRM BOSS**: Faible aux attaques laser

### Dégâts Critiques

- **Chance**: 15% base (peut être augmentée par talents/augs)
- **Multiplicateur**: 1.5x dégâts
- **Visuel**: Effet visuel + son spécial

### Statuts (Status Effects)

#### SHIELDED
- Absorbe X dégâts avant de se briser
- Visuel: Icône 🛡️ bleue

#### OVERDRIVE
- +50% dégâts infligés
- -25% dégâts reçus
- Durée: 10 secondes

#### STUNNED
- Ennemi ne peut pas attaquer
- ATB bloquée à 0%
- Durée: 3-5 secondes

#### BURNING
- DoT: 10 dégâts par seconde
- Durée: 5 secondes
- Stackable

### Calcul de Dégâts

**Formule complète**:
```typescript
finalDamage = baseDamage 
  * augmentationMultiplier 
  * comboMultiplier
  * (isCritical ? 1.5 : 1.0)
  * (isWeakPoint ? 2.0 : 1.0)
  * difficultyMultiplier
```

---

## Pilotes et Modules

### 5 Pilotes Uniques

#### 1. VANGUARD - "The Aegis"
- **HP**: 120 (High)
- **Speed**: 100 (Normal)
- **Damage**: 15 (Normal)
- **Mécanique**: Shield Generation
  - Gagne 20 shield tous les 5 kills
  - Shield max: 50
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Shield Bash (1.2x dmg, stun si shield actif)
    - Special: Aegis Strike (1.5x dmg AoE)
  - **DEFENSE MODULE**:
    - Primary: Fortify (gagne 20 shield)
    - Special: Reactive Armor (reflect 50% dmg)

#### 2. SOLARIS - "The Dynamo"
- **HP**: 100 (Normal)
- **Speed**: 120 (Fast)
- **Damage**: 18 (High)
- **Mécanique**: Energy Management
  - Max Energy: 100
  - Regen: 10/sec
  - Abilities coûtent de l'énergie
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
- **Mécanique**: Heat Management
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
- **Mécanique**: Bio-Regeneration
  - Regen 2 HP/sec en combat
  - Regen 5 HP/sec hors combat
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
- **Mécanique**: Stealth & Burst
  - +50% crit chance
  - Frappe first hit avant ATB start
- **Abilities**:
  - **ASSAULT MODULE**:
    - Primary: Shadow Strike (2.0x dmg, guaranteed crit)
    - Special: Phase Shift (dodge next 3 attacks)
  - **DEFENSE MODULE**:
    - Primary: Smoke Bomb (reset all enemy ATB)
    - Special: Vanish (become untargetable 5s)

### Déblocage des Pilotes

- **VANGUARD**: Débloqué par défaut
- **SOLARIS**: Level 2 OU 10 kills
- **HYDRA**: Level 4 OU 25 kills
- **WYRM**: Level 6 OU 50 kills
- **GHOST**: Level 8 OU Complete 1 run

---

## Système d'Achievements

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

### Conditions d'Unlock

Les achievements se débloquent automatiquement via `checkAchievements()` appelé après chaque action significative.

**Exemple**:
```typescript
const FIRST_BLOOD: Achievement = {
  id: 'first-blood',
  condition: (stats) => stats.totalKills >= 1,
  reward: { type: 'XP', value: 100 }
};
```

---

## Système de Talents

### Arbres de Talents par Pilote

Chaque pilote a son propre **arbre de talents** avec 15-20 talents.

#### Structure

```typescript
interface Talent {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  cost: number;                // Points requis
  prerequisiteId?: string;     // Talent parent
  effect: TalentEffect;
}
```

#### Types d'Effets

- **STAT_BOOST**: +X HP, +Y dmg, etc.
- **ABILITY_ENHANCE**: Améliore une capacité
- **UNLOCK_FEATURE**: Débloque une mécanique
- **PASSIVE_BONUS**: Bonus permanent

#### Exemple: VANGUARD Talent Tree

**Tier 1** (1 point):
- **Reinforced Plating**: +20 Max HP
- **Combat Training**: +10% crit chance

**Tier 2** (2 points, requires Tier 1):
- **Shield Mastery**: +25% shield generation rate
- **Aegis Aura**: Allies in 5m gain 10 shield

**Tier 3** (3 points, requires Tier 2):
- **Unbreakable**: Shield breaks grant OVERDRIVE (5s)
- **Fortress**: While shield > 50%, take 25% less dmg

**Tier 4** (5 points, requires Tier 3):
- **Guardian Angel**: Auto-revive once per run at 1 HP

### Points de Talents

- Gagnés en montant de niveau
- 1 point par level
- Peuvent être reset (coût: scrap)

---

## Mode Endless

### Fonctionnement

- **Vagues infinies** d'ennemis
- Difficulté augmente à chaque vague
- Upgrades entre vagues (tous les 5 waves)
- Score basé sur: vagues, kills, temps de survie

### Scaling d'Ennemis

```
enemyHP = baseHP * (1 + wave * 0.15)
enemyDamage = baseDamage * (1 + wave * 0.10)
```

### Upgrades Endless

Tous les 5 waves, choix entre 3 upgrades aléatoires:

#### Common (60% chance)
- +20 Max HP
- +10% Damage
- +1 Consumable

#### Rare (30% chance)
- +15% Cooldown Reduction
- Augmentation aléatoire
- +50 Scrap

#### Legendary (10% chance)
- Full Heal
- Extra Life
- Random Synergy

### Leaderboard

Le score est calculé:
```typescript
score = (wave * 100) + (kills * 10) + (survivalTime / 60 * 50)
```

**Filtres**:
- Par difficulté
- Par pilote
- Global / All-time

---

## Système de Replay

### Fonctionnalités

- Enregistre automatiquement les **5 derniers combats**
- Sauvegarde: Boss kills, Victoires, Défaites (optional)
- Rejoue en temps réel avec contrôles (play/pause/speed)

### Données Enregistrées

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
  duration: number;           // Secondes
}
```

### Événements

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

#### Pilotes (5 entrées)
Bio complète de chaque pilote unlockée en le sélectionnant.

#### Ennemis (20+ entrées)
Données sur chaque type d'ennemi, unlockées en les tuant.

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

#### Lore (15+ entrées)
Fragments d'histoire unlockés en progressant.

#### Audio Logs (10 entrées)
Logs audio (TTS) découverts aléatoirement (15% chance après victoire).

### Système d'Unlock

```typescript
// Débloquer pilote bio
unlockCodexPilot(pilotId);

// Débloquer lore
unlockCodexLore('lore-the-fall');

// Chance d'audio log
unlockCodexAudioLog(0.15); // 15%

// Tracking enemy kills
recordCodexEnemyKill('SENTINEL');
```

### Progression

Badge "NEW!" sur les entrées non lues.

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

### Recettes

Combinez consommables pour créer items plus puissants.

#### Exemples

**MEGA-STIM** (Rare):
- Coût: 2x Med-Kit + 50 scrap
- Effet: Restore 100 HP (vs 50 pour Med-Kit normal)

**CRYO-BOMB** (Legendary):
- Coût: 2x EMP Grenade + 2x Frag Grenade + 100 scrap
- Effet: AoE stun + slow (5s)

### Unlock des Recettes

- Certaines recettes unlockées par stage
- D'autres par achievements
- Visibles dans le hangar

```typescript
interface CraftingRecipe {
  id: string;
  requirements: { consumableId?: string, count: number, scrap?: number }[];
  result: Consumable;
  unlockedAtStage?: number;
}
```

---

## Difficulté et Modificateurs

### 4 Niveaux de Difficulté

| Niveau | Enemy HP | Enemy Dmg | Scrap | Permadeath | Lives |
|--------|----------|-----------|-------|------------|-------|
| RECRUIT | 1.0x | 1.0x | 1.5x | ❌ | ∞ |
| VETERAN | 1.3x | 1.2x | 1.2x | ❌ | 3 |
| ELITE | 1.6x | 1.5x | 1.0x | ❌ | 1 |
| NIGHTMARE | 2.0x | 2.0x | 0.8x | ✅ | 1 |

### Modificateurs Quotidiens

Un modificateur aléatoire par jour (rotation):

#### BOSS RUSH
- Tous les ennemis deviennent mini-boss
- HP: -50%, Dmg: +25%
- Boss fights more frequent

#### DOUBLE HAZARDS
- 2x chance de hazards environnementaux
- Effets de hazards +50% plus forts

#### PACIFIST
- Consommables offensifs cachés
- +100% scrap rewards
- Focus sur capacités défensives

---

## Accessibilité

### Support Lecteur d'Écran (NVDA)

- **ARIA labels** sur tous éléments interactifs
- **Live regions** pour annonces dynamiques
- **Skip links** pour navigation rapide
- **Descriptions** pour images et icônes

### Navigation Clavier

| Touche | Action |
|--------|--------|
| Tab / Shift+Tab | Navigation entre éléments |
| Enter | Sélectionner / Confirmer |
| Espace | Activer / Toggle |
| Échap | Fermer / Retour |
| Flèches | Navigation dans listes |
| 1-4 | Utiliser consommable (en combat) |
| P | Pause |
| H | Aide contextuelle |

### Modes Daltonisme

3 modes pour différents types:

- **Protanopia** (rouge-vert): Palette ajustée rouge → orange
- **Deuteranopia** (rouge-vert): Palette ajustée vert → bleu
- **Tritanopia** (bleu-jaune): Palette ajustée bleu → violet

### Audio Spatial 3D

Positionnement audio basé sur position ennemis:
- Ennemis à gauche → son à gauche
- Ennemis à droite → son à droite
- Boss → son central amplifié

### Options Performance

**Mode Performance**:
- Désactive animations complexes
- Réduit particules
- Désactive blur/glow effects
- +30% FPS sur machines low-end

---

**Dernière mise à jour**: 2025-12-09
