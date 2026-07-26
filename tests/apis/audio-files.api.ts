import { AudioTrack } from '@shared/models/track.model';
import { Page } from 'playwright';

export async function fetchAudioTrackData(
  page: Page,
  filePaths: string[]
): Promise<AudioTrack[]> {
  return await page.evaluate(
    (paths) => (window as any).AUDIO_FILES_API.fetchAudioData(paths),
    filePaths
  );
}
