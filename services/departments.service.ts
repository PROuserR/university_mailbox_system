/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/departments.service.ts

import { apiWrapper, extractData, isApiSuccess } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
    DepartmentDto,
    ActiveDepartmentDto,
    DepartmentMemberDto,
    DepartmentDistributionSummaryDto,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    DistributeToDepartmentRequest,
    RevokeFromDepartmentMemberRequest,
    DepartmentDistributionsQueryParams,
} from "@/types/api/department.types";
import PagedResult from "@/types/api/PagedResponse";

const BASE_URL = "Departments";

// ============================================================
// ===== Department CRUD =====
// ============================================================

export const getDepartments = async (): Promise<DepartmentDto[]> => {
    const response = await apiWrapper.get<ApiResult<DepartmentDto[]>>(BASE_URL);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل الأقسام';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response) || [];
};

export const getActiveDepartments = async (): Promise<ActiveDepartmentDto[]> => {
    const response = await apiWrapper.get<ApiResult<ActiveDepartmentDto[]>>(`${BASE_URL}/active`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل الأقسام النشطة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response) || [];
};

export const getDepartmentById = async (id: number): Promise<DepartmentDto> => {
    const response = await apiWrapper.get<ApiResult<DepartmentDto>>(`${BASE_URL}/${id}`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

export const createDepartment = async (payload: CreateDepartmentRequest): Promise<DepartmentDto> => {
    const response = await apiWrapper.post<ApiResult<DepartmentDto>>(BASE_URL, payload);

    if (!isApiSuccess(response)) {
        let errorMessage = response?.message || 'فشل إنشاء القسم';
        
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

export const updateDepartment = async (id: number, payload: UpdateDepartmentRequest): Promise<DepartmentDto> => {
    const response = await apiWrapper.put<ApiResult<DepartmentDto>>(`${BASE_URL}/${id}`, payload);

    if (!isApiSuccess(response)) {
        let errorMessage = response?.message || 'فشل تحديث القسم';
        
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

export const deleteDepartment = async (id: number): Promise<void> => {
    const response = await apiWrapper.delete<ApiResult<void>>(`${BASE_URL}/${id}`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل حذف القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ============================================================
// ===== Department Members =====
// ============================================================

export const getDepartmentMembers = async (departmentId: number): Promise<DepartmentMemberDto[]> => {
    const response = await apiWrapper.get<ApiResult<DepartmentMemberDto[]>>(`${BASE_URL}/${departmentId}/members`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل أعضاء القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response) || [];
};

export const addDepartmentMember = async (departmentId: number, userId: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${departmentId}/members/${userId}`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل إضافة العضو';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

export const removeDepartmentMember = async (departmentId: number, userId: number): Promise<void> => {
    const response = await apiWrapper.delete<ApiResult<void>>(`${BASE_URL}/${departmentId}/members/${userId}`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل إزالة العضو';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ============================================================
// ===== Head of Department =====
// ============================================================

export const setDepartmentHead = async (departmentId: number, userId: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${departmentId}/head/${userId}`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تعيين رئيس القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

export const removeDepartmentHead = async (departmentId: number): Promise<void> => {
    const response = await apiWrapper.delete<ApiResult<void>>(`${BASE_URL}/${departmentId}/head`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل إزالة رئيس القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

export const getMyDepartment = async (): Promise<DepartmentDto> => {
    const response = await apiWrapper.get<ApiResult<DepartmentDto>>(`${BASE_URL}/my-department`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل قسمك';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Department Distributions =====
// ============================================================

export const getDepartmentDistributions = async (
    params: DepartmentDistributionsQueryParams
): Promise<PagedResult<DepartmentDistributionSummaryDto>> => {
    const queryParams: any = {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        sortDescending: params.sortDescending !== undefined ? params.sortDescending : true,
    };

    if (params.departmentId) queryParams.departmentId = params.departmentId;
    if (params.search) queryParams.search = params.search;
    if (params.sortBy) queryParams.sortBy = params.sortBy;

    const response = await apiWrapper.get<ApiResult<PagedResult<DepartmentDistributionSummaryDto>>>(
        `${BASE_URL}/distributions`,
        queryParams
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل توزيعات القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};
export const activateDepartment = async (departmentId: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${departmentId}/activate`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تفعيل القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

export const deactivateDepartment = async (departmentId: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${departmentId}/deactivate`);

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تعطيل القسم';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};