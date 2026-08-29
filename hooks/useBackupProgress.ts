/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useBackupProgress.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProgress,
  getRunningOperations,
  getAllOperations,
  cancelOperation,
  verifyOperationCancelled,
  getProgressStatistics,
  cleanupStaleOperations,
} from "@/services/backup-progress.service";
import {
  BackupProgressResponseDto,
  ProgressStatisticsDto,
} from "@/types/api/backup-progress.types";

// ============================================================
// ===== Queries =====
// ============================================================

export const useProgress = (operationId: string | null) => {
  return useQuery<BackupProgressResponseDto>({
    queryKey: ["backup-progress", operationId],
    queryFn: () => getProgress(operationId!),
    enabled: !!operationId,
    staleTime: 0,
    // ✅ إعادة الجلب كل 2 ثانية إذا كانت العملية قيد التشغيل
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.isRunning) {
        return 2000;
      }
      return false;
    },
    retry: false,
  });
};

export const useRunningOperations = () => {
  return useQuery<BackupProgressResponseDto[]>({
    queryKey: ["backup-progress", "running"],
    queryFn: getRunningOperations,
    staleTime: 0,
    refetchInterval: 3000, // ✅ إعادة الجلب كل 3 ثواني
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useAllOperations = (status?: string) => {
  return useQuery<BackupProgressResponseDto[]>({
    queryKey: ["backup-progress", "all", status],
    queryFn: () => getAllOperations(status),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useProgressStatistics = () => {
  return useQuery<ProgressStatisticsDto>({
    queryKey: ["backup-progress", "statistics"],
    queryFn: getProgressStatistics,
    staleTime: 0,
    refetchInterval: 5000, // ✅ إعادة الجلب كل 5 ثواني
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useVerifyOperationCancelled = (operationId: string | null) => {
  return useQuery<boolean>({
    queryKey: ["backup-progress", "verify-cancelled", operationId],
    queryFn: () => verifyOperationCancelled(operationId!),
    enabled: !!operationId,
    staleTime: 0,
    retry: false,
  });
};

// ============================================================
// ===== Mutations =====
// ============================================================

export const useCancelOperation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operationId: string) => cancelOperation(operationId),
    onSuccess: () => {
      toast.success("تم إلغاء العملية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup-progress"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إلغاء العملية";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useCleanupStaleOperations = (onSuccess?: (count: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (olderThanMinutes?: number) => cleanupStaleOperations(olderThanMinutes),
    onSuccess: (count) => {
      toast.success(`تم تنظيف ${count} عملية قديمة`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup-progress"] });
      if (onSuccess) onSuccess(count);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل تنظيف العمليات القديمة";
      toast.error(message, { duration: 4000 });
    },
  });
};