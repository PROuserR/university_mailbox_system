/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useFileManagement.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getUnresolvedFailedFiles,
  retryFailedDeletions,
  markFailedFileAsResolved,
  searchTempFiles,
  deleteTempFiles,
  getTempFolderSize,
} from "@/services/file-management.service";
import {
  FailedFileDeletionDto,
  TempFilesResultDto,
  TempCleanupResultDto,
  GetTempFilesQuery,
  DeleteTempFilesQuery,
} from "@/types/api/file-management.types";

// ============================================================
// ===== Failed File Deletions Queries =====
// ============================================================

export const useUnresolvedFailedFiles = () => {
  return useQuery<FailedFileDeletionDto[]>({
    queryKey: ["file-management", "failed-files"],
    queryFn: getUnresolvedFailedFiles,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Failed File Deletions Mutations =====
// ============================================================

export const useRetryFailedDeletions = (onSuccess?: (count: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryFailedDeletions,
    onSuccess: (count) => {
      toast.success(`تم إعادة محاولة حذف ${count} ملف بنجاح`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["file-management"] });
      if (onSuccess) onSuccess(count);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إعادة محاولة حذف الملفات";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useMarkFailedFileAsResolved = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markFailedFileAsResolved(id),
    onSuccess: () => {
      toast.success("تم تحديث حالة الملف بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["file-management"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const message = error?.message || "فشل تحديث حالة الملف";
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Temp Files Queries =====
// ============================================================

export const useSearchTempFiles = (query: GetTempFilesQuery = {}) => {
  const { olderThanMinutes } = query;

  return useQuery<TempFilesResultDto>({
    queryKey: ["file-management", "temp-files", olderThanMinutes],
    queryFn: () => searchTempFiles({ olderThanMinutes }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useTempFolderSize = () => {
  return useQuery<number>({
    queryKey: ["file-management", "temp-size"],
    queryFn: getTempFolderSize,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Temp Files Mutations =====
// ============================================================

export const useDeleteTempFiles = (onSuccess?: (data: TempCleanupResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (query: DeleteTempFilesQuery) => deleteTempFiles(query),
    onSuccess: (data) => {
      toast.success(`تم حذف ${data.deletedFiles} ملف مؤقت`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["file-management"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل حذف الملفات المؤقتة";
      toast.error(message, { duration: 4000 });
    },
  });
};