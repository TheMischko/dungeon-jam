import { QueryRequest } from '@shared/models/request.model';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
  PlaylistRelativeReorderQuery,
  PlaylistReorderQuery,
  PlaylistUpdateQuery,
} from '@shared/models/playlist.model';
import { DisplayOrder } from '@shared/models/display-order.model';

export type PlaylistApiWindow = Window &
  typeof globalThis & {
    PLAYLIST_API: {
      getAllPlaylists: (options: QueryRequest) => Promise<Playlist[]>;
      getPlaylistById: (playlistId: string) => Promise<Playlist>;
      insertPlaylist: (data: PlaylistInsertQuery) => Promise<Playlist>;
      addTracksToPlaylists: (
        data: PlaylistAddTracksData
      ) => Promise<Map<string, Playlist>>;
      updatePlaylist: (query: PlaylistUpdateQuery) => Promise<Playlist>;
      changePlaylistOrder: (query: PlaylistReorderQuery) => Promise<void>;
      changePlaylistRelativeOrder: (
        query: PlaylistRelativeReorderQuery
      ) => Promise<Map<string, DisplayOrder>>;
      deletePlaylist: (playlistId: string) => Promise<void>;
    };
  };
