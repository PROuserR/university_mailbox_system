// src/types/api/correspondence.types.ts

import { Attachment } from "@/types/api/Attachment";

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
// CorrespondenceStatus من Backend
// =========================

export enum CorrespondenceStatus {
    Draft = 0,
    PendingApproval = 1,
    Distributed = 2,
    Signed = 3,
    Archived = 4
}

export const getStatusLabel = (status: CorrespondenceStatus | string): string => {
    if (typeof status === 'string') {
        switch (status) {
            case 'Draft': return 'مسودة';
            case 'PendingApproval': return 'بانتظار الموافقة';
            case 'Distributed': return 'موزعة';
            case 'Signed': return 'موقعة';
            case 'Archived': return 'مؤرشفة';
            default: return status;
        }
    }
    switch (status) {
        case CorrespondenceStatus.Draft: return 'مسودة';
        case CorrespondenceStatus.PendingApproval: return 'بانتظار الموافقة';
        case CorrespondenceStatus.Distributed: return 'موزعة';
        case CorrespondenceStatus.Signed: return 'موقعة';
        case CorrespondenceStatus.Archived: return 'مؤرشفة';
        default: return 'غير معروف';
    }
};

export const getStatusColor = (status: CorrespondenceStatus | string): string => {
    if (typeof status === 'string') {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-700';
            case 'PendingApproval': return 'bg-yellow-100 text-yellow-700';
            case 'Distributed': return 'bg-blue-100 text-blue-700';
            case 'Signed': return 'bg-green-100 text-green-700';
            case 'Archived': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }
    switch (status) {
        case CorrespondenceStatus.Draft: return 'bg-gray-100 text-gray-700';
        case CorrespondenceStatus.PendingApproval: return 'bg-yellow-100 text-yellow-700';
        case CorrespondenceStatus.Distributed: return 'bg-blue-100 text-blue-700';
        case CorrespondenceStatus.Signed: return 'bg-green-100 text-green-700';
        case CorrespondenceStatus.Archived: return 'bg-purple-100 text-purple-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

// =========================
// DTOs من Backend
// =========================

export type CorrespondenceResponse = {
    id: number;
    number: number;
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
    archivedAt: string | null;
    approvedAt: string | null;
    totalReceivers: number;
    readCount: number;
    status: string;
    parentCorrespondenceId: number | null;
    isReply: boolean;
    repliesCount: number;
};


export type UpdateCorrespondencePayload = {
    number?: number;
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
    parentCorrespondenceId?: number;
    deletedAttachmentIds?: number[];
    revokeDistributionsAndRevertToDraft?: boolean;
};

// src/types/api/correspondence.types.ts

export type CreateCorrespondencePayload = {
    number: number;
    mainType: CorrespondenceMainType;
    isProfessional?: boolean;
    documentTypeId?: number | null;
    parentCorrespondenceId?: number | null; 
    senderEntityId?: number | null;
    title: string;
    content?: string | null;
    senderReference?: string | null;
    issuedDate: string;
    receivedDate?: string | null;
    sentDate?: string | null;
    notes?: string | null;
    primaryFile?: File | null;
    additionalFiles?: File[] | null;
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
    number?: number;
    mainType?: CorrespondenceMainType;
    isProfessional?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrderDESC?: boolean;
    documentTypeId?: number;
    senderEntityId?: number;
    status?: CorrespondenceStatus;
    createdAtFrom?: string;
    createdAtTo?: string;
    issuedDateFrom?: string;
    issuedDateTo?: string;
    receivedDateFrom?: string;
    receivedDateTo?: string;
    sentDateFrom?: string;
    sentDateTo?: string;
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

// =========================
// Sign Result
// =========================

export interface SignCorrespondenceResultDto {
    correspondenceId: number;
    newStatus: CorrespondenceStatus;
    ignoredCount: number;
    rejectedCount: number;
    message: string;
}


export type CorrespondenceWithRepliesResponse = {
    id: number;
    number: number;
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
    archivedAt: string | null;
    approvedAt: string | null;
    totalReceivers: number;
    readCount: number;
    status: string;

    // ===== Reply/Chain Properties =====
    parentCorrespondenceId: number | null;
    isReply: boolean;
    repliesCount: number;

    // ===== Nested Replies (Full Chain) =====
    replies: CorrespondenceWithRepliesResponse[] | null;
};


export interface CorrespondenceParentSelectorDto {
    id: number;
    number: number;
    title: string;
    mainType: number; // CorrespondenceMainType
}

export interface CorrespondenceParentSelectorSearchDto {
    search?: string;
    page?: number;
    pageSize?: number;
}
