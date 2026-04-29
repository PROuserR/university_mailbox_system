import myAPI from "./myAPI";
import axios, { AxiosRequestConfig } from "axios";

// Generic response type
type ApiResponse<T> = {
    status: number;
    data: T | null;
    error: string | null;
    success: boolean;
};

// 🔥 Core request wrapper
async function request<T>(
    config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    try {
        const res = await myAPI.request<T>(config);

        return {
            data: res.data,
            error: null,
            success: true,
            status: res.status
        };
    } catch (err: unknown) {
        let message = "Something went wrong";

        if (axios.isAxiosError(err)) {
            message =
                err.response?.data?.message ||
                err.message ||
                "API error";
        }

        return {
            data: null,
            error: message,
            success: false,
            status: 0
        };
    }
}

export const apiWrapper = {
    get: <T>(url: string, params?: object) =>
        request<T>({
            method: "GET",
            url,
            params,
        }),

    post: <T>(url: string, data?: object) =>
        request<T>({
            method: "POST",
            url,
            data,
        }),

    put: <T>(url: string, data?: object) =>
        request<T>({
            method: "PUT",
            url,
            data,
        }),

    delete: <T>(url: string) =>
        request<T>({
            method: "DELETE",
            url,
        }),
};