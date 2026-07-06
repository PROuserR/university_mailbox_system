// src/hooks/useCorrespondence.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getCorrespondenceById,
    updateCorrespondence,
    getDocumentTypes,
    getSenderEntities,
} from "@/services/correspondence.service";
import { UpdateCorrespondencePayload } from "@/types/api/correspondence.types";

// =========================
// Hook لجلب مراسلة
// =========================

export const useCorrespondence = (id: number) => {
    return useQuery({
        queryKey: ["correspondence", id],
        queryFn: () => getCorrespondenceById(id),
        enabled: !!id,
    });
};

// =========================
// Hook لتحديث مراسلة
// =========================

export const useUpdateCorrespondence = (
    id: number,
    onSuccess?: () => void
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            data: UpdateCorrespondencePayload;
            files?: File[];
            primaryFile?: File;
        }) => {
            return updateCorrespondence(
                id,
                payload.data,
                payload.files,
                payload.primaryFile
            );
        },
        onSuccess: () => {
            toast.success("تم تحديث المراسلة بنجاح");

            queryClient.invalidateQueries({
                queryKey: ["correspondence", id],
            });
            queryClient.invalidateQueries({
                queryKey: ["mails"],
            });
            queryClient.invalidateQueries({
                queryKey: ["mailsCount"],
            });

            if (onSuccess) onSuccess();
        },
        onError: (error: Error) => {
            toast.error(error.message || "فشل تحديث المراسلة");
        },
    });
};

// =========================
// Hook لجلب أنواع المستندات
// =========================

export const useDocumentTypes = () => {
    return useQuery({
        queryKey: ["document-types"],
        queryFn: () => getDocumentTypes(),
        staleTime: 5 * 60 * 1000, // 5 دقائق
    });
};

// =========================
// Hook لجلب الجهات المرسلة
// =========================

export const useSenderEntities = () => {
    return useQuery({
        queryKey: ["sender-entities"],
        queryFn: () => getSenderEntities(),
        staleTime: 5 * 60 * 1000, // 5 دقائق
    });
};