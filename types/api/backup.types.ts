/* eslint-disable @typescript-eslint/no-explicit-any */
// types/api/backup.types.ts

// ============================================================
// ===== Enums =====
// ============================================================

export enum BackupType {
  Daily = 1,
  Monthly = 2,
  Annual = 3,
}

// ============================================================
// ===== Request DTOs =====
// ============================================================

export interface RestoreOptions {
  overwriteExisting?: boolean;
  dryRun?: boolean;
  validateIntegrity?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
  specificFiles?: string[];
}

export interface RestoreToPathOptions {
  targetPath: string;
  overwriteExisting?: boolean;
  dryRun?: boolean;
}

export interface RetryFailedRequest {
  type: BackupType;
  backupId: string;
  failedFiles: string[];
}

export interface CompareBackupsRequest {
  backupId1: string;
  backupId2: string;
}

export interface CleanupPolicy {
  deleteDailyAfterDays?: boolean;
  dailyRetentionDays?: number;
  deleteMonthlyAfterMonths?: boolean;
  monthlyRetentionMonths?: number;
  deleteAnnualAfterYears?: boolean;
  annualRetentionYears?: number;
  keepPermanentBackups?: boolean;
}

// ============================================================
// ===== Response DTOs =====
// ============================================================

export interface BackupResultDto {
  success: boolean;
  backupId?: string;
  filePath?: string;
  fileName?: string;
  type?: string;
  message?: string;
  error?: string;
  sizeBytes: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface BackupInfoDto {
  id: string;
  fileName: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  modifiedAt?: string;
  type: string;
  isCompressed: boolean;
  checksum?: string;
  metadata?: Record<string, any>;
}

export interface BackupPreviewDto {
  backupId: string;
  backupType: string;
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  createdAt: string;
  files: BackupFileInfo[];
  fileTypeCount: Record<string, number>;
}

export interface BackupFileInfo {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  extension: string;
  modifiedAt?: string;
}

export interface BackupStatisticsDto {
  totalBackups: number;
  totalSizeBytes: number;
  lastBackupDate?: string;
  oldestBackupDate?: string;
  backupTypeCounts: Record<string, number>;
  backupTypeSizes: Record<string, number>;
}

export interface BackupComparisonDto {
  backup1Id: string;
  backup2Id: string;
  backup1Date: string;
  backup2Date: string;
  totalFilesInBackup1: number;
  totalFilesInBackup2: number;
  totalSizeInBackup1: number;
  totalSizeInBackup2: number;
  sizeDifference: number;
  sizeDifferenceFormatted: string;
  fileCountDifference: number;
  newFiles: FileDifference[];
  modifiedFiles: FileDifference[];
  deletedFiles: FileDifference[];
  sameFiles: FileDifference[];
}

export interface FileDifference {
  path: string;
  oldSize?: number;
  newSize?: number;
  size?: number;
  oldModified?: string;
  newModified?: string;
  modified?: string;
}

export interface RestoreResultDto {
  success: boolean;
  backupId: string;
  backupType: string;
  totalFiles: number;
  restoredFiles: number;
  skippedFiles: number;
  failedFiles: number;
  totalSizeBytes: number; 
  restoredAt: string;
  restoredFilesList: string[];
  skippedFilesList: string[];
  failedFilesList: string[];
  message: string;
}

export interface BackupScheduleInfoDto {
  frequency: number;
  scheduleDescription: string;
  nextRunTime?: string;
  lastRunTime?: string;
  isEnabled: boolean;
}

export interface BackupSettingsDto {
  dbBackupEnabled: boolean;
  dbBackupFrequency: number;
  dbBackupScheduledHour: number;
  dbBackupScheduledMinute: number;
  dbBackupWeeklyDay?: number;
  dbBackupMonthlyDay?: number;
  dbBackupMaxRetention: number;
  dbBackupCompress: boolean;
}
