// types/api/settings.ts

// ============================================================
// ===== Queries (GET) =====
// ============================================================

export interface SystemSettingsDto {
  // Distribution
  ignoredAfterDays: number;
  autoIgnoreEnabled: boolean;
  backgroundServiceIntervalHours: number;
  requireDeanApprovalForAll: boolean;
  autoApprovePermanentReceivers: boolean;
  requireDeanApprovalForHeadDistribution: boolean;

  // File
  maxAttachmentSizeMB: number;
  allowedExtensionsList: string[];
  blockedMimeTypesList: string[];

  // Email Incoming
  enableIncomingEmail: boolean;
  incomingEmailServer: string | null;
  incomingEmailPort: number;
  incomingEmailUsername: string | null;
  incomingEmailUseSsl: boolean;
  incomingEmailCheckIntervalMinutes: number;
  incomingEmailMaxPerBatch: number;
  incomingEmailAllowedDomains: string | null;
  incomingEmailFetchDays: number | null;

  // Email Outgoing
  enableOutgoingEmail: boolean;
  outgoingEmailServer: string | null;
  outgoingEmailPort: number;
  outgoingEmailUsername: string | null;
  outgoingEmailUseSsl: boolean;
  outgoingEmailFrom: string | null;
  outgoingEmailFromName: string | null;
  outgoingEmailMaxRetryCount: number;
  outgoingEmailRetryIntervalMinutes: number;
  outgoingEmailNotifyOnDelivery: boolean;

  // Archive
  archiveAfterDays: number;
  autoArchiveEnabled: boolean;
  archiveBatchSize: number;

  // Attachment Naming
  attachmentIncludeNumber: boolean;
  attachmentIncludeMainType: boolean;
  attachmentIncludeOriginalName: boolean;
  attachmentNameMaxLength: number;

  // Cleanup
  cleanupDelayMinutes: number;
  maxStaleMinutes: number;
  autoCleanupEnabled: boolean;
  notifyOnLongRunning: boolean;
  autoRemoveStaleRunning: boolean;
  progressCleanupIntervalMinutes: number;

  // Temp Cleanup
  tempCleanupEnabled: boolean;
  tempFilesMaxAgeMinutes: number;
  tempCleanupCronExpression: string;
  autoDeleteTempFiles: boolean;

  // Files Backup
  isDailyBackupJobEnabled: boolean;
  isMonthlyBackupJobEnabled: boolean;
  isAnnualBackupJobEnabled: boolean;
  isCleanupJobEnabled: boolean;
  dailyBackupCron: string | null;
  monthlyBackupCron: string | null;
  annualBackupCron: string | null;
  cleanupCron: string | null;
  dailyBackupEnabled: boolean;
  monthlyBackupEnabled: boolean;
  annualBackupEnabled: boolean;
  dailyRetentionDays: number;
  monthlyRetentionMonths: number;
  annualRetentionYears: number;
  backupFolder: string;
  filesPath: string;
  lastDailyBackup: string | null;
  lastMonthlyBackup: string | null;
  lastAnnualBackup: string | null;

  // Database Backup
  dbBackupEnabled: boolean;
  dbBackupFrequency: number;
  dbBackupScheduledHour: number;
  dbBackupScheduledMinute: number;
  dbBackupWeeklyDay: number | null;
  dbBackupMonthlyDay: number | null;
  dbBackupMaxRetention: number;
  dbBackupCompress: boolean;
}

// ============================================================
// ===== Commands (PUT) - مطابقة للـ DTOs مع الـ Validators =====
// ============================================================

export interface UpdateDistributionSettingsDto {
  ignoredAfterDays?: number;
  autoIgnoreEnabled?: boolean;
  backgroundServiceIntervalHours?: number;
  requireDeanApprovalForAll?: boolean;
  autoApprovePermanentReceivers?: boolean;
  requireDeanApprovalForHeadDistribution?: boolean;
}

export interface UpdateFileSettingsDto {
  maxAttachmentSizeMB?: number; // 1-100 MB
  allowedExtensions?: string[]; // يجب أن تبدأ بـ "."
  blockedMimeTypes?: string[];
}

export interface UpdateEmailIncomingSettingsDto {
  enableIncomingEmail?: boolean;
  incomingEmailServer?: string; // مطلوب عند التفعيل
  incomingEmailPort?: number; // 1-65535
  incomingEmailUsername?: string; // مطلوب عند التفعيل
  incomingEmailPassword?: string; // مطلوب عند التفعيل، حد أدنى 6 أحرف
  incomingEmailUseSsl?: boolean;
  incomingEmailCheckIntervalMinutes?: number; // 1-1440
  incomingEmailMaxPerBatch?: number; // 1-500
  incomingEmailAllowedDomains?: string; // @domain.com,@domain2.com
  incomingEmailFetchDays?: number; // 1-365
}

export interface UpdateEmailOutgoingSettingsDto {
  enableOutgoingEmail?: boolean;
  outgoingEmailServer?: string; // مطلوب عند التفعيل
  outgoingEmailPort?: number; // 1-65535
  outgoingEmailUsername?: string; // مطلوب عند التفعيل
  outgoingEmailPassword?: string; // مطلوب عند التفعيل، حد أدنى 6 أحرف
  outgoingEmailUseSsl?: boolean;
  outgoingEmailFrom?: string; // مطلوب عند التفعيل، يجب أن يكون إيميل صحيح
  outgoingEmailFromName?: string;
  outgoingEmailMaxRetryCount?: number; // 1-10
  outgoingEmailRetryIntervalMinutes?: number; // 5-1440
  outgoingEmailNotifyOnDelivery?: boolean;
}

export interface UpdateArchiveSettingsDto {
  archiveAfterDays?: number;
  autoArchiveEnabled?: boolean;
  archiveBatchSize?: number;
}

export interface UpdateAttachmentNamingDto {
  includeNumber: boolean;
  includeMainType: boolean;
  includeOriginalName: boolean;
  maxLength: number;
}

export interface UpdateCleanupSettingsDto {
  cleanupDelayMinutes?: number;
  maxStaleMinutes?: number;
  autoCleanupEnabled?: boolean;
  notifyOnLongRunning?: boolean;
  autoRemoveStaleRunning?: boolean;
  progressCleanupIntervalMinutes?: number;
}

export interface UpdateTempCleanupSettingsDto {
  tempCleanupEnabled?: boolean;
  tempFilesMaxAgeMinutes?: number;
  tempCleanupCronExpression?: string;
  autoDeleteTempFiles?: boolean;
}

export interface UpdateFilesBackupSettingsDto {
  isDailyBackupJobEnabled?: boolean;
  isMonthlyBackupJobEnabled?: boolean;
  isAnnualBackupJobEnabled?: boolean;
  isCleanupJobEnabled?: boolean;
  dailyBackupCron?: string;
  monthlyBackupCron?: string;
  annualBackupCron?: string;
  cleanupCron?: string;
  dailyBackupEnabled?: boolean;
  monthlyBackupEnabled?: boolean;
  annualBackupEnabled?: boolean;
  dailyRetentionDays?: number;
  monthlyRetentionMonths?: number;
  annualRetentionYears?: number;
  backupFolder?: string;
  filesPath?: string;
}

export interface UpdateDatabaseBackupSettingsDto {
  dbBackupEnabled?: boolean;
  dbBackupFrequency?: number;
  dbBackupScheduledHour?: number;
  dbBackupScheduledMinute?: number;
  dbBackupWeeklyDay?: number;
  dbBackupMonthlyDay?: number;
  dbBackupMaxRetention?: number;
  dbBackupCompress?: boolean;
}