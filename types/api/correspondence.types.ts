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
