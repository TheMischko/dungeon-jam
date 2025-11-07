import { ipcMain } from 'electron';
import { TagChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';
import {
  DatabaseProvider,
  FilterFn,
  SortFn,
} from '../database/database-provider';
import { Tag, TagData } from '@shared/models/tag.model';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { SortDirection } from '@shared/models/common.model';
import { GetSomeMatch } from '../database/database-provider.model';

export class TagsManager {
  private static _instance: TagsManager;

  private constructor(private tagDatabase: DatabaseProvider<TagData>) {}

  public static async getInstance(): Promise<TagsManager> {
    if (!TagsManager._instance) {
      const database = await TagsManager.prepareDatabase();
      TagsManager._instance = new TagsManager(database);
      TagsManager._instance.registerChannels();
    }
    return TagsManager._instance;
  }

  private registerChannels(): void {
    ipcMain.handle(TagChannel.GET_ALL, async (_, query?: QueryRequest) => {
      return await this.tagDatabase.getAll(query);
    });
    ipcMain.handle(
      TagChannel.GET_SUBSET,
      async (_, column: keyof TagData, values: []) => {
        return await this.tagDatabase.getSome(column, values);
      },
    );
    ipcMain.handle(TagChannel.INSERT, async (_, data: Tag) => {
      return await this.tagDatabase.create(data);
    });
    ipcMain.handle(TagChannel.SUGGESTION, async (_, titlePart: string) => {
      return await this.tagDatabase.getSome('title', [titlePart], {
        match: GetSomeMatch.STARTS_WITH,
      });
    });
  }

  private static async prepareDatabase(): Promise<DatabaseProvider<TagData>> {
    return await DatabaseProviderCreator.create<TagData>()
      .setTable('tags')
      .setIdColumn('id')
      .setSort(TagsManager.sortTags.bind(this))
      .setFilter(TagsManager.filterTags.bind(this))
      .complete();
  }

  private static sortTags: SortFn<TagData> = (
    itemA: TagData,
    itemB: TagData,
    sortBy: string,
    direction: SortDirection,
  ): number => {
    if (sortBy === 'color') {
      return 0;
    }
    const directionMul = direction === SortDirection.ASC ? 1 : -1;
    return (
      (itemA?.[sortBy as keyof TagData]?.localeCompare(
        itemB?.[sortBy as keyof TagData] ?? '',
      ) ?? 0) * directionMul
    );
  };

  private static filterTags: FilterFn<TagData> = (
    item: TagData,
    filter: string,
  ) => {
    return item.title.includes(filter) || item.id.includes(filter);
  };
}
