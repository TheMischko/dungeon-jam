import {
  AudioTrack,
  PlaylistTracksQuery,
  Track,
} from '@shared/models/track.model';
import { ipcMain } from 'electron';
import { AudioFileChannel, TrackChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { PlaylistManager } from './playlist.manager';
import { DatabaseProvider } from '../database/database-provider';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { TagsManager } from './tags.manager';
import { GetSomeMatch } from '../database/database-provider.model';
import { FilesManager } from './files.manager';
import { Logger } from '../utils/logger';
import { Playlist } from '@shared/models/playlist.model';
import { resolveAudioTrack } from '../utils/resolve-audio-track';

export class TrackManager {
  private static _instance: TrackManager;
  private logger = new Logger('TrackManager', 'green');
  private readonly MAX_CHILDREN_DEPTH = 5;

  private constructor(
    private tracksProvider: DatabaseProvider<Track>,
    private filesManager: FilesManager,
  ) {}

  public static async getInstance() {
    if (!TrackManager._instance) {
      const provider = await DatabaseProviderCreator.create<Track>()
        .setTable('tracks')
        .setSort(TrackManager.sortTracks)
        .setFilter(TrackManager.filterTracks)
        .complete();
      const filesManager = await FilesManager.getInstance();
      TrackManager._instance = new TrackManager(provider, filesManager);
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
        tags?: string[],
      ) => {
        return await this.insert(name, url, duration, author, tags);
      },
    );

    ipcMain.handle(AudioFileChannel.UPLOAD, async (_, tracks: AudioTrack[]) => {
      for (const track of tracks) {
        const resolved = resolveAudioTrack(track);
        this.logger.log('Uploading track', { name: resolved.name, url: resolved.url, author: resolved.author, duration: resolved.duration });

        await this.insert(
          resolved.name,
          resolved.url,
          resolved.duration,
          resolved.author,
          resolved.tags,
        );
      }
    });

    ipcMain.handle(TrackChannel.UPDATE, async (_, track: Track) => {
      return await this.update(track);
    });

    ipcMain.handle(TrackChannel.DELETE, async (_, id: string) => {
      return await this.deleteById(id);
    });
  }

  async getAll(query?: QueryRequest): Promise<Track[]> {
    return await this.tracksProvider.getAll(query);
  }

  async get(id: string): Promise<Track | undefined> {
    return (await this.tracksProvider.getBy('id', id)) ?? undefined;
  }

  async getByPlaylist(query: PlaylistTracksQuery): Promise<Track[]> {
    const playlist = await (
      await PlaylistManager.getInstance()
    ).getById(query.playlistId);

    if (!playlist) {
      return [];
    }
    const allTracks = await this.getAll({
      filter: query?.filter,
      sortBy: query?.sortBy,
      sortDirection: query?.sortDirection,
    });

    if(query.includeChildren){
      return this.getPlaylistTracksWithChildren(playlist, allTracks);
    }

    return this.getPlaylistTracks(playlist, allTracks);
  }

  async insert(
    name: string,
    url: string,
    duration: number,
    author?: string,
    tags?: string[],
  ): Promise<Track> {
    const newTrack = {
      name,
      url,
      author,
      duration,
      tags,
    };
    const newRecord = await this.tracksProvider.create(newTrack);
    this.logger.log('Insert track', { trackId: newRecord.id, name, url, author, duration });
    try {
      await this.filesManager.updateTrackFile(newRecord);
    } catch (e) {
      console.error('[TrackManager] Failed to update track file metadata', e);
      this.logger.logErrorMessage('Failed to update track file metadata', {
        error: e,
      });
    }
    return newRecord;
  }

  async deleteById(id: string) {
    this.logger.log('Delete track', { trackId: id });
    const playlistsManager = await PlaylistManager.getInstance();
    await playlistsManager.removeTracksFromPlaylists([id]);
    return await this.tracksProvider.deleteOne('id', id);
  }

  public static __resetForTests(): void {
    TrackManager._instance = undefined as unknown as TrackManager;
  }

  private static async filterTracks(
    track: Track,
    filter?: string,
  ): Promise<boolean> {
    if (!filter) {
      return true;
    }
    const filterLower = filter.toLowerCase();
    if (track.name && track.name.toLowerCase().includes(filterLower)) {
      return true;
    }
    if (track?.author && track.author.toLowerCase().includes(filterLower)) {
      return true;
    }
    if (track?.tags) {
      const tags = await (
        await TagsManager.getInstance()
      ).getSubset('id', track.tags, {
        match: GetSomeMatch.EXACT,
      });
      for (const tag of tags) {
        if (tag.title.toLowerCase().includes(filterLower)) {
          return true;
        }
      }
    }
    return false;
  }

  private static sortTracks(
    trackA: Track,
    trackB: Track,
    sortBy?: string,
    direction?: SortDirection,
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

    const valA = trackA[sortValue] as string;
    const valB = trackB[sortValue] as string;

    return valA.toLowerCase().localeCompare(valB.toLowerCase()) * directionNum;
  }

  private async update(track: Track) {
    this.logger.log('Update track', { trackId: track.id });
    const updatedRecord = await this.tracksProvider.update(
      'id',
      track.id,
      track,
    );
    try {
      await this.filesManager.updateTrackFile(updatedRecord);
    } catch (e) {
      this.logger.logErrorMessage('Failed to update track file metadata', {
        error: e,
      });
    }
    return updatedRecord;
  }

  private getPlaylistTracks(playlist: Playlist, allTracks: Track[]): Track[] {
    return allTracks.reduce((playlistTracks, track, _, __) => {
      if (!playlist.trackIds.includes(track.id)) {
        return playlistTracks;
      }
      return [...playlistTracks, track];
    }, [] as Track[]);
  }

  private async getPlaylistTracksWithChildren(playlist: Playlist, allTracks: Track[]) {
    const playlistManager = await PlaylistManager.getInstance();
    if(!playlist.childrenIds || playlist.childrenIds.length === 0){
      return this.getPlaylistTracks(playlist, allTracks);
    }
    const allPlaylists = await playlistManager.getAll();


    const relatedTracks = this.getTracksFromChildren(playlist, allTracks, allPlaylists);
    const relatedTrackIds = relatedTracks.map(track => track.id);
    const trackIdsUniqueSet = new Set(relatedTrackIds);
    return allTracks.filter(track => trackIdsUniqueSet.has(track.id));
  }

  getTracksFromChildren(playlist: Playlist, allTracks: Track[], allPlaylists: Playlist[], currentIteration: number = 0): Track[] {
    if(currentIteration > this.MAX_CHILDREN_DEPTH){
      return [];
    }
    if(!playlist?.childrenIds?.length){
      return this.getPlaylistTracks(playlist, allTracks);
    }

    const childrenPlaylists = allPlaylists.filter(p => playlist.childrenIds!.includes(p.id));

    const tracks = childrenPlaylists.reduce((tracks, childPlaylist, _, __) => {
      const childTracks = this.getPlaylistTracks(childPlaylist, allTracks);
      childTracks.forEach((track) => tracks.add(track));
      const childChildrenTracks = this.getTracksFromChildren(childPlaylist, allTracks, allPlaylists, currentIteration + 1);
      childChildrenTracks.forEach((track) => tracks.add(track));
      return tracks;
    }, new Set<Track>())

    this.getPlaylistTracks(playlist, allTracks).forEach((item) => tracks.add(item));

    return Array.from(tracks.values());
  }
}
