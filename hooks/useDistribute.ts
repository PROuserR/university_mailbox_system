/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDistribution.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
  getAllDistributions,
} from "@/services/distribution.service";
import {
  CreateDistributionPayload,
  DistributionFilterDto,
  DistributionResponseByIdDto,
} from "@/types/api/distribution.types";
import PagedResult from "@/types/api/PagedResponse";

// ============================================================
// ===== Helper: استخراج رسالة الخطأ =====
// ============================================================

const getErrorMessage = (error: any): string => {
  // 1. إذا كان error نص
  if (typeof error === 'string') {
    return error;
  }

  // 2. إذا كان error كائن مع message
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // 3. إذا كان error من React Query (عنده response)
  if (error?.response?.data) {
    const data = error.response.data;
    
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    
    if (data.errors) {
      if (typeof data.errors === 'string') {
        return data.errors;
      }
      if (Array.isArray(data.errors)) {
        return data.errors.join(', ');
      }
      if (typeof data.errors === 'object') {
        const messages: string[] = [];
        for (const [key, value] of Object.entries(data.errors)) {
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(', ')}`);
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          } else {
            messages.push(`${key}: ${JSON.stringify(value)}`);
          }
        }
        return messages.join('; ');
      }
    }
    
    if (data.title && typeof data.title === 'string') {
      return data.title;
    }
    
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
  }

  // 4. إذا كان error عنده response مع errors
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) return errors.join(', ');
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
  }

  // 5. إذا كان error عنده response مع message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // 6. إذا كان error عنده response مع error
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // 7. إذا كان error عنده statusText
  if (error?.response?.statusText) {
    return error.response.statusText;
  }

  // 8. رسالة افتراضية
  return 'حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.';
};

// ============================================================
// ===== Distribution Editor =====
// ============================================================

export const useDistributionEditor = (correspondenceId: number | null) => {
  return useQuery({
    queryKey: ["distribution-editor", correspondenceId],
    queryFn: () => getDistributionEditorData(correspondenceId!),
    enabled: !!correspondenceId && correspondenceId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
    retry: 1,
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
    retry: 1,
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
    retry: 1,
  });
};

export const usePendingApprovals = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ["pending-approvals", page, pageSize],
    queryFn: () => getPendingApprovals(page, pageSize),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
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
    retry: 1,
  });
};

export const useDistributions = (filter: DistributionFilterDto) => {
  return useQuery({
    queryKey: ["distributions", filter],
    queryFn: () => getDistributions(filter),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
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
      
      queryClient.refetchQueries({ 
        queryKey: ["distribution-inbox"] 
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error(message, { duration: 4000 });
    },
  });
};

// ============================================================
// ===== Infinite Query =====
// ============================================================

interface UseAllDistributionsInfiniteOptions extends Partial<DistributionFilterDto> {
  pageSize?: number;
}

export const useAllDistributionsInfinite = (options: UseAllDistributionsInfiniteOptions = {}) => {
  const {
    search,
    status,
    correspondenceStatus, 
    correspondenceNumber,
    correspondenceMainType,
    isProfessional,
    documentTypeId,
    senderEntityId,
    readAtFrom,
    readAtTo,
    approvedAtFrom,
    approvedAtTo,
    rejectedAtFrom,
    rejectedAtTo,
    revokedAtFrom,
    revokedAtTo,
    sortBy = "DistributedDate",
    sortDescending = true,
    pageSize = 40,
  } = options;

  const queryKey = [
    "distributions",
    "all",
    "infinite",
    search,
    status,
    correspondenceStatus, 
    correspondenceNumber,
    correspondenceMainType,
    isProfessional,
    documentTypeId,
    senderEntityId,
    readAtFrom,
    readAtTo,
    approvedAtFrom,
    approvedAtTo,
    rejectedAtFrom,
    rejectedAtTo,
    revokedAtFrom,
    revokedAtTo,
    sortBy,
    sortDescending,
    pageSize,
  ];

  return useInfiniteQuery<PagedResult<DistributionResponseByIdDto>>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getAllDistributions({
        page: pageParam as number,
        pageSize,
        search,
        status: status !== undefined ? Number(status) : undefined,
        correspondenceStatus: correspondenceStatus !== undefined ? Number(correspondenceStatus) : undefined,
        correspondenceNumber,
        correspondenceMainType: correspondenceMainType !== undefined ? Number(correspondenceMainType) : undefined,
        isProfessional,
        documentTypeId,
        senderEntityId,
        readAtFrom: readAtFrom ? new Date(readAtFrom).toISOString().split('T')[0] : undefined,
        readAtTo: readAtTo ? new Date(readAtTo).toISOString().split('T')[0] : undefined,
        approvedAtFrom: approvedAtFrom ? new Date(approvedAtFrom).toISOString().split('T')[0] : undefined,
        approvedAtTo: approvedAtTo ? new Date(approvedAtTo).toISOString().split('T')[0] : undefined,
        rejectedAtFrom: rejectedAtFrom ? new Date(rejectedAtFrom).toISOString().split('T')[0] : undefined,
        rejectedAtTo: rejectedAtTo ? new Date(rejectedAtTo).toISOString().split('T')[0] : undefined,
        revokedAtFrom: revokedAtFrom ? new Date(revokedAtFrom).toISOString().split('T')[0] : undefined,
        revokedAtTo: revokedAtTo ? new Date(revokedAtTo).toISOString().split('T')[0] : undefined,
        sortBy,
        sortDescending,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};