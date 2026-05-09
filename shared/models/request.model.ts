import { SortDirection } from '@shared/models/common.model';
import { FilterQuery } from '@shared/models/filter.model';

export interface QueryRequest {
  search?: string;
  sortDirection?: SortDirection;
  sortBy?: string;
  filters?: FilterQuery;
}

export interface FilterConstrain {
  property: string;
  values: string[];
}

export enum FilterMatchType {
  ALL = 'ALL',
  ANY = 'ANY',
}

export type QueryOptions = QueryRequest;

export interface BatchRequest extends QueryRequest {
  batchSize: number;
  random?: string;
}

export interface PlaylistDiscoverBatchRequest extends BatchRequest {
  playlistId: string;
}
