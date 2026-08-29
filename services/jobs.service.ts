/* eslint-disable @typescript-eslint/no-explicit-any */
// services/jobs.service.ts

import { apiWrapper, extractData } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import { JobsStatusResponse, JobStatusDto } from "@/types/api/jobs.types";

const BASE_URL = "Jobs";

// ============================================================
// ===== GET Jobs Status =====
// ============================================================

export const getAllJobsStatus = async (): Promise<JobsStatusResponse> => {
  const response = await apiWrapper.get<ApiResult<JobsStatusResponse>>(
    `${BASE_URL}/status`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل تحميل حالة المهام";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل تحميل حالة المهام";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || {};
};

export const getJobStatus = async (jobId: string): Promise<JobStatusDto> => {
  const response = await apiWrapper.get<ApiResult<JobStatusDto>>(
    `${BASE_URL}/status/${jobId}`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل تحميل حالة المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل تحميل حالة المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Reschedule Jobs =====
// ============================================================

export const rescheduleAllJobs = async (): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/reschedule-all`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل إعادة جدولة المهام";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل إعادة جدولة المهام";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

export const rescheduleJob = async (jobId: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/reschedule/${jobId}`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل إعادة جدولة المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل إعادة جدولة المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Trigger Jobs =====
// ============================================================

export const triggerJob = async (jobId: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/trigger/${jobId}`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل تشغيل المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل تشغيل المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Pause / Resume Jobs =====
// ============================================================

export const pauseJob = async (jobId: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/pause/${jobId}`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل إيقاف المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل إيقاف المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

export const resumeJob = async (jobId: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/resume/${jobId}`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل استئناف المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل استئناف المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Update Schedule =====
// ============================================================

export const updateJobSchedule = async (
  jobId: string,
  cronExpression: string
): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/update-schedule/${jobId}`,
    { cronExpression }
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل تحديث جدولة المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل تحديث جدولة المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Cancel Job =====
// ============================================================

export const cancelJob = async (jobId: string): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/cancel/${jobId}`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل إلغاء المهمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل إلغاء المهمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};

// ============================================================
// ===== Cleanup Old Jobs =====
// ============================================================

export const cleanupOldJobs = async (): Promise<void> => {
  const response = await apiWrapper.post<ApiResult<void>>(
    `${BASE_URL}/cleanup-old`
  );

  if (!response.success || !response.data) {
    const errorMessage = response?.message || "فشل تنظيف المهام القديمة";
    const error = new Error(errorMessage);
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    let errorMessage = response.data.message || "فشل تنظيف المهام القديمة";
    if (response.data.errors && Array.isArray(response.data.errors)) {
      errorMessage = response.data.errors.join(" • ");
    }
    const error = new Error(errorMessage);
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }
};
