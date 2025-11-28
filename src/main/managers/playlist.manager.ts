import { DatabaseWrapper } from '../database/database';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
  PlaylistUpdateQuery,
} from '@shared/models/playlist.model';
import { ipcMain } from 'electron';
import { PlaylistChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { v4 as uuid } from 'uuid';
import { DatabaseProvider } from '../database/database-provider';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { GetSomeMatch } from '../database/database-provider.model';

export class PlaylistManager {
  private static _instance: PlaylistManager;

  private constructor(
    private database: DatabaseWrapper,
    private playlistProvider: DatabaseProvider<Playlist>,
  ) {}

  public static async getInstance() {
    if (!PlaylistManager._instance) {
      const database = await DatabaseWrapper.getInstance();
      const provider = await DatabaseProviderCreator.create<Playlist>()
        .setTable('playlists')
        .setSort((a, b, sortBy, direction) =>
          PlaylistManager.sortPlaylists(a, b, direction, sortBy),
        )
        .setFilter((item, filter) =>
          PlaylistManager.filterPlaylists(item, filter),
        )
        .complete();
      PlaylistManager._instance = new PlaylistManager(database, provider);
      PlaylistManager._instance.registerChannels();
    }
    return PlaylistManager._instance!;
  }

  private registerChannels(): void {
    ipcMain.handle(PlaylistChannel.GET_ALL, async (_, query?: QueryRequest) => {
      return await this.playlistProvider.getAll(query);
    });
    ipcMain.handle(PlaylistChannel.GET_BY_ID, async (_, id: string) => {
      return await this.getById(id);
    });
    ipcMain.handle(
      PlaylistChannel.INSERT,
      async (_, query: PlaylistInsertQuery) => {
        return await this.insert(query);
      },
    );
    ipcMain.handle(
      PlaylistChannel.ADD_TRACKS,
      async (_, data: PlaylistAddTracksData) => {
        return await this.addTracks(data);
      },
    );
    ipcMain.handle(
      PlaylistChannel.UPDATE,
      async (_, query: PlaylistUpdateQuery) => {
        return await this.update(query);
      },
    );
  }

  async insert(query: PlaylistInsertQuery): Promise<Playlist> {
    const playlists = await this.playlistProvider.getAll();
    const newPlaylist = this.createNewPlaylist(query, playlists.length);
    return await this.playlistProvider.create(newPlaylist);
  }

  public static __resetForTests(): void {
    PlaylistManager._instance = undefined as unknown as PlaylistManager;
  }

  private static filterPlaylists(playlist: Playlist, filter?: string): boolean {
    if (!filter) {
      return true;
    }
    const filterLower = filter.toLowerCase();
    // Check if filter matches playlist name
    if (playlist.name.toLowerCase().includes(filterLower)) {
      return true;
    }
    // Check if filter matches any tag
    return playlist.tags.some((tag) => tag.toLowerCase().includes(filterLower));
  }

  private static sortPlaylists(
    playlistA: Playlist,
    playlistB: Playlist,
    direction?: SortDirection,
    sortBy?: string,
  ) {
    if (!direction) {
      return 0;
    }
    type PlaylistKey = Extract<
      keyof Omit<Playlist, 'trackIds' | 'dateCreated' | 'dateUpdated'>,
      string
    >;
    let sortValue: PlaylistKey = 'name';
    if (sortBy && ['name', 'order'].includes(sortBy)) {
      sortValue = sortBy as PlaylistKey;
    }
    const directionNum = direction === SortDirection.ASC ? 1 : -1;

    // Handle string and number sorting
    const valueA = playlistA[sortValue];
    const valueB = playlistB[sortValue];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return (
        valueA.toLowerCase().localeCompare(valueB.toLowerCase()) * directionNum
      );
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA - valueB) * directionNum;
    }

    return 0;
  }

  async addTracks(data: PlaylistAddTracksData): Promise<Map<string, Playlist>> {
    const playlists = this.database.readTable<Playlist[]>('playlists');
    if (!playlists) {
      return new Map();
    }

    const playlistIdsToUpdate = new Set(Object.keys(data));
    const modifiedPlaylists: Playlist[] = [];

    const updatedPlaylists = playlists.map<Playlist>((playlist) => {
      if (!playlistIdsToUpdate.has(playlist.id)) {
        return playlist;
      }

      const tracksToAdd = data[playlist.id];
      const newUniqueTrackIds = Array.from(
        new Set(
          tracksToAdd.filter((trackId) => !playlist.trackIds.includes(trackId)),
        ),
      );

      if (newUniqueTrackIds.length === 0) {
        return playlist;
      }

      const updatedPlaylist: Playlist = {
        ...playlist,
        trackIds: [...playlist.trackIds, ...newUniqueTrackIds],
        dateUpdated: new Date(),
      };

      modifiedPlaylists.push(updatedPlaylist);
      return updatedPlaylist;
    });

    await this.database.updateTable('playlists', updatedPlaylists);
    return new Map(
      modifiedPlaylists.map((playlist) => [playlist.id, playlist]),
    );
  }

  async update(query: PlaylistUpdateQuery): Promise<Playlist> {
    if (!query.id) {
      throw new Error('Playlist ID is required for update.');
    }
    const playlist = await this.playlistProvider.getBy('id', query.id);
    if (!playlist) {
      throw new Error(`Playlist with ID ${query.id} not found`);
    }
    const playlistTags = [
      ...(playlist?.tags ?? []),
      ...(query?.tagsAdded ?? []),
    ].filter((tag) => {
      if (!query?.tagsRemoved) {
        return true;
      }
      return !query.tagsRemoved.includes(tag);
    });
    const playlistTracks = [
      ...(playlist?.trackIds ?? []),
      ...(query?.tracksAdded ?? []),
    ].filter((trackId) => {
      if (!query?.tracksRemoved) {
        return true;
      }
      return !query.tracksRemoved.includes(trackId);
    });
    const updatedPlaylist: Playlist = {
      id: playlist.id,
      name: query.name ?? playlist.name,
      description: query.description ?? playlist.description,
      imageUrl: query.imageUrl ?? playlist.imageUrl,
      tags: playlistTags,
      trackIds: playlistTracks,
      order: playlist.order,
      dateCreated: playlist.dateCreated,
      dateUpdated: new Date(),
    };
    return await this.playlistProvider.replaceRecord(updatedPlaylist);
  }

  async getById(id: string) {
    return this.playlistProvider.getBy('id', id);
  }

  async removeTracksFromPlaylists(trackIds: string[]): Promise<number> {
    const playlists = await this.playlistProvider.getAll();
    let affectedCount = 0;
    for (const playlist of playlists) {
      const tracks = [...playlist.trackIds].filter(
        (trackId) => !trackIds.includes(trackId),
      );
      if (tracks.length !== playlist.trackIds.length) {
        await this.playlistProvider.replaceRecord({
          ...playlist,
          trackIds: tracks,
          dateUpdated: new Date(),
        });
        affectedCount++;
      }
    }
    return affectedCount;
  }

  async isTrackInPlaylists(
    trackId: string,
    playlistIds: string[],
  ): Promise<boolean> {
    if (playlistIds.length <= 1) {
      return this.isTrackInPlaylist(trackId, playlistIds[0]);
    }

    const playlists = await this.playlistProvider.getSome('id', playlistIds, {
      match: GetSomeMatch.EXACT,
    });

    return playlists.some((playlist) => playlist.trackIds.includes(trackId));
  }

  async isTrackInPlaylist(
    trackId: string,
    playlistId: string,
  ): Promise<boolean> {
    const playlist = await this.getById(playlistId);
    if (!playlist) {
      return false;
    }
    return playlist.trackIds.includes(trackId);
  }

  private createNewPlaylist(
    data: PlaylistInsertQuery,
    order: number,
  ): Playlist {
    const id = uuid();
    const date = new Date();
    return {
      id,
      name: data.name,
      description: data?.description,
      order,
      imageUrl: data?.imageUrl,
      tags: data?.tags.map((t) => t.id) ?? [],
      dateCreated: date,
      dateUpdated: date,
      trackIds: [],
    };
  }
}
