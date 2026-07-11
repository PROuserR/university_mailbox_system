// src/hooks/useCorrespondence.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getCorrespondenceById,
  updateCorrespondence,
  getDocumentTypes,
  getSenderEntities,
  getCorrespondencesPaged,
  deleteCorrespondence,
} from "@/services/correspondence.service";
import {
  UpdateCorrespondencePayload,
  CorrespondenceResponse,
} from "@/types/api/correspondence.types";
import type { CorrespondenceSearchDto } from "@/types/api/correspondence.types";


export const useCorrespondences = (searchDto: CorrespondenceSearchDto) => {
  return useQuery({
    queryKey: ["correspondences", searchDto],
    queryFn: () => getCorrespondencesPaged(searchDto),
    staleTime:500,  
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};



export const useCorrespondence = (id: number | null) => {
  return useQuery({
    queryKey: ["correspondence", id],
    queryFn: () => getCorrespondenceById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};



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
        queryKey: ["correspondences"],
      });

      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل تحديث المراسلة");
    },
  });
};


export const useDeleteCorrespondence = (
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCorrespondence(id),
    onSuccess: () => {
      toast.success("تم حذف المراسلة بنجاح");

      queryClient.invalidateQueries({
        queryKey: ["correspondences"],
      });

      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل حذف المراسلة");
    },
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