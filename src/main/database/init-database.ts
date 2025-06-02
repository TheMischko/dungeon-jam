import { Track } from '@shared/models/track.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: [],
  };
}
export type DatabaseSchema = ReturnType<typeof initDatabase>;

function initTracks(): Track[] {
  return [
    {
      id: '123',
      name: 'The Best Song',
      author: 'Minstrel',
      url: '/',
    },
    {
      id: '456',
      name: 'The Not So Good Song',
      author: 'Minstrel',
      url: '/',
    },
  ];
}
