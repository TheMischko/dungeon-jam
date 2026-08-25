import { DatabaseWrapper } from '../database/database';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistFetchQuery,
  PlaylistInsertQuery,
  PlaylistOrderContext,
  PlaylistRelativeReorderQuery,
  PlaylistReorderQuery,
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
import { PlaylistHelper } from '../utils/playlist-helper';
import { ImageEntityType, ImageManager } from './image.manager';
import { Logger } from '../utils/logger';
import { DisplayOrderManager } from './display-order.manager';
import { OrderableEntityType } from '@shared/models/display-order.model';
import { createAppError } from '../utils/create-app-error';
import { ErrorCode } from '@shared/models/error.model';
import { withAppError } from '../utils/ipc-handler';

export class PlaylistManager {
  private static _instance: PlaylistManager;
  private logger = new Logger('PlaylistManager', 'magenta');

  private constructor(
    private database: DatabaseWrapper,
    private playlistProvider: DatabaseProvider<Playlist>,
    private imageManager: ImageManager,
    private displayOrderManager: DisplayOrderManager
  ) {}

  public static async getInstance() {
    if (!PlaylistManager._instance) {
      const database = await DatabaseWrapper.getInstance();
      const provider = await DatabaseProviderCreator.create<Playlist>()
        .setTable('playlists')
        .setSort((a, b, sortBy, direction) =>
          PlaylistManager.sortPlaylists(a, b, direction, sortBy)
        )
        .setSearch((item, filter) =>
          PlaylistManager.searchPlaylists(item, filter)
        )
        .complete();
      const imageManager = await ImageManager.getInstance();
      const orderManager = await DisplayOrderManager.getInstance();
      PlaylistManager._instance = new PlaylistManager(
        database,
        provider,
        imageManager,
        orderManager
      );
      PlaylistManager._instance.registerChannels();
      await PlaylistManager._instance.repairOrderRecordsInit();
    }
    return PlaylistManager._instance!;
  }

  private registerChannels(): void {
    ipcMain.handle(
      PlaylistChannel.GET_ALL,
      withAppError(async (_, query?: QueryRequest) => {
        this.logger.log('Getting playlist channels', { query });
        return await this.getAllPlaylists(query);
      })
    );
    ipcMain.handle(
      PlaylistChannel.GET_BY_ID,
      withAppError(async (_, id: string) => {
        this.logger.log('Getting playlist by id', { id });
        return await this.getById(id);
      })
    );
    ipcMain.handle(
      PlaylistChannel.INSERT,
      withAppError(async (_, query: PlaylistInsertQuery) => {
        this.logger.log('Inserting playlist', { query });
        return await this.insert(query);
      })
    );
    ipcMain.handle(
      PlaylistChannel.ADD_TRACKS,
      withAppError(async (_, data: PlaylistAddTracksData) => {
        this.logger.log('Adding playlist', { data });
        return await this.addTracks(data);
      })
    );
    ipcMain.handle(
      PlaylistChannel.UPDATE,
      withAppError(async (_, query: PlaylistUpdateQuery) => {
        this.logger.log('Update playlist', { query });
        return await this.update(query);
      })
    );
    ipcMain.handle(
      PlaylistChannel.CHANGE_ORDER,
      withAppError(async (_, query: PlaylistReorderQuery) => {
        this.logger.log('Changing order of a playlist', { query });
        return await this.changePlaylistOrder(query);
      })
    );
    ipcMain.handle(
      PlaylistChannel.DELETE,
      withAppError(async (_, id: string) => {
        this.logger.log('Deleting playlist', { id });
        return await this.delete(id);
      })
    );
    ipcMain.handle(
      PlaylistChannel.CHANGE_RELATIVE_ORDER,
      withAppError(async (_, query: PlaylistRelativeReorderQuery) => {
        this.logger.log('Changing relative order of a playlist', { query });
        return await this.changePlaylistRelativeOrder(query);
      })
    );
  }

  async getAllPlaylists(query?: QueryRequest): Promise<Playlist[]> {
    const playlists = await this.playlistProvider.getAll(query);

    let orderMap = await this.displayOrderManager.getOrderMap(
      OrderableEntityType.Playlist,
      PlaylistOrderContext.Landing
    );
    const noSearch = query?.search === undefined || query?.search?.length === 0;
    const noFilters =
      query?.filters === undefined || query?.filters.filters.length === 0;
    if (orderMap.size !== playlists.length && noSearch && noFilters) {
      orderMap = await this.repairOrderRecords(
        playlists,
        PlaylistOrderContext.Landing
      );
    }

    if (!query?.sortBy) {
      playlists.sort((a, b) => {
        const orderA = orderMap.get(a.id)!;
        const orderB = orderMap.get(b.id)!;

        return (orderA?.order ?? 0) - (orderB?.order ?? 0);
      });
    }

    return playlists;
  }

  async insert(query: PlaylistInsertQuery): Promise<Playlist> {
    const playlists = await this.playlistProvider.getAll();
    const imageUrl = query.imageUrl
      ? await this.imageManager.processAndSaveImage(
          query.imageUrl,
          ImageEntityType.PLAYLIST
        )
      : undefined;
    try {
      const newPlaylist = this.createNewPlaylist(
        {
          ...query,
          imageUrl,
        },
        playlists.length
      );
      const createdPlaylist = await this.playlistProvider.create(newPlaylist);

      await this.setParentOwnership(
        query.parentPlaylistId ?? undefined,
        createdPlaylist.id
      );

      await this.displayOrderManager.appendEntity(
        createdPlaylist.id,
        OrderableEntityType.Playlist,
        PlaylistOrderContext.Landing
      );
      if (query.parentPlaylistId) {
        await this.displayOrderManager.appendEntity(
          createdPlaylist.id,
          OrderableEntityType.Playlist,
          PlaylistOrderContext.Parent,
          query.parentPlaylistId
        );
      }

      return createdPlaylist;
    } catch (e) {
      if (imageUrl) {
        await this.imageManager.deleteImage(imageUrl);
      }
      throw e;
    }
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
          tracksToAdd.filter((trackId) => !playlist.trackIds.includes(trackId))
        )
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
      modifiedPlaylists.map((playlist) => [playlist.id, playlist])
    );
  }

  async update(query: PlaylistUpdateQuery): Promise<Playlist> {
    if (!query.id) {
      throw createAppError(
        ErrorCode.PlaylistIdRequired,
        'Playlist ID is required for update.'
      );
    }
    const playlist = await this.playlistProvider.getBy('id', query.id);
    if (!playlist) {
      throw createAppError(
        ErrorCode.PlaylistIdNotFound,
        `Playlist with ID ${query.id} not found`,
        {
          playlistId: query.id,
        }
      );
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

    let imageUrl = playlist.imageUrl;
    if (query.imageUrl !== undefined) {
      if (query.imageUrl) {
        imageUrl = await this.imageManager.processAndSaveImage(
          query.imageUrl,
          ImageEntityType.PLAYLIST
        );
      } else {
        imageUrl = undefined;
      }
    }

    if (playlist.imageUrl && imageUrl !== playlist.imageUrl) {
      await this.imageManager.deleteImage(playlist.imageUrl);
    }

    const updatedPlaylist: Playlist = {
      id: playlist.id,
      name: query.name ?? playlist.name,
      description: query.description ?? playlist.description,
      imageUrl,
      tags: playlistTags,
      trackIds: playlistTracks,
      order: playlist.order,
      ownershipId: playlist.ownershipId,
      childrenIds: playlist.childrenIds,
      dateCreated: playlist.dateCreated,
      dateUpdated: new Date(),
    };
    try {
      await this.playlistProvider.replaceRecord(updatedPlaylist);
      await this.setParentOwnership(query.parentPlaylistId, updatedPlaylist.id);

      const finalizedPlaylist = await this.getById(playlist.id);
      if (!finalizedPlaylist) {
        throw createAppError(
          ErrorCode.GenericError,
          'Could not find the updated playlist.'
        );
      }
      return finalizedPlaylist;
    } catch (e) {
      if (playlist.imageUrl && imageUrl !== playlist.imageUrl) {
        await this.imageManager.deleteImage(playlist.imageUrl);
      }
      throw e;
    }
  }

  async getAll(query?: PlaylistFetchQuery | undefined) {
    const playlists = await this.playlistProvider.getAll(query);

    if (query?.hideChildren) {
      return PlaylistHelper.getPlaylistsWithoutChildren(playlists);
    }

    return PlaylistHelper.getPlaylistsWithOwnership(playlists);
  }

  async getById(id: string) {
    return this.playlistProvider.getBy('id', id);
  }

  async delete(playlistId: string): Promise<void> {
    const playlist = await this.getById(playlistId);
    if (!playlist) {
      return;
    }

    if (playlist.imageUrl) {
      await this.imageManager.deleteImage(playlist.imageUrl);
    }

    // 1. Remove this playlist from its parent (if it was a child)
    await this.removeParentOwnership(playlistId);

    // 2. Clear ownershipId on all children (if it was a parent)
    if (playlist.childrenIds?.length) {
      const allPlaylists = await this.playlistProvider.getAll();
      for (const childId of playlist.childrenIds) {
        const child = allPlaylists.find((p) => p.id === childId);
        if (child && child.ownershipId === playlistId) {
          const { ownershipId, ...childWithoutOwnership } = child;
          await this.playlistProvider.replaceRecord(childWithoutOwnership);
        }
      }
    }

    await this.playlistProvider.deleteOne('id', playlistId);
  }

  async removeTracksFromPlaylists(trackIds: string[]): Promise<number> {
    const playlists = await this.playlistProvider.getAll();
    let affectedCount = 0;
    for (const playlist of playlists) {
      const tracks = [...playlist.trackIds].filter(
        (trackId) => !trackIds.includes(trackId)
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
    mustMatchAll: boolean = false
  ): Promise<boolean> {
    if (playlistIds.length <= 1) {
      return this.isTrackInPlaylist(trackId, playlistIds[0]);
    }

    const playlists = await this.playlistProvider.getSome('id', playlistIds, {
      match: GetSomeMatch.EXACT,
    });

    if (mustMatchAll) {
      const playlistsMissingTrack = playlists.filter(
        (playlist) => !playlist.trackIds.includes(trackId)
      );
      return playlistsMissingTrack.length === 0;
    }

    return playlists.some((playlist) => playlist.trackIds.includes(trackId));
  }

  async isTrackInPlaylist(
    trackId: string,
    playlistId: string
  ): Promise<boolean> {
    const playlist = await this.getById(playlistId);
    if (!playlist) {
      return false;
    }
    return playlist.trackIds.includes(trackId);
  }

  async changePlaylistOrder(query: PlaylistReorderQuery): Promise<void> {
    return await this.displayOrderManager.setDisplayOrder(
      query.playlistId,
      query.newOrder,
      OrderableEntityType.Playlist,
      query.contextType,
      query.contextId
    );
  }

  async changePlaylistRelativeOrder(
    query: PlaylistRelativeReorderQuery
  ): Promise<void> {
    return await this.displayOrderManager.setRelativeDisplayOrder(
      query,
      OrderableEntityType.Playlist,
      query.contextType,
      query.contextId
    );
  }

  private createNewPlaylist(
    data: PlaylistInsertQuery,
    order: number
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
      ownershipId: data.parentPlaylistId,
    };
  }

  private async setParentOwnership(
    parentId: string | null | undefined,
    childId: string
  ): Promise<void> {
    if (parentId === undefined) {
      return;
    }

    await this.removeParentOwnership(childId);

    if (parentId === null) {
      return;
    }

    const parentPlaylist = await this.getById(parentId);
    if (!parentPlaylist) {
      return;
    }

    const childPlaylist = await this.getById(childId);
    if (!childPlaylist) {
      return;
    }

    if (childPlaylist.ownershipId !== parentPlaylist.id) {
      const updatedChild: Playlist = {
        ...childPlaylist,
        ownershipId: parentPlaylist.id,
      };
      await this.playlistProvider.replaceRecord(updatedChild);
    }

    if (parentPlaylist.childrenIds?.includes(childId)) {
      return;
    }

    const updatedParent: Playlist = {
      ...parentPlaylist,
      childrenIds: [...(parentPlaylist.childrenIds ?? []), childId],
    };
    await this.playlistProvider.replaceRecord(updatedParent);
  }

  public static __resetForTests(): void {
    PlaylistManager._instance = undefined as unknown as PlaylistManager;
  }

  private static sortPlaylists(
    playlistA: Playlist,
    playlistB: Playlist,
    direction?: SortDirection,
    sortBy?: string
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

  private static searchPlaylists(playlist: Playlist, filter?: string): boolean {
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

  public static filterPlaylists(playlist: Playlist, filter?: string): boolean {
    return PlaylistManager.searchPlaylists(playlist, filter);
  }

  private async repairOrderRecords(
    playlists: Playlist[],
    contextType: string,
    contextId?: string
  ) {
    return await this.displayOrderManager.repairCollection(
      playlists,
      'id',
      (a, mapOrderA, b, mapOrderB) => {
        const orderA = mapOrderA ?? a?.dateUpdated?.getTime?.() ?? 0;
        const orderB = mapOrderB ?? b?.dateUpdated?.getTime?.() ?? 0;
        return orderA - orderB;
      },
      OrderableEntityType.Playlist,
      contextType,
      contextId
    );
  }

  private async repairOrderRecordsInit(): Promise<void> {
    const currentAllPlaylists = await this.playlistProvider.getAll();
    const currentLandingOrder = await this.displayOrderManager.getOrderMap(
      OrderableEntityType.Playlist,
      PlaylistOrderContext.Landing
    );
    if (currentAllPlaylists.length === currentLandingOrder.size) {
      return;
    }
    this.logger.log('On init order mismatch, repairing orders.');
    await this.repairOrderRecords(
      currentAllPlaylists,
      PlaylistOrderContext.Landing
    );
  }

  private async removeParentOwnership(childId: string) {
    const playlists = await this.getAll({});
    const child = playlists.find((playlist) => playlist.id === childId);
    if (child && child.ownershipId) {
      const { ownershipId, ...childWithoutOwnership } = child;
      await this.playlistProvider.replaceRecord(childWithoutOwnership);
    }

    const parent = playlists.find((playlist) =>
      playlist.childrenIds?.includes(childId)
    );
    if (!parent) {
      return;
    }
    const childrenIds = parent.childrenIds!.filter((id) => id !== childId);
    await this.playlistProvider.replaceRecord({
      ...parent,
      childrenIds,
    });
  }
}
