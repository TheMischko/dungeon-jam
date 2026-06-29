import { DatabaseProvider } from '../database/database-provider';
import {
  Scene,
  SceneInsertQuery,
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

export class SceneManager {
  private static _instance: SceneManager;

  private logger = new Logger('SceneManager');
  constructor(
    private databaseProvider: DatabaseProvider<Scene>,
    private soundEffectManager: SoundEffectManager,
    private imageManager: ImageManager
  ) {}

  public static async getInstance(): Promise<SceneManager> {
    if (!this._instance) {
      const databaseBuilder = DatabaseProviderCreator.create<Scene>();
      const database = await databaseBuilder
        .setTable('scenes')
        .setIdColumn('id')
        .complete();
      const soundEffectManager = await SoundEffectManager.getInstance();
      const imageManager = await ImageManager.getInstance();
      this._instance = new SceneManager(
        database,
        soundEffectManager,
        imageManager
      );
      this._instance.registerChannels();
    }
    return this._instance;
  }

  private registerChannels(): void {
    ipcMain.handle(SceneChannel.GET_ALL, withAppError((_, query: QueryRequest) => {
      this.logger.log('Received request to get all scenes', { query });
      return this.getAll(query);
    }));
    ipcMain.handle(SceneChannel.GET_BY_ID, withAppError((_, id: string) => {
      this.logger.log('Received request to get by id', { id });
      return this.getById(id);
    }));
    ipcMain.handle(SceneChannel.INSERT, withAppError((_, data: SceneInsertQuery) => {
      this.logger.log('Received request to insert scene', { data });
      return this.insert(data);
    }));
    ipcMain.handle(SceneChannel.UPDATE, withAppError((_, data: SceneUpdateQuery) => {
      this.logger.log('Received request to update scene', { data });
      return this.update(data);
    }));
    ipcMain.handle(SceneChannel.DELETE, withAppError((_, id: string) => {
      this.logger.log('Received request to delete scene', { id });
      return this.deleteById(id);
    }));
    ipcMain.handle(SceneChannel.CHANGE_ORDER, withAppError((_, sceneIds: string[]) => {
      this.logger.log('Received request to change order', { sceneIds });
      this.logger.logWarning('Change order is not implemented');
      return this.getAll({});
    }));
  }

  public async getAll(query: QueryRequest): Promise<Scene[]> {
    const scenes = await this.databaseProvider.getAll(query);
    this.logger.log(`Fetched ${scenes.length} scenes from database`);
    return scenes.map((scene) => this.parseScene(scene));
  }

  public async getById(id: string): Promise<Scene | undefined> {
    const result = (await this.databaseProvider.getBy('id', id)) ?? undefined;
    if (result) {
      this.parseScene(result);
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
      ambience: [],
      stingers: [],
      introTrackIds: [],
      order: scenes.length,
      imageUrl: imagePath,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
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
    };
  }
}
