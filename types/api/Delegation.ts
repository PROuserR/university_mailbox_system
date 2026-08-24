// ============================================================
// ===== Delegation DTOs (مطابقة للباك إند) =====
// ============================================================

export interface DelegationDto {
  id: number;
  delegatorId: number;
  delegatorName: string;
  delegateUserId: number;
  delegateUserName: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  revokeReason: string | null;
  revokedAt: string | null;
  revokedBy: number | null;
  permissions: PermissionDto[];
  recentUsages?: DelegationUsageDto[];
}

export interface CreateDelegationDto {
  delegateUserId: number;
  endDate?: string;
  notes?: string;
  permissionIds: number[];
}

export interface UpdateDelegationDto {
  endDate?: string;
  notes?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

export interface RevokeDelegationDto {
  reason?: string;
}

// ============================================================
// ===== Permission DTOs =====
// ============================================================

export interface PermissionDto {
  id: number;
  name: string;
  displayName: string;
  category: string | null;
  isGranted: boolean;
}

export interface AvailablePermissionDto {
  id: number;
  name: string;
  displayName: string;
  isDelegatable: boolean;
  category: string | null;
}

// ============================================================
// ===== Usage & Statistics =====
// ============================================================

export interface DelegationUsageDto {
  id: number;
  action: string;
  resourceType: string | null;
  resourceId: number | null;
  usedAt: string;
  userName: string;
  permissionName: string;
}

export interface DelegationStatisticsDto {
  totalDelegations: number;
  activeDelegations: number;
  expiredDelegations: number;
  revokedDelegations: number;
  totalUsages: number;
  usagesByPermission: Record<string, number>;
  lastUpdated: string;
}

// ============================================================
// ===== Permission Override (ميزة إضافية) =====
// ============================================================

export interface PermissionOverrideDto {
  id: number;
  userId: number;
  userName: string;
  permissionId: number;
  permissionName: string;
  permissionDisplayName: string;
  isAllowed: boolean;
  reason: string | null;
  expiryDate: string | null;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreatePermissionOverrideDto {
  userId: number;
  permissionId: number;
  isAllowed: boolean;
  reason?: string;
  expiryDate?: string;
}

export interface UpdatePermissionOverrideDto {
  isAllowed?: boolean;
  reason?: string;
  expiryDate?: string;
}

export interface UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isBanned: boolean;
  isPermanentReceiver: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  profileImageUrl: string | null;
  roles: string[];
}