// src/services/distribution.service.ts

import { apiWrapper } from "@/utils/apiClient";
import {
  DistributionEditorData,
  CreateDistributionPayload,
  DistributeResponseDto,
  ApiResult,
} from "@/types/api/distribution.types";

const BASE_URL = "Distributions";

/**
 * جلب بيانات التوزيع للتعديل
 */
export const getDistributionEditorData = async (
  correspondenceId: number
): Promise<DistributionEditorData> => {
  const res = await apiWrapper.get<ApiResult<DistributionEditorData>>(
    `${BASE_URL}/editor-data/${correspondenceId}`
  );

  if (!res.success || !res.data) {
    throw new Error(res.error || "Failed to load distribution data");
  }

  return res.data.data;
};

/**
 * حفظ التوزيع (إنشاء/تعديل)
 */
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
    throw new Error(res.error || res.data?.message || "فشل حفظ التوزيع");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل حفظ التوزيع");
  }

  return res.data.data;
};
