import { v4 as uuid } from 'uuid';
import { AudioTrack, Track } from '@shared/models/track.model';

export function mockTrack(options?: Partial<Track>): Track {
  return {
    id: uuid(),
    name: uuid().slice(0, 6),
    url: uuid().slice(0, 6),
    duration: 0,
    author: uuid().slice(0, 6),
    ...options,
  };
}

export function mockAudioTrack(options?: AudioTrack): AudioTrack {
  return {
    title: uuid().slice(0, 6),
    author: uuid().slice(0, 6),
    fullPath: uuid().slice(0, 6),
    length: 0,
    ...options,
  };
}
