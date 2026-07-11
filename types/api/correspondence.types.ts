// src/types/correspondence.types.ts

import { Attachment } from "@/types/api/attachment.types";

// =========================
// CorrespondenceMainType من Backend
// =========================

export enum CorrespondenceMainType {
    Incoming = 1,
    Outgoing = 2,
    Internal = 3
}

export type CorrespondenceMainTypeString = 'Incoming' | 'Outgoing' | 'Internal';

export const getMainTypeString = (type: CorrespondenceMainType): CorrespondenceMainTypeString => {
    switch (type) {
        case CorrespondenceMainType.Incoming:
            return 'Incoming';
        case CorrespondenceMainType.Outgoing:
            return 'Outgoing';
        case CorrespondenceMainType.Internal:
            return 'Internal';
        default:
            return 'Incoming';
    }
};
// =========================
// DTOs من Backend
// =========================

export type CorrespondenceResponse = {
    id: number;
    number: string;
    mainType: CorrespondenceMainType;
    isProfessional: boolean;
    documentTypeId: number | null;
    documentType: string | null;
    senderEntityId: number | null;
    senderEntity: string | null;
    senderReference: string | null;
    title: string;
    content: string | null;
    issuedDate: string | null;
    receivedDate: string | null;
    sentDate: string | null;
    notes: string | null;
    attachments: Attachment[];
    createdBy: string;
    createdAt: string;
    updatedAt: string | null;
    totalReceivers?: number;
    readCount?: number;
    status?: string;
};

export type UpdateCorrespondencePayload = {
    number?: string;
    mainType?: CorrespondenceMainType;
    isProfessional?: boolean;
    documentTypeId?: number;
    senderEntityId?: number;
    title?: string;
    content?: string;
    senderReference?: string;
    issuedDate?: string;
    receivedDate?: string;
    sentDate?: string;
    notes?: string;
    deletedAttachmentIds?: number[];
};

// =========================
// ApiResult<T>
// =========================

export type ApiResult<T> = {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
};

export interface CorrespondenceSearchDto {
  number?: string;
  mainType?: CorrespondenceMainType;
  isProfessional?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrderDESC?: boolean;
  documentTypeId?: number;
  senderEntityId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CorrespondenceSearchParams {
  mainType?: CorrespondenceMainType;
  isProfessional?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrderDESC?: boolean;
}