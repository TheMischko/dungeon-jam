import { Page } from 'playwright';
import {
  SoundEffect,
  SoundEffectCreateData,
} from '@shared/models/sound-effect.model';

export async function createSoundEffect(
  page: Page,
  data: SoundEffectCreateData
): Promise<SoundEffect> {
  return await page.evaluate(
    (d) => (window as any).SOUND_EFFECT_API.create(d),
    data
  );
}
