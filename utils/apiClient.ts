/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/apiClient.ts

import { ApiResult } from "@/types/api/ApiResult";
import myAPI from "./myAPI";
import axios, { AxiosRequestConfig, AxiosError } from "axios";

// ==============================
// TYPES
// ==============================

export type ApiResponse<T> = {
    status: number;
    data: T | null;
    message: string | null;
    success: boolean;
    isBlob?: boolean;
};

// ==============================
// CORE REQUEST WRAPPER
// ==============================

export async function request<T>(
    config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    try {
        const res = await myAPI.request<T>(config);

        if (config.responseType === "blob") {
            return {
                data: res.data as T,
                message: null,
                success: true,
                status: res.status,
                isBlob: true,
            };
        }

        const data = res.data as any;
        if (data && typeof data === "object" && "isSuccess" in data) {
            if (data.isSuccess === true) {
                return {
                    data: data,
                    message: data.message || null,
                    success: true,
                    status: res.status,
                };
            } else {
                // ✅ استخراج الرسالة من الباكند
                let errorMessage = data.message || "Request failed";
                
                // ✅ إذا كانت هناك أخطاء تفصيلية
                if (data.errors) {
                    if (Array.isArray(data.errors) && data.errors.length > 0) {
                        errorMessage = data.errors.join(" • ");
                    } else if (typeof data.errors === "object") {
                        const errorValues = Object.values(data.errors).flat();
                        if (errorValues.length > 0) {
                            errorMessage = errorValues.join(" • ");
                        }
                    }
                }
                
                return {
                    data: data,
                    message: errorMessage,
                    success: false,
                    status: res.status,
                };
            }
        }

        return {
            data: res.data,
            message: null,
            success: true,
            status: res.status,
        };
    } catch (err: unknown) {
        let message = "حدث خطأ غير متوقع";
        let status = 0;

        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;
            const responseData = axiosError.response?.data as any;
            
            if (responseData && typeof responseData === "object") {
                // ✅ استخراج الرسالة
                if ("message" in responseData) {
                    message = responseData.message;
                } else if ("Message" in responseData) {
                    message = responseData.Message;
                } else if ("error" in responseData) {
                    message = responseData.error;
                } else if ("title" in responseData) {
                    message = responseData.title;
                }
                
                // ✅ استخراج الأخطاء التفصيلية
                if ("errors" in responseData && responseData.errors) {
                    if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
                        message = responseData.errors.join(" • ");
                    } else if (typeof responseData.errors === "object") {
                        const errorValues = Object.values(responseData.errors).flat();
                        if (errorValues.length > 0) {
                            message = errorValues.join(" • ");
                        }
                    }
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
            message: message,
            success: false,
            status,
        };
    }
}

// ==============================
// API WRAPPER
// ==============================

export const apiWrapper = {
    get: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
        request<T>({
            method: "GET",
            url,
            params,
            ...config,
        }),

    post: <T>(url: string, data?: object | FormData) =>
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

    put: <T>(url: string, data?: object) =>
        request<T>({
            method: "PUT",
            url,
            data,
        }),

    patch: <T>(url: string, data?: object | FormData) =>
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

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
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
    return response.message || "حدث خطأ";
}

export function extractErrors<T>(response: ApiResponse<ApiResult<T>>): string[] | null {
    if (!response.success && response.data) {
        return response.data.errors || null;
    }
    return null;
}

export function isApiSuccess<T>(response: ApiResponse<ApiResult<T>>): boolean {
    return response.success && response.data?.isSuccess === true;
}