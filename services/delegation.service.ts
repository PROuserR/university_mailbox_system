// services/delegation.service.ts
import { apiWrapper, extractData, isApiSuccess } from '@/utils/apiClient';
import {
  DelegationDto,
  CreateDelegationDto,
  UpdateDelegationDto,
  RevokeDelegationDto,
  AvailablePermissionDto,
  PermissionDto,
  DelegationStatisticsDto,
  DelegationUsageDto,
} from '@/types/api/Delegation';
import { ApiResult } from '@/types/api/ApiResult';
import { UserResponse } from '@/types/api/user';
import PagedResult from '@/types/api/PagedResponse';

class DelegationService {
  // ============================================================
  // ===== Users =====
  // ============================================================

  async getActiveUsers(): Promise<UserResponse[]> {
    const response = await apiWrapper.get<ApiResult<UserResponse[]>>(
      '/Users/active'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل المستخدمين');
    }

    return extractData(response) || [];
  }

  // ============================================================
  // ===== Create Delegation =====
  // ============================================================

  async createDelegation(dto: CreateDelegationDto): Promise<DelegationDto> {
    const response = await apiWrapper.post<ApiResult<DelegationDto>>(
      '/Delegations',
      dto
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل إنشاء التفويض');
    }

    return extractData(response)!;
  }

  // ============================================================
  // ===== Update Delegation =====
  // ============================================================

  async updateDelegation(id: number, dto: UpdateDelegationDto): Promise<DelegationDto> {
    const response = await apiWrapper.put<ApiResult<DelegationDto>>(
      `/Delegations/${id}`,
      dto
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحديث التفويض');
    }

    return extractData(response)!;
  }

  async addPermissionsToDelegation(id: number, permissionIds: number[]): Promise<DelegationDto> {
    const response = await apiWrapper.post<ApiResult<DelegationDto>>(
      `/Delegations/${id}/add-permissions`,
      permissionIds
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل إضافة الصلاحيات');
    }

    return extractData(response)!;
  }

  // ============================================================
  // ===== Revoke Delegation =====
  // ============================================================

  async revokeDelegation(id: number, reason?: string): Promise<void> {
    const response = await apiWrapper.post<ApiResult<void>>(
      `/Delegations/${id}/revoke`,
      { reason } as RevokeDelegationDto
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل إلغاء التفويض');
    }
  }

  // ============================================================
  // ===== Get Delegations =====
  // ============================================================

  async getDelegationById(id: number): Promise<DelegationDto> {
    const response = await apiWrapper.get<ApiResult<DelegationDto>>(
      `/Delegations/${id}`
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل التفويض');
    }

    return extractData(response)!;
  }

  async getAllDelegations(): Promise<DelegationDto[]> {
    const response = await apiWrapper.get<ApiResult<DelegationDto[]>>(
      '/Delegations'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل التفويضات');
    }

    return extractData(response) || [];
  }

  async getDelegationsByDelegate(userId: number): Promise<DelegationDto[]> {
    const response = await apiWrapper.get<ApiResult<DelegationDto[]>>(
      `/Delegations/by-delegate/${userId}`
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل تفويضات المستخدم');
    }

    return extractData(response) || [];
  }

  async getMyDelegations(): Promise<DelegationDto[]> {
    const response = await apiWrapper.get<ApiResult<DelegationDto[]>>(
      '/Delegations/my-delegations'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل تفويضاتي');
    }

    return extractData(response) || [];
  }

  // ============================================================
  // ===== Permissions =====
  // ============================================================

  async getMyPermissions(): Promise<PermissionDto[]> {
    const response = await apiWrapper.get<ApiResult<PermissionDto[]>>(
      '/Delegations/my-permissions'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل الصلاحيات');
    }

    return extractData(response) || [];
  }

  async hasPermission(permissionName: string): Promise<boolean> {
    const response = await apiWrapper.get<ApiResult<boolean>>(
      '/Delegations/has-permission',
      { permissionName }
    );

    if (!isApiSuccess(response)) {
      return false;
    }

    return extractData(response) || false;
  }

  async getAvailablePermissions(): Promise<AvailablePermissionDto[]> {
    const response = await apiWrapper.get<ApiResult<AvailablePermissionDto[]>>(
      '/Delegations/available-permissions'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل الصلاحيات المتاحة');
    }

    return extractData(response) || [];
  }

  // ============================================================
  // ===== Usage & Statistics =====
  // ============================================================

  async getDelegationStatistics(): Promise<DelegationStatisticsDto> {
    const response = await apiWrapper.get<ApiResult<DelegationStatisticsDto>>(
      '/Delegations/statistics'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل الإحصائيات');
    }

    return extractData(response)!;
  }
   async getDelegationUsage(
    delegationId: number, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<PagedResult<DelegationUsageDto>> {
    const response = await apiWrapper.get<ApiResult<PagedResult<DelegationUsageDto>>>(
      `/Delegations/${delegationId}/usage`,
      { page, pageSize }
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل تحميل سجل الاستخدام');
    }

    const data = extractData(response);
    
    return data || {
      items: [],
      totalCount: 0,
      totalPages: 0,
      pageNumber: page,
      pageSize: pageSize,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
  // ============================================================
  // ===== Management =====
  // ============================================================

  async revokeExpiredDelegations(): Promise<number> {
    const response = await apiWrapper.post<ApiResult<number>>(
      '/Delegations/revoke-expired'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل إلغاء التفويضات المنتهية');
    }

    return extractData(response) || 0;
  }

  // ============================================================
  // ===== Default Delegations =====
  // ============================================================

  async addDefaultDelegations(): Promise<number> {
    const response = await apiWrapper.post<ApiResult<number>>(
      '/Delegations/default-delegations/add'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل إضافة التفويضات الافتراضية');
    }

    return extractData(response) || 0;
  }

  async resetDefaultDelegations(): Promise<number> {
    const response = await apiWrapper.post<ApiResult<number>>(
      '/Delegations/default-delegations/reset'
    );

    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'فشل إعادة تعيين التفويضات الافتراضية');
    }

    return extractData(response) || 0;
  }
}

export const delegationService = new DelegationService();