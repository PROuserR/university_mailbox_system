// types/documentType.ts

/**
 * Document Type Response DTO
 */
export interface DocumentTypeResponse {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Create Document Type Request DTO
 */
export interface CreateDocumentTypeRequest {
  name: string;
}

/**
 * Update Document Type Request DTO
 */
export interface UpdateDocumentTypeRequest {
  name?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResult<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}