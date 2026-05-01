export interface PagedResponse<T> {
  items: T[];           
  totalCount: number;   
  totalPages: number;   
  currentPage: number;  
  pageSize: number;     
}