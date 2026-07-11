// types/PagedResponse.ts
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;     
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}