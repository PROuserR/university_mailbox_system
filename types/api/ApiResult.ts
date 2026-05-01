// types/ApiResult.ts
export interface ApiResult<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}