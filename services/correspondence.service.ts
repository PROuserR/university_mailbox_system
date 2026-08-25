/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/correspondence.service.ts

import { apiWrapper, extractData, isApiSuccess, request } from "@/utils/apiClient";
import {
    ApiResult,
    CorrespondenceResponse,
    CorrespondenceSearchDto,
    UpdateCorrespondencePayload,
    SignCorrespondenceResultDto,
    CorrespondenceWithRepliesResponse,
    CorrespondenceParentSelectorSearchDto,
    CorrespondenceParentSelectorDto,
} from "@/types/api/correspondence.types";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api";
const BASE_URL = "Correspondences";

// ============================================================
// ===== Types =====
// ============================================================

interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

// ============================================================
// ===== Get Correspondences =====
// ============================================================

export const getCorrespondencesForParentSelector = async (
    searchDto: CorrespondenceParentSelectorSearchDto
): Promise<PagedResult<CorrespondenceParentSelectorDto>> => {
    const response = await apiWrapper.get<ApiResult<PagedResult<CorrespondenceParentSelectorDto>>>(
        `${BASE_URL}/parent-selector`,
        searchDto
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل المراسلات للاختيار';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

export const getCorrespondencesPaged = async (
    searchDto: CorrespondenceSearchDto
): Promise<PagedResult<CorrespondenceResponse>> => {
    const response = await apiWrapper.get<ApiResult<PagedResult<CorrespondenceResponse>>>(
        `${BASE_URL}/paged`,
        searchDto
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل المراسلات';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    const data = extractData(response)!;
    return {
        items: data.items || [],
        totalCount: data.totalCount || 0,
        pageNumber: data.pageNumber || 1,
        pageSize: data.pageSize || 10,
        totalPages: data.totalPages || 0,
    };
};

export const getCorrespondenceById = async (
    id: number
): Promise<CorrespondenceResponse> => {
    const response = await apiWrapper.get<ApiResult<CorrespondenceResponse>>(
        `${BASE_URL}/${id}`
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Get Correspondence With Replies (Full Chain) =====
// ============================================================

export const getCorrespondenceWithReplies = async (
    id: number
): Promise<CorrespondenceWithRepliesResponse> => {
    const response = await apiWrapper.get<ApiResult<CorrespondenceWithRepliesResponse>>(
        `${BASE_URL}/${id}/with-replies`
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل تحميل المراسلة مع الردود';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Document Types & Sender Entities =====
// ============================================================

export const getDocumentTypes = async (): Promise<{ id: number; name: string }[]> => {
    const response = await apiWrapper.get<ApiResult<{ id: number; name: string }[]>>(
        '/DocumentTypes'
    );

    if (!isApiSuccess(response)) {
        return [];
    }

    return extractData(response) || [];
};

export const getSenderEntities = async (): Promise<{ id: number; name: string }[]> => {
    const response = await apiWrapper.get<ApiResult<{ id: number; name: string }[]>>(
        '/SenderEntities'
    );

    if (!isApiSuccess(response)) {
        return [];
    }

    return extractData(response) || [];
};

// ============================================================
// ===== Create Correspondence =====
// ============================================================

export const createCorrespondence = async (
    payload: FormData
): Promise<CorrespondenceResponse> => {
    const response = await apiWrapper.post<ApiResult<CorrespondenceResponse>>(
        `${BASE_URL}`,
        payload
    );

    if (!isApiSuccess(response)) {
        // ✅ استخدام response?.message مباشرة (من ApiResponse)
        let errorMessage = response?.message || 'فشل إنشاء المراسلة';
        
        // ✅ إذا كانت هناك أخطاء تفصيلية في data.errors
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
        (error as any).response = {
            status: response.status,
            data: response.data,
        };
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Update Correspondence =====
// ============================================================

export const updateCorrespondence = async (
    id: number,
    payload: FormData
): Promise<CorrespondenceResponse> => {
    const response = await apiWrapper.patch<ApiResult<CorrespondenceResponse>>(
        `${BASE_URL}/${id}`,
        payload
    );

    if (!isApiSuccess(response)) {
        // ✅ استخدام response?.message مباشرة
        let errorMessage = response?.message || 'فشل تحديث المراسلة';
        
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
        (error as any).response = {
            status: response.status,
            data: response.data,
        };
        throw error;
    }

    return extractData(response)!;
};

// ============================================================
// ===== Delete Correspondence =====
// ============================================================

export const deleteCorrespondence = async (id: number): Promise<void> => {
    const response = await apiWrapper.delete<ApiResult<void>>(
        `${BASE_URL}/${id}`
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل حذف المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ============================================================
// ===== Status Management =====
// ============================================================

// ✅ FromBody: none
export const requestApproval = async (id: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(
        `${BASE_URL}/${id}/request-approval`
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل طلب الموافقة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: SignCorrespondenceOptionsDto (object)
export const signCorrespondence = async (
    id: number,
    options: {
        autoIgnoreUnread?: boolean;
        autoRejectPendingApproval?: boolean;
        forceSign?: boolean;
    }
): Promise<SignCorrespondenceResultDto> => {
    const response = await apiWrapper.post<ApiResult<SignCorrespondenceResultDto>>(
        `${BASE_URL}/${id}/sign`,
        {
            autoIgnoreUnread: options.autoIgnoreUnread || false,
            autoRejectPendingApproval: options.autoRejectPendingApproval || false,
            forceSign: options.forceSign || false,
        }
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل توقيع المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }

    return extractData(response)!;
};

// ✅ FromQuery: Notes
export const archiveCorrespondence = async (
    id: number,
    notes?: string
): Promise<void> => {
    const url = notes 
        ? `${BASE_URL}/${id}/archive?Notes=${encodeURIComponent(notes)}`
        : `${BASE_URL}/${id}/archive`;
    
    const response = await request<ApiResult<void>>({
        method: "POST",
        url,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل أرشفة المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromQuery: Notes
export const restoreFromArchive = async (
    id: number,
    notes?: string
): Promise<void> => {
    const url = notes 
        ? `${BASE_URL}/${id}/restore?Notes=${encodeURIComponent(notes)}`
        : `${BASE_URL}/${id}/restore`;
    
    const response = await request<ApiResult<void>>({
        method: "POST",
        url,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل استرجاع المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: none
export const revertToDraft = async (id: number): Promise<void> => {
    const response = await apiWrapper.post<ApiResult<void>>(
        `${BASE_URL}/${id}/revert-to-draft`
    );

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل استرجاع المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const revertToDistributed = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/revert-to-distributed`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل استرجاع المراسلة';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const requestRevertToDraft = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/request-revert`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل طلب الاسترجاع';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const requestRevertToDistributed = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/request-revert-to-distributed`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل طلب الاسترجاع';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const approveRevertToDraft = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/approve-revert`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل الموافقة على الاسترجاع';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const approveRevertToDistributed = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/approve-revert-to-distributed`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل الموافقة على الاسترجاع';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const rejectRevertToDraft = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/reject-revert`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل رفض الاسترجاع';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ✅ FromBody: string (نص مباشر)
export const rejectRevertToDistributed = async (
    id: number,
    reason?: string
): Promise<void> => {
    const response = await request<ApiResult<void>>({
        method: "POST",
        url: `${BASE_URL}/${id}/reject-revert-to-distributed`,
        data: reason || null,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!isApiSuccess(response)) {
        const errorMessage = response?.message || 'فشل رفض الاسترجاع';
        const error = new Error(errorMessage);
        (error as any).statusCode = response.data?.statusCode || response.status;
        throw error;
    }
};

// ============================================================
// ===== Attachments =====
// ============================================================

// export const viewAttachment = async (
//     attachmentId: number,
//     signal?: AbortSignal
// ): Promise<Blob> => {
//     const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7236/api'}/Attachments/${attachmentId}/view`,
//         {
//             credentials: 'include',
//             signal,
//         }
//     );

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return response.blob();
// };

// export const downloadAttachment = async (
//     attachmentId: number
// ): Promise<Blob> => {
//     const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7236/api'}/Attachments/${attachmentId}/download`,
//         {
//             credentials: 'include',
//         }
//     );

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return response.blob();
// };





// ============================================================
// ===== Attachments =====
// ============================================================

export const viewAttachment = async (
    attachmentId: number,
    signal?: AbortSignal
): Promise<Blob> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/Attachments/${attachmentId}/view?t=${Date.now()}`,
            {
                method: 'GET',
                credentials: 'include',
                signal,
                headers: {
                    'Accept': 'application/octet-stream, */*',
                },
            }
        );

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData?.message) {
                    errorMessage = errorData.message;
                }
            } catch {
            }
            throw new Error(errorMessage);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
            throw new Error('الملف فارغ أو تالف');
        }

        return blob;
    } catch (error) {
        console.error('View attachment error:', error);
        throw error;
    }
};

export const downloadAttachment = async (
    attachmentId: number
): Promise<Blob> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/Attachments/${attachmentId}/download?t=${Date.now()}`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/octet-stream, */*',
                },
            }
        );

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData?.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                // تجاهل خطأ تحويل JSON
            }
            throw new Error(errorMessage);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
            throw new Error('الملف فارغ أو تالف');
        }

        return blob;
    } catch (error) {
        console.error('Download attachment error:', error);
        throw error;
    }
};