// src/services/correspondence.service.ts

import { apiWrapper, ApiResult } from "@/utils/apiClient";
import {
  CorrespondenceResponse,
  UpdateCorrespondencePayload,
  CorrespondenceMainType,
} from "@/types/api/correspondence.types";
import {
  DocumentType,
  DocumentTypeResponse,
} from "@/types/api/DocumentTypesResponse";
import { SenderEntity, SenderEntityResponse } from "@/types/api/SenderEntity";
import type { CorrespondenceSearchDto } from "@/types/api/correspondence.types";
import type { PagedResponse } from "@/types/api/PagedResponse";

const BASE_URL = "Correspondences";



export const getCorrespondencesPaged = async (
  searchDto: CorrespondenceSearchDto
): Promise<PagedResponse<CorrespondenceResponse>> => {
  const res = await apiWrapper.get<ApiResult<PagedResponse<CorrespondenceResponse>>>(
    `${BASE_URL}/paged`,
    searchDto
  );

  if (!res.success) {
    throw new Error(res.error || "فشل تحميل المراسلات");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام بيانات من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل تحميل المراسلات");
  }

  return res.data.data;
};


export const getCorrespondenceById = async (
  id: number
): Promise<CorrespondenceResponse> => {
  const res = await apiWrapper.get<ApiResult<CorrespondenceResponse>>(
    `${BASE_URL}/${id}`
  );

  if (!res.success) {
    throw new Error(res.error || "فشل تحميل المراسلة");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام بيانات من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل تحميل المراسلة");
  }

  return res.data.data;
};


export const updateCorrespondence = async (
  id: number,
  data: UpdateCorrespondencePayload,
  files?: File[],
  primaryFile?: File
): Promise<CorrespondenceResponse> => {
  const formData = new FormData();

  // إضافة البيانات النصية
  if (data.number) formData.append("Number", data.number);
  if (data.mainType !== undefined)
    formData.append("MainType", String(data.mainType));
  if (data.isProfessional !== undefined)
    formData.append("IsProfessional", String(data.isProfessional));
  if (data.documentTypeId)
    formData.append("DocumentTypeId", String(data.documentTypeId));
  if (data.senderEntityId)
    formData.append("SenderEntityId", String(data.senderEntityId));
  if (data.title) formData.append("Title", data.title);
  if (data.content) formData.append("Content", data.content);
  if (data.senderReference)
    formData.append("SenderReference", data.senderReference);
  if (data.issuedDate) formData.append("IssuedDate", data.issuedDate);
  if (data.receivedDate) formData.append("ReceivedDate", data.receivedDate);
  if (data.sentDate) formData.append("SentDate", data.sentDate);
  if (data.notes) formData.append("Notes", data.notes);

  // إضافة الملفات
  if (primaryFile) {
    formData.append("PrimaryFile", primaryFile);
  }

  if (files) {
    files.forEach((file) => {
      formData.append("AdditionalFiles", file);
    });
  }

  // إضافة IDs الملفات المراد حذفها
  if (data.deletedAttachmentIds && data.deletedAttachmentIds.length > 0) {
    data.deletedAttachmentIds.forEach((id) => {
      formData.append("AttachmentIdsToDelete", String(id));
    });
  }

  const res = await apiWrapper.patch<ApiResult<CorrespondenceResponse>>(
    `${BASE_URL}/${id}`,
    formData
  );

  if (!res.success) {
    throw new Error(res.error || "فشل تحديث المراسلة");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام بيانات من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل تحديث المراسلة");
  }

  return res.data.data;
};


export const downloadAttachment = async (
  attachmentId: number,
  signal?: AbortSignal
): Promise<Blob> => {
  const config = {
    responseType: "blob" as const,
    signal,
  };

  const res = await apiWrapper.get<Blob>(
    `/Attachments/${attachmentId}/download`,
    undefined,
    config
  );

  if (!res.success) {
    throw new Error(res.error || "فشل تحميل المرفق");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام الملف من الخادم");
  }

  return res.data;
};


export const deleteCorrespondence = async (id: number): Promise<void> => {
  const res = await apiWrapper.delete<ApiResult<void>>(
    `${BASE_URL}/${id}`
  );

  if (!res.success) {
    throw new Error(res.error || "فشل حذف المراسلة");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام رد من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل حذف المراسلة");
  }
};


export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  const res = await apiWrapper.get<DocumentTypeResponse>(
    "/DocumentTypes/active"
  );

  if (!res.success || !res.data) {
    return [];
  }

  return res.data.data;
};


export const getSenderEntities = async (): Promise<SenderEntity[]> => {
  const res = await apiWrapper.get<SenderEntityResponse>(
    "/SenderEntities/active"
  );

  if (!res.success || !res.data) {
    return [];
  }

  return res.data.data;
};