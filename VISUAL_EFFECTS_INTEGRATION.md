# Visual Animations Integration Example

This document shows how to integrate the new visual effects into existing combat screens.

## Basic Integration

### 1. Import the necessary components

```typescript
import { useVisualEffects, CombatEffectsLayer } from './components/CombatEffectsLayer';
import { AnimatedPortrait } from './components/AnimatedPortrait';
import { ChargeAura } from './components/ChargeAura';
```

### 2. Initialize the visual effects hook

```typescript
const {
  effects,
  screenFlash,
  spawnParticles,
  triggerFlash
} = useVisualEffects();
```

### 3. Add the effects layer to your component

```typescript
return (
  <div className="relative w-full h-full">
    {/* Your existing combat UI */}
    
    {/* Visual Effects Layer */}
    <CombatEffectsLayer effects={effects} screenFlash={screenFlash} />
  </div>
);
```

## Integration Points

### On Ability Use (Normal Attack)

```typescript
// In handleAbilityUse callback
const handleAbilityUse = (ability: Ability) => {
  // ... existing logic ...
  
  // Spawn particles
  spawnParticles('hit', 50, 50); // Center of screen
  
  // ... rest of logic ...
};
```

### On Critical Hit

```typescript
// When detecting a critical hit
if (isCrit) {
  spawnParticles('critical', enemyX, enemyY);
  triggerFlash('critical');
  setCritFlash(true); // Existing crit flash state
}
```

### On Player Damage

```typescript
// When player takes damage
if (damageTaken > 0) {
  trigger Flash('damage');
  // Use shake-horizontal or shake-rumble class
  triggerShake(damageTaken > 20 ? 'rumble' : 'horizontal');
}
```

### On Healing

```typescript
// When healing is applied
if (hpGained > 0) {
  spawnParticles('heal', 30, 50); // Left side where player portrait is
  triggerFlash('heal');
}
```

### On Status Effects

```typescript
// Stun effect
if (stunApplied) {
  spawnParticles('stun', targetX, targetY);
}

// Burn effect
if (burnApplied) {
  spawnParticles('burn', targetX, targetY);
}
```

## Animated Portrait Integration

Replace static pilot display with animated portrait:

```typescript
// Before:
<div className="pilot-avatar">{pilot.mechName}</div>

// After:
<AnimatedPortrait
  pilotId={pilot.id}
  currentHp={playerHp}
  maxHp={maxHp}
  size="large"
/>
```

## Charge Aura Integration

Add to player/enemy display when ready to act:

```typescript
<div className="relative">
  {/* Existing character UI */}
  <div className="character-avatar">...</div>
  
  {/* Charge Aura */}
  <ChargeAura
    isReady={playerCharge >= 100}
    color={pilot.color}
    size="medium"
  />
</div>
```

## Enhanced Shake Effects

Replace basic shake with varied effects:

```typescript
// Before:
triggerShake(magnitude);

// After:
const getShakeClass = (damageType: string, magnitude: number) => {
  if (damageType === 'boss_ability') return 'shake-vertical';
  if (damageType === 'explosion') return 'shake-intense';
  if (magnitude > 20) return 'shake-rumble';
  return 'shake-horizontal';
};

// Usage:
const shakeClass = getShakeClass(damageType, damage);
setContainerClass(shakeClass);
```

## Performance Tips

1. **Limit Particles**: Don't spawn more than 2-3 particle effects per second
2. **Debounce Effects**: Add cooldown to prevent spam
3. **Respect reduceMotion**: Effects automatically respect prefers-reduced-motion
4. **Clean Up**: Effects auto-cleanup after animation completes

## Example: Full Combat Action

```typescript
const executeCombatAction = (action: CombatAction) => {
  // 1. Calculate results
  const result = calculateAction(action);
  
  // 2. Visual feedback based on result
  if (result.type === 'attack') {
    if (result.isCritical) {
      spawnParticles('critical', result.targetX, result.targetY);
      triggerFlash('critical');
      setShakeClass('shake-rumble');
    } else {
      spawnParticles('hit', result.targetX, result.targetY);
      setShakeClass('shake-horizontal');
    }
  } else if (result.type === 'heal') {
    spawnParticles('heal', 30, 50);
    triggerFlash('heal');
  } else if (result.type === 'ability') {
    spawnParticles('energy', result.sourceX, result.sourceY);
    spawnParticles(result.abilityType, result.targetX, result.targetY);
    setShakeClass('shake-vertical');
  }
  
  // 3. Apply game logic
  applyActionResult(result);
};
```

## Accessibility

All animations respect `prefers-reduced-motion`:
- Animations are disabled for users who prefer reduced motion
- Screen flashes still occur but with minimal duration
- Shake effects are minimized

No changes needed - this is handled automatically by the CSS.
