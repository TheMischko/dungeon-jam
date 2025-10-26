import { QueryRequest } from '@shared/models/request.model';
import { Playlist, PlaylistInsertQuery } from '@shared/models/playlist.model';

export type PlaylistApiWindow = Window &
  typeof globalThis & {
    PLAYLIST_API: {
      getAllPlaylists: (options: QueryRequest) => Promise<Playlist[]>;
      insertPlaylist: (data: PlaylistInsertQuery) => Promise<Playlist>;
    };
  };
