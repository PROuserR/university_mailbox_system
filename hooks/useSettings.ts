/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useSettings.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { settingsService } from "@/services/settings.service";
import {
  SystemSettingsDto,
  UpdateDistributionSettingsDto,
  UpdateFileSettingsDto,
  UpdateEmailIncomingSettingsDto,
  UpdateEmailOutgoingSettingsDto,
  UpdateArchiveSettingsDto,
  UpdateAttachmentNamingDto,
  UpdateCleanupSettingsDto,
  UpdateTempCleanupSettingsDto,
  UpdateFilesBackupSettingsDto,
  UpdateDatabaseBackupSettingsDto,
} from "@/types/api/settings";

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettingsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // ===== Load Settings =====
  // ============================================================

  const hasLoaded = useRef(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      toast.error(error.message || "فشل تحميل الإعدادات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    // ✅ استخدام IIFE لتجنب setState المباشر
    (async () => {
      await loadSettings();
    })();
  }, [loadSettings]);
  

  // ============================================================
  // ===== Update Functions =====
  // ============================================================

  const updateDistributionSettings = useCallback(
    async (dto: UpdateDistributionSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateDistributionSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات التوزيع بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات التوزيع");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateFileSettings = useCallback(
    async (dto: UpdateFileSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateFileSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات الملفات بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات الملفات");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateEmailIncomingSettings = useCallback(
    async (dto: UpdateEmailIncomingSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateEmailIncomingSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات البريد الوارد بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات البريد الوارد");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const toggleIncomingEmail = useCallback(
    async (enabled: boolean) => {
      try {
        setIsSaving(true);
        const data = await settingsService.toggleIncomingEmail(enabled);
        setSettings(data);
        toast.success(`تم ${enabled ? 'تفعيل' : 'تعطيل'} البريد الوارد بنجاح`);
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تغيير حالة البريد الوارد");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateEmailOutgoingSettings = useCallback(
    async (dto: UpdateEmailOutgoingSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateEmailOutgoingSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات البريد الصادر بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات البريد الصادر");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const toggleOutgoingEmail = useCallback(
    async (enabled: boolean) => {
      try {
        setIsSaving(true);
        const data = await settingsService.toggleOutgoingEmail(enabled);
        setSettings(data);
        toast.success(`تم ${enabled ? 'تفعيل' : 'تعطيل'} البريد الصادر بنجاح`);
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تغيير حالة البريد الصادر");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateArchiveSettings = useCallback(
    async (dto: UpdateArchiveSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateArchiveSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات الأرشفة بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات الأرشفة");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateAttachmentNamingSettings = useCallback(
    async (dto: UpdateAttachmentNamingDto) => {
      try {
        setIsSaving(true);
        await settingsService.updateAttachmentNamingSettings(dto);
        // ✅ إعادة تحميل الإعدادات للحصول على القيم المحدثة
        await loadSettings();
        toast.success("تم تحديث إعدادات تسمية المرفقات بنجاح");
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات تسمية المرفقات");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [loadSettings]
  );

  const updateCleanupSettings = useCallback(
    async (dto: UpdateCleanupSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateCleanupSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات التنظيف بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات التنظيف");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateTempCleanupSettings = useCallback(
    async (dto: UpdateTempCleanupSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateTempCleanupSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات التنظيف المؤقت بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات التنظيف المؤقت");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateFilesBackupSettings = useCallback(
    async (dto: UpdateFilesBackupSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateFilesBackupSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات النسخ الاحتياطي للملفات بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات النسخ الاحتياطي للملفات");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateDatabaseBackupSettings = useCallback(
    async (dto: UpdateDatabaseBackupSettingsDto) => {
      try {
        setIsSaving(true);
        const data = await settingsService.updateDatabaseBackupSettings(dto);
        setSettings(data);
        toast.success("تم تحديث إعدادات النسخ الاحتياطي لقاعدة البيانات بنجاح");
        return data;
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث إعدادات النسخ الاحتياطي لقاعدة البيانات");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const resetSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      await settingsService.resetSettings();
      await loadSettings();
      toast.success("تم إعادة تعيين الإعدادات بنجاح");
    } catch (error: any) {
      toast.error(error.message || "فشل إعادة تعيين الإعدادات");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [loadSettings]);

  // ============================================================
  // ===== Initialize =====
  // ============================================================


  return {
    settings,
    isLoading,
    isSaving,
    loadSettings,
    updateDistributionSettings,
    updateFileSettings,
    updateEmailIncomingSettings,
    toggleIncomingEmail,
    updateEmailOutgoingSettings,
    toggleOutgoingEmail,
    updateArchiveSettings,
    updateAttachmentNamingSettings,
    updateCleanupSettings,
    updateTempCleanupSettings,
    updateFilesBackupSettings,
    updateDatabaseBackupSettings,
    resetSettings,
  };
}