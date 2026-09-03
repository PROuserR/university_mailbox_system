// services/document-type.service.ts

import { apiWrapper } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import { DocumentType } from "@/types/api/DocumentTypesResponse";

export const documentTypeService = {
  
  async getAll(): Promise<DocumentType[]> {
    const response = await apiWrapper.get<ApiResult<DocumentType[]>>(
      "/DocumentTypes"
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تحميل أنواع الوثائق");
    }

    return response.data.data || [];
  },

  
  async create(name: string): Promise<DocumentType> {
    const response = await apiWrapper.post<ApiResult<DocumentType>>(
      "/DocumentTypes",
      { name }
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل إنشاء نوع الوثيقة");
    }

    return response.data.data;
  },

 
  async update(id: number, name: string): Promise<DocumentType> {
    const response = await apiWrapper.put<ApiResult<DocumentType>>(
      `/DocumentTypes/${id}`,
      { name }
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تحديث نوع الوثيقة");
    }

    return response.data.data;
  },

 
  async delete(id: number): Promise<void> {
    const response = await apiWrapper.delete<ApiResult<void>>(
      `/DocumentTypes/${id}`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل حذف نوع الوثيقة");
    }
  },

  
  async activate(id: number): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      `/DocumentTypes/${id}/activate`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تفعيل نوع الوثيقة");
    }
  },

  async deactivate(id: number): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      `/DocumentTypes/${id}/deactivate`
    );

    if (!response.success || !response.data?.isSuccess) {
      throw new Error(response.data?.message || response.message || "فشل تعطيل نوع الوثيقة");
    }
  },
};