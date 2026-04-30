/**
 * API Response wrapper (matches your backend ApiResult<T>)
 */
export interface ApiResult<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}