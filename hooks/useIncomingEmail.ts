/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useIncomingEmail.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { incomingEmailService } from "@/services/incoming-email.service";
import { IncomingEmailFilter, IncomingEmailStatus, ApproveIncomingEmailDto } from "@/types/api/incoming-email";
import toast from "react-hot-toast";
import { useCallback, useRef, useEffect } from "react";

// ============================================================
// ===== Infinite Scroll Hook =====
// ============================================================

export function useInfiniteScroll({
    onBottom,
    isLoading = false,
    hasMore = true,
    dataLength,
    threshold = 0.8,
    rootMargin = "50px",
}: {
    onBottom: () => void;
    isLoading?: boolean;
    hasMore?: boolean;
    dataLength: number;
    threshold?: number;
    rootMargin?: string;
}) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const isReadyRef = useRef(false);
    const loadingLockRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (dataLength > 0) {
            isReadyRef.current = true;
        }
    }, [dataLength]);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (!entry) return;

            const isVisible = entry.intersectionRatio >= threshold;

            if (
                !isVisible ||
                !isReadyRef.current ||
                isLoading ||
                loadingLockRef.current ||
                !hasMore
            ) {
                return;
            }

            loadingLockRef.current = true;
            onBottom();

            setTimeout(() => {
                loadingLockRef.current = false;
            }, 500);
        },
        [onBottom, isLoading, hasMore, threshold]
    );

    useEffect(() => {
        const el = bottomRef.current;
        if (!el) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        observerRef.current = new IntersectionObserver(handleIntersection, {
            root: null,
            threshold,
            rootMargin,
        });

        observerRef.current.observe(el);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [handleIntersection, threshold, rootMargin]);

    return bottomRef;
}

// ============================================================
// ===== Queries =====
// ============================================================

export const useIncomingEmails = (filter: IncomingEmailFilter) => {
    return useInfiniteQuery({
        queryKey: ["incoming-emails", filter],
        queryFn: ({ pageParam = 1 }) => 
            incomingEmailService.getEmails({
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

export const useIncomingEmail = (id: number | null) => {
    return useQuery({
        queryKey: ["incoming-email", id],
        queryFn: () => incomingEmailService.getEmailById(id!),
        enabled: !!id,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

// ============================================================
// ===== Mutations =====
// ============================================================

export const useProcessIncomingEmails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => incomingEmailService.processEmails(),
        onSuccess: (data) => {
            const message = data !== undefined ? `تمت معالجة ${data} بريد وارد` : "تمت معالجة البريد الوارد";
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ["incoming-emails"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل في معالجة البريد الوارد");
        },
    });
};

export const useApproveEmail = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ApproveIncomingEmailDto }) =>
            incomingEmailService.approveEmail(id, data),
        onSuccess: (data) => {
            toast.success(data?.message || "تمت الموافقة على البريد وتحويله إلى مراسلة");
            queryClient.invalidateQueries({ queryKey: ["incoming-emails"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-email"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل في الموافقة على البريد");
        },
    });
};

export const useRejectEmail = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            incomingEmailService.rejectEmail(id, reason),
        onSuccess: (data) => {
            toast.success(data?.message || "تم رفض البريد");
            queryClient.invalidateQueries({ queryKey: ["incoming-emails"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-email"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل في رفض البريد");
        },
    });
};

export const useSkipEmail = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            incomingEmailService.skipEmail(id, notes),
        onSuccess: (data) => {
            toast.success(data?.message || "تم تخطي البريد");
            queryClient.invalidateQueries({ queryKey: ["incoming-emails"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-email"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل في تخطي البريد");
        },
    });
};

export const useReopenEmail = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            incomingEmailService.reopenEmail(id, notes),
        onSuccess: (data) => {
            toast.success(data?.message || "تم إعادة فتح البريد");
            queryClient.invalidateQueries({ queryKey: ["incoming-emails"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-email"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل في إعادة فتح البريد");
        },
    });
};

export const useDeleteIncomingEmail = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => incomingEmailService.deleteIncomingEmail(id),
        onSuccess: (data) => {
            toast.success(data?.message || "تم حذف البريد بنجاح");
            queryClient.invalidateQueries({ queryKey: ["incoming-emails"] });
            queryClient.invalidateQueries({ queryKey: ["incoming-email"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل في حذف البريد");
        },
    });
};