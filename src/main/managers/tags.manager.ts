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
import {
  DefaultGetSomeOptions,
  GetSomeMatch,
  GetSomeOptions,
} from '../database/database-provider.model';
import { DatabaseTable } from '../database/init-database';
import { DatabaseWrapper } from '../database/database';

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
      return await this.getAll(query);
    });
    ipcMain.handle(
      TagChannel.GET_SUBSET,
      async (_, column: keyof TagData, values: []) => {
        return await this.getSubset(column, values);
      },
    );
    ipcMain.handle(TagChannel.INSERT, async (_, data: Tag) => {
      return await this.insert(data);
    });
    ipcMain.handle(TagChannel.SUGGESTION, async (_, titlePart: string) => {
      return await this.getSuggestion(titlePart);
    });
    ipcMain.handle(TagChannel.DELETE_ONE, async (_, tagId: string) => {
      return await this.delete(tagId);
    });
    ipcMain.handle(TagChannel.CLEAR_ORPHANS, async () => {
      return await this.clearOrphanedTags();
    });
  }

  /**
   * Retrieves all tags with optional filtering and sorting
   * @param query - Optional query request with filter/sort parameters
   * @returns All tags matching the query
   */
  public async getAll(query?: QueryRequest): Promise<TagData[]> {
    return await this.tagDatabase.getAll(query);
  }

  /**
   * Retrieves a subset of tags by column value
   * @param column - The column to filter by
   * @param values - The values to match
   * @param options
   * @returns Tags matching the specified values
   */
  public async getSubset<V>(
    column: keyof TagData,
    values: V[],
    options: GetSomeOptions = DefaultGetSomeOptions,
  ): Promise<TagData[]> {
    return await this.tagDatabase.getSome(column, values, options);
  }

  /**
   * Creates a new tag
   * @param data - The tag data to create
   * @returns The created tag
   */
  public async insert(data: Tag): Promise<TagData> {
    return await this.tagDatabase.create(data);
  }

  /**
   * Gets tag suggestions based on a title prefix
   * @param titlePart - The title prefix to search for
   * @returns Tags that start with the given title
   */
  public async getSuggestion(titlePart: string): Promise<TagData[]> {
    return await this.tagDatabase.getSome('title', [titlePart], {
      match: GetSomeMatch.STARTS_WITH,
    });
  }

  /**
   * Deletes a tag by its ID
   * @param tagId
   */
  public async delete(tagId: string): Promise<void> {
    await this.tagDatabase.deleteOne('id', tagId);
  }

  /**
   * Clears orphaned tags that are not used in any configured table
   */
  public async clearOrphanedTags(): Promise<number> {
    const allTags = await this.getAll();
    const usedTagIds = new Set<string>();
    const database = await DatabaseWrapper.getInstance();

    for (const pair of Object.entries(tagUsedInTableColumnMap)) {
      const [table, column] = pair;
      database.readTable<any>(table as DatabaseTable)?.forEach((item: any) => {
        const tags = item[column as keyof typeof item] as string[] | undefined;
        if (tags) {
          tags.forEach((tagId) => usedTagIds.add(tagId));
        }
      });
    }

    const orphanedTags = allTags.filter((tag) => !usedTagIds.has(tag.id));
    for (const orphanedTag of orphanedTags) {
      await this.delete(orphanedTag.id);
    }
    return orphanedTags.length ?? 0;
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

const tagUsedInTableColumnMap = {
  playlists: 'tags',
  tracks: 'tags',
};
