import myAPI from "./myAPI";
import axios, { AxiosRequestConfig, AxiosError } from "axios";

// ==============================
// TYPES
// ==============================

export interface ApiResult<T> {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
}

export type ApiResponse<T> = {
    status: number;
    data: T | null;
    error: string | null;
    success: boolean;
    isBlob?: boolean; // ✅ إضافة flag للـ Blob
};

// ==============================
// CORE REQUEST WRAPPER
// ==============================

async function request<T>(
    config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    try {
        const res = await myAPI.request<T>(config);

        // ✅ إذا كان responseType هو blob، نعيد البيانات كما هي
        if (config.responseType === 'blob') {
            return {
                data: res.data as T,
                error: null,
                success: true,
                status: res.status,
                isBlob: true,
            };
        }

        // ✅ للـ JSON العادي
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = res.data as any;
        if (data && typeof data === 'object' && 'isSuccess' in data) {
            if (data.isSuccess) {
                return {
                    data: data,
                    error: null,
                    success: true,
                    status: res.status,
                };
            } else {
                return {
                    data: data,
                    error: data.message || "Request failed",
                    success: false,
                    status: res.status,
                };
            }
        }

        return {
            data: res.data,
            error: null,
            success: true,
            status: res.status,
        };
    } catch (err: unknown) {
        let message = "حدث خطأ غير متوقع";
        let status = 0;

        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const responseData = axiosError.response?.data as any;
            if (responseData && typeof responseData === 'object') {
                if ('message' in responseData) {
                    message = responseData.message;
                } else if ('Message' in responseData) {
                    message = responseData.Message;
                } else if ('error' in responseData) {
                    message = responseData.error;
                } else if ('title' in responseData) {
                    message = responseData.title;
                }
            }

            if (message === "حدث خطأ غير متوقع") {
                message = axiosError.message || "فشل الاتصال بالخادم";
            }

            status = axiosError.response?.status || 0;
        } else if (err instanceof Error) {
            message = err.message;
        }

        return {
            data: null,
            error: message,
            success: false,
            status,
        };
    }
}

// ==============================
// API WRAPPER
// ==============================

export const apiWrapper = {
    get: <T>(
        url: string,
        params?: object,
        config?: AxiosRequestConfig
    ) =>
        request<T>({
            method: "GET",
            url,
            params,
            ...config,
        }),

    post: <T>(
        url: string,
        data?: object | FormData
    ) =>
        request<T>({
            method: "POST",
            url,
            data,
            headers:
                data instanceof FormData
                    ? {
                          "Content-Type": "multipart/form-data",
                      }
                    : undefined,
        }),

    put: <T>(
        url: string,
        data?: object
    ) =>
        request<T>({
            method: "PUT",
            url,
            data,
        }),

    patch: <T>(
        url: string,
        data?: object | FormData
    ) =>
        request<T>({
            method: "PATCH",
            url,
            data,
            headers:
                data instanceof FormData
                    ? {
                          "Content-Type": "multipart/form-data",
                      }
                    : undefined,
        }),

    delete: <T>(
        url: string,
        config?: AxiosRequestConfig
    ) =>
        request<T>({
            method: "DELETE",
            url,
            ...config,
        }),
};

// ==============================
// HELPERS
// ==============================

export function extractData<T>(response: ApiResponse<ApiResult<T>>): T | null {
    if (response.success && response.data) {
        return response.data.data;
    }
    return null;
}

export function extractMessage<T>(response: ApiResponse<ApiResult<T>>): string {
    if (response.success && response.data) {
        return response.data.message || "تم بنجاح";
    }
    return response.error || "حدث خطأ";
}

export function isApiSuccess<T>(response: ApiResponse<ApiResult<T>>): boolean {
    return response.success && response.data?.isSuccess === true;
}