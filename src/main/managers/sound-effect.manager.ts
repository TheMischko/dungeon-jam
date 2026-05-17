import {
  DatabaseProvider,
  SearchFn,
  SortFn,
} from '../database/database-provider';
import {
  SoundEffect,
  SoundEffectContextType,
  SoundEffectCreateData,
  SoundEffectReorderQuery,
  SoundEffectUpdateData,
} from '@shared/models/sound-effect.model';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { ipcMain } from 'electron';
import { SoundEffectChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';
import { Logger } from '../utils/logger';
import { SortDirection } from '@shared/models/common.model';
import { TagsManager } from './tags.manager';
import { GetSomeMatch } from '../database/database-provider.model';
import { DisplayOrderManager } from './display-order.manager';
import { OrderableEntityType } from '@shared/models/display-order.model';

export class SoundEffectManager {
  private static instance: SoundEffectManager;

  private logger: Logger;

  constructor(
    private database: DatabaseProvider<SoundEffect>,
    private displayOrderManager: DisplayOrderManager
  ) {
    this.logger = new Logger('SoundEffectManager', 'yellow');
  }

  private static async prepareDatabase(): Promise<
    DatabaseProvider<SoundEffect>
  > {
    return await DatabaseProviderCreator.create<SoundEffect>()
      .setTable('soundEffects')
      .setIdColumn('id')
      .setSort(this.sortFn)
      .setSearch(this.searchFn)
      .complete();
  }

  public static async getInstance(): Promise<SoundEffectManager> {
    if (!this.instance) {
      const database = await this.prepareDatabase();
      const orderManager = await DisplayOrderManager.getInstance();
      this.instance = new SoundEffectManager(database, orderManager);
      this.instance.registerIpcHandlers();
      await this.instance.repairOrderRecordsInit();
    }
    return this.instance;
  }

  private registerIpcHandlers(): void {
    ipcMain.handle(
      SoundEffectChannel.GET_ALL,
      async (_, query: QueryRequest): Promise<SoundEffect[]> => {
        this.logger.log(`Fetching all sound effects.`, query);
        const data = await this.getAll(query);
        this.logger.log(`Found ${data.length} sound effects.`);
        return data;
      }
    );
    ipcMain.handle(
      SoundEffectChannel.GET_BY_ID,
      async (_, id: string): Promise<SoundEffect | null> => {
        this.logger.log(`Fetching record with ID: ${id}.`);
        const record = await this.getById(id);
        this.logger.log(`Record found: ${record ? 'yes' : 'no'}.`);
        return record;
      }
    );
    ipcMain.handle(
      SoundEffectChannel.CREATE,
      async (_, data: SoundEffectCreateData): Promise<SoundEffect> => {
        this.logger.log('Creating new sound effect', data);
        return this.create(data);
      }
    );
    ipcMain.handle(
      SoundEffectChannel.UPDATE,
      async (_, data: SoundEffectUpdateData): Promise<SoundEffect | null> => {
        this.logger.log('Updating record.', data);
        return this.update(data);
      }
    );
    ipcMain.handle(
      SoundEffectChannel.DELETE,
      async (_, id: string): Promise<boolean> => {
        this.logger.log(`Deleting record with ID: ${id}.`);
        return this.deleteById(id);
      }
    );
    ipcMain.handle(
      SoundEffectChannel.CHANGE_ORDER,
      async (_, query: SoundEffectReorderQuery): Promise<void> => {
        this.logger.log('Changing order of a sound effect', { query });
        return await this.changeSoundEffectOrder(query);
      }
    );
  }

  private async getById(id: string): Promise<SoundEffect | null> {
    return (await this.database.getBy('id', id)) ?? null;
  }

  private async create(data: SoundEffectCreateData): Promise<SoundEffect> {
    const soundEffect = await this.database.create({
      ...data,
      volume: 1,
      looping: false,
    });

    await this.displayOrderManager.appendEntity(
      soundEffect.id,
      OrderableEntityType.SoundEffect,
      SoundEffectContextType.Landing
    );

    return soundEffect;
  }

  public async getAll(query: QueryRequest): Promise<SoundEffect[]> {
    const soundEffects = await this.database.getAll(query);

    let orderMap = await this.displayOrderManager.getOrderMap(
      OrderableEntityType.SoundEffect,
      SoundEffectContextType.Landing
    );
    if (orderMap.size !== soundEffects.length) {
      orderMap = await this.repairOrderRecords(
        soundEffects,
        SoundEffectContextType.Landing
      );
    }

    if (!query?.sortBy) {
      soundEffects.sort((a, b) => {
        const orderA = orderMap.get(a.id);
        const orderB = orderMap.get(b.id);

        return (orderA?.order ?? 0) - (orderB?.order ?? 0);
      });
    }

    return soundEffects;
  }

  private async update(
    data: SoundEffectUpdateData
  ): Promise<SoundEffect | null> {
    const matching = await this.getById(data.id);
    if (!matching) {
      this.logger.logWarning(
        `Cannot find record with ID: ${data.id} to update.`
      );
      return null;
    }
    const newRecord: SoundEffect = {
      ...matching,
      ...data,
    };
    return this.database.replaceRecord(newRecord);
  }

  private async deleteById(id: string): Promise<boolean> {
    await this.displayOrderManager.removeFromCollection(
      id,
      OrderableEntityType.SoundEffect,
      SoundEffectContextType.Landing
    );
    return await this.database.deleteOne('id', id);
  }

  private async changeSoundEffectOrder(
    query: SoundEffectReorderQuery
  ): Promise<void> {
    return await this.displayOrderManager.setDisplayOrder(
      query.soundEffectId,
      query.newOrder,
      OrderableEntityType.SoundEffect,
      query.contextType,
      query.contextId
    );
  }

  private async repairOrderRecordsInit(): Promise<void> {
    const currentAllSoundEffects = await this.database.getAll();
    const currentLandingOrder = await this.displayOrderManager.getOrderMap(
      OrderableEntityType.SoundEffect,
      SoundEffectContextType.Landing
    );
    if (currentAllSoundEffects.length === currentLandingOrder.size) {
      return;
    }
    this.logger.log('On init order mismatch, repairing orders.');
    await this.repairOrderRecords(
      currentAllSoundEffects,
      SoundEffectContextType.Landing
    );
  }

  private async repairOrderRecords(
    soundEffects: SoundEffect[],
    contextType: string,
    contextId?: string
  ) {
    return this.displayOrderManager.repairCollection(
      soundEffects,
      'id',
      (a, mapOrderA, b, mapOrderB) => {
        const orderA = mapOrderA ?? 0;
        const orderB = mapOrderB ?? 0;
        return orderA - orderB;
      },
      OrderableEntityType.SoundEffect,
      contextType,
      contextId
    );
  }

  // -- STATIC DB METHODS --

  private static sortFn: SortFn<SoundEffect> = (
    sfxA: SoundEffect,
    sfxB: SoundEffect,
    sortBy: string,
    direction: SortDirection
  ): number => {
    const directionMul = direction === SortDirection.ASC ? 1 : -1;
    if (sortBy === 'id' || sortBy === 'name') {
      return sfxA[sortBy].localeCompare(sfxB[sortBy]) * directionMul;
    }
    if (sortBy === 'duration') {
      return (sfxA['duration'] - sfxB['duration']) * directionMul;
    }
    return 0;
  };

  private static searchFn: SearchFn<SoundEffect> = async (
    sfx: SoundEffect,
    filter: string
  ): Promise<boolean> => {
    if (sfx.name.toLowerCase().includes(filter.toLowerCase())) {
      return true;
    }
    if (!sfx.tags?.length) {
      return false;
    }
    const tagsManager = await TagsManager.getInstance();
    const matchingTags = await tagsManager.getSubset('title', [filter], {
      match: GetSomeMatch.STARTS_WITH,
    });
    if (!matchingTags.length) {
      return false;
    }
    return matchingTags.some((tag) => sfx.tags!.includes(tag.id));
  };
}
