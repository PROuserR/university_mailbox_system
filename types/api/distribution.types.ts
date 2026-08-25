import { CorrespondenceStatus } from "./correspondence.types";

export type CreateDistributionPayload = {
    correspondenceId: number;
    receiverIds: number[];
    notes?: string;
};


export enum DistributionStatus {
  Pending = 0,
  Read = 1,
  Ignored = 2,
  Revoked = 3,
  PendingApproval = 4,
  Approved = 5,
  Rejected = 6,
}

export interface DistributionInboxDto {
  id: number;
  distributedDate: string;
  status: string;
  readAt?: string;
  isRead: boolean;
  isAutoDistributed: boolean;
  notes?: string;
  distributedBy: string;
  distributorName: string;
  distributorEmail: string;
  distributorRole: string;
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  correspondenceContent: string;
  mainType: string;
  isProfessional: boolean;
  documentType?: string;
  senderEntity?: string;
  senderReference?: string;
  issuedDate?: string;
  receivedDate?: string;
  sentDate?: string;
  attachments: AttachmentDto[];
}

export interface DistributionOutboxDto {
  id: number;
  distributedDate: string;
  status: string;
  readAt?: string;
  isRead: boolean;
  isAutoDistributed: boolean;
  notes?: string;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  receiverRole?: string;
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  correspondenceContent?: string;
  mainType: string;
  isProfessional: boolean;
  documentType?: string;
  senderEntity?: string;
  senderReference?: string;
  issuedDate?: string;
  receivedDate?: string;
  sentDate?: string;
  attachments: AttachmentDto[];
}

export interface DistributionResponseByIdDto {
  id: number;
  distributedDate: string;
  status: string;
  readAt?: string;
  isRead: boolean;
  isAutoDistributed: boolean;
  notes?: string;
  distributedBy: string;
  distributorName: string;
  distributorEmail: string;
  receiverId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  role?: string;
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  correspondenceContent: string;
  mainType: string;
  isProfessional: boolean;
  documentType?: string;
  senderEntity?: string;
  senderReference?: string;
  issuedDate?: string;
  receivedDate?: string;
  sentDate?: string;

   approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  departmentId: number | null;
  isFromHead: boolean | null;

  attachments: AttachmentDto[];
}

export interface AttachmentDto {
  id: number;
  fileName: string;
  fileIdentifier: string;
  fileSize: number;
  mimeType: string | null;
  isPrimary: boolean;
  uploadedAt: string;
  uploadedBy: string;
  attachmentType: string;
  updatedAt: string | null;
  createdAt: string | null;
}
export interface DistributeResponseDto {
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  correspondenceContent: string;
  mainType: string;
  isProfessional: boolean;
  documentType?: string;
  senderEntity?: string;
  senderReference?: string;
  issuedDate?: string;
  receivedDate?: string;
  sentDate?: string;
  totalReceivers: number;
  distributedAt?: string;
  attachments: AttachmentDto[];
  receivers: DistributionReceiverDto[];
}

export interface DistributionFilterDto {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
  search?: string;
  distributionId?: number;
  correspondenceId?: number;
  receiverId?: number;
  distributedBy?: number;
  departmentId?: number;
  status?: string;
  isFromHead?: boolean;
  isAutoDistributed?: boolean;
  correspondenceNumber?: number;
  correspondenceMainType?: number;
  correspondenceStatus?: number;
  isProfessional?: boolean;
  documentTypeId?: number;
  senderEntityId?: number;
  distributedDateFrom?: string;
  distributedDateTo?: string;
  readAtFrom?: string;
  readAtTo?: string;
  approvedAtFrom?: string;
  approvedAtTo?: string;
  rejectedAtFrom?: string;
  rejectedAtTo?: string;
  revokedAtFrom?: string;
  revokedAtTo?: string;
}

export interface DistributionReceiverDto {
  id: number;
  receiverId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  role?: string;
  distributedBy: number;
  distributorName: string;
  distributorEmail: string;
  status: string;
  readAt?: string;
  isRead: boolean;
  isAutoDistributed: boolean;
  notes?: string;
}

export interface DistributionEditorData {
    correspondenceId: number;
    correspondenceNumber: number;
    correspondenceTitle: number;
    correspondenceStatus: CorrespondenceStatus;
    requireDeanApprovalForAll: boolean;
    autoApprovePermanentReceivers: boolean;
    userType: string; // "Dean" | "HeadOfDepartment" | "Employee"
    users: UserDistributionStatusDto[];
}

export interface UserDistributionStatusDto {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role?: string;
    isSelected: boolean;
    isPermanentReceiver: boolean;
    isLocked: boolean; 
}

export interface PendingCorrespondenceDto {
  distributionId: number;
  correspondenceId: number;
  title: string;
  distributedDate: string;
  distributorName: string;
}

export interface PendingApprovalCorrespondenceDto {
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  correspondenceContent: string;
  mainType: string;
  isProfessional: boolean;
  documentType?: string;
  senderEntity?: string;
  senderReference?: string;
  issuedDate?: string;
  receivedDate?: string;
  sentDate?: string;
  distributedDate: string;
  distributedBy: string;
  distributorName: string;
  attachments: AttachmentDto[];
  pendingReceivers: PendingReceiverDto[];
}

export interface PendingReceiverDto {
  distributionId: number;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  receiverRole?: string;
  notes?: string;
  isAutoDistributed: boolean;
  distributedDate: string;
  rejectionReason?: string;
}

// ========== طلبات API ==========

export interface CreateDistributionRequest {
  correspondenceId: number;
  receiverIds: number[];
  notes?: string;
}

export interface MarkAsReadRequest {
  correspondenceId: number;
}

export interface RevokeDistributionRequest {
  distributionId: number;
  reason?: string;
}

export interface DistributionDetails {
  id: number;
  correspondenceId: number;
  correspondenceTitle: string;
  correspondenceNumber: string;
  correspondenceContent?: string;
  distributedDate: string;
  status: string;
  isRead: boolean;
  isRevoked: boolean;
  isIgnored: boolean;
  readAt?: string;
  revokedAt?: string;
  revokedReason?: string;
  ignoredAt?: string;
  notes?: string;
  distributorId: number;
  distributorName: string;
  distributorEmail: string;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
}

// types/distribution.ts

export interface DistributionStatusReport {
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  totalReceivers: number;
  readCount: number;
  pendingCount: number;
  ignoredCount: number;
  revokedCount: number;
  rejectedCount: number;
  readPercentage: number;
  receivers: ReceiverStatusDetail[];
}

export interface ReceiverStatusDetail {
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  department?: string;
  status: string; // "Read" | "Pending" | "Ignored" | "Revoked" | "Rejected"
  distributedDate: string;
  readAt?: string;
  revokedAt?: string;
  notes?: string;
  rejectionReason?: string;
  daysPending: number;
}

export interface ApproveRejectResult {
  approvedCount: number;
  rejectedCount: number;
}