export const COLOR_PALETTES = {
  none: {
    '--color-text': '#e5e7eb',
    '--color-primary': '#06b6d4',
    '--color-secondary': '#6366f1',
    '--color-accent': '#f59e0b',
    '--color-success': '#10b981',
    '--color-danger': '#ef4444',
    '--color-warning': '#f97316',
  },
  protanopia: {
    '--color-text': '#e5e7eb',
    '--color-primary': '#06b6d4',
    '--color-secondary': '#6366f1',
    '--color-accent': '#f59e0b',
    '--color-success': '#10b981',
    '--color-danger': '#f59e0b', // Red -> Amber
    '--color-warning': '#f97316',
  },
  deuteranopia: {
    '--color-text': '#e5e7eb',
    '--color-primary': '#06b6d4',
    '--color-secondary': '#6366f1',
    '--color-accent': '#f59e0b',
    '--color-success': '#06b6d4', // Green -> Cyan
    '--color-danger': '#ef4444',
    '--color-warning': '#f97316',
  },
  tritanopia: {
    '--color-text': '#e5e7eb',
    '--color-primary': '#0d9488', // Cyan -> Teal
    '--color-secondary': '#ef4444', // Indigo -> Red
    '--color-accent': '#f59e0b',
    '--color-success': '#10b981',
    '--color-danger': '#ef4444',
    '--color-warning': '#f97316',
  },
};
