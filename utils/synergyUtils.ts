import { Augmentation, Synergy, SynergyId } from '../types';
import { AUGMENTATIONS, SYNERGIES } from '../constants';

export const getActiveSynergies = (equippedAugmentationIds: string[]): Synergy[] => {
  const activeSynergies: Synergy[] = [];

  for (const synergy of SYNERGIES) {
    const requiredAugmentations = synergy.augmentationIds;
    const hasAllRequired = requiredAugmentations.every(augId => equippedAugmentationIds.includes(augId));

    if (hasAllRequired) {
      activeSynergies.push(synergy);
    }
  }

  return activeSynergies;
};
