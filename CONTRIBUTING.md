# Guide de Contribution

Merci de votre intérêt pour contribuer à **Neon Vanguard: Sector Zero** ! 🎮

Ce document fournit des guidelines pour contribuer au projet. En participant, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md).

## 📋 Table des Matières

- [Comment Contribuer](#comment-contribuer)
- [Signaler des Bugs](#signaler-des-bugs)
- [Suggérer des Fonctionnalités](#suggérer-des-fonctionnalités)
- [Pull Requests](#pull-requests)
- [Standards de Code](#standards-de-code)
- [Structure des Commits](#structure-des-commits)
- [Configuration de Développement](#configuration-de-développement)
- [Tests](#tests)

## Comment Contribuer

Il y a plusieurs façons de contribuer au projet:

- 🐛 Signaler des bugs
- 💡 Suggérer de nouvelles fonctionnalités
- 📝 Améliorer la documentation
- 🎨 Créer des mods (ennemis, pilotes, événements)
- 🔧 Corriger des bugs ou implémenter des features
- 🌍 Ajouter des traductions

## Signaler des Bugs

Avant de signaler un bug, veuillez:

1. **Vérifier les issues existantes** pour éviter les doublons
2. **Utiliser le template de bug report** disponible dans GitHub Issues
3. **Fournir un maximum de détails**:
   - Description claire du bug
   - Steps pour reproduire
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Informations système (OS, navigateur, version)
   - Console errors (F12 dans le navigateur)

### Template Bug Report

```markdown
**Description du Bug**
Description claire et concise du bug.

**Steps pour Reproduire**
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement Attendu**
Ce qui devrait se passer normalement.

**Screenshots**
Si applicable, ajoutez des screenshots.

**Environnement:**
 - OS: [e.g. Windows 11]
 - Navigateur: [e.g. Chrome 120]
 - Version du jeu: [e.g. 1.0.0]

**Informations Additionnelles**
Tout autre contexte pertinent.
```

## Suggérer des Fonctionnalités

Pour suggérer une nouvelle fonctionnalité:

1. **Vérifiez** qu'elle n'a pas déjà été suggérée
2. **Utilisez le template de feature request**
3. **Expliquez clairement**:
   - Le problème que ça résout
   - La solution proposée
   - Les alternatives envisagées
   - L'impact sur le jeu

### Template Feature Request

```markdown
**Le Problème**
Description claire du problème ou du besoin.

**Solution Proposée**
Comment vous imaginez la fonctionnalité.

**Alternatives**
Autres solutions envisagées.

**Contexte Additionnel**
Screenshots, mockups, exemples d'autres jeux, etc.
```

## Pull Requests

### Process

1. **Fork** le repository
2. **Créez une branche** depuis `main`:
   ```bash
   git checkout -b feature/ma-fonctionnalite
   # OU
   git checkout -b fix/mon-bug-fix
   ```

3. **Développez** votre feature/fix:
   - Suivez les [standards de code](#standards-de-code)
   - Écrivez des tests si applicable
   - Mettez à jour la documentation

4. **Testez localement**:
   ```bash
   npm run test
   npm run build
   npm run dev
   ```

5. **Committez** vos changements:
   ```bash
   git commit -m "Add: Nouvelle fonctionnalité X"
   ```

6. **Push** vers votre fork:
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

7. **Ouvrez une Pull Request** vers `main`

### Checklist PR

- [ ] Le code compile sans erreurs
- [ ] Les tests passent (`npm run test`)
- [ ] La documentation est à jour
- [ ] Les commits suivent la convention
- [ ] Le code respecte les standards du projet
- [ ] Aucune dépendance inutile ajoutée
- [ ] Les fichiers générés (`dist/`, `node_modules/`) ne sont pas inclus

## Standards de Code

### TypeScript

- **Types explicites**: Évitez `any`, utilisez des types stricts
- **Interfaces vs Types**: Préférez `interface` pour les objets, `type` pour les unions/intersections
- **Naming**:
  - PascalCase pour les composants/types/interfaces
  - camelCase pour les variables/fonctions
  - UPPER_SNAKE_CASE pour les constantes

```typescript
// ✅ Bon
interface PlayerStats {
  hp: number;
  damage: number;
}

const calculateDamage = (base: number, multiplier: number): number => {
  return base * multiplier;
};

const MAX_HP = 100;

// ❌ Mauvais
interface player_stats {
  hp: any;
  damage: any;
}

function CalculateDamage(base, multiplier) {
  return base * multiplier;
}
```

### React

- **Composants fonctionnels** avec hooks
- **Props typées** avec TypeScript
- **Destructuration** des props
- **Hooks** en haut du composant
- **Early returns** pour conditions

```tsx
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  if (disabled) return null;
  
  return (
    <button onClick={onClick} className="btn">
      {label}
    </button>
  );
};

// ❌ Mauvais
const Button = (props: any) => {
  return (
    <button onClick={props.onClick}>
      {props.label}
    </button>
  );
};
```

### CSS / Tailwind

- Utilisez **Tailwind classes** en priorité
- Classes personnalisées dans `index.css` si nécessaire
- **Responsive** avec les breakpoints Tailwind (`sm:`, `md:`, `lg:`)

### Fichiers et Organisation

- **Un composant par fichier**
- **Exports nommés** pour les utils, **default** pour les composants
- **Imports groupés**: React/externes, puis composants, puis utils/types

```typescript
// ✅ Bon
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Button } from './Button';
import { Modal } from './Modal';

import { calculateDamage } from '../utils/combatUtils';
import type { Enemy, Player } from '../types';
```

## Structure des Commits

Utilisez la convention **Conventional Commits**:

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

### Types

- `Add`: Nouvelle fonctionnalité
- `Fix`: Correction de bug
- `Docs`: Documentation uniquement
- `Style`: Formatage, point-virgules manquants, etc.
- `Refactor`: Refactorisation sans changement de fonctionnalité
- `Test`: Ajout/modification de tests
- `Chore`: Tâches de maintenance (dépendances, config, etc.)

### Exemples

```bash
Add(combat): Weak point system for enemies
Fix(audio): Correct music volume not applying
Docs(readme): Update installation instructions
Refactor(utils): Simplify damage calculation logic
Test(combat): Add tests for combo multiplier
Chore(deps): Update React to 19.2.0
```

## Configuration de Développement

### Setup Initial

1. **Fork et clone** le repository
2. **Installez les dépendances**:
   ```bash
   npm install
   ```

3. **Générez les assets** (optionnel):
   ```bash
   npm run generate-audio
   ```

4. **Lancez le dev server**:
   ```bash
   npm run dev
   ```

### Structure Recommandée

```
neon-vanguard-sector-zero/
├── components/       # Vos nouveaux composants ici
├── utils/            # Utilities helpers
├── types/            # Nouvelles définitions de types
└── constants/        # Configuration et constantes
```

### Outils Recommandés

- **VS Code** avec extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
- **React DevTools** (extension navigateur)
- **Git** (CLI ou GUI comme GitHub Desktop)

## Tests

### Lancer les Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Écrire des Tests

Utilisez **Vitest** + **Testing Library**:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Coverage Minimum

- **Unit tests**: Pour les utils critiques (combatUtils, synergyUtils)
- **Component tests**: Pour les composants avec logique complexe
- Pas besoin de tester chaque composant UI simple

## Questions ?

Si vous avez des questions:

- 📖 Consultez la [documentation](docs/)
- 💬 Ouvrez une [Discussion GitHub](https://github.com/yourusername/neon-vanguard-sector-zero/discussions)
- 📧 Contactez les mainteneurs

---

**Merci pour votre contribution ! 🚀**
