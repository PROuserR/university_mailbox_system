// types/api/incoming-email.ts

export enum IncomingEmailStatus {
    Pending = 0,
    Rejected = 1,
    Converted = 2,
    Skipped = 3,
}

export interface IncomingEmailAttachmentDto {
    id: number;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileIdentifier: string;
    contentId?: string; 
    isInline: boolean;
}

export interface IncomingEmailDto {
    id: number;
    messageId: string;
    from: string;
    fromName?: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body?: string;
    bodyHtml?: string;
    receivedAt: string;
    status: IncomingEmailStatus;
    correspondenceId?: number;
    correspondenceNumber?: string;
    correspondenceTitle?: string;
    processedBy?: number;
    processedByName?: string;
    processedAt?: string;
    rejectionReason?: string;
    hasAttachments: boolean;
    attachmentCount?: number;
    attachments: IncomingEmailAttachmentDto[];
    createdAt: string;
}

export interface IncomingEmailFilter {
    page?: number;
    pageSize?: number;
    search?: string;
    from?: string;
    subject?: string;
    dateFrom?: Date;
    dateTo?: Date;
    hasAttachments?: boolean;
    status?: IncomingEmailStatus;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface ApproveIncomingEmailDto {
    number: number;
    notes?: string;
    documentTypeId: number;
    senderEntityId: number;
    senderReference?: string;
    issuedDate?: Date;
    receivedDate?: Date;
    isProfessional: boolean;
}

export interface ProcessIncomingEmailResultDto {
    id: number;
    isSuccess: boolean;
    message: string;
    correspondenceId?: number;
    correspondenceNumber?: string;
    newStatus: IncomingEmailStatus;
}