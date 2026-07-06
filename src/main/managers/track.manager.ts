import {
  AudioTrack,
  PlaylistTracksQuery,
  TaggedTracksQuery,
  Track,
} from '@shared/models/track.model';
import { ipcMain } from 'electron';
import { AudioFileChannel, TrackChannel } from '@shared/models/channels.model';
import {
  FilterMatchType,
  PlaylistDiscoverBatchRequest,
  QueryRequest,
} from '@shared/models/request.model';
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
import { FilterQuery } from '@shared/models/filter.model';
import { shuffleList } from '../../../frontend/projects/main/src/app/utils/shuffle-list';
import { withAppError } from '../utils/ipc-handler';

export class TrackManager {
  private static _instance: TrackManager;
  private logger = new Logger('TrackManager', 'green');
  private readonly MAX_CHILDREN_DEPTH = 5;

  private constructor(
    private tracksProvider: DatabaseProvider<Track>,
    private filesManager: FilesManager
  ) {}

  public static async getInstance() {
    if (!TrackManager._instance) {
      const provider = await DatabaseProviderCreator.create<Track>()
        .setTable('tracks')
        .setSort(TrackManager.sortTracks)
        .setSearch(TrackManager.searchTracks)
        .setFilter(TrackManager.trackMatchingFilters)
        .complete();
      const filesManager = await FilesManager.getInstance();
      TrackManager._instance = new TrackManager(provider, filesManager);
      TrackManager._instance.registerChannels();
    }
    return TrackManager._instance!;
  }

  private registerChannels(): void {
    ipcMain.handle(TrackChannel.GET_ALL, withAppError(async (_, query?: QueryRequest) => {
      this.logger.log('Fetching playlist tracks', { query });
      const result = await this.getAll(query);
      this.logger.log(`Found ${result.length} matching tracks`);
      return result;
    }));

    ipcMain.handle(TrackChannel.GET_BY_ID, withAppError(async (_, id: string) => {
      this.logger.log('Fetching playlist tracks', { id });
      const result = await this.get(id);
      this.logger.log('Found:', { track: result });
      return result;
    }));

    ipcMain.handle(
      TrackChannel.GET_PLAYLIST_TRACKS,
      withAppError(async (_, query: PlaylistTracksQuery) => {
        this.logger.log('Fetching playlist tracks', { query });
        const result = await this.getByPlaylist(query);
        this.logger.log(`Found ${result.length} matching tracks`);
        return result;
      })
    );

    ipcMain.handle(
      TrackChannel.PLAYLIST_DISCOVER,
      withAppError(async (_, query: PlaylistDiscoverBatchRequest) => {
        this.logger.log(`Fetching discover tracks for playlist.`, { query });
        const result = await this.discoverTracks(query);
        this.logger.log(`Tracks discovered.`, {
          result: result.map((r) => ({ id: r.id, name: r.name })),
        });
        return result;
      })
    );

    ipcMain.handle(
      TrackChannel.INSERT,
      withAppError(async (
        _,
        name: string,
        url: string,
        duration: number,
        author?: string,
        tags?: string[]
      ) => {
        return await this.insert(name, url, duration, author, tags);
      })
    );

    ipcMain.handle(AudioFileChannel.UPLOAD, withAppError(async (_, tracks: AudioTrack[]) => {
      const inserted: Track[] = [];
      for (const track of tracks) {
        const resolved = resolveAudioTrack(track);
        this.logger.log('Uploading track', {
          name: resolved.name,
          url: resolved.url,
          author: resolved.author,
          duration: resolved.duration,
        });

        inserted.push(
          await this.insert(
            resolved.name,
            resolved.url,
            resolved.duration,
            resolved.author,
            resolved.tags
          )
        );
      }
      return inserted;
    }));

    ipcMain.handle(TrackChannel.UPDATE, withAppError(async (_, track: Track) => {
      return await this.update(track);
    }));

    ipcMain.handle(TrackChannel.DELETE, withAppError(async (_, id: string) => {
      return await this.deleteById(id);
    }));

    ipcMain.handle(
      TrackChannel.GET_TAGGED_TRACKS,
      withAppError(async (_, query: TaggedTracksQuery) => {
        return await this.getTaggedTracks(query.tagId, query);
      })
    );
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
    const allTracks = await this.getAll(query);
    if (query.includeChildren) {
      return this.getPlaylistTracksWithChildren(playlist, allTracks);
    }

    return this.getPlaylistTracks(playlist, allTracks);
  }

  async insert(
    name: string,
    url: string,
    duration: number,
    author?: string,
    tags?: string[]
  ): Promise<Track> {
    const newTrack = {
      name,
      url,
      author,
      duration,
      tags,
    };
    const newRecord = await this.tracksProvider.create(newTrack);
    this.logger.log('Insert track', {
      trackId: newRecord.id,
      name,
      url,
      author,
      duration,
    });
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

  private async update(track: Track) {
    this.logger.log('Update track', { trackId: track.id });
    const updatedRecord = await this.tracksProvider.update(
      'id',
      track.id,
      track
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

  private async getPlaylistTracksWithChildren(
    playlist: Playlist,
    allTracks: Track[]
  ) {
    const playlistManager = await PlaylistManager.getInstance();
    if (!playlist.childrenIds || playlist.childrenIds.length === 0) {
      return this.getPlaylistTracks(playlist, allTracks);
    }
    const allPlaylists = await playlistManager.getAll();

    const relatedTracks = this.getTracksFromChildren(
      playlist,
      allTracks,
      allPlaylists
    );
    const relatedTrackIds = relatedTracks.map((track) => track.id);
    const trackIdsUniqueSet = new Set(relatedTrackIds);
    return allTracks.filter((track) => trackIdsUniqueSet.has(track.id));
  }

  getTracksFromChildren(
    playlist: Playlist,
    allTracks: Track[],
    allPlaylists: Playlist[],
    currentIteration: number = 0
  ): Track[] {
    if (currentIteration > this.MAX_CHILDREN_DEPTH) {
      return [];
    }
    if (!playlist?.childrenIds?.length) {
      return this.getPlaylistTracks(playlist, allTracks);
    }

    const childrenPlaylists = allPlaylists.filter((p) =>
      playlist.childrenIds!.includes(p.id)
    );

    const tracks = childrenPlaylists.reduce((tracks, childPlaylist, _, __) => {
      const childTracks = this.getPlaylistTracks(childPlaylist, allTracks);
      childTracks.forEach((track) => tracks.add(track));
      const childChildrenTracks = this.getTracksFromChildren(
        childPlaylist,
        allTracks,
        allPlaylists,
        currentIteration + 1
      );
      childChildrenTracks.forEach((track) => tracks.add(track));
      return tracks;
    }, new Set<Track>());

    this.getPlaylistTracks(playlist, allTracks).forEach((item) =>
      tracks.add(item)
    );

    return Array.from(tracks.values());
  }

  async getTaggedTracks(tagId: string, query?: QueryRequest): Promise<Track[]> {
    return this.tracksProvider.getMatching(
      (track) => track.tags?.includes(tagId) ?? false,
      query
    );
  }

  /***
   * STATIC METHODS
   ***/

  public static __resetForTests(): void {
    TrackManager._instance = undefined as unknown as TrackManager;
  }

  private static async searchTracks(
    track: Track,
    filter?: string
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
    direction?: SortDirection
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

  private static async trackMatchingFilters(
    track: Track,
    filterQuery: FilterQuery
  ): Promise<boolean> {
    if (!filterQuery?.filters?.length) {
      return true;
    }
    const playlistFilters = filterQuery.filters.find(
      (f) => f.property === 'playlist'
    );
    const tagFilters = filterQuery.filters.find((f) => f.property === 'tag');

    let matchingPlaylist = true;
    if (playlistFilters) {
      const playlistManager = await PlaylistManager.getInstance();
      matchingPlaylist = await playlistManager.isTrackInPlaylists(
        track.id,
        playlistFilters.values,
        filterQuery.matchType === FilterMatchType.ALL
      );
    }

    let matchingTags = true;
    if (tagFilters) {
      const trackTags = track?.tags ?? [];
      const missingTags = tagFilters.values.filter(
        (tagId) => !trackTags.includes(tagId)
      );
      matchingTags =
        filterQuery.matchType === FilterMatchType.ANY
          ? missingTags.length < tagFilters.values.length
          : missingTags.length === 0;
    }

    if (tagFilters && playlistFilters) {
      return filterQuery.matchType === FilterMatchType.ANY
        ? matchingPlaylist || matchingTags
        : matchingPlaylist && matchingTags;
    }
    if (!tagFilters && playlistFilters) {
      return matchingPlaylist;
    }
    if (tagFilters && !playlistFilters) {
      return matchingTags;
    }
    return true;
  }

  private async discoverTracks(
    query: PlaylistDiscoverBatchRequest
  ): Promise<Track[]> {
    const playlistTracks = await this.getByPlaylist({
      playlistId: query.playlistId,
      includeChildren: true,
    });
    const excludedTrackIds = new Set(playlistTracks.map((t) => t.id));

    const allTracks = await this.tracksProvider.getAll(query);
    const validTracks = allTracks.filter((t) => !excludedTrackIds.has(t.id));
    const shuffled = shuffleList(validTracks);
    const batch = shuffled.slice(0, query.batchSize);
    const hasSort =
      query?.sortBy !== undefined && query?.sortDirection !== undefined;
    return hasSort
      ? batch.sort((a, b) =>
          TrackManager.sortTracks(a, b, query.sortBy, query.sortDirection)
        )
      : batch;
  }
}
