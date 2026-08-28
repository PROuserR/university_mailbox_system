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
// ===== Distribution Editor =====
// ============================================================

export const getDistributionEditorData = async (
  correspondenceId: number
): Promise<DistributionEditorData> => {
  const res = await apiWrapper.get<ApiResult<DistributionEditorData>>(
    `${BASE_URL}/editor-data/${correspondenceId}`
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to load distribution data");
  }

  return res.data.data;
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
    throw new Error(res.message || "فشل حفظ التوزيع");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل حفظ التوزيع");
  }

  return res.data.data;
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
    throw new Error(response?.message || "فشل تحميل التوزيعات الواردة");
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
    throw new Error(response?.message || "فشل تحميل التوزيعات الصادرة");
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
    throw new Error(response?.message || "فشل تحميل الموافقات المعلقة");
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
    throw new Error(response?.message || "فشل تحميل الموافقات المعلقة");
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
    throw new Error(response?.message || "فشل الموافقة على التوزيع");
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
    throw new Error(response?.message || "فشل رفض التوزيع");
  }
};

export const approveDistributions = async (ids: number[]): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/batch/approve`,
    ids
  );

  if (!isApiSuccess(response)) {
    throw new Error(response?.message || "فشل الموافقة على التوزيعات");
  }

  return extractData(response)!;
};

export const rejectDistributions = async (ids: number[], reason?: string): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/batch/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`,
    ids
  );

  if (!isApiSuccess(response)) {
    throw new Error(response?.message || "فشل رفض التوزيعات");
  }

  return extractData(response)!;
};

export const approveAllByCorrespondence = async (correspondenceId: number): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/correspondence/${correspondenceId}/approve-all`
  );

  if (!isApiSuccess(response)) {
    throw new Error(response?.message || "فشل الموافقة على جميع التوزيعات");
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
    throw new Error(response?.message || "فشل رفض جميع التوزيعات");
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
    throw new Error(response?.message || "فشل تحميل تفاصيل التوزيع");
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
    throw new Error(response?.message || "فشل تحميل التوزيعات");
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
    let errorMessage = response?.message || 'فشل تحديد البريد كمقروء';
    
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
