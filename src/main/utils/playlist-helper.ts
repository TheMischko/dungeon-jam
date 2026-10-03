import { Playlist } from '@shared/models/playlist.model';

export class PlaylistHelper {
  static async getPlaylistsWithoutChildren(
    playlists: Playlist[]
  ): Promise<Playlist[]> {
    const childrenIds = playlists.reduce((ids, playlist, _, __) => {
      playlist.childrenIds?.forEach((childId) => ids.add(childId));
      return ids;
    }, new Set<string>());

    return playlists.filter((playlist) => !childrenIds.has(playlist.id));
  }
  static async getPlaylistsWithOwnership(
    playlists: Playlist[]
  ): Promise<Playlist[]> {
    const playlistMap = await this.getPlaylistMap(playlists);
    const updatedPlaylists = PlaylistHelper.addOwnershipToPlaylists(
      playlists,
      playlistMap
    );
    const order = Object.fromEntries(
      playlists.map((p, i) => [p.id, i] as const)
    );

    const correctIndex = (p: Playlist) =>
      order[p.id] ?? Number.MAX_SAFE_INTEGER;

    return updatedPlaylists.sort((a, b) => {
      return correctIndex(a) - correctIndex(b);
    });
  }

  static addOwnershipToPlaylists(
    playlists: Playlist[],
    playlistMap: Map<string, Playlist>,
    parentId?: string
  ): Playlist[] {
    return playlists.reduce((processed, playlist, _, __) => {
      const updatedPlaylist: Playlist = {
        ...playlist,
        ownershipId: parentId ?? undefined,
      };
      const childrenPlaylists = this.addOwnershipToPlaylists(
        updatedPlaylist.childrenIds
          ?.map((ch) => playlistMap.get(ch))
          .filter((pl): pl is Playlist => !!pl) ?? [],
        playlistMap,
        updatedPlaylist.id
      );
      const processedWithoutChildren = processed.filter((p) => {
        return (
          p.id !== updatedPlaylist.id &&
          !childrenPlaylists.some((c) => c.id === p.id)
        );
      });
      return [
        ...processedWithoutChildren,
        updatedPlaylist,
        ...childrenPlaylists,
      ];
    }, [] as Playlist[]);
  }

  static async getPlaylistMap(
    playlists?: Playlist[]
  ): Promise<Map<string, Playlist>> {
    if (!playlists) {
      return new Map();
    }
    const records = playlists.map(
      (playlist) => [playlist.id, playlist] as const
    );
    return new Map(records);
  }
}
