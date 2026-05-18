import { Track } from '@shared/models/track.model';
import { Page } from 'playwright';

export interface TrackSeedData {
  name: string;
  url: string;
  duration: number;
  author?: string;
  tags?: string[];
}

export async function createTrack(
  page: Page,
  data: TrackSeedData
): Promise<Track> {
  return await page.evaluate(
    ({ name, url, duration, author, tags }) =>
      (window as any).TRACK_API.createTrack(name, url, duration, author, tags),
    data
  );
}
