// services/documentType.service.ts

import myAPI from "@/utils/myAPI";
import type {
  DocumentTypeResponse,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
  ApiResult,
} from "@/types/api/documentType";

export const documentTypeService = {
  /**
   * Get all document types
   * GET /api/DocumentType
   */
  async getAll(): Promise<DocumentTypeResponse[]> {
    const response = await myAPI.get<ApiResult<DocumentTypeResponse[]>>("/DocumentType");
    return response.data.data;
  },

  /**
   * Get active only document types (for dropdown lists)
   * GET /api/DocumentType/active
   */
  async getActiveOnly(): Promise<DocumentTypeResponse[]> {
    const response = await myAPI.get<ApiResult<DocumentTypeResponse[]>>("/DocumentType/active");
    return response.data.data;
  },

  /**
   * Get single document type by ID
   * GET /api/DocumentType/{id}
   */
  async getById(id: number): Promise<DocumentTypeResponse> {
    const response = await myAPI.get<ApiResult<DocumentTypeResponse>>(`/DocumentType/${id}`);
    return response.data.data;
  },

  /**
   * Create new document type (Dean only)
   * POST /api/DocumentType
   */
  async create(data: CreateDocumentTypeRequest): Promise<DocumentTypeResponse> {
    const response = await myAPI.post<ApiResult<DocumentTypeResponse>>("/DocumentType", data);
    return response.data.data;
  },

  /**
   * Update existing document type (Dean only)
   * PUT /api/DocumentType/{id}
   */
  async update(id: number, data: UpdateDocumentTypeRequest): Promise<DocumentTypeResponse> {
    const response = await myAPI.put<ApiResult<DocumentTypeResponse>>(`/DocumentType/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete document type (Dean only)
   * DELETE /api/DocumentType/{id}
   */
  async delete(id: number): Promise<void> {
    await myAPI.delete(`/DocumentType/${id}`);
  },

  /**
   * Activate document type (Dean only)
   * POST /api/DocumentType/{id}/activate
   */
  async activate(id: number): Promise<void> {
    await myAPI.post(`/DocumentType/${id}/activate`);
  },

  /**
   * Deactivate document type (Dean only)
   * POST /api/DocumentType/{id}/deactivate
   */
  async deactivate(id: number): Promise<void> {
    await myAPI.post(`/DocumentType/${id}/deactivate`);
  },
};