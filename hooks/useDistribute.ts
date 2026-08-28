/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDistribution.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getDistributionEditorData,
  distribute,
  getInboxDistributions,
  getOutboxDistributions,
  getPendingApprovalsGrouped,
  getPendingApprovals,
  approveDistribution,
  rejectDistribution,
  approveDistributions,
  rejectDistributions,
  approveAllByCorrespondence,
  rejectAllByCorrespondence,
  getDistributionById,
  getDistributions,
  markAsRead,
} from "@/services/distribution.service";
import {
  CreateDistributionPayload,
  DistributionFilterDto,
} from "@/types/api/distribution.types";

// ============================================================
// ===== Distribution Editor =====
// ============================================================

export const useDistributionEditor = (correspondenceId: number | null) => {
  return useQuery({
    queryKey: ["distribution-editor", correspondenceId],
    queryFn: () => getDistributionEditorData(correspondenceId!),
    enabled: !!correspondenceId && correspondenceId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDistributeMutation = (
  correspondenceId: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { receiverIds: number[]; notes?: string }) => {
      return distribute({
        correspondenceId,
        receiverIds: payload.receiverIds,
        notes: payload.notes,
      });
    },
    onSuccess: () => {
      toast.success("تم حفظ التوزيع بنجاح", { duration: 3000 });
      queryClient.invalidateQueries({
        queryKey: ["distribution-editor", correspondenceId],
      });
      queryClient.invalidateQueries({ queryKey: ["correspondences"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل حفظ التوزيع", { duration: 3000 });
    },
  });
};

// ============================================================
// ===== Inbox & Outbox =====
// ============================================================

export const useInboxDistributions = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  mainType?: string;
  isProfessional?: boolean;
}) => {
  return useQuery({
    queryKey: ["distributions", "inbox", params],
    queryFn: () => getInboxDistributions(params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useOutboxDistributions = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}) => {
  return useQuery({
    queryKey: ["distributions", "outbox", params],
    queryFn: () => getOutboxDistributions(params),
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: true,
  });
};

// ============================================================
// ===== Pending Approvals =====
// ============================================================

export const usePendingApprovalsGrouped = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ["pending-approvals", "grouped", page, pageSize],
    queryFn: () => getPendingApprovalsGrouped(page, pageSize),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const usePendingApprovals = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ["pending-approvals", page, pageSize],
    queryFn: () => getPendingApprovals(page, pageSize),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Distribution Details =====
// ============================================================

export const useDistribution = (id: number | null) => {
  return useQuery({
    queryKey: ["distribution", id],
    queryFn: () => getDistributionById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDistributions = (filter: DistributionFilterDto) => {
  return useQuery({
    queryKey: ["distributions", filter],
    queryFn: () => getDistributions(filter),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// ============================================================
// ===== Mutations - Approve / Reject =====
// ============================================================

export const useApproveDistribution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveDistribution(id),
    onSuccess: () => {
      toast.success("تمت الموافقة على التوزيع", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل الموافقة على التوزيع", { duration: 3000 });
    },
  });
};

export const useRejectDistribution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      rejectDistribution(id, reason),
    onSuccess: () => {
      toast.success("تم رفض التوزيع", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل رفض التوزيع", { duration: 3000 });
    },
  });
};

export const useApproveDistributions = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => approveDistributions(ids),
    onSuccess: () => {
      toast.success("تمت الموافقة على التوزيعات المختارة", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل الموافقة على التوزيعات", { duration: 3000 });
    },
  });
};

export const useRejectDistributions = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, reason }: { ids: number[]; reason?: string }) =>
      rejectDistributions(ids, reason),
    onSuccess: () => {
      toast.success("تم رفض التوزيعات المختارة", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل رفض التوزيعات", { duration: 3000 });
    },
  });
};

export const useApproveAllByCorrespondence = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (correspondenceId: number) =>
      approveAllByCorrespondence(correspondenceId),
    onSuccess: () => {
      toast.success("تمت الموافقة على جميع التوزيعات", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل الموافقة على التوزيعات", { duration: 3000 });
    },
  });
};

export const useRejectAllByCorrespondence = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ correspondenceId, reason }: { correspondenceId: number; reason?: string }) =>
      rejectAllByCorrespondence(correspondenceId, reason),
    onSuccess: () => {
      toast.success("تم رفض جميع التوزيعات", { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل رفض التوزيعات", { duration: 3000 });
    },
  });
};

// ============================================================
// ===== Mark as Read =====
// ============================================================

export const useMarkAsRead = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ correspondenceId, notes }: { correspondenceId: number; notes?: string }) =>
      markAsRead(correspondenceId, notes),
    onSuccess: () => {
      toast.success("تم تحديد البريد كمقروء", { duration: 3000 });
      
      // ✅ تحديث جميع الـ queries المتعلقة بالـ inbox
      queryClient.invalidateQueries({ 
        queryKey: ["distribution-inbox"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["distributions", "inbox"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["distribution-outbox"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["distributions", "outbox"] 
      });
      
      // ✅ إعادة تحميل البيانات فوراً
      queryClient.refetchQueries({ 
        queryKey: ["distribution-inbox"] 
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "فشل تحديد البريد كمقروء", { duration: 3000 });
    },
  });
};