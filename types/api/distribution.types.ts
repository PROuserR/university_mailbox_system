// src/types/distribution.types.ts

// =========================
// أنواع المستخدمين
// =========================

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: string;
    isSelected?: boolean;
    isPermanentReceiver: boolean;
};

export type DistributionEditorData = {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    users: User[];
};

// =========================
// DTOs من Backend
// =========================

export type AttachmentDto = {
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string | null;
    isPrimary: boolean;
    uploadedAt: string;
    uploadedBy: string;
    downloadUrl: string | null;
};

export type DistributionReceiverDto = {
    id: number;
    receiverId: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string | null;
    role: string | null;
    distributedBy: number;
    distributorName: string;
    distributorEmail: string;
    status: string;
    readAt: string | null;
    isRead: boolean;
    isAutoDistributed: boolean;
    notes: string | null;
};

export type DistributeResponseDto = {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    correspondenceContent: string;
    mainType: string;
    isProfessional: boolean;
    documentType: string | null;
    senderEntity: string | null;
    senderReference: string | null;
    issuedDate: string | null;
    receivedDate: string | null;
    sentDate: string | null;
    totalReceivers: number;
    distributedAt: string | null;
    attachments: AttachmentDto[];
    receivers: DistributionReceiverDto[];
};

// =========================
// ApiResult<T> من Backend
// =========================

export type ApiResult<T> = {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
};

// =========================
// Payload للـ API
// =========================

export type CreateDistributionPayload = {
    correspondenceId: number;
    receiverIds: number[];
    notes?: string;
};