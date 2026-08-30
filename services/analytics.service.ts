/* eslint-disable @typescript-eslint/no-explicit-any */
// services/analytics.service.ts

import { apiWrapper, extractData } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
  IgnoredUserReportDto,
  GetIgnoredUsersQuery,
  DistributionPatternsDto,
  GetDistributionPatternsQuery,
  DistributionFullReportDto,
  GetDistributionFullQuery,
  IgnoredPatternsDto,
  DeanDashboardDto,
  ReceiverDashboardFullDto,
  ReadingBehaviorReportDto,
  GetCorrespondenceFullQuery,
  CorrespondenceFullReportDto,
  DistributionStatusDto,
} from "@/types/api/analytics.types";
import PagedResult from "@/types/api/PagedResponse";

const BASE_URL = "Analytics";

// ============================================================
// ===== Get Ignored Users =====
// ============================================================

export const getIgnoredUsers = async (
  query: GetIgnoredUsersQuery = {}
): Promise<PagedResult<IgnoredUserReportDto>> => {
  const { daysThreshold = 7, page = 1, pageSize = 10 } = query;

  const response = await apiWrapper.get<ApiResult<PagedResult<IgnoredUserReportDto>>>(
    `${BASE_URL}/ignored-users`,
    { daysThreshold, page, pageSize }
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل تقرير المستخدمين المتجاهلين");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل تقرير المستخدمين المتجاهلين");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Process Ignored =====
// ============================================================

export const processIgnored = async (daysThreshold: number): Promise<number> => {
  const response = await apiWrapper.post<ApiResult<number>>(
    `${BASE_URL}/process-ignored?daysThreshold=${daysThreshold}`,
    {}
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل معالجة المراسلات المتجاهلة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل معالجة المراسلات المتجاهلة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response) || 0;
};

// ============================================================
// ===== Get Distribution Patterns =====
// ============================================================

export const getDistributionPatterns = async (
  query: GetDistributionPatternsQuery = {}
): Promise<DistributionPatternsDto> => {
  const {
    topDistributorsCount = 10,
    topSenderEntitiesCount = 10,
    topDocumentTypesCount = 10,
    months = 12,
  } = query;

  const response = await apiWrapper.get<ApiResult<DistributionPatternsDto>>(
    `${BASE_URL}/distribution/patterns`,
    {
      topDistributorsCount,
      topSenderEntitiesCount,
      topDocumentTypesCount,
      months,
    }
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل أنماط التوزيع");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل أنماط التوزيع");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Distribution Full Report =====
// ============================================================

export const getDistributionFull = async (
  query: GetDistributionFullQuery = {}
): Promise<DistributionFullReportDto> => {
  const {
    fromDate = null,
    toDate = null,
    departmentId = null,
    userId = null,
    mainType = null,
    isProfessional = null,
    groupBy = "day",
  } = query;

  const params: Record<string, any> = {
    groupBy,
  };

  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (departmentId) params.departmentId = departmentId;
  if (userId) params.userId = userId;
  if (mainType) params.mainType = mainType;
  if (isProfessional !== null && isProfessional !== undefined) params.isProfessional = isProfessional;

  const response = await apiWrapper.get<ApiResult<DistributionFullReportDto>>(
    `${BASE_URL}/distribution/full`,
    params
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل تقرير التوزيع الكامل");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل تقرير التوزيع الكامل");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Ignored Patterns =====
// ============================================================

export const getIgnoredPatterns = async (): Promise<IgnoredPatternsDto> => {
  const response = await apiWrapper.get<ApiResult<IgnoredPatternsDto>>(
    `${BASE_URL}/ignored-patterns`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل أنماط التجاهل");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل أنماط التجاهل");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Dean Dashboard =====
// ============================================================

export const getDeanDashboard = async (): Promise<DeanDashboardDto> => {
  const response = await apiWrapper.get<ApiResult<DeanDashboardDto>>(
    `${BASE_URL}/dean/dashboard`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل لوحة العميد");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل لوحة العميد");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Receiver Dashboard =====
// ============================================================

export const getReceiverDashboard = async (): Promise<ReceiverDashboardFullDto> => {
  const response = await apiWrapper.get<ApiResult<ReceiverDashboardFullDto>>(
    `${BASE_URL}/receiver/dashboard`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل لوحة المستلم");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل لوحة المستلم");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Reading Behavior Report =====
// ============================================================

export const getReadingBehavior = async (): Promise<ReadingBehaviorReportDto> => {
  const response = await apiWrapper.get<ApiResult<ReadingBehaviorReportDto>>(
    `${BASE_URL}/reading-behavior`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل تقرير سلوك القراءة");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل تقرير سلوك القراءة");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Correspondence Full Report =====
// ============================================================

export const getCorrespondenceFull = async (
  query: GetCorrespondenceFullQuery = {}
): Promise<CorrespondenceFullReportDto> => {
  const {
    fromDate = null,
    toDate = null,
    mainType = null,
    documentTypeId = null,
    senderEntityId = null,
    groupBy = "day",
    topIgnoredCount = 10,
  } = query;

  const params: Record<string, any> = {
    groupBy,
    topIgnoredCount,
  };

  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (mainType) params.mainType = mainType;
  if (documentTypeId) params.documentTypeId = documentTypeId;
  if (senderEntityId) params.senderEntityId = senderEntityId;

  const response = await apiWrapper.get<ApiResult<CorrespondenceFullReportDto>>(
    `${BASE_URL}/correspondence/full`,
    params
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل تقرير المراسلات الكامل");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل تقرير المراسلات الكامل");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};

// ============================================================
// ===== Get Distribution Status Report =====
// ============================================================

export const getDistributionStatus = async (
  correspondenceId: number
): Promise<DistributionStatusDto> => {
  const response = await apiWrapper.get<ApiResult<DistributionStatusDto>>(
    `${BASE_URL}/distribution-status-report/${correspondenceId}`
  );

  if (!response.success || !response.data) {
    const error = new Error(response?.message || "فشل تحميل حالة التوزيع");
    (error as any).statusCode = response?.status || 500;
    throw error;
  }

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || "فشل تحميل حالة التوزيع");
    (error as any).statusCode = response.data.statusCode || response.status;
    throw error;
  }

  return extractData(response)!;
};