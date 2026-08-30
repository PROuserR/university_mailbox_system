import { Attachment } from "./Attachment";
import { CorrespondenceStatus } from "./correspondence.types";

export type CreateDistributionPayload = {
    correspondenceId: number;
    receiverIds: number[];
    notes?: string;
};


export enum DistributionStatus {
  Pending = 1,
  Read = 2,
  Ignored = 3,
  Revoked = 4,
  PendingApproval = 5,
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
  attachments: Attachment[];
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
  attachments: Attachment[];
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

  attachments: Attachment[];
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
  attachments: Attachment[];
  receivers: DistributionReceiverDto[];
}

export interface DistributionFilterDto {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
  search?: string;
  status?: number | string;
  correspondenceNumber?: number;
  correspondenceMainType?: number;
  correspondenceStatus?: number | string;
  isProfessional?: boolean;
  documentTypeId?: number;
  senderEntityId?: number;
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
  attachments: Attachment[];
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