/* eslint-disable @typescript-eslint/no-explicit-any */
// services/file-management.service.ts

import { apiWrapper, extractData } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
  FailedFileDeletionDto,
  TempFilesResultDto,
  TempCleanupResultDto,
  GetTempFilesQuery,
  DeleteTempFilesQuery,
} from "@/types/api/file-management.types";

const BASE_URL = "FailedFileDeletions";
const TEMP_URL = "TempFiles";

// ============================================================
// ===== Failed File Deletions =====
// ============================================================

export const getUnresolvedFailedFiles = async (): Promise<FailedFileDeletionDto[]> => {
  const response = await apiWrapper.get<ApiResult<FailedFileDeletionDto[]>>(BASE_URL);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل قائمة الملفات الفاشلة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل قائمة الملفات الفاشلة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || [];
};

export const retryFailedDeletions = async (): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(`${BASE_URL}/retry`);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إعادة محاولة حذف الملفات");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إعادة محاولة حذف الملفات");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || 0;
};

export const markFailedFileAsResolved = async (id: number): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(`${BASE_URL}/${id}/resolve`);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحديث حالة الملف");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحديث حالة الملف");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Temp Files =====
// ============================================================

export const searchTempFiles = async (
  query: GetTempFilesQuery = {}
): Promise<TempFilesResultDto> => {
  const { olderThanMinutes } = query;

  const params: Record<string, any> = {};
  if (olderThanMinutes) params.olderThanMinutes = olderThanMinutes;

  const response = await apiWrapper.get<ApiResult<TempFilesResultDto>>(
    `${TEMP_URL}/search`,
    params
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل البحث عن الملفات المؤقتة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل البحث عن الملفات المؤقتة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

export const deleteTempFiles = async (
  query: DeleteTempFilesQuery = {}
): Promise<TempCleanupResultDto> => {
  const { olderThanMinutes, forceDelete = false } = query;

  const params: Record<string, any> = { forceDelete };
  if (olderThanMinutes) params.olderThanMinutes = olderThanMinutes;

  const response = await apiWrapper.delete<ApiResult<TempCleanupResultDto>>(
    `${TEMP_URL}`,
    { params }
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل حذف الملفات المؤقتة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل حذف الملفات المؤقتة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

export const getTempFolderSize = async (): Promise<number> => {
  const response = await apiWrapper.get<ApiResult<number>>(`${TEMP_URL}/size`);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل الحصول على حجم المجلد المؤقت");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل الحصول على حجم المجلد المؤقت");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || 0;
};