/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/SenderEntities.service.ts

import myAPI from "@/utils/myAPI";
import type { ApiResult } from "@/types/api/ApiResult";
import type {
  SenderEntity,
  CreateSenderEntityRequest,
  UpdateSenderEntityRequest,
} from "@/types/api/SenderEntity";

/**
 * Service for managing sender entities (الجهات المرسلة)
 * All endpoints require authentication (JWT stored in cookies)
 */
export const senderEntityService = {
  /**
   * Get all sender entities (including inactive)
   * GET /api/SenderEntities
   */
  async getAll(): Promise<SenderEntity[]> {
    const response = await myAPI.get<ApiResult<SenderEntity[]>>(
      "/SenderEntities"
    );
    return response.data.data;
  },

  /**
   * Get active only sender entities (for dropdown lists)
   * GET /api/SenderEntities/active
   */
  async getActiveOnly(): Promise<SenderEntity[]> {
    const response = await myAPI.get<ApiResult<SenderEntity[]>>(
      "/SenderEntities/active"
    );
    return response.data.data;
  },

  /**
   * Get single sender entity by ID
   * GET /api/SenderEntities/{id}
   */
  async getById(id: number): Promise<SenderEntity> {
    const response = await myAPI.get<ApiResult<SenderEntity>>(
      `/SenderEntities/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new sender entity (Dean only)
   * POST /api/SenderEntities
   */
  async create(data: CreateSenderEntityRequest): Promise<SenderEntity> {
    const response = await myAPI.post<ApiResult<SenderEntity>>(
      "/SenderEntities",
      data
    );
    return response.data.data;
  },

  /**
   * Update existing sender entity (Dean only)
   * PUT /api/SenderEntities/{id}
   */
  async update(
    id: number,
    data: UpdateSenderEntityRequest
  ): Promise<SenderEntity> {
    const response = await myAPI.put<ApiResult<SenderEntity>>(
      `/SenderEntities/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete sender entity (Dean only)
   * DELETE /api/SenderEntities/{id}
   */
  async delete(id: number): Promise<void> {
    await myAPI.delete(`/SenderEntities/${id}`);
  },

  /**
   * Activate sender entity (Dean only)
   * POST /api/SenderEntities/{id}/activate
   */
  async activate(id: number): Promise<void> {
    await myAPI.post(`/SenderEntities/${id}/activate`);
  },

  /**
   * Deactivate sender entity (Dean only)
   * POST /api/SenderEntities/{id}/deactivate
   */
  async deactivate(id: number): Promise<void> {
    await myAPI.post(`/SenderEntities/${id}/deactivate`);
  },

  /**
   * Search sender entities by name
   * GET /api/SenderEntities/search?name={name}
   */
  async search(searchTerm?: string): Promise<SenderEntity[]> {
    const params: Record<string, any> = {};
    if (searchTerm && searchTerm.trim() !== "") {
      params.search = searchTerm.trim();
    }
    const response = await myAPI.get<ApiResult<SenderEntity[]>>(
      "/SenderEntities",
      { params }
    );
    return response.data.data;
  },
};
