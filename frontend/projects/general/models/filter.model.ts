export type FilterMatchingOption = 'any' | 'all';

export interface SongsTableFilters {
  matching: FilterMatchingOption;
  playlistIds: string[];
  tagIds: string[];
}
