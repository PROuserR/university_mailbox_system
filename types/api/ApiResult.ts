// types/ApiResult.ts
export interface ApiResult<T> {
    isSuccess: boolean;
    message: string;
    data: T;
    errors?: string[];
    statusCode: number;
}