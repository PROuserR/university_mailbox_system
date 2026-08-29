/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDeanHistory.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getCurrentDean,
    getDeanByDate,
    isUserCurrentDean,
    getAllDeanHistory,
    getDeanHistoryByUserId,
    assignNewDean,
    terminateCurrentDean,
    transferDean,
    deleteDeanHistory,
} from "@/services/dean-history.service";
import {
    DeanHistoryResponseDto,
    CurrentDeanDto,
    CreateDeanHistoryRequest,
    TransferDeanRequest,
} from "@/types/api/dean-history.types";

// ============================================================
// ===== Queries =====
// ============================================================

export const useCurrentDean = () => {
    return useQuery({
        queryKey: ["dean-history", "current"],
        queryFn: async () => {
            try {
                const result = await getCurrentDean();
                return result;
            } catch (error: any) {
                // ✅ إذا كان الخطأ 404، نرجع null بدلاً من رمي الخطأ
                if (error?.statusCode === 404 || error?.message?.includes("404")) {
                    return null;
                }
                throw error;
            }
        },
        staleTime: 0, // ✅ عدم تخزين البيانات مؤقتاً
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        retry: false,
    });
};

export const useDeanByDate = (date: string | null) => {
    return useQuery({
        queryKey: ["dean-history", "by-date", date],
        queryFn: () => getDeanByDate(date!),
        enabled: !!date,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

export const useIsUserCurrentDean = (userId: number | null) => {
    return useQuery({
        queryKey: ["dean-history", "is-current-dean", userId],
        queryFn: () => isUserCurrentDean(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useAllDeanHistory = () => {
    return useQuery({
        queryKey: ["dean-history", "all"],
        queryFn: () => getAllDeanHistory(),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
};

export const useDeanHistoryByUserId = (userId: number | null) => {
    return useQuery({
        queryKey: ["dean-history", "user", userId],
        queryFn: () => getDeanHistoryByUserId(userId!),
        enabled: !!userId,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
};

// ============================================================
// ===== Mutations =====
// ============================================================

export const useAssignNewDean = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDeanHistoryRequest) => assignNewDean(payload),
        onSuccess: () => {
            toast.success("تم تعيين العميد الجديد بنجاح", { duration: 3000 });
            // ✅ إلغاء جميع الـ Queries المتعلقة بالعميد
            queryClient.invalidateQueries({ queryKey: ["dean-history"] });
            queryClient.invalidateQueries({ queryKey: ["dean-history", "current"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // ✅ إعادة جلب فورية
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: ["dean-history", "current"] });
            }, 100);
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error?.message || "فشل تعيين العميد الجديد";
            toast.error(errorMessage, { duration: 4000 });
        },
    });
};

export const useTerminateCurrentDean = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // ✅ محاولة إنهاء العميد الحالي
            await terminateCurrentDean();
            return true;
        },
        onSuccess: () => {
            toast.success("تم إنهاء فترة العميد الحالي بنجاح", { duration: 3000 });
            
            // ✅ إلغاء جميع الـ Queries المتعلقة بالعميد
            queryClient.invalidateQueries({ queryKey: ["dean-history"] });
            queryClient.invalidateQueries({ queryKey: ["dean-history", "current"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            
            // ✅ إعادة جلب فورية مع تأخير بسيط لضمان تحديث cache
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: ["dean-history", "current"] });
                // ✅ التأكد من أن cache تم مسحه
                queryClient.setQueryData(["dean-history", "current"], null);
            }, 100);
            
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error?.message || "فشل إنهاء فترة العميد الحالي";
            toast.error(errorMessage, { duration: 4000 });
        },
    });
};

export const useTransferDean = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: TransferDeanRequest) => transferDean(payload),
        onSuccess: () => {
            toast.success("تم نقل منصب العميد بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["dean-history"] });
            queryClient.invalidateQueries({ queryKey: ["dean-history", "current"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: ["dean-history", "current"] });
            }, 100);
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error?.message || "فشل نقل منصب العميد";
            toast.error(errorMessage, { duration: 4000 });
        },
    });
};

export const useDeleteDeanHistory = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteDeanHistory(id),
        onSuccess: () => {
            toast.success("تم حذف السجل بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["dean-history"] });
            queryClient.invalidateQueries({ queryKey: ["dean-history", "user"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error?.message || "فشل حذف السجل";
            toast.error(errorMessage, { duration: 4000 });
        },
    });
};