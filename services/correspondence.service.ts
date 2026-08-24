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
import axios from "axios";

const BASE_URL = "Correspondences";

// ============================================================
// ===== Base URL =====
// ============================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api";

// ============================================================
// ===== Get Correspondences =====
// ============================================================

export const getCorrespondencesPaged = async (
  searchDto: CorrespondenceSearchDto
): Promise<PagedResponse<CorrespondenceResponse>> => {
  const res = await apiWrapper.get<ApiResult<PagedResponse<CorrespondenceResponse>>>(
    `${BASE_URL}/paged`,
    searchDto
  );

  if (!res.success) {
    throw new Error(res.message || "فشل تحميل المراسلات");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام بيانات من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل تحميل المراسلات");
  }

  return res.data.data;
};

// ============================================================
// ===== Get Correspondence By ID =====
// ============================================================

export const getCorrespondenceById = async (
  id: number
): Promise<CorrespondenceResponse> => {
  const res = await apiWrapper.get<ApiResult<CorrespondenceResponse>>(
    `${BASE_URL}/${id}`
  );

  if (!res.success) {
    throw new Error(res.message || "فشل تحميل المراسلة");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام بيانات من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل تحميل المراسلة");
  }

  return res.data.data;
};

// ============================================================
// ===== Update Correspondence =====
// ============================================================

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
    throw new Error(res.message || "فشل تحديث المراسلة");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام بيانات من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل تحديث المراسلة");
  }

  return res.data.data;
};

// ============================================================
// ===== Delete Correspondence =====
// ============================================================

export const deleteCorrespondence = async (id: number): Promise<void> => {
  const res = await apiWrapper.delete<ApiResult<void>>(
    `${BASE_URL}/${id}`
  );

  if (!res.success) {
    throw new Error(res.message || "فشل حذف المراسلة");
  }

  if (!res.data) {
    throw new Error("لم يتم استلام رد من الخادم");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "فشل حذف المراسلة");
  }
};

// ============================================================
// ===== Get Document Types =====
// ============================================================

export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  const res = await apiWrapper.get<DocumentTypeResponse>(
    "/DocumentTypes/active"
  );

  if (!res.success || !res.data) {
    return [];
  }

  return res.data.data;
};

// ============================================================
// ===== Get Sender Entities =====
// ============================================================

export const getSenderEntities = async (): Promise<SenderEntity[]> => {
  const res = await apiWrapper.get<SenderEntityResponse>(
    "/SenderEntities/active"
  );

  if (!res.success || !res.data) {
    return [];
  }

  return res.data.data;
};

// ============================================================
// ===== Download Attachment =====
// ============================================================

export const downloadAttachment = async (
  attachmentId: number,
  fileName: string,
  signal?: AbortSignal
): Promise<Blob> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/Attachments/${attachmentId}/download`,
      {
        responseType: 'blob',
        withCredentials: true,
        signal,
        headers: {
          'Accept': '*/*',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = response.data;

    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error('الملف غير صالح أو فارغ');
    }

    return blob;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error('DownloadAttachment error:', error);
    throw error;
  }
};

// ============================================================
// ===== View Attachment =====
// ============================================================

/**
 * عرض المرفق (معاينة)
 * @param attachmentId - معرف المرفق
 * @param signal - AbortSignal لإلغاء الطلب (اختياري)
 */
export const viewAttachment = async (
  attachmentId: number,
  signal?: AbortSignal
): Promise<Blob> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/Attachments/${attachmentId}/view?t=${Date.now()}`,
      {
        responseType: 'blob',
        withCredentials: true,
        signal,
        headers: {
          'Accept': '*/*',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = response.data;

    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error('الملف غير صالح أو فارغ');
    }

    return blob;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error('ViewAttachment error:', error);
    throw error;
  }
};

// ============================================================
// ===== Download Attachment (Direct - مع إنشاء الرابط) =====
// ============================================================

/**
 * تحميل المرفق مباشرة مع إنشاء رابط التحميل
 * @param attachmentId - معرف المرفق
 * @param fileName - اسم الملف
 * @param signal - AbortSignal لإلغاء الطلب (اختياري)
 */
export const downloadAttachmentDirect = async (
  attachmentId: number,
  fileName: string,
  signal?: AbortSignal
): Promise<void> => {
  try {
    const blob = await downloadAttachment(attachmentId, fileName, signal);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `attachment_${attachmentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error('DownloadDirect error:', error);
    throw error;
  }
};

// ============================================================
// ===== View Attachment (Direct - مع عرض في المتصفح) =====
// ============================================================

/**
 * عرض المرفق مباشرة في المتصفح (فتح في نافذة جديدة)
 * @param attachmentId - معرف المرفق
 */
export const viewAttachmentDirect = (attachmentId: number): void => {
  const url = `${API_BASE_URL}/Attachments/${attachmentId}/view?t=${Date.now()}`;
  window.open(url, '_blank');
};