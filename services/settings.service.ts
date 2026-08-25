// services/settings.service.ts
import { apiWrapper } from "@/utils/apiClient";
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
import { ApiResult } from "@/types/api/ApiResult";

class SettingsService {
  // ============================================================
  // ===== GET =====
  // ============================================================

  async getSettings(): Promise<SystemSettingsDto> {
    const response = await apiWrapper.get<ApiResult<SystemSettingsDto>>(
      "/SystemSettings"
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحميل الإعدادات");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Distribution =====
  // ============================================================

  async updateDistributionSettings(
    dto: UpdateDistributionSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/distribution",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات التوزيع");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - File =====
  // ============================================================

  async updateFileSettings(dto: UpdateFileSettingsDto): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/file",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات الملفات");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Email Incoming =====
  // ============================================================

  async updateEmailIncomingSettings(
    dto: UpdateEmailIncomingSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/email/incoming",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات البريد الوارد");
    }

    return response.data.data;
  }

  async toggleIncomingEmail(enabled: boolean): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      `/SystemSettings/email/incoming/toggle?enabled=${enabled}`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تغيير حالة البريد الوارد");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Email Outgoing =====
  // ============================================================

  async updateEmailOutgoingSettings(
    dto: UpdateEmailOutgoingSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/email/outgoing",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات البريد الصادر");
    }

    return response.data.data;
  }

  async toggleOutgoingEmail(enabled: boolean): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      `/SystemSettings/email/outgoing/toggle?enabled=${enabled}`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تغيير حالة البريد الصادر");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Archive =====
  // ============================================================

  async updateArchiveSettings(
    dto: UpdateArchiveSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/archive",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات الأرشفة");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Attachment Naming =====
  // ============================================================

  async updateAttachmentNamingSettings(
    dto: UpdateAttachmentNamingDto
  ): Promise<void> {
    const response = await apiWrapper.put<ApiResult<void>>(
      "/SystemSettings/attachment-naming",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات تسمية المرفقات");
    }
  }

  // ============================================================
  // ===== UPDATE - Cleanup =====
  // ============================================================

  async updateCleanupSettings(
    dto: UpdateCleanupSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/cleanup",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات التنظيف");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Temp Cleanup =====
  // ============================================================

  async updateTempCleanupSettings(
    dto: UpdateTempCleanupSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/temp-cleanup",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات التنظيف المؤقت");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Files Backup =====
  // ============================================================

  async updateFilesBackupSettings(
    dto: UpdateFilesBackupSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/files-backup",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات النسخ الاحتياطي للملفات");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== UPDATE - Database Backup =====
  // ============================================================

  async updateDatabaseBackupSettings(
    dto: UpdateDatabaseBackupSettingsDto
  ): Promise<SystemSettingsDto> {
    const response = await apiWrapper.put<ApiResult<SystemSettingsDto>>(
      "/SystemSettings/database-backup",
      dto
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل تحديث إعدادات النسخ الاحتياطي لقاعدة البيانات");
    }

    return response.data.data;
  }

  // ============================================================
  // ===== RESET =====
  // ============================================================

  async resetSettings(): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      "/SystemSettings/reset"
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.message || "فشل إعادة تعيين الإعدادات");
    }
  }
}

export const settingsService = new SettingsService();