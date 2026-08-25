/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCorrespondence.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getCorrespondenceById,
    getCorrespondencesPaged,
    getDocumentTypes,
    getSenderEntities,
    deleteCorrespondence,
    requestApproval,
    signCorrespondence,
    archiveCorrespondence,
    restoreFromArchive,
    revertToDraft,
    revertToDistributed,
    requestRevertToDraft,
    approveRevertToDraft,
    rejectRevertToDraft,
    requestRevertToDistributed,
    approveRevertToDistributed,
    rejectRevertToDistributed,
    getCorrespondenceWithReplies,
    updateCorrespondence,
    createCorrespondence,
    getCorrespondencesForParentSelector,
} from "@/services/correspondence.service";
import {
    UpdateCorrespondencePayload,
    CorrespondenceResponse,
    CorrespondenceSearchDto,
    SignCorrespondenceResultDto,
} from "@/types/api/correspondence.types";

// ============================================================
// ===== Queries =====
// ============================================================

export const useParentSelector = (search: string = '', page: number = 1, pageSize: number = 10) => {
    return useQuery({
        queryKey: ["parent-selector", search, page, pageSize],
        queryFn: () => getCorrespondencesForParentSelector({ search, page, pageSize }),
        staleTime: 5 * 60 * 1000,
        enabled: false,
    });
};

export const useCorrespondences = (searchDto: CorrespondenceSearchDto) => {
    return useQuery({
        queryKey: ["correspondences", searchDto],
        queryFn: () => getCorrespondencesPaged(searchDto),
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

export const useCorrespondence = (id: number | null) => {
    return useQuery({
        queryKey: ["correspondence", id],
        queryFn: () => getCorrespondenceById(id!),
        enabled: !!id,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

export const useDocumentTypes = () => {
    return useQuery({
        queryKey: ["document-types"],
        queryFn: () => getDocumentTypes(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useSenderEntities = () => {
    return useQuery({
        queryKey: ["sender-entities"],
        queryFn: () => getSenderEntities(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useCorrespondenceWithReplies = (id: number | null) => {
    return useQuery({
        queryKey: ["correspondence", id, "with-replies"],
        queryFn: () => getCorrespondenceWithReplies(id!),
        enabled: !!id,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

// ============================================================
// ===== Mutation - Create Correspondence =====
// ============================================================

export const useCreateCorrespondence = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: FormData) => createCorrespondence(payload),
        onSuccess: (data: CorrespondenceResponse) => {
            toast.success("تم إنشاء المراسلة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence", data.id] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إنشاء المراسلة", {
                duration: 3000,
            });
        },
    });
};

export const useUpdateCorrespondence = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: FormData;
        }) => updateCorrespondence(id, payload),
        onSuccess: (data: CorrespondenceResponse) => {
            toast.success("تم تحديث المراسلة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence", data.id] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تحديث المراسلة", {
                duration: 3000,
            });
        },
    });
};

export const useDeleteCorrespondence = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteCorrespondence(id),
        onSuccess: () => {
            toast.success("تم حذف المراسلة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل حذف المراسلة", {
                duration: 3000,
            });
        },
    });
};

// ============================================================
// ===== Mutations - Status Management =====
// ============================================================

export const useRequestApproval = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => requestApproval(id),
        onSuccess: () => {
            toast.success("تم طلب الموافقة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل طلب الموافقة", {
                duration: 3000,
            });
        },
    });
};

export const useSignCorrespondence = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            options,
        }: {
            id: number;
            options: {
                autoIgnoreUnread?: boolean;
                autoRejectPendingApproval?: boolean;
                forceSign?: boolean;
            };
        }) => signCorrespondence(id, options),
        onSuccess: (data: SignCorrespondenceResultDto) => {
            toast.success(data.message || "تم توقيع المراسلة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل توقيع المراسلة", {
                duration: 3000,
            });
        },
    });
};

export const useArchiveCorrespondence = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            archiveCorrespondence(id, notes),
        onSuccess: () => {
            toast.success("تم أرشفة المراسلة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل أرشفة المراسلة", {
                duration: 3000,
            });
        },
    });
};

export const useRestoreFromArchive = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            restoreFromArchive(id, notes),
        onSuccess: () => {
            toast.success("تم استرجاع المراسلة بنجاح", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل استرجاع المراسلة", {
                duration: 3000,
            });
        },
    });
};

export const useRevertToDraft = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => revertToDraft(id),
        onSuccess: () => {
            toast.success("تم استرجاع المراسلة إلى مسودة", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل استرجاع المراسلة", {
                duration: 3000,
            });
        },
    });
};

export const useRevertToDistributed = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            revertToDistributed(id, reason),
        onSuccess: () => {
            toast.success("تم استرجاع المراسلة إلى موزعة", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل استرجاع المراسلة", {
                duration: 3000,
            });
        },
    });
};

// ============================================================
// ===== Mutations - Revert Requests =====
// ============================================================

export const useRequestRevertToDraft = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            requestRevertToDraft(id, reason),
        onSuccess: () => {
            toast.success("تم إرسال طلب الاسترجاع للعميد", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إرسال طلب الاسترجاع", {
                duration: 3000,
            });
        },
    });
};

export const useApproveRevertToDraft = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            approveRevertToDraft(id, reason),
        onSuccess: () => {
            toast.success("تمت الموافقة على استرجاع المراسلة", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل الموافقة على الاسترجاع", {
                duration: 3000,
            });
        },
    });
};

export const useRejectRevertToDraft = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            rejectRevertToDraft(id, reason),
        onSuccess: () => {
            toast.success("تم رفض طلب الاسترجاع", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل رفض طلب الاسترجاع", {
                duration: 3000,
            });
        },
    });
};

export const useRequestRevertToDistributed = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            requestRevertToDistributed(id, reason),
        onSuccess: () => {
            toast.success("تم إرسال طلب الاسترجاع للعميد", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إرسال طلب الاسترجاع", {
                duration: 3000,
            });
        },
    });
};

export const useApproveRevertToDistributed = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            approveRevertToDistributed(id, reason),
        onSuccess: () => {
            toast.success("تمت الموافقة على استرجاع المراسلة", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل الموافقة على الاسترجاع", {
                duration: 3000,
            });
        },
    });
};

export const useRejectRevertToDistributed = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            rejectRevertToDistributed(id, reason),
        onSuccess: () => {
            toast.success("تم رفض طلب الاسترجاع", {
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["correspondences"] });
            queryClient.invalidateQueries({ queryKey: ["correspondence"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل رفض طلب الاسترجاع", {
                duration: 3000,
            });
        },
    });
};