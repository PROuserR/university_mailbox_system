// types/api/backup-progress.types.ts

// ============================================================
// ===== Response DTOs =====
// ============================================================

export interface BackupProgressResponseDto {
  operationId: string;
  operationType: string; // Backup, Restore
  backupType: string; // Daily, Monthly, Annual
  backupId: string;
  percentage: number;
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  currentStage: string; // Collecting, Downloading, Zipping, Uploading, Restoring
  status: string; // Running, Completed, Failed, Cancelled
  startedAt: string;
  lastUpdated?: string;
  estimatedCompletion?: string;
  errorMessage?: string;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  isRunning: boolean;
}

export interface ProgressStatisticsDto {
  totalOperations: number;
  runningOperations: number;
  completedOperations: number;
  failedOperations: number;
  cancelledOperations: number;
  staleOperations: number;
}

// ============================================================
// ===== Request DTOs =====
// ============================================================

export interface GetOperationsQuery {
  status?: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
}