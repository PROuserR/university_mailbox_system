/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/distribution.service.ts

import {
  apiWrapper,
  extractData,
  isApiSuccess,
  request,
} from "@/utils/apiClient";
import {
  DistributionEditorData,
  CreateDistributionPayload,
  DistributeResponseDto,
  DistributionFilterDto,
  DistributionResponseByIdDto,
  PendingApprovalCorrespondenceDto,
  DistributionInboxDto,
  DistributionOutboxDto,
} from "@/types/api/distribution.types";
import PagedResult from "@/types/api/PagedResponse";
import { ApiResult } from "@/types/api/ApiResult";

const BASE_URL = "Distributions";

// ============================================================
// ===== Helper: استخراج رسالة الخطأ من الـ API =====
// ============================================================

const extractErrorMessage = (response: any): string => {
  // 1. محاولة استخراج الرسالة من response.message
  if (response?.message && typeof response.message === 'string') {
    return response.message;
  }
  
  // 2. محاولة استخراج الرسالة من response.data?.message
  if (response?.data?.message && typeof response.data.message === 'string') {
    return response.data.message;
  }
  
  // 3. محاولة استخراج الرسالة من response.data?.errors
  if (response?.data?.errors) {
    const errors = response.data.errors;
    if (typeof errors === 'string') {
      return errors;
    }
    if (Array.isArray(errors)) {
      return errors.join(' • ');
    }
    if (typeof errors === 'object') {
      const messages: string[] = [];
      for (const [key, value] of Object.entries(errors)) {
        if (Array.isArray(value)) {
          messages.push(`${key}: ${value.join(', ')}`);
        } else if (typeof value === 'string') {
          messages.push(`${key}: ${value}`);
        } else {
          messages.push(`${key}: ${JSON.stringify(value)}`);
        }
      }
      return messages.join(' • ');
    }
  }
  
  // 4. محاولة استخراج الرسالة من response.data?.title
  if (response?.data?.title && typeof response.data.title === 'string') {
    return response.data.title;
  }
  
  // 5. محاولة استخراج الرسالة من response.data?.error
  if (response?.data?.error && typeof response.data.error === 'string') {
    return response.data.error;
  }
  
  // 6. رسالة افتراضية
  return 'حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.';
};

const throwApiError = (response: any, defaultMessage: string): never => {
  const message = extractErrorMessage(response);
  const error = new Error(message || defaultMessage);
  (error as any).statusCode = response?.status || response?.data?.statusCode || 500;
  (error as any).response = response;
  throw error;
};

// ============================================================
// ===== Distribution Editor =====
// ============================================================

export const getDistributionEditorData = async (
  correspondenceId: number
): Promise<DistributionEditorData> => {
  const res = await apiWrapper.get<ApiResult<DistributionEditorData>>(
    `${BASE_URL}/editor-data/${correspondenceId}`
  );

  if (!res.success || !res.data) {
    throwApiError(res, "فشل تحميل بيانات التوزيع");
  }

  if (!res.data!.isSuccess) {
    throwApiError(res.data, "فشل تحميل بيانات التوزيع");
  }

  return res.data!.data;
};

export const distribute = async (
  payload: CreateDistributionPayload
): Promise<DistributeResponseDto> => {
  const res = await apiWrapper.post<ApiResult<DistributeResponseDto>>(
    `${BASE_URL}/distribute`,
    {
      correspondenceId: payload.correspondenceId,
      receiverIds: payload.receiverIds,
      notes: payload.notes || undefined,
    }
  );

  if (!res.success || !res.data) {
    throwApiError(res, "فشل حفظ التوزيع");
  }

  if (!res.data!.isSuccess) {
    throwApiError(res.data, "فشل حفظ التوزيع");
  }

  return res.data!.data;
};

// ============================================================
// ===== Inbox & Outbox =====
// ============================================================

export const getInboxDistributions = async (
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
    mainType?: string;
    isProfessional?: boolean;
  }
): Promise<PagedResult<DistributionInboxDto>> => {
  const response = await apiWrapper.get<ApiResult<PagedResult<DistributionInboxDto>>>(
    `${BASE_URL}/my-inbox`,
    params
  );

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحميل التوزيعات الواردة");
  }

  return extractData(response)!;
};

export const getOutboxDistributions = async (
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }
): Promise<PagedResult<DistributionOutboxDto>> => {
  const response = await apiWrapper.get<ApiResult<PagedResult<DistributionOutboxDto>>>(
    `${BASE_URL}/my-outbox`,
    params
  );

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحميل التوزيعات الصادرة");
  }

  return extractData(response)!;
};

// ============================================================
// ===== Pending Approvals =====
// ============================================================

export const getPendingApprovalsGrouped = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PagedResult<PendingApprovalCorrespondenceDto>> => {
  const response = await apiWrapper.get<
    ApiResult<PagedResult<PendingApprovalCorrespondenceDto>>
  >(`${BASE_URL}/pending-approval/grouped`, { page, pageSize });

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحميل الموافقات المعلقة");
  }

  return extractData(response)!;
};

export const getPendingApprovals = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PagedResult<DistributionResponseByIdDto>> => {
  const response = await apiWrapper.get<
    ApiResult<PagedResult<DistributionResponseByIdDto>>
  >(`${BASE_URL}/pending-approval`, { page, pageSize });

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحميل الموافقات المعلقة");
  }

  return extractData(response)!;
};

// ============================================================
// ===== Approve / Reject =====
// ============================================================

export const approveDistribution = async (id: number): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/${id}/approve`
  );

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل الموافقة على التوزيع");
  }
};

export const rejectDistribution = async (id: number, reason?: string): Promise<void> => {
  const response = await request<ApiResult<void>>({
    method: "POST",
    url: `${BASE_URL}/${id}/reject`,
    data: reason || null,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل رفض التوزيع");
  }
};

export const approveDistributions = async (ids: number[]): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/batch/approve`,
    ids
  );

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل الموافقة على التوزيعات");
  }

  return extractData(response)!;
};

export const rejectDistributions = async (ids: number[], reason?: string): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/batch/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`,
    ids
  );

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل رفض التوزيعات");
  }

  return extractData(response)!;
};

export const approveAllByCorrespondence = async (correspondenceId: number): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/correspondence/${correspondenceId}/approve-all`
  );

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل الموافقة على جميع التوزيعات");
  }

  return extractData(response)!;
};

export const rejectAllByCorrespondence = async (
  correspondenceId: number,
  reason?: string
): Promise<number> => {
  const response = await request<ApiResult<number>>({
    method: "POST",
    url: `${BASE_URL}/correspondence/${correspondenceId}/reject-all`,
    data: reason || null,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل رفض جميع التوزيعات");
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Distribution Details =====
// ============================================================

export const getDistributionById = async (id: number): Promise<DistributionResponseByIdDto> => {
  const response = await apiWrapper.get<
    ApiResult<DistributionResponseByIdDto>
  >(`${BASE_URL}/${id}`);

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحميل تفاصيل التوزيع");
  }

  return extractData(response)!;
};

// ============================================================
// ===== Filter Distributions =====
// ============================================================

export const getDistributions = async (
  filter: DistributionFilterDto
): Promise<PagedResult<DistributionResponseByIdDto>> => {
  const response = await apiWrapper.get<
    ApiResult<PagedResult<DistributionResponseByIdDto>>
  >(`${BASE_URL}`, filter);

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحميل التوزيعات");
  }

  return extractData(response)!;
};

// ============================================================
// ===== Mark as Read =====
// ============================================================

export const markAsRead = async (correspondenceId: number, notes?: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/read`, {
    correspondenceId: correspondenceId, 
    notes: notes || null,
  });

  if (!isApiSuccess(response)) {
    throwApiError(response, "فشل تحديد البريد كمقروء");
  }
};

// ============================================================
// ===== All Distributions =====
// ============================================================

export const getAllDistributions = async (
  filter: Partial<DistributionFilterDto> = {}
): Promise<PagedResult<DistributionResponseByIdDto>> => {
  const defaultFilter: DistributionFilterDto = {
    page: 1,
    pageSize: 20,
    sortBy: "DistributedDate",
    sortDescending: true,
  };

  const mergedFilter = { ...defaultFilter, ...filter };

  const params: Record<string, any> = {};
  Object.entries(mergedFilter).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  if (params.status !== undefined && typeof params.status === "string") {
    params.status = Number(params.status);
  }

  const response = await apiWrapper.get<ApiResult<PagedResult<DistributionResponseByIdDto>>>(
    `${BASE_URL}/all`,
    params
  );

  if (!response.success || !response.data) {
    throwApiError(response, "فشل تحميل قائمة التوزيعات");
  }

  if (!response.data!.isSuccess) {
    throwApiError(response.data, "فشل تحميل قائمة التوزيعات");
  }

  return response.data!.data!;
};