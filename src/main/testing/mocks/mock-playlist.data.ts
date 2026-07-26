import { v4 as uuid } from 'uuid';
import { Playlist } from '@shared/models/playlist.model';

export function mockPlaylist(options?: Partial<Playlist>): Playlist {
  return {
    id: uuid(),
    name: uuid().slice(0, 6),
    tags: [uuid().slice(0, 4)],
    trackIds: [uuid()],
    order: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    ...options,
  };
}
