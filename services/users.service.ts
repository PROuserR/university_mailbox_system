/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/users.service.ts

import { apiWrapper, extractData, isApiSuccess } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
    CreateUserRequest,
    UpdateUserRequest,
    ResetUserPasswordRequest,
    UserResponse,
} from "@/types/api/user";

const BASE_URL = "Users";

// ============================================================
// ===== Get Users =====
// ============================================================

export const getUsers = async (): Promise<UserResponse[]> => {
    const response = await apiWrapper.get<ApiResult<UserResponse[]>>(BASE_URL);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل المستخدمين';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response) || [];
};

// ============================================================
// ===== Create User =====
// ============================================================

export const createUser = async (payload: CreateUserRequest): Promise<UserResponse> => {
    const response = await apiWrapper.post<ApiResult<UserResponse>>(BASE_URL, payload);

    if (!isApiSuccess(response)) {
        let errorMessage = response?.message || 'فشل إضافة المستخدم';
        
        if (response.data?.errors) {
            const errors = response.data.errors;
            if (Array.isArray(errors) && errors.length > 0) {
                errorMessage = errors.join(" • ");
            } else if (typeof errors === 'object') {
                const errorValues = Object.values(errors).flat();
                if (errorValues.length > 0) {
                    errorMessage = errorValues.join(" • ");
                }
            }
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Update User =====
// ============================================================

export const updateUser = async (id: number, payload: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiWrapper.put<ApiResult<UserResponse>>(`${BASE_URL}/${id}`, payload);

    if (!isApiSuccess(response)) {
        let errorMessage = response?.message || 'فشل تعديل المستخدم';
        
        if (response.data?.errors) {
            const errors = response.data.errors;
            if (Array.isArray(errors) && errors.length > 0) {
                errorMessage = errors.join(" • ");
            } else if (typeof errors === 'object') {
                const errorValues = Object.values(errors).flat();
                if (errorValues.length > 0) {
                    errorMessage = errorValues.join(" • ");
                }
            }
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Reset User Password =====
// ============================================================

export const resetUserPassword = async (payload: ResetUserPasswordRequest): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/reset-user-password`, payload);

    if (!isApiSuccess(response)) {
        let errorMessage = response?.message || 'فشل إعادة تعيين كلمة المرور';
        
        if (response.data?.errors) {
            const errors = response.data.errors;
            if (Array.isArray(errors) && errors.length > 0) {
                errorMessage = errors.join(" • ");
            } else if (typeof errors === 'object') {
                const errorValues = Object.values(errors).flat();
                if (errorValues.length > 0) {
                    errorMessage = errorValues.join(" • ");
                }
            }
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ============================================================
// ===== Toggle Active =====
// ============================================================

export const activateUser = async (id: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${id}/activate`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تفعيل المستخدم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

export const deactivateUser = async (id: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${id}/deactivate`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تعطيل المستخدم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ============================================================
// ===== Toggle Permanent Receiver =====
// ============================================================

export const setPermanentReceiver = async (id: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${id}/set-permanent-receiver`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل إضافة المستخدم للمستلمين الدائمين';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

export const removePermanentReceiver = async (id: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${id}/remove-permanent-receiver`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل إزالة المستخدم من المستلمين الدائمين';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};