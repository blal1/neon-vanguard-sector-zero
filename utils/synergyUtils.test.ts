import { describe, it, expect } from 'vitest';
import { getActiveSynergies } from './synergyUtils';
import { SYNERGIES } from '../constants';

describe('Synergy Utilities', () => {
    describe('getActiveSynergies', () => {
        it('should return empty array when no augmentations', () => {
            const synergies = getActiveSynergies([]);
            expect(synergies).toEqual([]);
        });

        it('should return empty array when not enough augmentations for synergy', () => {
            // Only one part of a synergy combo
            const synergies = getActiveSynergies(['plasma_coating']);
            expect(synergies).toEqual([]);
        });

        it('should detect INFERNO synergy with correct augmentations', () => {
            // Find INFERNO synergy requirements
            const infernoSynergy = SYNERGIES.find(s => s.id === 'INFERNO');
            if (infernoSynergy) {
                const synergies = getActiveSynergies(infernoSynergy.augmentationIds);
                expect(synergies.some(s => s.id === 'INFERNO')).toBe(true);
            }
        });

        it('should detect BLOOD_SHELL synergy with correct augmentations', () => {
            const bloodShellSynergy = SYNERGIES.find(s => s.id === 'BLOOD_SHELL');
            if (bloodShellSynergy) {
                const synergies = getActiveSynergies(bloodShellSynergy.augmentationIds);
                expect(synergies.some(s => s.id === 'BLOOD_SHELL')).toBe(true);
            }
        });

        it('should detect multiple synergies simultaneously', () => {
            // Combine augmentations for multiple synergies
            const allAugIds = SYNERGIES.flatMap(s => s.augmentationIds);
            const uniqueAugIds = [...new Set(allAugIds)];
            const synergies = getActiveSynergies(uniqueAugIds);
            expect(synergies.length).toBe(SYNERGIES.length);
        });

        it('should not include synergies with missing augmentations', () => {
            // Pass augmentations that don't complete any synergy
            const synergies = getActiveSynergies(['nonexistent_aug1', 'nonexistent_aug2']);
            expect(synergies).toEqual([]);
        });

        it('should handle additional augmentations beyond synergy requirements', () => {
            const infernoSynergy = SYNERGIES.find(s => s.id === 'INFERNO');
            if (infernoSynergy) {
                const extendedAugs = [...infernoSynergy.augmentationIds, 'extra_aug1', 'extra_aug2'];
                const synergies = getActiveSynergies(extendedAugs);
                expect(synergies.some(s => s.id === 'INFERNO')).toBe(true);
            }
        });
    });
});
