import { SoundEffect } from '@shared/models/sound-effect.model';

export type SoundEffectVolumeChange = {
  soundEffect: SoundEffect;
  volume: number;
};
