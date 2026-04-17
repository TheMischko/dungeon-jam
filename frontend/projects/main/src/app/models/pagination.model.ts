export interface PaginationConfig {
  pageSizeOptions: number[];
  pageSize: number;
  totalItems: number;
  currentPageIndex?: number;
}

export const DEFAULT_PAGINATION_PAGES: number[] = [10, 20, 40, 60];
export const DEFAULT_PAGE_SIZE: number = 20;
