/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/dean-history.service.ts

import { apiWrapper, extractData, isApiSuccess } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
    DeanHistoryResponseDto,
    CurrentDeanDto,
    CreateDeanHistoryRequest,
    TransferDeanRequest,
} from "@/types/api/dean-history.types";

const BASE_URL = "DeanHistories";

// ============================================================
// ===== Public Endpoints =====
// ============================================================

export const getCurrentDean = async (): Promise<CurrentDeanDto> => {
    const response = await apiWrapper.get<ApiResult<CurrentDeanDto>>(`${BASE_URL}/current`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل العميد الحالي';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

export const getDeanByDate = async (date: string): Promise<DeanHistoryResponseDto> => {
    const response = await apiWrapper.get<ApiResult<DeanHistoryResponseDto>>(`${BASE_URL}/by-date`, { date });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل العميد لهذا التاريخ';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

export const isUserCurrentDean = async (userId: number): Promise<boolean> => {
    const response = await apiWrapper.get<ApiResult<boolean>>(`${BASE_URL}/is-current-dean/${userId}`);

    if (!isApiSuccess(response)) {
        return false;
    }

    return extractData(response) || false;
};

// ============================================================
// ===== Admin Only Endpoints =====
// ============================================================

export const getAllDeanHistory = async (): Promise<DeanHistoryResponseDto[]> => {
    const response = await apiWrapper.get<ApiResult<DeanHistoryResponseDto[]>>(BASE_URL);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل تاريخ العمداء';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response) || [];
};

export const getDeanHistoryByUserId = async (userId: number): Promise<DeanHistoryResponseDto[]> => {
    const response = await apiWrapper.get<ApiResult<DeanHistoryResponseDto[]>>(`${BASE_URL}/user/${userId}`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل تاريخ العميد للمستخدم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response) || [];
};

export const assignNewDean = async (payload: CreateDeanHistoryRequest): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/assign`, payload);

    // ✅ التحقق من isSuccess
    if (!response.success || !response.data) {
        const errorMessage = response?.message || 'فشل تعيين العميد الجديد';
        const error = new Error(errorMessage);
        (error as any).statusCode = response?.status || 500;
        throw error;
    }

    // ✅ التحقق من isSuccess في البيانات
    if (!response.data.isSuccess) {
        // ✅ استخراج رسائل الأخطاء من الباك اند
        let errorMessage = response.data.message || 'فشل تعيين العميد الجديد';
        
        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
            errorMessage = response.data.errors.join(' • ');
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data.statusCode || response.status;
        (error as any).errors = response.data.errors;
        throw error;
    }
};

export const terminateCurrentDean = async (): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/terminate`);

    if (!response.success || !response.data) {
        const errorMessage = response?.message || 'فشل إنهاء فترة العميد الحالي';
        const error = new Error(errorMessage);
        (error as any).statusCode = response?.status || 500;
        throw error;
    }

    if (!response.data.isSuccess) {
        let errorMessage = response.data.message || 'فشل إنهاء فترة العميد الحالي';
        
        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
            errorMessage = response.data.errors.join(' • ');
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data.statusCode || response.status;
        (error as any).errors = response.data.errors;
        throw error;
    }
};

export const transferDean = async (payload: TransferDeanRequest): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/transfer`, payload);

    if (!response.success || !response.data) {
        const errorMessage = response?.message || 'فشل نقل منصب العميد';
        const error = new Error(errorMessage);
        (error as any).statusCode = response?.status || 500;
        throw error;
    }

    if (!response.data.isSuccess) {
        let errorMessage = response.data.message || 'فشل نقل منصب العميد';
        
        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
            errorMessage = response.data.errors.join(' • ');
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data.statusCode || response.status;
        (error as any).errors = response.data.errors;
        throw error;
    }
};

export const deleteDeanHistory = async (id: number): Promise<void> => {
    const response = await apiWrapper.delete<ApiResult<void>>(`${BASE_URL}/${id}`);

    if (!response.success || !response.data) {
        const errorMessage = response?.message || 'فشل حذف السجل';
        const error = new Error(errorMessage);
        (error as any).statusCode = response?.status || 500;
        throw error;
    }

    if (!response.data.isSuccess) {
        let errorMessage = response.data.message || 'فشل حذف السجل';
        
        if (response.data.errors && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
            errorMessage = response.data.errors.join(' • ');
        }
        
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data.statusCode || response.status;
        (error as any).errors = response.data.errors;
        throw error;
    }
};