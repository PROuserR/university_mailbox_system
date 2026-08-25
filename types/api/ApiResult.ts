
export interface ApiResult<T> {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
}

export interface ApiResultWithoutData {
  isSuccess: boolean;
  message: string;
  data?: never;
  errors?: string[];
  statusCode: number;
}