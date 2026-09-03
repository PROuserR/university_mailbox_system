/* eslint-disable @typescript-eslint/no-explicit-any */
// services/backup.service.ts

import { apiWrapper, extractData } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
  BackupInfoDto,
  BackupPreviewDto,
  BackupResultDto,
  BackupStatisticsDto,
  BackupType,
  CleanupPolicy,
  CompareBackupsRequest,
  RestoreOptions,
  RestoreResultDto,
  RestoreToPathOptions,
  RetryFailedRequest,
  BackupComparisonDto,
} from "@/types/api/backup.types";
import PagedResult from "@/types/api/PagedResponse";

const BASE_URL = "Backup";

// ============================================================
// ===== Database Backup =====
// ============================================================

export const createDatabaseBackup = async (): Promise<BackupResultDto> => {
  const response = await apiWrapper.post<ApiResult<BackupResultDto>>(
    `${BASE_URL}/database`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إنشاء نسخة احتياطية لقاعدة البيانات");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إنشاء نسخة احتياطية لقاعدة البيانات");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};


export const listDatabaseBackups = async (): Promise<BackupInfoDto[]> => {
  const response = await apiWrapper.get<ApiResult<BackupInfoDto[]>>(
    `${BASE_URL}/database`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل قائمة النسخ الاحتياطية لقاعدة البيانات");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل قائمة النسخ الاحتياطية لقاعدة البيانات");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || [];
};
export const deleteDatabaseBackup = async (id: string): Promise<void> => {
  const response = await apiWrapper.delete<ApiResult<void>>(
    `${BASE_URL}/database/${id}`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل حذف النسخة الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل حذف النسخة الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

export const restoreDatabaseBackup = async (id: string): Promise<RestoreResultDto> => {
  const response = await apiWrapper.post<ApiResult<RestoreResultDto>>(
    `${BASE_URL}/database/${id}/restore`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل استعادة النسخة الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل استعادة النسخة الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Files Backup - Create =====
// ============================================================

export const createDailyBackup = async (
  year?: number,
  month?: number,
  day?: number
): Promise<BackupResultDto> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());
  if (day) params.append("day", day.toString());

  const url = `${BASE_URL}/files/daily${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiWrapper.post<ApiResult<BackupResultDto>>(url);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إنشاء نسخة احتياطية يومية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إنشاء نسخة احتياطية يومية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

export const createMonthlyBackup = async (
  year?: number,
  month?: number
): Promise<BackupResultDto> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const url = `${BASE_URL}/files/monthly${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiWrapper.post<ApiResult<BackupResultDto>>(url);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إنشاء نسخة احتياطية شهرية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إنشاء نسخة احتياطية شهرية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

export const createAnnualBackup = async (year?: number): Promise<BackupResultDto> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());

  const url = `${BASE_URL}/files/annual${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiWrapper.post<ApiResult<BackupResultDto>>(url);

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إنشاء نسخة احتياطية سنوية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إنشاء نسخة احتياطية سنوية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Files Backup - List (مع PagedResult) =====
// ============================================================

export const listFilesBackups = async (
  page: number = 1,
  pageSize: number = 5
): Promise<PagedResult<BackupInfoDto>> => {
  const response = await apiWrapper.get<ApiResult<any>>(
    `${BASE_URL}/files/list`,
    { page, pageSize }
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل قائمة النسخ الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل قائمة النسخ الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  const data = extractData(response);
  
  if (data && 'items' in data && 'totalCount' in data) {
    return {
      items: data.items || [],
      totalCount: data.totalCount || 0,
      pageNumber: data.pageNumber || page,
      pageSize: data.pageSize || pageSize,
      totalPages: data.totalPages || Math.ceil((data.totalCount || 0) / pageSize) || 1,
      hasPreviousPage: data.hasPreviousPage || page > 1,
      hasNextPage: data.hasNextPage || page < (data.totalPages || 1),
    };
  }

  const items = data || [];
  return {
    items,
    totalCount: items.length,
    pageNumber: page,
    pageSize: pageSize,
    totalPages: Math.ceil(items.length / pageSize) || 1,
    hasPreviousPage: page > 1,
    hasNextPage: page < Math.ceil(items.length / pageSize),
  };
};

export const deleteFilesBackup = async (id: string): Promise<void> => {
  const response = await apiWrapper.delete<ApiResult<void>>(
    `${BASE_URL}/files/${id}`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل حذف النسخة الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل حذف النسخة الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

export const cleanupOldBackups = async (policy?: CleanupPolicy): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/files/cleanup`,
    policy || {}
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تنظيف النسخ الاحتياطية القديمة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تنظيف النسخ الاحتياطية القديمة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || 0;
};

// ============================================================
// ===== Files Backup - Preview =====
// ============================================================

export const previewFilesBackup = async (
  type: BackupType,
  backupId: string
): Promise<BackupPreviewDto> => {
  const response = await apiWrapper.get<ApiResult<BackupPreviewDto>>(
    `${BASE_URL}/files/preview`,
    { type, backupId }
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل معاينة النسخة الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل معاينة النسخة الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Files Backup - Restore =====
// ============================================================

export const restoreFilesBackup = async (
  type: BackupType,
  backupId: string,
  options?: RestoreOptions
): Promise<RestoreResultDto> => {
  const response = await apiWrapper.post<ApiResult<RestoreResultDto>>(
    `${BASE_URL}/files/restore?type=${type}&backupId=${backupId}`,
    options || {}
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل استعادة النسخة الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل استعادة النسخة الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

export const restoreFilesBackupToPath = async (
  type: BackupType,
  backupId: string,
  options: RestoreToPathOptions
): Promise<RestoreResultDto> => {
  const response = await apiWrapper.post<ApiResult<RestoreResultDto>>(
    `${BASE_URL}/files/restore-to-path?type=${type}&backupId=${backupId}`,
    options
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل استعادة النسخة الاحتياطية إلى المسار المحدد");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل استعادة النسخة الاحتياطية إلى المسار المحدد");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

export const retryFailedRestore = async (
  request: RetryFailedRequest
): Promise<RestoreResultDto> => {
  const response = await apiWrapper.post<ApiResult<RestoreResultDto>>(
    `${BASE_URL}/files/restore-retry-failed`,
    request
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إعادة محاولة الاستعادة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إعادة محاولة الاستعادة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Files Backup - Compare =====
// ============================================================

export const compareBackups = async (
  request: CompareBackupsRequest
): Promise<BackupComparisonDto> => {
  const response = await apiWrapper.post<ApiResult<BackupComparisonDto>>(
    `${BASE_URL}/files/compare`,
    request
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل مقارنة النسخ الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل مقارنة النسخ الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Files Backup - Statistics =====
// ============================================================

export const getBackupStatistics = async (): Promise<BackupStatisticsDto> => {
  const response = await apiWrapper.get<ApiResult<BackupStatisticsDto>>(
    `${BASE_URL}/files/statistics`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل إحصائيات النسخ الاحتياطية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل إحصائيات النسخ الاحتياطية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};