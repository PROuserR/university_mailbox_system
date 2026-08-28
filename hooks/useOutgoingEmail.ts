// hooks/useOutgoingEmail.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { outgoingEmailService } from "@/services/outgoing-email.service";
import {
    OutgoingEmailFilterDto,
    SendOutgoingEmailDto,
    ResendOutgoingEmailDto,
    UpdateFailedEmailDto,
} from "@/types/api/outgoing-email";
import toast from "react-hot-toast";

// ============================================================
// ===== Queries =====
// ============================================================

export const useOutgoingEmails = (filter: OutgoingEmailFilterDto) => {
    return useInfiniteQuery({
        queryKey: ["outgoing-emails", filter],
        queryFn: ({ pageParam = 1 }) =>
            outgoingEmailService.getSentEmails({
                ...filter,
                page: pageParam,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.pageNumber < lastPage.totalPages) {
                return lastPage.pageNumber + 1;
            }
            return undefined;
        },
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

export const useOutgoingEmail = (id: number | null) => {
    return useQuery({
        queryKey: ["outgoing-email", id],
        queryFn: () => outgoingEmailService.getEmailHistoryById(id!),
        enabled: !!id,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

export const useEmailHistory = (correspondenceId: number | null) => {
    return useQuery({
        queryKey: ["email-history", correspondenceId],
        queryFn: () => outgoingEmailService.getEmailHistory(correspondenceId!),
        enabled: !!correspondenceId,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

export const useOutgoingStatistics = () => {
    return useQuery({
        queryKey: ["outgoing-statistics"],
        queryFn: () => outgoingEmailService.getStatistics(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
};

export const usePendingRetryEmails = () => {
    return useQuery({
        queryKey: ["pending-retry-emails"],
        queryFn: () => outgoingEmailService.getPendingRetry(),
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

// ============================================================
// ===== Mutations =====
// ============================================================

export const useSendEmail = (onSuccess?: (data: any) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SendOutgoingEmailDto) => {
            const response = await outgoingEmailService.sendEmail(data);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data?.messageId ? `تم إرسال البريد بنجاح (رقم: ${data.messageId})` : "تم إرسال البريد بنجاح");
            queryClient.invalidateQueries({ queryKey: ["outgoing-emails"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-statistics"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إرسال البريد");
        },
    });
};

export const useResendEmail = (onSuccess?: (data: any) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ResendOutgoingEmailDto }) => {
            const response = await outgoingEmailService.resendEmail(id, data);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data?.messageId ? `تم إعادة إرسال البريد بنجاح (رقم: ${data.messageId})` : "تم إعادة إرسال البريد بنجاح");
            queryClient.invalidateQueries({ queryKey: ["outgoing-emails"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-statistics"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إعادة إرسال البريد");
        },
    });
};

export const useProcessFailedEmails = (onSuccess?: (count: number) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const count = await outgoingEmailService.processFailedEmails();
            return count;
        },
        onSuccess: (count) => {
            if (count > 0) {
                toast.success(`تمت معالجة ${count} بريد فاشل`);
            } else {
                toast.success("لا يوجد بريد فاشل للمعالجة");
            }
            queryClient.invalidateQueries({ queryKey: ["outgoing-emails"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["pending-retry-emails"] });
            if (onSuccess) onSuccess(count);
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل معالجة البريد الفاشل");
        },
    });
};

export const useUpdateFailedEmail = (onSuccess?: (data: any) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateFailedEmailDto) => {
            const response = await outgoingEmailService.updateFailedEmail(data);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data?.messageId ? `تم تحديث البريد الفاشل وإعادة إرساله (رقم: ${data.messageId})` : "تم تحديث البريد الفاشل وإعادة إرساله");
            queryClient.invalidateQueries({ queryKey: ["outgoing-emails"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["pending-retry-emails"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تحديث البريد الفاشل");
        },
    });
};

export const useTestEmailConnection = (onSuccess?: (result: boolean) => void) => {
    return useMutation({
        mutationFn: async () => {
            const result = await outgoingEmailService.testConnection();
            return result;
        },
        onSuccess: (result) => {
            if (result) {
                toast.success("اتصال البريد الإلكتروني يعمل بشكل صحيح");
            } else {
                toast.error("فشل الاتصال بخادم البريد الإلكتروني");
            }
            if (onSuccess) onSuccess(result);
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل اختبار الاتصال");
        },
    });
};

export const useDeleteEmailHistory = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await outgoingEmailService.deleteEmailHistory(id);
        },
        onSuccess: () => {
            toast.success("تم حذف سجل البريد بنجاح");
            queryClient.invalidateQueries({ queryKey: ["outgoing-emails"] });
            queryClient.invalidateQueries({ queryKey: ["outgoing-statistics"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل حذف سجل البريد");
        },
    });
};