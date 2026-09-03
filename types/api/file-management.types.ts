// types/api/file-management.types.ts

// ============================================================
// ===== Failed File Deletions =====
// ============================================================

export interface FailedFileDeletionDto {
  id: number;
  fileIdentifier: string;
  operation: string;
  failedAt: string;
  isResolved: boolean;
  retryCount: number;
  errorMessage: string | null;
}

// ============================================================
// ===== Temp Files =====
// ============================================================

export interface TempFileInfoDto {
  filePath: string;
  fileName: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  lastModified: string;
  ageMinutes: number;
  operationId: string | null;
}

export interface TempFilesResultDto {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  files: TempFileInfoDto[];
}

export interface TempCleanupResultDto {
  deletedFiles: number;
  deletedSizeBytes: number;
  deletedSizeFormatted: string;
  failedFiles: string[];
  message: string;
}

export interface GetTempFilesQuery {
  olderThanMinutes?: number;
}

export interface DeleteTempFilesQuery {
  olderThanMinutes?: number;
  forceDelete?: boolean;
}