# Neon Vanguard: Sector Zero

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/blal1/neon-vanguard-sector-zero)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-39.2-47848f.svg)](https://www.electronjs.org/)

> Un jeu de combat mech tactique roguelite avec système de progression profond, support complet pour l'accessibilité et capacités de modding extensives.

![Game Banner](docs/assets/screenshots/banner.png)
<!-- TODO: Ajouter un banner/screenshot du jeu -->

## Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Scripts Disponibles](#-scripts-disponibles)
- [Stack Technologique](#-stack-technologique)
- [Architecture](#-architecture)
- [Modding](#-modding)
- [Accessibilité](#-accessibilité)
- [Contribution](#-contribution)
- [Licence](#-licence)
- [Crédits](#-crédits)

## À Propos

**Neon Vanguard: Sector Zero** est un jeu de combat mech rapide et intense construit avec React et TypeScript. Pilotez des mechs avancés à travers des secteurs dangereux, combattez des ennemis uniques, acquérez des augmentations et améliorez votre équipement pour survivre à des vagues de plus en plus difficiles.

Le jeu combine des mécaniques **roguelite** avec un système de combat dynamique en **temps réel**, des risques environnementaux procéduraux et un arbre de talents profond pour la personnalisation des pilotes.

### Objectif du Jeu

Survivre à travers 5 secteurs de difficulté croissante, vaincre les boss de fin de secteur et déverrouiller de nouveaux pilotes, augmentations et secrets dans le Codex. Testez vos limites dans le **Mode Endless** pour grimper dans le classement mondial.

## Fonctionnalités

### Système de Combat Avancé
- **ATB (Active Time Battle)**: Combat en temps réel avec jauge de charge pour chaque ennemi
- **Système de Combos**: Enchaînez les attaques pour des multiplicateurs de dégâts
- **Points Faibles**: Exploitez les vulnérabilités ennemies avec les bonnes capacités
- **Intentions Ennemies**: Anticipez et contrez les attaques, soins et défenses adverses
- **Affixes d'Élite**: Ennemis avec modificateurs spéciaux (Volatile, Blindé, Vampirique, etc.)

### Pilotes Uniques
- **5 Pilotes Jouables**: Chacun avec des statistiques, capacités et mécaniques uniques
  - **Vanguard**: Tank équilibré avec boucliers
  - **Solaris**: Spécialiste énergie avec surcharge
  - **Hydra**: Gestion de chaleur et dégâts DoT
  - **Wyrm**: Bio-régénération et contrôle de foule
  - **Ghost**: Furtivité et burst damage critique
- **2 Modules par Pilote**: ASSAULT (offensif) ou DEFENSE (défensif)
- **Arbres de Talents**: Système de progression permanent pour chaque pilote

### Modes de Jeu
- **Campagne Standard**: 5 secteurs avec boss finaux
- **Mode Endless**: Survie par vagues infinies avec classement
- **Niveaux de Difficulté**: RECRUIT, VETERAN, ELITE, NIGHTMARE
- **Modificateurs Quotidiens**: Boss Rush, Double Hazards, Pacifist

### Progression et Personnalisation
- **Système d'Augmentations**: Plus de 30 augmentations avec synergies
- **Crafting**: Combinez des consommables pour créer des items uniques
- **Système de Succès**: 18+ achievements avec récompenses
- **Loadouts**: Sauvegardez et chargez vos configurations favorites
- **Statistiques Détaillées**: Tracking complet de performance

### Contenu Narratif
- **Codex**: Base de données des pilotes, ennemis et lore
- **Événements Narratifs**: Choix qui affectent votre run
- **Logs Audio**: Découvrez l'histoire du secteur
- **Dialogues de Boss**: Interactions uniques pour chaque boss

### Fonctionnalités Avancées
- **Système de Replay**: Enregistrez et rejouez vos meilleurs combats
- **Audio Dynamique**: Musique et effets sonores par stage
- **Support TTS**: Voice lines via Web Speech API
- **Support Multilingue**: Système i18next intégré
- **Modding**: Ajoutez facilement vos propres ennemis, pilotes et événements

### Accessibilité
- **Support Complet Lecteur d'Écran**: Compatible NVDA
- **Navigation Clavier**: Contrôles complets au clavier
- **Modes Daltonisme**: 3 modes pour différents types
- **Audio Positionnel 3D**: Orientation spatiale des sons
- **Raccourcis Personnalisables**: Keybindings configurables
- **Options de Performance**: Mode performance pour réduire les effets visuels

## Screenshots

<!-- TODO: Ajouter des screenshots -->
```
[Menu Principal] [Sélection Pilote] [Combat] [Hangar] [Arbre de Talents]
```

## Installation

### Prérequis

- **Node.js** version 18 ou supérieure ([Télécharger](https://nodejs.org/))
- **npm** (inclus avec Node.js) ou **yarn**

### Installation Standard

1. **Cloner le repository**:
   ```bash
   git clone https://github.com/blal1/neon-vanguard-sector-zero.git
   cd neon-vanguard-sector-zero
   ```

2. **Installer les dépendances**:
   ```bash
   npm install
   ```

3. **Générer les assets audio** (optionnel - placeholders):
   ```bash
   npm run generate-audio
   ```

4. **Lancer le serveur de développement**:
   ```bash
   npm run dev
   ```

5. **Ouvrir dans votre navigateur**: `http://localhost:5173`

### Installation Electron (Application Desktop)

Pour lancer l'application en mode desktop:

```bash
# Mode développement avec hot-reload
npm run electron:dev

# Build de production Windows
npm run electron:build:win
```

L'exécutable sera créé dans le dossier `release/`.

## Utilisation

### Démarrage Rapide

1. **Sélectionnez un Pilote**: Choisissez parmi 5 pilotes uniques
2. **Choisissez un Module**: ASSAULT ou DEFENSE
3. **Équipez des Consommables**: Med-Kits, Grenades EMP, etc.
4. **Lisez le Briefing**: Comprenez votre mission
5. **Lancez le Combat**: Engagez les systèmes !

### Contrôles

#### Combat
- **Clic Gauche sur Ennemi**: Attaque de base
- **Barre Espace**: Capacité primaire
- **Shift**: Capacité spéciale
- **1-4**: Utiliser consommable
- **P**: Pause

#### Navigation
- **Tab**: Naviguer entre éléments
- **Enter**: Sélectionner/Confirmer
- **Échap**: Retour/Annuler
- **F1**: Aide/Tutoriel

Pour plus de détails, voir [COMMENT_JOUER.md](COMMENT_JOUER.md).

## Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur de développement Vite (port 5173) |
| `npm run build` | Compile l'application pour la production dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm run test` | Lance les tests avec Vitest |
| `npm run test:ui` | Interface graphique pour les tests |
| `npm run generate-audio` | Génère les fichiers audio placeholders |
| `npm run electron:dev` | Lance Electron en mode développement avec hot-reload |
| `npm run electron:build` | Build Electron pour production |
| `npm run electron:build:win` | Build Electron spécifiquement pour Windows |

## Stack Technologique

### Frontend
- **[React 19](https://react.dev/)**: Bibliothèque UI avec composants fonctionnels et hooks
- **[TypeScript 5.8](https://www.typescriptlang.org/)**: Typage statique pour JavaScript
- **[Vite 6](https://vitejs.dev/)**: Build tool ultra-rapide et dev server
- **[Tailwind CSS 3.4](https://tailwindcss.com/)**: Framework CSS utility-first
- **[Framer Motion](https://www.framer.com/motion/)**: Animations et transitions fluides

### State Management
- **[Zustand 5](https://zustand-demo.pmnd.rs/)**: State management simple et performant
- **React Context**: State global pour le GameContext
- **LocalStorage**: Persistence des données (profil, settings, runs)

### Desktop Application
- **[Electron 39](https://www.electronjs.org/)**: Framework pour applications desktop cross-platform
- **[electron-builder](https://www.electron.build/)**: Packaging et distribution

### Internationalization & Accessibility
- **[i18next](https://www.i18next.com/)**: Système de traduction
- **[react-i18next](https://react.i18next.com/)**: Intégration React pour i18n
- **Web Speech API**: Text-to-Speech natif du navigateur

### Charts & Visualization
- **[Recharts](https://recharts.org/)**: Graphiques pour les statistiques

### Development Tools
- **[Vitest](https://vitest.dev/)**: Framework de test unitaire
- **[Testing Library](https://testing-library.com/)**: Utilities pour tester React
- **ESLint + Prettier**: Linting et formatting (via configuration Vite)

## Architecture

### Structure des Dossiers

```
neon-vanguard-sector-zero/
├── components/          # Composants React réutilisables (44 fichiers)
│   ├── CombatScreen.tsx
│   ├── HangarScreen.tsx
│   ├── CharacterSelect.tsx
│   └── ...
├── constants/           # Configuration et données statiques
│   ├── achievements.ts
│   ├── augmentations.ts
│   ├── colors.ts
│   ├── talents.ts
│   └── ...
├── context/             # React Context providers
│   └── GameContext.tsx
├── data/                # Gestionnaire de données pilotes
│   └── dataManager.ts
├── docs/                # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── FEATURES.md
├── electron/            # Configuration Electron
│   └── main.cjs
├── hooks/               # Custom React hooks
│   └── useKeyboardNavigation.ts
├── mods/                # Système de modding
│   ├── enemies/
│   ├── pilots/
│   └── events/
├── public/              # Assets statiques
│   └── audio/           # Fichiers audio
├── services/            # Services et utilitaires
│   ├── audioService.ts
│   ├── ttsService.ts
│   └── voiceLineService.ts
├── src/                 # Code source principal
│   ├── i18n/            # Traductions
│   └── test/            # Configuration tests
├── types/               # Définitions TypeScript
│   ├── codex.ts
│   ├── replay.ts
│   └── talents.ts
├── utils/               # Fonctions utilitaires
│   ├── combatUtils.ts
│   ├── synergyUtils.ts
│   └── ...
├── App.tsx              # Composant principal
├── index.tsx            # Point d'entrée React
├── types.ts             # Types globaux
├── constants.ts         # Constantes globales
└── package.json
```

Pour plus de détails, consultez [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Flux de Données

1. **GameContext** (Zustand + React Context) gère l'état global
2. **LocalStorage** persiste les données entre sessions
3. **Services** (audio, TTS) communiquent avec les APIs du navigateur
4. **Utilities** effectuent les calculs de combat et synergies
5. **Components** consomment et affichent l'état

## Modding

Neon Vanguard supporte le modding via des fichiers JSON/TypeScript simples !

### Ajouter un Ennemi

Créez `mods/enemies/mon-ennemi.json`:
```json
{
  "name": "DEVASTATOR",
  "maxHp": 150,
  "speed": 1.2,
  "damage": 25,
  "flavorText": "Lance une salve de missiles.",
  "scrapValue": 40
}
```

### Ajouter un Pilote

Créez `mods/pilots/mon-pilote.json` avec les capacités personnalisées.

### Ajouter un Événement

Créez `mods/events/mon-event.ts` avec choix et conséquences.

Pour le guide complet, voir [MODDING_GUIDE.md](MODDING_GUIDE.md).

## Accessibilité

Ce jeu est conçu pour être **entièrement accessible** aux joueurs utilisant des lecteurs d'écran:

- ✅ Support NVDA complet
- ✅ Navigation clavier totale
- ✅ Annonces ARIA avec priorités
- ✅ Audio spatial 3D pour orientation
- ✅ Modes daltonisme (protanopia, deuteranopia, tritanopia)
- ✅ Keybindings personnalisables
- ✅ Mode performance (réduit les animations)

Les voice lines utilisent la **Web Speech API** du navigateur (fonctionne mieux sur Chrome/Edge).

## Contribution

Les contributions sont les bienvenues ! Voici comment participer:

1. **Fork** le projet
2. **Créez une branche** pour votre feature (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add: Amazing feature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request**

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines détaillées.

### Signaler des Bugs

Utilisez les [GitHub Issues](https://github.com/blal1/neon-vanguard-sector-zero/issues) avec le template de bug report.

### Suggérer des Fonctionnalités

Utilisez les GitHub Issues avec le template de feature request.

## Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

## Crédits

### Développement
- **Développeur Principal**: Bilal

### Technologies
- Construit avec [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) et [Vite](https://vitejs.dev/)
- Propulsé par [Electron](https://www.electronjs.org/)

### Audio
- Placeholder audio généré via scripts Node.js
- TTS via Web Speech API

### Remerciements Spéciaux
- Communauté React et TypeScript
- Tous les contributeurs et testeurs

---

## Contact & Support

- **GitHub Issues**: [Bug Reports & Features](https://github.com/yourusername/neon-vanguard-sector-zero/issues)
- **Discord**: [Communauté Neon Vanguard](#) <!-- TODO: Ajouter lien Discord si applicable -->
- **Email**: bilalfehan2006@gmail.com <!-- TODO: Ajouter email -->

---

<div align="center">

**⚡ Fait avec ❤️ pour la communauté gaming et accessibilité ⚡**

[⬆ Retour en haut](#-neon-vanguard-sector-zero)

</div>