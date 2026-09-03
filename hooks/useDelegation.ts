/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { delegationService } from '@/services/delegation.service';
import {
  DelegationDto,
  AvailablePermissionDto,
  PermissionDto,
  CreateDelegationDto,
  UpdateDelegationDto,
  DelegationStatisticsDto,
  DelegationUsageDto,
} from '@/types/api/Delegation';
import useUserInfoStore from '@/store/userInfoStore';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import PagedResult from '@/types/api/PagedResponse';

export function useDelegation() {
  const queryClient = useQueryClient();
  const { role } = useUserInfoStore();

  const isAdmin = role === 'Admin';
  const isDean = role === 'Dean';
  const canManageDelegations = isAdmin || isDean;

  // ============================================================
  // ===== QUERIES (تحميل البيانات مع caching) =====
  // ============================================================

  // 1. المستخدمين النشطين
  const usersQuery = useQuery({
    queryKey: ['delegation', 'users'],
    queryFn: () => delegationService.getActiveUsers(),
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق (كان cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // 2. جميع التفويضات (لـ Admin و Dean فقط)
  const allDelegationsQuery = useQuery({
    queryKey: ['delegation', 'all'],
    queryFn: () => delegationService.getAllDelegations(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: canManageDelegations,
    refetchOnWindowFocus: false,
  });

  // 3. تفويضاتي الخاصة
  const myDelegationsQuery = useQuery({
    queryKey: ['delegation', 'my'],
    queryFn: () => delegationService.getMyDelegations(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 4. الصلاحيات المتاحة للتفويض
  const availablePermissionsQuery = useQuery({
    queryKey: ['delegation', 'available-permissions'],
    queryFn: () => delegationService.getAvailablePermissions(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: canManageDelegations,
    refetchOnWindowFocus: false,
  });

  // 5. صلاحياتي الحالية
  const myPermissionsQuery = useQuery({
    queryKey: ['delegation', 'my-permissions'],
    queryFn: async () => {
      const data = await delegationService.getMyPermissions();
      // تحديث الصلاحيات في الـ auth service
      const permissionNames = data.filter(p => p.isGranted).map(p => p.name);
      await authService.setDelegatedPermissions(permissionNames);
      return data;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 6. الإحصائيات
  const statisticsQuery = useQuery({
    queryKey: ['delegation', 'statistics'],
    queryFn: () => delegationService.getDelegationStatistics(),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: canManageDelegations,
    refetchOnWindowFocus: false,
  });

  // 7. تفويض محدد (يتم استخدامه عند عرض التفاصيل)
  const useDelegationById = (id: number | null) => {
    return useQuery({
      queryKey: ['delegation', 'detail', id],
      queryFn: () => id ? delegationService.getDelegationById(id) : null,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!id,
      refetchOnWindowFocus: false,
    });
  };

    const useDelegationUsage = (delegationId: number | null, page: number = 1, pageSize: number = 10) => {
    return useQuery({
      queryKey: ['delegation', 'usage', delegationId, page, pageSize],
      queryFn: async () => {
        if (!delegationId) {
          return {
            items: [],
            totalCount: 0,
            totalPages: 0,
            pageNumber: page,
            pageSize: pageSize,
            hasPreviousPage: false,
            hasNextPage: false,
          } as PagedResult<DelegationUsageDto>;
        }
        return await delegationService.getDelegationUsage(delegationId, page, pageSize);
      },
      staleTime: 1 * 60 * 1000,
      gcTime: 3 * 60 * 1000,
      enabled: !!delegationId && canManageDelegations,
      refetchOnWindowFocus: false,
    });
  };

  // ============================================================
  // ===== MUTATIONS (العمليات التي تعدل البيانات) =====
  // ============================================================

  // إنشاء تفويض جديد
  const createMutation = useMutation({
    mutationFn: (dto: CreateDelegationDto) => 
      delegationService.createDelegation(dto),
    onSuccess: () => {
      // تحديث جميع الـ queries المرتبطة بالتفويضات
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast.success('تم إنشاء التفويض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إنشاء التفويض');
    },
  });

  // تحديث تفويض
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateDelegationDto }) =>
      delegationService.updateDelegation(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      // تحديث التفويض المحدد في cache
      queryClient.invalidateQueries({ 
        queryKey: ['delegation', 'detail', variables.id] 
      });
      toast.success('تم تحديث التفويض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل تحديث التفويض');
    },
  });

  // إضافة صلاحيات لتفويض
  const addPermissionsMutation = useMutation({
    mutationFn: ({ id, permissionIds }: { id: number; permissionIds: number[] }) =>
      delegationService.addPermissionsToDelegation(id, permissionIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      queryClient.invalidateQueries({ 
        queryKey: ['delegation', 'detail', variables.id] 
      });
      toast.success('تم إضافة الصلاحيات بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إضافة الصلاحيات');
    },
  });

  // إلغاء تفويض
  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      delegationService.revokeDelegation(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      queryClient.invalidateQueries({ 
        queryKey: ['delegation', 'detail', variables.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['delegation', 'usage', variables.id] 
      });
      toast.success('تم إلغاء التفويض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إلغاء التفويض');
    },
  });

  // إلغاء التفويضات المنتهية
  const revokeExpiredMutation = useMutation({
    mutationFn: () => delegationService.revokeExpiredDelegations(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast.success(`تم إلغاء ${count} تفويض منتهي`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إلغاء التفويضات المنتهية');
    },
  });

  // إضافة التفويضات الافتراضية
  const addDefaultMutation = useMutation({
    mutationFn: () => delegationService.addDefaultDelegations(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast.success(`تم إضافة ${count} تفويض افتراضي`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إضافة التفويضات الافتراضية');
    },
  });

  // إعادة تعيين التفويضات الافتراضية
  const resetDefaultMutation = useMutation({
    mutationFn: () => delegationService.resetDefaultDelegations(),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast.success(`تم إعادة تعيين ${count} تفويض افتراضي`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إعادة تعيين التفويضات الافتراضية');
    },
  });

  // ============================================================
  // ===== COMPUTED DATA (بيانات محسوبة) =====
  // ============================================================

  const usersData = usersQuery.data || [];
  const allDelegations = allDelegationsQuery.data || [];
  const myDelegations = myDelegationsQuery.data || [];
  const availablePermissions = availablePermissionsQuery.data || [];
  const myPermissions = myPermissionsQuery.data || [];
  const statistics = statisticsQuery.data || null;

  const employees = useMemo(
    () => usersData.filter(u => u.isActive && u.roles?.includes('Employee')),
    [usersData]
  );
  
  const deans = useMemo(
    () => usersData.filter(u => u.isActive && u.roles?.includes('Dean')),
    [usersData]
  );
  
  const headOfDepartments = useMemo(
    () => usersData.filter(u => u.isActive && u.roles?.includes('HeadOfDepartment')),
    [usersData]
  );

  const isLoading = 
    usersQuery.isLoading || 
    myDelegationsQuery.isLoading || 
    myPermissionsQuery.isLoading;


  const loadAllData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['delegation'] });
    queryClient.invalidateQueries({ queryKey: ['delegation', 'users'] });
  }, [queryClient]);

  const loadAvailablePermissions = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['delegation', 'available-permissions'] 
    });
  }, [queryClient]);

  const loadDelegationById = useCallback(async (id: number) => {
    const result = await queryClient.fetchQuery({
      queryKey: ['delegation', 'detail', id],
      queryFn: () => delegationService.getDelegationById(id),
    });
    return result;
  }, [queryClient]);

  const loadDelegationUsage = useCallback(async (delegationId: number) => {
    const result = await queryClient.fetchQuery({
      queryKey: ['delegation', 'usage', delegationId],
      queryFn: () => delegationService.getDelegationUsage(delegationId),
    });
    return result;
  }, [queryClient]);

  // ============================================================
  // ===== RETURN =====
  // ============================================================

  return {
    allDelegations,
    myDelegations,
    availablePermissions,
    myPermissions,
    statistics,
    employees,
    deans,
    headOfDepartments,
    allUsers: usersData,
    
    isLoading,
    isAuthLoading: false, 
    canManageDelegations,
    isAdmin,
    isDean,
    
    loadAllData,
    loadAvailablePermissions,
    loadDelegationById,
    loadDelegationUsage,
    
    useDelegationById,
    useDelegationUsage,
    
    createDelegation: createMutation.mutateAsync,
    updateDelegation: (id: number, dto: UpdateDelegationDto) =>
      updateMutation.mutateAsync({ id, dto }),
    addPermissions: (id: number, permissionIds: number[]) =>
      addPermissionsMutation.mutateAsync({ id, permissionIds }),
    revokeDelegation: (id: number, reason?: string) =>
      revokeMutation.mutateAsync({ id, reason }),
    revokeExpiredDelegations: revokeExpiredMutation.mutateAsync,
    addDefaultDelegations: addDefaultMutation.mutateAsync,
    resetDefaultDelegations: resetDefaultMutation.mutateAsync,
    
    // حالات الـ Mutations (للتحكم في الـ UI)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRevoking: revokeMutation.isPending,
  };
}