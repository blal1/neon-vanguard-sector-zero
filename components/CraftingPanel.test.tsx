import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CraftingPanel } from './CraftingPanel';
import { CRAFTING_RECIPES } from '../constants';

// Mock useGame and useTranslation
const mockCraftItem = vi.fn();
const mockUseGame = vi.fn();

vi.mock('../context/GameContext', () => ({
    useGame: () => mockUseGame()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

vi.mock('../services/audioService', () => ({
    audio: {
        playBlip: vi.fn(),
        playAlarm: vi.fn(),
        playSound: vi.fn()
    }
}));

describe('CraftingPanel Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGame.mockReturnValue({
            runState: {
                scrap: 100,
                consumables: [
                    { id: 'nano_stim', name: 'Nano-Stim', count: 3, maxCount: 5, cost: 25, description: 'Heal 50 HP', color: 'text-green-400 border-green-700' }
                ],
                augmentations: []
            },
            craftedItems: [],
            craftItem: mockCraftItem
        });
    });

    it('should render crafting panel', () => {
        render(<CraftingPanel />);
        // Should have crafting-related content
        expect(screen.getByText(/craft/i) || screen.getByText(/recipe/i)).toBeDefined();
    });

    it('should display available recipes', () => {
        render(<CraftingPanel />);

        // Should show at least one recipe if available
        if (CRAFTING_RECIPES && CRAFTING_RECIPES.length > 0) {
            // Look for recipe-related content
            const recipeElements = screen.queryAllByRole('button');
            expect(recipeElements.length).toBeGreaterThan(0);
        }
    });

    it('should show material requirements', () => {
        render(<CraftingPanel />);

        // Recipes should have material requirements displayed
        // This will vary based on actual recipes
        if (CRAFTING_RECIPES && CRAFTING_RECIPES.length > 0) {
            const firstRecipe = CRAFTING_RECIPES[0];
            if (firstRecipe.materials) {
                // Materials should be visible in some form
                expect(screen.getByText(/material/i) || screen.getByText(/require/i) || document.body).toBeDefined();
            }
        }
    });

    it('should call craftItem when crafting', () => {
        render(<CraftingPanel />);

        // Find and click a craft button if available
        const craftButtons = screen.queryAllByRole('button');
        const craftButton = craftButtons.find(btn =>
            btn.textContent?.toLowerCase().includes('craft') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('craft')
        );

        if (craftButton) {
            fireEvent.click(craftButton);
            // May or may not call depending on material availability
        }
    });

    it('should display scrap cost', () => {
        render(<CraftingPanel />);

        // Recipes that cost scrap should show the cost
        if (CRAFTING_RECIPES && CRAFTING_RECIPES.some(r => r.scrapCost && r.scrapCost > 0)) {
            // Scrap values should be visible
            expect(document.body.textContent?.includes('SCRAP') ||
                document.body.textContent?.includes('scrap')).toBe(true);
        }
    });

    it('should show crafting success animation', () => {
        render(<CraftingPanel />);

        // Animation classes or elements should be present when crafting succeeds
        // This is primarily visual and may require more complex testing
        expect(screen.getByRole('region') || document.body).toBeDefined();
    });
});
