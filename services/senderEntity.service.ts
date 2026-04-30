// src/services/senderEntity.service.ts

import myAPI from "@/utils/myAPI";
import type {ApiResult} from "@/types/ApiResult";
import type {
  SenderEntityResponse,
  CreateSenderEntityRequest,
  UpdateSenderEntityRequest,
} from "@/types/senderEntity";

/**
 * Service for managing sender entities (الجهات المرسلة)
 * All endpoints require authentication (JWT stored in cookies)
 */
export const senderEntityService = {
  /**
   * Get all sender entities (including inactive)
   * GET /api/SenderEntity
   */
  async getAll(): Promise<SenderEntityResponse[]> {
    const response = await myAPI.get<ApiResult<SenderEntityResponse[]>>("/SenderEntity");
    return response.data.data;
  },

  /**
   * Get active only sender entities (for dropdown lists)
   * GET /api/SenderEntity/active
   */
  async getActiveOnly(): Promise<SenderEntityResponse[]> {
    const response = await myAPI.get<ApiResult<SenderEntityResponse[]>>("/SenderEntity/active");
    return response.data.data;
  },

  /**
   * Get single sender entity by ID
   * GET /api/SenderEntity/{id}
   */
  async getById(id: number): Promise<SenderEntityResponse> {
    const response = await myAPI.get<ApiResult<SenderEntityResponse>>(`/SenderEntity/${id}`);
    return response.data.data;
  },

  /**
   * Create new sender entity (Dean only)
   * POST /api/SenderEntity
   */
  async create(data: CreateSenderEntityRequest): Promise<SenderEntityResponse> {
    const response = await myAPI.post<ApiResult<SenderEntityResponse>>("/SenderEntity", data);
    return response.data.data;
  },

  /**
   * Update existing sender entity (Dean only)
   * PUT /api/SenderEntity/{id}
   */
  async update(id: number, data: UpdateSenderEntityRequest): Promise<SenderEntityResponse> {
    const response = await myAPI.put<ApiResult<SenderEntityResponse>>(`/SenderEntity/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete sender entity (Dean only)
   * DELETE /api/SenderEntity/{id}
   */
  async delete(id: number): Promise<void> {
    await myAPI.delete(`/SenderEntity/${id}`);
  },

  /**
   * Activate sender entity (Dean only)
   * POST /api/SenderEntity/{id}/activate
   */
  async activate(id: number): Promise<void> {
    await myAPI.post(`/SenderEntity/${id}/activate`);
  },

  /**
   * Deactivate sender entity (Dean only)
   * POST /api/SenderEntity/{id}/deactivate
   */
  async deactivate(id: number): Promise<void> {
    await myAPI.post(`/SenderEntity/${id}/deactivate`);
  },
};