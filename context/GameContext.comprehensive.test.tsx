import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { GameProvider, GameContext, useGame } from '../context/GameContext';
import { PilotId, DifficultyLevel, PilotModule, Consumable, HazardType } from '../types';
import { PILOTS, CONSUMABLES, DIFFICULTIES } from '../constants';

// Test component to access context
const TestConsumer: React.FC<{ onMount?: (context: any) => void }> = ({ onMount }) => {
    const context = useGame();
    React.useEffect(() => {
        if (onMount) onMount(context);
    }, [context, onMount]);
    return <div data-testid="consumer">Ready</div>;
};

// Wrapper for rendering with provider
const renderWithProvider = (ui?: React.ReactElement) => {
    return render(
        <GameProvider>
            {ui || <TestConsumer />}
        </GameProvider>
    );
};

describe('GameContext Integration Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initial State', () => {
        it('should provide initial profile state', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => {
                expect(contextValue).toBeDefined();
                expect(contextValue.profile).toBeDefined();
                expect(contextValue.profile.xp).toBe(0);
                expect(contextValue.profile.level).toBe(1);
            });
        });

        it('should have default settings', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => {
                expect(contextValue.settings).toBeDefined();
                expect(typeof contextValue.settings.volume).toBe('number');
            });
        });

        it('should have inactive run state initially', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => {
                expect(contextValue.runState).toBeDefined();
                expect(contextValue.runState.isActive).toBe(false);
            });
        });
    });

    describe('Run Lifecycle', () => {
        it('should start a new run', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => {
                expect(contextValue.startRun).toBeDefined();
            });

            const pilot = PILOTS[0];
            const module: PilotModule = 'BALANCED';
            const consumables = CONSUMABLES.slice(0, 2);

            act(() => {
                contextValue.startRun(pilot, module, consumables);
            });

            await waitFor(() => {
                expect(contextValue.runState.isActive).toBe(true);
                expect(contextValue.runState.currentStage).toBe(1);
            });
        });

        it('should end a run and update stats', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => {
                expect(contextValue).toBeDefined();
            });

            const pilot = PILOTS[0];
            act(() => {
                contextValue.startRun(pilot, 'BALANCED', []);
            });

            await waitFor(() => {
                expect(contextValue.runState.isActive).toBe(true);
            });

            act(() => {
                contextValue.endRun();
            });

            await waitFor(() => {
                expect(contextValue.runState.isActive).toBe(false);
            });
        });

        it('should track kills during run', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.startRun(PILOTS[0], 'BALANCED', []);
                contextValue.addKill();
                contextValue.addKill();
            });

            await waitFor(() => {
                expect(contextValue.profile.totalKills).toBeGreaterThan(0);
            });
        });

        it('should track scrap during run', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.startRun(PILOTS[0], 'BALANCED', []);
                contextValue.addScrap(50);
            });

            await waitFor(() => {
                expect(contextValue.runState.scrap).toBe(50);
            });
        });
    });

    describe('Shop System', () => {
        it('should purchase HP upgrade', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.startRun(PILOTS[0], 'BALANCED', []);
                contextValue.addScrap(100);
            });

            await waitFor(() => {
                expect(contextValue.runState.scrap).toBeGreaterThanOrEqual(50);
            });

            act(() => {
                contextValue.purchaseUpgrade('hp', undefined, 50);
            });

            await waitFor(() => {
                expect(contextValue.runState.maxHpUpgrade).toBe(10);
                expect(contextValue.runState.scrap).toBe(50);
            });
        });

        it('should purchase damage upgrade', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.startRun(PILOTS[0], 'BALANCED', []);
                contextValue.addScrap(100);
                contextValue.purchaseUpgrade('dmg', undefined, 60);
            });

            await waitFor(() => {
                expect(contextValue.runState.damageUpgrade).toBe(1);
            });
        });

        it('should not purchase without enough scrap', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.startRun(PILOTS[0], 'BALANCED', []);
                // Don't add scrap
                contextValue.purchaseUpgrade('hp', undefined, 50);
            });

            await waitFor(() => {
                expect(contextValue.runState.maxHpUpgrade).toBe(0);
            });
        });
    });

    describe('Stage Progression', () => {
        it('should advance stage', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.startRun(PILOTS[0], 'BALANCED', []);
            });

            await waitFor(() => {
                expect(contextValue.runState.currentStage).toBe(1);
            });

            act(() => {
                contextValue.advanceStage();
            });

            await waitFor(() => {
                expect(contextValue.runState.currentStage).toBe(2);
            });
        });
    });

    describe('XP and Leveling', () => {
        it('should add XP', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            const initialXp = contextValue.profile.xp;
            act(() => {
                contextValue.addXp(100);
            });

            await waitFor(() => {
                expect(contextValue.profile.xp).toBe(initialXp + 100);
            });
        });
    });

    describe('Difficulty System', () => {
        it('should set difficulty level', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.setDifficulty('HARD' as DifficultyLevel);
            });

            await waitFor(() => {
                expect(contextValue.difficulty).toBe('HARD');
            });
        });
    });

    describe('Daily Modifiers', () => {
        it('should have daily modifier', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => {
                expect(contextValue).toBeDefined();
                expect(contextValue.dailyModifier).toBeDefined();
                expect(['NONE', 'BOSS_RUSH', 'DOUBLE_HAZARDS', 'PACIFIST']).toContain(contextValue.dailyModifier);
            });
        });
    });

    describe('Statistics Tracking', () => {
        it('should record damage dealt', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.recordDamageDealt(50);
            });

            await waitFor(() => {
                expect(contextValue.stats.totalDamageDealt).toBe(50);
            });
        });

        it('should record enemy kills by name', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.recordEnemyKill('Scout Drone');
                contextValue.recordEnemyKill('Scout Drone');
                contextValue.recordEnemyKill('Heavy Mech');
            });

            await waitFor(() => {
                expect(contextValue.stats.enemyKillsByType?.['Scout Drone']).toBe(2);
                expect(contextValue.stats.enemyKillsByType?.['Heavy Mech']).toBe(1);
            });
        });

        it('should record hazard survival', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.recordHazardSurvival('ACID_RAIN' as HazardType);
                contextValue.recordHazardSurvival('ION_STORM' as HazardType);
            });

            await waitFor(() => {
                expect(contextValue.stats.hazardsSurvived).toBeDefined();
            });
        });

        it('should record ability usage', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.recordAbilityUsage('laser_shot');
                contextValue.recordAbilityUsage('laser_shot');
            });

            await waitFor(() => {
                expect(contextValue.stats.abilityUsage?.['laser_shot']).toBe(2);
            });
        });
    });

    describe('Loadout Management', () => {
        it('should create loadout', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.createLoadout('Test Loadout', PilotId.VANGUARD, 'BALANCED', [], '#FF0000');
            });

            await waitFor(() => {
                expect(contextValue.loadouts.length).toBeGreaterThan(0);
            });
        });

        it('should delete loadout', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.createLoadout('To Delete', PilotId.SOLARIS, 'ASSAULT', [], '#00FF00');
            });

            await waitFor(() => {
                const loadoutId = contextValue.loadouts[0]?.id;
                if (loadoutId) {
                    act(() => {
                        contextValue.deleteLoadout(loadoutId);
                    });
                }
            });

            await waitFor(() => {
                expect(contextValue.loadouts.length).toBe(0);
            });
        });
    });

    describe('Data Persistence', () => {
        it('should save to localStorage', async () => {
            let contextValue: any;
            renderWithProvider(
                <TestConsumer onMount={(ctx) => { contextValue = ctx; }} />
            );

            await waitFor(() => expect(contextValue).toBeDefined());

            act(() => {
                contextValue.addXp(500);
            });

            // Wait for auto-save 
            await new Promise(resolve => setTimeout(resolve, 100));

            const savedData = localStorage.getItem('neon-vanguard-save');
            expect(savedData).not.toBeNull();
        });
    });
});
