import { SoundEffect } from '@shared/models/sound-effect.model';

export interface SelectSoundEffectsSelection {
  selectedSoundEffects: SoundEffect[];
}

export interface SelectSoundEffectsModalData {
  excludedSoundEffectIds?: string[];
}
