import { DatabaseWrapper } from '../database/database';
import {
  AudioTrack,
  PlaylistTracksQuery,
  Track,
} from '@shared/models/track.model';
import { ipcMain } from 'electron';
import { AudioFileChannel, TrackChannel } from '@shared/models/channels.model';
import { v4 as uuid } from 'uuid';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { PlaylistManager } from './playlist.manager';

export class TrackManager {
  private static _instance: TrackManager;

  private constructor(private database: DatabaseWrapper) {}

  public static async getInstance() {
    if (!TrackManager._instance) {
      const database = await DatabaseWrapper.getInstance();
      TrackManager._instance = new TrackManager(database);
      TrackManager._instance.registerChannels();
    }
    return TrackManager._instance!;
  }

  private registerChannels(): void {
    ipcMain.handle(TrackChannel.GET_ALL, (_, query?: QueryRequest) => {
      return this.getAll(query);
    });

    ipcMain.handle(TrackChannel.GET_BY_ID, (_, id: string) => {
      return this.get(id);
    });

    ipcMain.handle(
      TrackChannel.GET_PLAYLIST_TRACKS,
      (_, query: PlaylistTracksQuery) => {
        return this.getByPlaylist(query);
      },
    );

    ipcMain.handle(
      TrackChannel.INSERT,
      async (
        _,
        name: string,
        url: string,
        duration: number,
        author?: string,
      ) => {
        return await this.insert(name, url, duration, author);
      },
    );

    ipcMain.handle(AudioFileChannel.UPLOAD, async (_, tracks: AudioTrack[]) => {
      const promises = tracks.map((track: AudioTrack) => {
        return this.insert(
          track.title,
          track.fullPath,
          track.length,
          track.author,
        );
      });
      await Promise.all(promises);
    });
  }

  getAll(query?: QueryRequest): Track[] {
    const data = this.database.readTable<Track[]>('tracks') ?? [];
    return data
      .filter((track) => this.filterTracks(track, query?.filter))
      .sort((a, b) =>
        this.sortTracks(a, b, query?.sortDirection, query?.sortBy),
      );
  }

  get(id: string): Track | undefined {
    return this.getAll()?.find((track) => track.id === id);
  }

  async getByPlaylist(query: PlaylistTracksQuery): Promise<Track[]> {
    const playlist = await (
      await PlaylistManager.getInstance()
    ).getById(query.playlistId);
    if (!playlist) {
      return [];
    }
    const allTracks = this.getAll();
    return allTracks
      .reduce((playlistTracks, track, _, __) => {
        if (!playlist.trackIds.includes(track.id)) {
          return playlistTracks;
        }
        return [...playlistTracks, track];
      }, [] as Track[])
      .filter((track) => this.filterTracks(track, query?.filter))
      .sort((a, b) => this.sortTracks(a, b));
  }

  async insert(
    name: string,
    url: string,
    duration: number,
    author?: string,
  ): Promise<Track> {
    const tracks = this.getAll();
    const id = uuid();
    const newTrack = {
      id,
      name,
      url,
      author,
      duration,
    };
    tracks.push(newTrack);
    await this.database.updateTable('tracks', tracks);
    return this.get(id)!;
  }

  public static __resetForTests(): void {
    TrackManager._instance = undefined as unknown as TrackManager;
  }

  private filterTracks(track: Track, filter?: string): boolean {
    if (!filter) {
      return true;
    }
    const filterLower = filter.toLowerCase();
    if (track?.author && track.author.toLowerCase().includes(filterLower)) {
      return true;
    }
    return track.name.toLowerCase().includes(filterLower);
  }

  private sortTracks(
    trackA: Track,
    trackB: Track,
    direction?: SortDirection,
    sortBy?: string,
  ) {
    if (!direction) {
      return 0;
    }
    type TrackKey = Extract<keyof Omit<Track, 'duration'>, string>;
    let sortValue: TrackKey = 'name';
    if (sortBy && ['name', 'author'].includes(sortBy)) {
      sortValue = sortBy as TrackKey;
    }
    const directionNum = direction === SortDirection.ASC ? 1 : -1;

    return (
      trackA[sortValue]!.toLowerCase().localeCompare(
        trackB[sortValue]!.toLowerCase(),
      ) * directionNum
    );
  }
}
