/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDocumentType.ts

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { documentTypeService } from "@/services/documentType.service";
import type {
  DocumentTypeResponse,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
} from "@/types/api/documentType";

/**
 * Hook for fetching and managing document types
 */
export function useDocumentTypes() {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentTypeService.getAll();
      setDocumentTypes(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تحميل أنواع الوثائق";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { documentTypes, setDocumentTypes, loading, error, refetch: fetchAll };
}

/**
 * Hook for fetching only active document types (for dropdowns)
 */
export function useActiveDocumentTypes() {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentTypeService.getActiveOnly();
      setDocumentTypes(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تحميل أنواع الوثائق";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  return { documentTypes, loading, error, refetch: fetchActive };
}

/**
 * Hook for CRUD operations on document types
 */
export function useDocumentTypeOperations() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (data: CreateDocumentTypeRequest) => {
    setIsLoading(true);
    try {
      const result = await documentTypeService.create(data);
      toast.success("تم إنشاء نوع الوثيقة بنجاح");
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في إنشاء نوع الوثيقة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateDocumentTypeRequest) => {
    setIsLoading(true);
    try {
      const result = await documentTypeService.update(id, data);
      toast.success("تم تعديل نوع الوثيقة بنجاح");
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تعديل نوع الوثيقة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await documentTypeService.delete(id);
      toast.success("تم حذف نوع الوثيقة بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في حذف نوع الوثيقة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activate = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await documentTypeService.activate(id);
      toast.success("تم تفعيل نوع الوثيقة بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تفعيل نوع الوثيقة";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deactivate = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await documentTypeService.deactivate(id);
      toast.success("تم إلغاء تفعيل نوع الوثيقة بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في إلغاء تفعيل نوع الوثيقة";
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