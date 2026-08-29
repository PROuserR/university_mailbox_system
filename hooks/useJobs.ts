/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useJobs.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllJobsStatus,
  getJobStatus,
  rescheduleAllJobs,
  rescheduleJob,
  triggerJob,
  pauseJob,
  resumeJob,
  updateJobSchedule,
  cancelJob,
  cleanupOldJobs,
} from "@/services/jobs.service";

// ============================================================
// ===== Queries =====
// ============================================================

export const useAllJobsStatus = () => {
  return useQuery({
    queryKey: ["jobs", "status"],
    queryFn: async () => {
      try {
        const result = await getAllJobsStatus();
        return result;
      } catch (error: any) {
        if (error?.statusCode === 404) {
          return {};
        }
        throw error;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
};

export const useJobStatus = (jobId: string | null) => {
  return useQuery({
    queryKey: ["jobs", "status", jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
};

// ============================================================
// ===== Mutations =====
// ============================================================

export const useRescheduleAllJobs = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rescheduleAllJobs,
    onSuccess: () => {
      toast.success("تم إعادة جدولة جميع المهام بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل إعادة جدولة المهام";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const useRescheduleJob = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => rescheduleJob(jobId),
    onSuccess: () => {
      toast.success("تم إعادة جدولة المهمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل إعادة جدولة المهمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const useTriggerJob = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => triggerJob(jobId),
    onSuccess: () => {
      toast.success("تم تشغيل المهمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل تشغيل المهمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const usePauseJob = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => pauseJob(jobId),
    onSuccess: () => {
      toast.success("تم إيقاف المهمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل إيقاف المهمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const useResumeJob = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => resumeJob(jobId),
    onSuccess: () => {
      toast.success("تم استئناف المهمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل استئناف المهمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const useUpdateJobSchedule = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, cronExpression }: { jobId: string; cronExpression: string }) =>
      updateJobSchedule(jobId, cronExpression),
    onSuccess: () => {
      toast.success("تم تحديث جدولة المهمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل تحديث جدولة المهمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const useCancelJob = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => cancelJob(jobId),
    onSuccess: () => {
      toast.success("تم إلغاء المهمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل إلغاء المهمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};

export const useCleanupOldJobs = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupOldJobs,
    onSuccess: () => {
      toast.success("تم تنظيف المهام القديمة بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "فشل تنظيف المهام القديمة";
      toast.error(errorMessage, { duration: 4000 });
    },
  });
};