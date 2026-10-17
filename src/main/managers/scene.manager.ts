import { DatabaseProvider } from '../database/database-provider';
import {
  Scene,
  SceneInsertQuery,
  SceneOrderContext,
  ScenesRelativeDisplayOrderQuery,
  SceneUpdateQuery,
} from '@shared/models/scene.model';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { ipcMain } from 'electron';
import { SceneChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';
import { Logger } from '../utils/logger';
import { SoundEffectManager } from './sound-effect.manager';
import { ImageEntityType, ImageManager } from './image.manager';
import { withAppError } from '../utils/ipc-handler';
import { TagsManager } from './tags.manager';
import { GetSomeMatch } from '../database/database-provider.model';
import { DisplayOrderManager } from './display-order.manager';
import {
  DisplayOrder,
  OrderableEntityType,
} from '@shared/models/display-order.model';

export class SceneManager {
  private static _instance: SceneManager;

  private logger = new Logger('SceneManager');
  constructor(
    private databaseProvider: DatabaseProvider<Scene>,
    private soundEffectManager: SoundEffectManager,
    private imageManager: ImageManager,
    private displayOrderManager: DisplayOrderManager
  ) {}

  public static async getInstance(): Promise<SceneManager> {
    if (!this._instance) {
      const databaseBuilder = DatabaseProviderCreator.create<Scene>();
      const database = await databaseBuilder
        .setTable('scenes')
        .setIdColumn('id')
        .setSearch(SceneManager.searchScenes)
        .complete();
      const soundEffectManager = await SoundEffectManager.getInstance();
      const imageManager = await ImageManager.getInstance();
      const displayOrderManager = await DisplayOrderManager.getInstance();
      this._instance = new SceneManager(
        database,
        soundEffectManager,
        imageManager,
        displayOrderManager
      );
      this._instance.registerChannels();
    }
    return this._instance;
  }

  private registerChannels(): void {
    ipcMain.handle(
      SceneChannel.GET_ALL,
      withAppError((_, query: QueryRequest) => {
        this.logger.log('Received request to get all scenes', { query });
        return this.getAll(query);
      })
    );
    ipcMain.handle(
      SceneChannel.GET_BY_ID,
      withAppError((_, id: string) => {
        this.logger.log('Received request to get by id', { id });
        return this.getById(id);
      })
    );
    ipcMain.handle(
      SceneChannel.INSERT,
      withAppError((_, data: SceneInsertQuery) => {
        this.logger.log('Received request to insert scene', { data });
        return this.insert(data);
      })
    );
    ipcMain.handle(
      SceneChannel.UPDATE,
      withAppError((_, data: SceneUpdateQuery) => {
        this.logger.log('Received request to update scene', { data });
        return this.update(data);
      })
    );
    ipcMain.handle(
      SceneChannel.DELETE,
      withAppError((_, id: string) => {
        this.logger.log('Received request to delete scene', { id });
        return this.deleteById(id);
      })
    );
    ipcMain.handle(
      SceneChannel.CHANGE_ORDER,
      withAppError((_, query: ScenesRelativeDisplayOrderQuery) => {
        this.logger.log('Received request to change order', { query });
        return this.changeRelativeOrder(query);
      })
    );
  }

  public async getAll(query: QueryRequest): Promise<Scene[]> {
    const scenes = await this.databaseProvider.getAll(query);
    this.logger.log(`Fetched ${scenes.length} scenes from database`);
    let orderMap = await this.displayOrderManager.getOrderMap(
      OrderableEntityType.Scene,
      SceneOrderContext.Landing
    );
    if (orderMap.size !== scenes.length && !query.search && !query.filters) {
      orderMap = await this.repairOrderRecords(
        scenes,
        SceneOrderContext.Landing
      );
    }

    if (!query.sortBy) {
      scenes.sort((a, b) => {
        const orderA = orderMap.get(a.id);
        const orderB = orderMap.get(b.id);

        return (orderA?.order ?? 0) - (orderB?.order ?? 0);
      });
    }

    return scenes.map((scene) => this.parseScene(scene));
  }

  private static async searchScenes(
    scene: Scene,
    filter?: string
  ): Promise<boolean> {
    if (!filter) {
      return true;
    }
    const filterLower = filter.toLowerCase();
    if (scene.name && scene.name.toLowerCase().includes(filterLower)) {
      return true;
    }
    if (
      scene.description &&
      scene.description.toLowerCase().includes(filterLower)
    ) {
      return true;
    }
    if (scene.tags?.length) {
      const tags = await (
        await TagsManager.getInstance()
      ).getSubset('id', scene.tags, {
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

  public async getById(id: string): Promise<Scene | undefined> {
    let result = (await this.databaseProvider.getBy('id', id)) ?? undefined;
    if (result) {
      result = this.parseScene(result);
    }
    return result;
  }

  public async insert(scene: SceneInsertQuery): Promise<Scene> {
    let imagePath = undefined;
    if (scene.imageUrl) {
      imagePath = await this.imageManager.processAndSaveImage(
        scene.imageUrl,
        ImageEntityType.SCENE
      );
    }
    const scenes = await this.getAll({});
    const result = await this.databaseProvider.create({
      ...scene,
      playlistId: scene.playlistId ?? null,
      ambience: [],
      stingers: [],
      introTrackIds: [],
      order: scenes.length,
      imageUrl: imagePath,
      includeChildrenTracks: false,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
    await this.displayOrderManager.appendEntity(
      result.id,
      OrderableEntityType.Scene,
      SceneOrderContext.Landing
    );
    return this.parseScene(result);
  }

  public async update(
    updateData: SceneUpdateQuery
  ): Promise<Scene | undefined> {
    const scene = await this.getById(updateData.id);
    if (!scene) {
      return undefined;
    }

    // Ambience
    scene.ambience = scene?.ambience ?? [];
    if (updateData.ambienceAdded?.length) {
      const toAddIds = updateData.ambienceAdded.filter(
        (id) => !scene.ambience?.some((a) => a.soundEffectId === id)
      );
      const soundEffects =
        await this.soundEffectManager.getMultipleByIds(toAddIds);
      soundEffects.forEach((soundEffect) => {
        scene.ambience.push({
          soundEffectId: soundEffect.id,
          volume: soundEffect.volume ?? 0.5,
        });
      });
    }
    if (updateData.ambienceRemoved?.length) {
      scene.ambience = scene.ambience.filter(
        (ref) => !updateData.ambienceRemoved?.includes(ref.soundEffectId)
      );
    }
    if (updateData.ambienceVolumeUpdate) {
      const index = scene.ambience.findIndex(
        (a) =>
          a.soundEffectId === updateData.ambienceVolumeUpdate!.soundEffectId
      );
      if (index >= 0) {
        scene.ambience[index].volume = updateData.ambienceVolumeUpdate!.volume;
      }
    }

    // Stingers
    scene.stingers = scene?.stingers ?? [];
    if (updateData.stingersAdded?.length) {
      const toAddIds = updateData.stingersAdded.filter(
        (id) => !scene.stingers?.some((a) => a.soundEffectId === id)
      );
      const soundEffects =
        await this.soundEffectManager.getMultipleByIds(toAddIds);
      soundEffects.forEach((soundEffect) => {
        scene.stingers.push({
          soundEffectId: soundEffect.id,
          volume: soundEffect.volume ?? 0.5,
        });
      });
    }
    if (updateData.stingersRemoved?.length) {
      scene.stingers = scene.stingers.filter(
        (ref) => !updateData.stingersRemoved!.includes(ref.soundEffectId)
      );
    }
    if (updateData.stingerVolumeUpdate) {
      const index = scene.stingers.findIndex(
        (a) => a.soundEffectId === updateData.stingerVolumeUpdate!.soundEffectId
      );
      if (index >= 0) {
        scene.stingers[index].volume = updateData.stingerVolumeUpdate!.volume;
      }
    }

    // Tags
    if (updateData.tagsAdded?.length) {
      const toAddIds = updateData.tagsAdded.filter(
        (tagId) => !scene.tags.includes(tagId)
      );
      toAddIds.forEach((id) => {
        scene.tags.push(id);
      });
    }
    if (updateData.tagsRemoved?.length) {
      scene.tags = scene.tags.filter(
        (tagId) => !updateData.tagsRemoved!.includes(tagId)
      );
    }

    let imagePath = updateData.imageUrl;
    if (updateData.imageUrl) {
      if (scene.imageUrl) {
        await this.imageManager.deleteImage(scene.imageUrl);
      }
      imagePath = await this.imageManager.processAndSaveImage(
        updateData.imageUrl,
        ImageEntityType.SCENE
      );
    }

    return await this.databaseProvider.replaceRecord({
      ...scene,
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && {
        description: updateData.description ?? undefined,
      }),
      ...(imagePath !== undefined && {
        imageUrl: imagePath ?? undefined,
      }),
      ...(updateData.playlistId !== undefined && {
        playlistId: updateData.playlistId,
      }),
      ...(updateData.introTrackIds !== undefined && {
        introTrackIds: updateData.introTrackIds,
      }),
      ...(updateData.includeChildrenTracks !== undefined && {
        includeChildrenTracks: updateData.includeChildrenTracks,
      }),
      dateUpdated: new Date(),
    });
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.databaseProvider.deleteOne('id', id);
  }

  private parseScene(scene: Scene): Scene {
    return {
      ...scene,
      ambience: scene.ambience ?? [],
      stingers: scene.stingers ?? [],
      tags: scene.tags ?? [],
      playlistId: scene.playlistId ?? null,
      introTrackIds: scene.introTrackIds ?? [],
      includeChildrenTracks: scene.includeChildrenTracks ?? false,
    };
  }

  private async repairOrderRecords(
    scenes: Scene[],
    contextType: string,
    contextId?: string
  ): Promise<Map<string, DisplayOrder>> {
    return this.displayOrderManager.repairCollection(
      scenes,
      'id',
      (a, mapOrderA, b, mapOrderB) => {
        const orderA = mapOrderA ?? a.order ?? 0;
        const orderB = mapOrderB ?? b.order ?? 0;
        return orderA - orderB;
      },
      OrderableEntityType.Scene,
      contextType,
      contextId
    );
  }

  private changeRelativeOrder(
    query: ScenesRelativeDisplayOrderQuery
  ): Promise<Map<string, DisplayOrder>> {
    return this.displayOrderManager.setRelativeDisplayOrder(
      query,
      OrderableEntityType.Scene,
      query.contextType,
      query.contextId
    );
  }
}
