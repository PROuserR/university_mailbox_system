// types/api/outgoing-email.ts

export enum EmailStatus {
    Pending = 0,
    Sent = 1,
    Failed = 2,
    RetryPending = 3,
}

export interface OutgoingEmailAttachmentDto {
    id: number;
    fileName: string;
    fileSize: number;
    contentType: string;
    fileIdentifier: string;
}

export interface OutgoingEmailHistoryDto {
    id: number;
    correspondenceId: number;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body?: string;
    sentAt: string;
    status: EmailStatus;
    errorMessage?: string;
    messageId?: string;
    retryCount: number;
    sentBy?: string;
    attachments: OutgoingEmailAttachmentDto[];
}

export interface OutgoingEmailFilterDto {
    search?: string;
    to?: string;
    subject?: string;
    status?: EmailStatus;
    dateFrom?: string;
    dateTo?: string;
    hasAttachments?: boolean;
    sentBy?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface SendOutgoingEmailDto {
    correspondenceId: number;
    toEmail: string;
    ccEmail?: string;
    bccEmail?: string;
    subject?: string;
    customBody?: string;
    attachmentIds?: number[];
    includeAllAttachments?: boolean;
}

export interface ResendOutgoingEmailDto {
    emailHistoryId: number;
    newToEmail?: string;
}

export interface UpdateFailedEmailDto {
    emailHistoryId: number;
    newToEmail?: string;
    newCcEmail?: string;
    newBccEmail?: string;
    newSubject?: string;
    newCustomBody?: string;
    attachmentIds?: number[];
    includeAllAttachments?: boolean;
}

export interface OutgoingEmailResultDto {
    emailHistoryId: number;
    correspondenceId: number;
    to: string;
    subject: string;
    sentAt: string;
    isSuccess: boolean;
    errorMessage?: string;
    messageId?: string;
    status: EmailStatus;
    retryCount: number;
}

export interface EmailBatchResultDto {
    totalEmails: number;
    successCount: number;
    failedCount: number;
    results: OutgoingEmailResultDto[];
}

export interface OutgoingEmailStatisticsDto {
    statusCounts: Record<EmailStatus, number>;
    totalSent: number;
    totalFailed: number;
    totalPendingRetry: number;
    lastSentAt?: string;
    lastFailedAt?: string;
    dailyCounts: Record<string, number>;
}