import { QueryRequest } from '@shared/models/request.model';
import { Tag, TagData } from '@shared/models/tag.model';

export type TagApiWindow = Window &
  typeof globalThis & {
    TAG_API: {
      getAllTags: (options: QueryRequest) => Promise<TagData[]>;
      getSubsetOfTags: (
        column: keyof TagData,
        values: unknown[],
      ) => Promise<TagData[]>;
      insertTag: (data: Tag) => Promise<TagData>;
      getTagSuggestion: (titlePart: string) => Promise<TagData[]>;
      deleteTag: (tagId: string) => Promise<void>;
      clearOrphanedTags: () => Promise<number>;
      getTagsTrackCount: () => Promise<Record<string, number>>;
    };
  };
