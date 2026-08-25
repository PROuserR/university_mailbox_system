// src/hooks/useDistribute.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getDistributionEditorData, distribute } from "@/services/distribution.service";

/**
 * Hook لجلب بيانات التوزيع
 */
export const useDistributionEditor = (correspondenceId: number | null) => {
    return useQuery({
        queryKey: ["distribution-editor", correspondenceId],
        queryFn: () => getDistributionEditorData(correspondenceId!),
        enabled: !!correspondenceId && correspondenceId > 0,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook لحفظ التوزيع
 */
export const useDistributeMutation = (
    correspondenceId: number,
    onSuccess?: () => void,
    onClose?: () => void
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
        onSuccess: (data) => {
            toast.success("تم حفظ التوزيع بنجاح");

            queryClient.invalidateQueries({
                queryKey: ["distribution-editor", correspondenceId],
            });
            queryClient.invalidateQueries({
                queryKey: ["correspondences"],
            });

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || "فشل حفظ التوزيع");
        },
    });
};