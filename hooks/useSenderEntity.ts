/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSenderEntity.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { senderEntityService } from "@/services/senderEntity.service";
import type {
  SenderEntityResponse,
  CreateSenderEntityRequest,
  UpdateSenderEntityRequest,
} from "@/types/api/senderEntity";

/**
 * Hook for fetching and managing sender entities
 * Uses simple useState/useEffect (no React Query for now)
 */
export function useSenderEntities() {
  const [entities, setEntities] = useState<SenderEntityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll =  async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await senderEntityService.getAll();
      setEntities(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "فشل في تحميل الجهات المرسلة";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    entities,
    setEntities,
    loading,
    error,
    refetch: fetchAll,
  };
}

/**
 * Hook for fetching only active sender entities (for dropdowns)
 */
export function useActiveSenderEntities() {
  const [entities, setEntities] = useState<SenderEntityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState<string | null>(null);

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await senderEntityService.getActiveOnly();
      setEntities(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "فشل في تحميل الجهات المرسلة";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  return { entities, loading, err, refetch: fetchActive };
}

/**
 * Hook for CRUD operations on sender entities
 */
export function useSenderEntityOperations() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (data: CreateSenderEntityRequest) => {
    setIsLoading(true);
    try {
      const result = await senderEntityService.create(data);
      toast.success("تم إنشاء الجهة بنجاح");
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في إنشاء الجهة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number, data: UpdateSenderEntityRequest) => {
      setIsLoading(true);
      try {
        const result = await senderEntityService.update(id, data);
        toast.success("تم تعديل الجهة بنجاح");
        return result;
      } catch (err: any) {
        const message = err.response?.data?.message || "فشل في تعديل الجهة";
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await senderEntityService.delete(id);
      toast.success("تم حذف الجهة بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في حذف الجهة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activate = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await senderEntityService.activate(id);
      toast.success("تم تفعيل الجهة بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تفعيل الجهة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deactivate = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await senderEntityService.deactivate(id);
      toast.success("تم إلغاء تفعيل الجهة بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في إلغاء تفعيل الجهة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    create,
    update,
    delete: remove,
    activate,
    deactivate,
  };
}
