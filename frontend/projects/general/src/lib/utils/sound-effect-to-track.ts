import { SoundEffect } from '@shared/models/sound-effect.model';
import { Track } from '@shared/models/track.model';

export const soundEffectToTrack = (soundEffect: SoundEffect): Track => {
  return {
    id: soundEffect.id,
    name: soundEffect.name,
    url: soundEffect.url,
    duration: soundEffect.duration,
  };
};
