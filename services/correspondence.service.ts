// src/services/correspondence.service.ts

import { apiWrapper } from "@/utils/apiClient";
import {
  CorrespondenceResponse,
  UpdateCorrespondencePayload,
  ApiResult,
} from "@/types/api/correspondence.types";
import {
  DocumentType,
  DocumentTypeResponse,
} from "@/types/api/DocumentTypesResponse";
import { SenderEntity, SenderEntityResponse } from "@/types/api/SenderEntity";

const BASE_URL = "Correspondences";

// =========================
// جلب مراسلة بواسطة ID
// =========================

export const getCorrespondenceById = async (
  id: number
): Promise<CorrespondenceResponse> => {
  const res = await apiWrapper.get<ApiResult<CorrespondenceResponse>>(
    `${BASE_URL}/${id}`
  );

  if (!res.success || !res.data) {
    throw new Error(res.error || "Failed to load correspondence");
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "Failed to load correspondence");
  }

  return res.data.data;
};

// =========================
// تحديث مراسلة
// =========================

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

  if (!res.success || !res.data) {
    throw new Error(
      res.error || res.data?.message || "Failed to update correspondence"
    );
  }

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "Failed to update correspondence");
  }

  return res.data.data;
};

// =========================
// جلب أنواع المستندات النشطة (باستخدام الملف الموجود)
// =========================

export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  const res = await apiWrapper.get<DocumentTypeResponse>(
    "/DocumentTypes/active"
  );

  if (!res.success || !res.data) {
    return [];
  }

  return res.data.data;
};

// =========================
// جلب الجهات المرسلة النشطة (باستخدام الملف الموجود)
// =========================

export const getSenderEntities = async (): Promise<SenderEntity[]> => {
  const res = await apiWrapper.get<SenderEntityResponse>(
    "/SenderEntities/active"
  );

  if (!res.success || !res.data) {
    return [];
  }

  return res.data.data;
};
