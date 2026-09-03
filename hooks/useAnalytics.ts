/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAnalytics.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getIgnoredUsers,
  processIgnored,
  getDistributionPatterns,
  getDistributionFull,
  getIgnoredPatterns,
  getDeanDashboard,
  getReceiverDashboard,
  getReadingBehavior,
  getDistributionStatus,
  getCorrespondenceFull,
} from "@/services/analytics.service";
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
  CorrespondenceFullReportDto,
  DistributionStatusDto,
  GetCorrespondenceFullQuery,
} from "@/types/api/analytics.types";
import PagedResult from "@/types/api/PagedResponse";

// ============================================================
// ===== Ignored Users Queries =====
// ============================================================

export const useIgnoredUsers = (query: GetIgnoredUsersQuery = {}) => {
  const { daysThreshold = 7, page = 1, pageSize = 10 } = query;

  return useQuery<PagedResult<IgnoredUserReportDto>>({
    queryKey: ["analytics", "ignored-users", daysThreshold, page, pageSize],
    queryFn: () => getIgnoredUsers({ daysThreshold, page, pageSize }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Ignored Users Mutations =====
// ============================================================

export const useProcessIgnored = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (daysThreshold: number) => processIgnored(daysThreshold),
    onSuccess: (count) => {
      toast.success(`تمت معالجة ${count} مراسلة متجاهلة بنجاح`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const message = error?.message || "فشل معالجة المراسلات المتجاهلة";
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Distribution Patterns Queries =====
// ============================================================

export const useDistributionPatterns = (query: GetDistributionPatternsQuery = {}) => {
  const {
    topDistributorsCount = 10,
    topSenderEntitiesCount = 10,
    topDocumentTypesCount = 10,
    months = 12,
  } = query;

  return useQuery<DistributionPatternsDto>({
    queryKey: [
      "analytics",
      "distribution-patterns",
      topDistributorsCount,
      topSenderEntitiesCount,
      topDocumentTypesCount,
      months,
    ],
    queryFn: () =>
      getDistributionPatterns({
        topDistributorsCount,
        topSenderEntitiesCount,
        topDocumentTypesCount,
        months,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Distribution Full Report Queries =====
// ============================================================

export const useDistributionFull = (query: GetDistributionFullQuery = {}) => {
  const {
    fromDate = null,
    toDate = null,
    departmentId = null,
    userId = null,
    mainType = null,
    isProfessional = null,
    groupBy = "day",
  } = query;

  return useQuery<DistributionFullReportDto>({
    queryKey: [
      "analytics",
      "distribution-full",
      fromDate,
      toDate,
      departmentId,
      userId,
      mainType,
      isProfessional,
      groupBy,
    ],
    queryFn: () =>
      getDistributionFull({
        fromDate,
        toDate,
        departmentId,
        userId,
        mainType,
        isProfessional,
        groupBy,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Ignored Patterns Queries =====
// ============================================================

export const useIgnoredPatterns = () => {
  return useQuery<IgnoredPatternsDto>({
    queryKey: ["analytics", "ignored-patterns"],
    queryFn: getIgnoredPatterns,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Dean Dashboard Queries =====
// ============================================================

export const useDeanDashboard = () => {
  return useQuery<DeanDashboardDto>({
    queryKey: ["analytics", "dean-dashboard"],
    queryFn: getDeanDashboard,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Receiver Dashboard Queries =====
// ============================================================

export const useReceiverDashboard = () => {
  return useQuery<ReceiverDashboardFullDto>({
    queryKey: ["analytics", "receiver-dashboard"],
    queryFn: getReceiverDashboard,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Reading Behavior Queries =====
// ============================================================

export const useReadingBehavior = () => {
  return useQuery<ReadingBehaviorReportDto>({
    queryKey: ["analytics", "reading-behavior"],
    queryFn: getReadingBehavior,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
// ============================================================
// ===== Correspondence Full Report Queries =====
// ============================================================

export const useCorrespondenceFull = (query: GetCorrespondenceFullQuery = {}) => {
  const {
    fromDate = null,
    toDate = null,
    mainType = null,
    documentTypeId = null,
    senderEntityId = null,
    groupBy = "day",
    topIgnoredCount = 10,
  } = query;

  return useQuery<CorrespondenceFullReportDto>({
    queryKey: [
      "analytics",
      "correspondence-full",
      fromDate,
      toDate,
      mainType,
      documentTypeId,
      senderEntityId,
      groupBy,
      topIgnoredCount,
    ],
    queryFn: () =>
      getCorrespondenceFull({
        fromDate,
        toDate,
        mainType,
        documentTypeId,
        senderEntityId,
        groupBy,
        topIgnoredCount,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Distribution Status Queries =====
// ============================================================

export const useDistributionStatus = (correspondenceId: number | null) => {
  return useQuery<DistributionStatusDto>({
    queryKey: ["analytics", "distribution-status", correspondenceId],
    queryFn: () => getDistributionStatus(correspondenceId!),
    enabled: !!correspondenceId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};