// src/services/distribution.service.ts

import {
  apiWrapper,
  extractData,
  isApiSuccess,
  request,
} from "@/utils/apiClient"; // ← تمت الإضافة
import {
  DistributionEditorData,
  CreateDistributionPayload,
  DistributeResponseDto,
  ApiResult,
} from "@/types/api/distribution.types";
import {
  DistributionFilterDto,
  DistributionResponseByIdDto,
  PendingApprovalCorrespondenceDto,
} from "@/types/api/distribution";
import PagedResult from "@/types/api/PagedResponse";

const BASE_URL = "Distributions";

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
    throw new Error(res.message || res.data?.message || "فشل حفظ التوزيع");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل حفظ التوزيع");
  }

  return res.data.data;
};

class DistributionService {
  // ============================================================
  // ===== Pending Approvals =====
  // ============================================================

  async getPendingApprovalsGrouped(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PagedResult<PendingApprovalCorrespondenceDto>> {
    const response = await apiWrapper.get<
      ApiResult<PagedResult<PendingApprovalCorrespondenceDto>>
    >("/Distributions/pending-approval/grouped", { page, pageSize });

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل تحميل الموافقات المعلقة");
    }

    return extractData(response)!;
  }

  async getPendingApprovals(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PagedResult<DistributionResponseByIdDto>> {
    const response = await apiWrapper.get<
      ApiResult<PagedResult<DistributionResponseByIdDto>>
    >("/Distributions/pending-approval", { page, pageSize });

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل تحميل الموافقات المعلقة");
    }

    return extractData(response)!;
  }

  // ============================================================
  // ===== Approve / Reject =====
  // ============================================================

  async approveDistribution(id: number): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      `/Distributions/${id}/approve`
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل الموافقة على التوزيع");
    }
  }

  async rejectDistribution(id: number, reason?: string): Promise<void> {
    const response = await request<ApiResult<void>>({
      method: "POST",
      url: `/Distributions/${id}/reject`,
      data: reason || null,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل رفض التوزيع");
    }
  }

  async approveDistributions(ids: number[]): Promise<number> {
    const response = await apiWrapper.post<ApiResult<number>>(
      "/Distributions/batch/approve",
      ids
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل الموافقة على التوزيعات");
    }

    return extractData(response)!;
  }

  async rejectDistributions(ids: number[], reason?: string): Promise<number> {
    const response = await apiWrapper.post<ApiResult<number>>(
      `/Distributions/batch/reject${
        reason ? `?reason=${encodeURIComponent(reason)}` : ""
      }`,
      ids
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل رفض التوزيعات");
    }

    return extractData(response)!;
  }

  async approveAllByCorrespondence(correspondenceId: number): Promise<number> {
    const response = await apiWrapper.post<ApiResult<number>>(
      `/Distributions/correspondence/${correspondenceId}/approve-all`
    );

    if (!isApiSuccess(response)) {
      throw new Error(
        response.data?.message || "فشل الموافقة على جميع التوزيعات"
      );
    }

    return extractData(response)!;
  }

  async rejectAllByCorrespondence(
    correspondenceId: number,
    reason?: string
  ): Promise<number> {
    const response = await request<ApiResult<number>>({
      method: "POST",
      url: `/Distributions/correspondence/${correspondenceId}/reject-all`,
      data: reason || null,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل رفض جميع التوزيعات");
    }

    return extractData(response)!;
  }

  // ============================================================
  // ===== Get Distribution Details =====
  // ============================================================

  async getDistributionById(id: number): Promise<DistributionResponseByIdDto> {
    const response = await apiWrapper.get<
      ApiResult<DistributionResponseByIdDto>
    >(`/Distributions/${id}`);

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل تحميل تفاصيل التوزيع");
    }

    return extractData(response)!;
  }

  // ============================================================
  // ===== Filter Distributions =====
  // ============================================================

  async getDistributions(
    filter: DistributionFilterDto
  ): Promise<PagedResult<DistributionResponseByIdDto>> {
    const response = await apiWrapper.get<
      ApiResult<PagedResult<DistributionResponseByIdDto>>
    >("/Distributions", filter);

    if (!isApiSuccess(response)) {
      throw new Error(response.data?.message || "فشل تحميل التوزيعات");
    }

    return extractData(response)!;
  }
}

export const distributionService = new DistributionService();
