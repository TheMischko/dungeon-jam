import { SortDirection } from '@shared/models/common.model';

export interface QueryRequest {
  filter?: string;
  sortDirection?: SortDirection;
  sortBy?: string;
}
