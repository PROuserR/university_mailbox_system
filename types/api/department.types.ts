// types/api/department.types.ts

// ============================================================
// ===== DTOs =====
// ============================================================

export interface DepartmentDto {
    id: number;
    name: string;
    code: string | null;
    isActive: boolean;
    headUserId: number | null;
    headUserName: string | null;
    membersCount: number;
    createdAt: string;
    members: DepartmentMemberDto[];
}

export interface ActiveDepartmentDto {
    id: number;
    name: string;
    code: string | null;
    isActive: boolean;
    headUserId: number | null;
    headUserName: string | null;
    createdAt: string;
}

export interface DepartmentMemberDto {
    userId: number;
    fullName: string;
    email: string;
    isHead: boolean;
}

export interface DepartmentDistributionSummaryDto {
    correspondenceId: number;
    correspondenceNumber: number | null;
    correspondenceTitle: string;
    departmentName: string;
    totalDistributed: number;
    readCount: number;
    pendingCount: number;
    ignoredCount: number;
    readPercentage: number;
    firstDistributedDate: string;
    lastDistributedDate: string;
}

// ============================================================
// ===== Request DTOs =====
// ============================================================

export interface CreateDepartmentRequest {
    name: string;
    code?: string | null;
    headUserId?: number | null;
}

export interface UpdateDepartmentRequest {
    name?: string;
    code?: string | null;
    isActive?: boolean;
    headUserId?: number | null;
}

export interface DistributeToDepartmentRequest {
    correspondenceId: number;
    receiverIds: number[];
    notes?: string;
}

export interface RevokeFromDepartmentMemberRequest {
    distributionId: number;
    reason?: string;
}

// ============================================================
// ===== Query Params =====
// ============================================================

export interface DepartmentDistributionsQueryParams {
    departmentId?: number;
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
}