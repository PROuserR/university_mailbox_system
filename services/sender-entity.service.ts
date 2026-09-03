// services/sender-entity.service.ts

import { apiWrapper } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import { SenderEntity } from "@/types/api/SenderEntity";

export const senderEntityService = {
 
  async getAll(): Promise<SenderEntity[]> {
    const response = await apiWrapper.get<ApiResult<SenderEntity[]>>(
      "/SenderEntities"
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تحميل الجهات المرسلة");
    }

    return response.data.data || [];
  },

  async create(name: string): Promise<SenderEntity> {
    const response = await apiWrapper.post<ApiResult<SenderEntity>>(
      "/SenderEntities",
      { name }
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل إنشاء الجهة");
    }

    return response.data.data;
  },

  async update(id: number, name: string): Promise<SenderEntity> {
    const response = await apiWrapper.put<ApiResult<SenderEntity>>(
      `/SenderEntities/${id}`,
      { name }
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تحديث الجهة");
    }

    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    const response = await apiWrapper.delete<ApiResult<void>>(
      `/SenderEntities/${id}`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل حذف الجهة");
    }
  },

  async activate(id: number): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      `/SenderEntities/${id}/activate`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تفعيل الجهة");
    }
  },

  async deactivate(id: number): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      `/SenderEntities/${id}/deactivate`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تعطيل الجهة");
    }
  },
};