/* eslint-disable @typescript-eslint/no-explicit-any */
// services/backup-progress.service.ts

import { apiWrapper, extractData } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
  BackupProgressResponseDto,
  ProgressStatisticsDto,
} from "@/types/api/backup-progress.types";

const BASE_URL = "BackupProgress";

// ============================================================
// ===== Get Progress =====
// ============================================================

export const getProgress = async (operationId: string): Promise<BackupProgressResponseDto> => {
  const response = await apiWrapper.get<ApiResult<BackupProgressResponseDto>>(
    `${BASE_URL}/${operationId}`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل تقدم العملية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل تقدم العملية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Running Operations =====
// ============================================================

export const getRunningOperations = async (): Promise<BackupProgressResponseDto[]> => {
  const response = await apiWrapper.get<ApiResult<BackupProgressResponseDto[]>>(
    `${BASE_URL}/running`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل العمليات الجارية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل العمليات الجارية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || [];
};

// ============================================================
// ===== Get All Operations =====
// ============================================================

export const getAllOperations = async (status?: string): Promise<BackupProgressResponseDto[]> => {
  const params: Record<string, any> = {};
  if (status) params.status = status;

  const response = await apiWrapper.get<ApiResult<BackupProgressResponseDto[]>>(
    BASE_URL,
    params
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل العمليات");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل العمليات");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || [];
};

// ============================================================
// ===== Cancel Operation =====
// ============================================================

export const cancelOperation = async (operationId: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/${operationId}/cancel`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل إلغاء العملية");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل إلغاء العملية");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Verify Operation Cancelled =====
// ============================================================

export const verifyOperationCancelled = async (operationId: string): Promise<boolean> => {
  const response = await apiWrapper.get<ApiResult<boolean>>(
    `${BASE_URL}/${operationId}/verify-cancelled`
  );

  if (!response.success || !response.data) {
    return false;
  }

  if (!response.data.isSuccess) {
    return false;
  }

  return extractData(response) || false;
};

// ============================================================
// ===== Get Statistics =====
// ============================================================

export const getProgressStatistics = async (): Promise<ProgressStatisticsDto> => {
  const response = await apiWrapper.get<ApiResult<ProgressStatisticsDto>>(
    `${BASE_URL}/statistics`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل إحصائيات التقدم");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل إحصائيات التقدم");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Cleanup Stale Operations =====
// ============================================================

export const cleanupStaleOperations = async (olderThanMinutes: number = 60): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/cleanup?olderThanMinutes=${olderThanMinutes}`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تنظيف العمليات القديمة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تنظيف العمليات القديمة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || 0;
};