import { SortDirection } from '@shared/models/common.model';

export interface QueryRequest {
  search?: string;
  sortDirection?: SortDirection;
  sortBy?: string;
}

export type QueryOptions = QueryRequest;
