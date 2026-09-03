/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useSenderEntities.ts

import { useState, useEffect, useCallback } from "react";
import { senderEntityService } from "@/services/sender-entity.service";
import { SenderEntity } from "@/types/api/SenderEntity";
import toast from "react-hot-toast";

export function useSenderEntities() {
  const [entities, setEntities] = useState<SenderEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntities = useCallback(async (showToast: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await senderEntityService.getAll();
      setEntities(data);
    } catch (err: any) {
      const message = err?.message || "فشل تحميل الجهات المرسلة";
      setError(message);
      if (showToast) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntities(true);
  }, [loadEntities]);

  const createEntity = useCallback(async (name: string) => {
    try {
      const data = await senderEntityService.create(name);
      setEntities((prev) => [...prev, data]);
      toast.success("تم إضافة الجهة بنجاح");
      return data;
    } catch (err: any) {
      const message = err?.message || "فشل إنشاء الجهة";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateEntity = useCallback(async (id: number, name: string) => {
    try {
      const data = await senderEntityService.update(id, name);
      setEntities((prev) => prev.map((item) => (item.id === id ? data : item)));
      toast.success("تم تحديث الجهة بنجاح");
      return data;
    } catch (err: any) {
      const message = err?.message || "فشل تحديث الجهة";
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteEntity = useCallback(async (id: number) => {
    try {
      await senderEntityService.delete(id);
      setEntities((prev) => prev.filter((item) => item.id !== id));
      toast.success("تم حذف الجهة بنجاح");
    } catch (err: any) {
      const message = err?.message || "فشل حذف الجهة";
      toast.error(message);
      throw err;
    }
  }, []);

  const toggleStatus = useCallback(async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await senderEntityService.deactivate(id);
        toast.success("تم تعطيل الجهة بنجاح");
      } else {
        await senderEntityService.activate(id);
        toast.success("تم تفعيل الجهة بنجاح");
      }
      setEntities((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !isActive } : item
        )
      );
    } catch (err: any) {
      const message = err?.message || "فشل تغيير حالة الجهة";
      toast.error(message);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadEntities(true);
  }, [loadEntities]);

  return {
    entities,
    loading,
    error,
    loadEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    toggleStatus,
    refresh,
  };
}