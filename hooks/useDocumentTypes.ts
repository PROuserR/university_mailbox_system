/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDocumentTypes.ts

import { useState, useEffect, useCallback } from "react";
import { documentTypeService } from "@/services/document-type.service";
import { DocumentType } from "@/types/api/DocumentTypesResponse";
import toast from "react-hot-toast";

export function useDocumentTypes() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async (showToast: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentTypeService.getAll();
      setDocuments(data);
    } catch (err: any) {
      const message = err?.message || "فشل تحميل أنواع الوثائق";
      setError(message);
      if (showToast) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments(true);
  }, [loadDocuments]);

  const createDocument = useCallback(async (name: string) => {
    try {
      const data = await documentTypeService.create(name);
      setDocuments((prev) => [...prev, data]);
      toast.success("تم إضافة نوع الوثيقة بنجاح");
      return data;
    } catch (err: any) {
      const message = err?.message || "فشل إنشاء نوع الوثيقة";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateDocument = useCallback(async (id: number, name: string) => {
    try {
      const data = await documentTypeService.update(id, name);
      setDocuments((prev) => prev.map((item) => (item.id === id ? data : item)));
      toast.success("تم تحديث نوع الوثيقة بنجاح");
      return data;
    } catch (err: any) {
      const message = err?.message || "فشل تحديث نوع الوثيقة";
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteDocument = useCallback(async (id: number) => {
    try {
      await documentTypeService.delete(id);
      setDocuments((prev) => prev.filter((item) => item.id !== id));
      toast.success("تم حذف نوع الوثيقة بنجاح");
    } catch (err: any) {
      const message = err?.message || "فشل حذف نوع الوثيقة";
      toast.error(message);
      throw err;
    }
  }, []);

  const toggleStatus = useCallback(async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await documentTypeService.deactivate(id);
        toast.success("تم تعطيل نوع الوثيقة بنجاح");
      } else {
        await documentTypeService.activate(id);
        toast.success("تم تفعيل نوع الوثيقة بنجاح");
      }
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !isActive } : item
        )
      );
    } catch (err: any) {
      const message = err?.message || "فشل تغيير حالة نوع الوثيقة";
      toast.error(message);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadDocuments(true);
  }, [loadDocuments]);

  return {
    documents,
    loading,
    error,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    toggleStatus,
    refresh,
  };
}