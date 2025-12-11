# Contributing Guide

Thank you for your interest in contributing to **Neon Vanguard: Sector Zero**! 🎮

This document provides guidelines for contributing to the project. By participating, you agree to respect our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📋 Table of Contents

- [How to Contribute](#how-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Pull Requests](#pull-requests)
- [Code Standards](#code-standards)
- [Commit Structure](#commit-structure)
- [Development Setup](#development-setup)
- [Tests](#tests)

## How to Contribute

There are several ways to contribute to the project:

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Create mods (enemies, pilots, events)
- 🔧 Fix bugs or implement features
- 🌍 Add translations

## Reporting Bugs

Before reporting a bug, please:

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** available in GitHub Issues
3. **Provide as many details as possible**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information (OS, browser, version)
   - Console errors (F12 in browser)

### Bug Report Template

```markdown
**Bug Description**
Clear and concise description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should normally happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Game version: [e.g. 1.0.0]

**Additional Information**
Any other relevant context.
```

## Suggesting Features

To suggest a new feature:

1. **Check** that it hasn't already been suggested
2. **Use the feature request template**
3. **Clearly explain**:
   - The problem it solves
   - The proposed solution
   - Alternatives considered
   - Impact on the game

### Feature Request Template

```markdown
**The Problem**
Clear description of the problem or need.

**Proposed Solution**
How you envision the feature.

**Alternatives**
Other solutions considered.

**Additional Context**
Screenshots, mockups, examples from other games, etc.
```

## Pull Requests

### Process

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   # OR
   git checkout -b fix/my-bug-fix
   ```

3. **Develop** your feature/fix:
   - Follow the [code standards](#code-standards)
   - Write tests if applicable
   - Update documentation

4. **Test locally**:
   ```bash
   npm run test
   npm run build
   npm run dev
   ```

5. **Commit** your changes:
   ```bash
   git commit -m "Add: New feature X"
   ```

6. **Push** to your fork:
   ```bash
   git push origin feature/my-feature
   ```

7. **Open a Pull Request** to `main`

### PR Checklist

- [ ] Code compiles without errors
- [ ] Tests pass (`npm run test`)
- [ ] Documentation is up to date
- [ ] Commits follow the convention
- [ ] Code respects project standards
- [ ] No unnecessary dependencies added
- [ ] Generated files (`dist/`, `node_modules/`) are not included

## Code Standards

### TypeScript

- **Explicit types**: Avoid `any`, use strict types
- **Interfaces vs Types**: Prefer `interface` for objects, `type` for unions/intersections
- **Naming**:
  - PascalCase for components/types/interfaces
  - camelCase for variables/functions
  - UPPER_SNAKE_CASE for constants

```typescript
// ✅ Good
interface PlayerStats {
  hp: number;
  damage: number;
}

const calculateDamage = (base: number, multiplier: number): number => {
  return base * multiplier;
};

const MAX_HP = 100;

// ❌ Bad
interface player_stats {
  hp: any;
  damage: any;
}

function CalculateDamage(base, multiplier) {
  return base * multiplier;
}
```

### React

- **Functional components** with hooks
- **Typed props** with TypeScript
- **Destructure** props
- **Hooks** at the top of the component
- **Early returns** for conditions

```tsx
// ✅ Good
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

// ❌ Bad
const Button = (props: any) => {
  return (
    <button onClick={props.onClick}>
      {props.label}
    </button>
  );
};
```

### CSS / Tailwind

- Use **Tailwind classes** as priority
- Custom classes in `index.css` if necessary
- **Responsive** with Tailwind breakpoints (`sm:`, `md:`, `lg:`)

### Files and Organization

- **One component per file**
- **Named exports** for utils, **default** for components
- **Grouped imports**: React/external, then components, then utils/types

```typescript
// ✅ Good
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Button } from './Button';
import { Modal } from './Modal';

import { calculateDamage } from '../utils/combatUtils';
import type { Enemy, Player } from '../types';
```

## Commit Structure

Use the **Conventional Commits** convention:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `Add`: New feature
- `Fix`: Bug fix
- `Docs`: Documentation only
- `Style`: Formatting, missing semicolons, etc.
- `Refactor`: Refactoring without functionality change
- `Test`: Adding/modifying tests
- `Chore`: Maintenance tasks (dependencies, config, etc.)

### Examples

```bash
Add(combat): Weak point system for enemies
Fix(audio): Correct music volume not applying
Docs(readme): Update installation instructions
Refactor(utils): Simplify damage calculation logic
Test(combat): Add tests for combo multiplier
Chore(deps): Update React to 19.2.0
```

## Development Setup

### Initial Setup

1. **Fork and clone** the repository
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Generate assets** (optional):
   ```bash
   npm run generate-audio
   ```

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

### Recommended Structure

```
neon-vanguard-sector-zero/
├── components/       # Your new components here
├── utils/            # Utility helpers
├── types/            # New type definitions
└── constants/        # Configuration and constants
```

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
- **React DevTools** (browser extension)
- **Git** (CLI or GUI like GitHub Desktop)

## Tests

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Writing Tests

Use **Vitest** + **Testing Library**:

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

### Minimum Coverage

- **Unit tests**: For critical utils (combatUtils, synergyUtils)
- **Component tests**: For components with complex logic
- No need to test every simple UI component

## Questions?

If you have questions:

- 📖 Check the [documentation](docs/)
- 💬 Open a [GitHub Discussion](https://github.com/yourusername/neon-vanguard-sector-zero/discussions)
- 📧 Contact the maintainers

---

**Thank you for your contribution! 🚀**
