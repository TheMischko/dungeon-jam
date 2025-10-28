import { DatabaseWrapper } from '../database/database';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
} from '@shared/models/playlist.model';
import { ipcMain } from 'electron';
import { PlaylistChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { v4 as uuid } from 'uuid';

export class PlaylistManager {
  private static _instance: PlaylistManager;

  private constructor(private database: DatabaseWrapper) {}

  public static async getInstance() {
    if (!PlaylistManager._instance) {
      const database = await DatabaseWrapper.getInstance();
      PlaylistManager._instance = new PlaylistManager(database);
      PlaylistManager._instance.registerChannels();
    }
    return PlaylistManager._instance!;
  }

  private registerChannels(): void {
    ipcMain.handle(PlaylistChannel.GET_ALL, (_, query?: QueryRequest) => {
      return this.getAll(query);
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
  }

  getAll(query?: QueryRequest): Playlist[] {
    const data = this.database.readTable<Playlist[]>('playlists') ?? [];
    return data
      .filter((playlist) => this.filterPlaylists(playlist, query?.filter))
      .sort((a, b) =>
        this.sortPlaylists(a, b, query?.sortDirection, query?.sortBy),
      );
  }

  async insert(query: PlaylistInsertQuery): Promise<Playlist> {
    const playlists = this.database.readTable<Playlist[]>('playlists') ?? [];
    const newPlaylist = this.createNewPlaylist(query, playlists.length);
    await this.database.updateTable('playlists', [...playlists, newPlaylist]);
    return newPlaylist;
  }

  public static __resetForTests(): void {
    PlaylistManager._instance = undefined as unknown as PlaylistManager;
  }

  private filterPlaylists(playlist: Playlist, filter?: string): boolean {
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

  private sortPlaylists(
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
      tags: data?.tags ?? [],
      dateCreated: date,
      dateUpdated: date,
      trackIds: [],
    };
  }

  private async addTracks(
    data: PlaylistAddTracksData,
  ): Promise<Map<string, Playlist>> {
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
}
