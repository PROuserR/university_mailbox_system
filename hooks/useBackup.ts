/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useBackup.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createDatabaseBackup,
  listDatabaseBackups,
  deleteDatabaseBackup,
  restoreDatabaseBackup,
  createDailyBackup,
  createMonthlyBackup,
  createAnnualBackup,
  listFilesBackups,
  deleteFilesBackup,
  cleanupOldBackups,
  previewFilesBackup,
  restoreFilesBackup,
  restoreFilesBackupToPath,
  retryFailedRestore,
  compareBackups,
  getBackupStatistics,
} from "@/services/backup.service";
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

// ============================================================
// ===== Database Backup Queries =====
// ============================================================

export const useListDatabaseBackups = () => {
  return useQuery<BackupInfoDto[]>({
    queryKey: ["backup", "database"],
    queryFn: listDatabaseBackups,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Files Backup Queries =====
// ============================================================

export const useListFilesBackups = (page: number = 1, pageSize: number = 20) => {
  return useQuery<PagedResult<BackupInfoDto>>({
    queryKey: ["backup", "files", page, pageSize],
    queryFn: () => listFilesBackups(page, pageSize),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
};

export const usePreviewFilesBackup = (type: BackupType | null, backupId: string | null) => {
  return useQuery<BackupPreviewDto>({
    queryKey: ["backup", "preview", type, backupId],
    queryFn: () => previewFilesBackup(type!, backupId!),
    enabled: !!type && !!backupId,
    staleTime: 0,
  });
};

export const useBackupStatistics = () => {
  return useQuery<BackupStatisticsDto>({
    queryKey: ["backup", "statistics"],
    queryFn: getBackupStatistics,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Database Backup Mutations =====
// ============================================================

export const useCreateDatabaseBackup = (onSuccess?: (data: BackupResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDatabaseBackup,
    onSuccess: (data) => {
      toast.success("تم إنشاء نسخة احتياطية لقاعدة البيانات بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إنشاء نسخة احتياطية لقاعدة البيانات";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useRestoreDatabaseBackup = (onSuccess?: (data: RestoreResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreDatabaseBackup(id),
    onSuccess: (data) => {
      toast.success("تم استعادة قاعدة البيانات بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل استعادة قاعدة البيانات";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useDeleteDatabaseBackup = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDatabaseBackup(id),
    onSuccess: () => {
      toast.success("تم حذف النسخة الاحتياطية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const message = error?.message || "فشل حذف النسخة الاحتياطية";
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Files Backup - Create Mutations =====
// ============================================================

export const useCreateDailyBackup = (onSuccess?: (data: BackupResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month, day }: { year?: number; month?: number; day?: number }) =>
      createDailyBackup(year, month, day),
    onSuccess: (data) => {
      toast.success("تم إنشاء النسخة الاحتياطية اليومية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إنشاء النسخة الاحتياطية اليومية";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useCreateMonthlyBackup = (onSuccess?: (data: BackupResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year?: number; month?: number }) =>
      createMonthlyBackup(year, month),
    onSuccess: (data) => {
      toast.success("تم إنشاء النسخة الاحتياطية الشهرية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إنشاء النسخة الاحتياطية الشهرية";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useCreateAnnualBackup = (onSuccess?: (data: BackupResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (year?: number) => createAnnualBackup(year),
    onSuccess: (data) => {
      toast.success("تم إنشاء النسخة الاحتياطية السنوية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إنشاء النسخة الاحتياطية السنوية";
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Files Backup - Management Mutations =====
// ============================================================

export const useDeleteFilesBackup = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFilesBackup(id),
    onSuccess: () => {
      toast.success("تم حذف النسخة الاحتياطية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const message = error?.message || "فشل حذف النسخة الاحتياطية";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useCleanupOldBackups = (onSuccess?: (count: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy?: CleanupPolicy) => cleanupOldBackups(policy),
    onSuccess: (count) => {
      toast.success(`تم تنظيف ${count} نسخة احتياطية قديمة`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(count);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل تنظيف النسخ الاحتياطية القديمة";
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Files Backup - Restore Mutations =====
// ============================================================

export const useRestoreFilesBackup = (onSuccess?: (data: RestoreResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, backupId, options }: { type: BackupType; backupId: string; options?: RestoreOptions }) =>
      restoreFilesBackup(type, backupId, options),
    onSuccess: (data) => {
      toast.success("تم استعادة النسخة الاحتياطية بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل استعادة النسخة الاحتياطية";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useRestoreFilesBackupToPath = (onSuccess?: (data: RestoreResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, backupId, options }: { type: BackupType; backupId: string; options: RestoreToPathOptions }) =>
      restoreFilesBackupToPath(type, backupId, options),
    onSuccess: (data) => {
      toast.success("تم استعادة النسخة الاحتياطية إلى المسار المحدد بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل استعادة النسخة الاحتياطية إلى المسار المحدد";
      toast.error(message, { duration: 4000 });
    },
  });
};

export const useRetryFailedRestore = (onSuccess?: (data: RestoreResultDto) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RetryFailedRequest) => retryFailedRestore(request),
    onSuccess: (data) => {
      toast.success("تم إعادة محاولة الاستعادة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["backup"] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل إعادة محاولة الاستعادة";
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Files Backup - Compare Mutations =====
// ============================================================

export const useCompareBackups = (onSuccess?: (data: BackupComparisonDto) => void) => {
  return useMutation({
    mutationFn: (request: CompareBackupsRequest) => compareBackups(request),
    onSuccess: (data) => {
      toast.success("تمت مقارنة النسخ الاحتياطية بنجاح", { duration: 3000 });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const message = error?.message || "فشل مقارنة النسخ الاحتياطية";
      toast.error(message, { duration: 4000 });
    },
  });
};