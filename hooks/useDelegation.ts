/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDelegation.ts
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { delegationService } from '@/services/delegation.service';
import {
  DelegationDto,
  AvailablePermissionDto,
  PermissionDto,
  CreateDelegationDto,
  UpdateDelegationDto,
  DelegationStatisticsDto,
  DelegationUsageDto,
  UserResponseDto,
} from '@/types/api/Delegation';
import useUserInfoStore from '@/store/userInfoStore';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';

export function useDelegation() {
  const { role } = useUserInfoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissionDto[]>([]);
  const [myPermissions, setMyPermissions] = useState<PermissionDto[]>([]);
  const [allDelegations, setAllDelegations] = useState<DelegationDto[]>([]);
  const [myDelegations, setMyDelegations] = useState<DelegationDto[]>([]);
  const [statistics, setStatistics] = useState<DelegationStatisticsDto | null>(null);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationDto | null>(null);
  const [usageLogs, setUsageLogs] = useState<DelegationUsageDto[]>([]);
  const [employees, setEmployees] = useState<UserResponseDto[]>([]);
  const [deans, setDeans] = useState<UserResponseDto[]>([]);
  const [allUsers, setAllUsers] = useState<UserResponseDto[]>([]);

  const isMounted = useRef(true);

  // ✅ جلب الصلاحيات من الـ Store مباشرة
  const isAdmin = role === 'Admin';
  const isDean = role === 'Dean';
  const canManageDelegations = isAdmin || isDean;

  // ============================================================
  // ===== Load Users based on Role =====
  // ============================================================

  const loadUsers = useCallback(async () => {
    try {
      const employeesData = await delegationService.getEmployees();
      if (isMounted.current) {
        const activeEmployees = employeesData.filter(u => u.isActive && !u.isBanned);
        setEmployees(activeEmployees);
      }

      if (isAdmin) {
        const deansData = await delegationService.getDeans();
        if (isMounted.current) {
          const activeDeans = deansData.filter(u => u.isActive && !u.isBanned);
          setDeans(activeDeans);
          setAllUsers([
            ...employeesData.filter(u => u.isActive && !u.isBanned),
            ...deansData.filter(u => u.isActive && !u.isBanned)
          ]);
        }
      } else {
        if (isMounted.current) {
          setAllUsers(employeesData.filter(u => u.isActive && !u.isBanned));
        }
      }
    } catch (error: any) {
      // Silent error
    }
  }, [isAdmin]);

  // ============================================================
  // ===== Load Available Permissions =====
  // ============================================================

  const loadAvailablePermissions = useCallback(async () => {
    if (!canManageDelegations) return;
    
    try {
      const data = await delegationService.getAvailablePermissions();
      if (isMounted.current) {
        setAvailablePermissions(data);
      }
    } catch (error: any) {
      // Silent error
    }
  }, [canManageDelegations]);

  // ============================================================
  // ===== Load My Permissions =====
  // ============================================================

  const loadMyPermissions = useCallback(async () => {
    try {
      const data = await delegationService.getMyPermissions();
      if (isMounted.current) {
        setMyPermissions(data);
        
        const permissionNames = data
          .filter(p => p.isGranted)
          .map(p => p.name);
        await authService.setDelegatedPermissions(permissionNames);
      }
    } catch (error: any) {
      // Silent error
    }
  }, []);

  // ============================================================
  // ===== Load All Delegations =====
  // ============================================================

  const loadAllDelegations = useCallback(async () => {
    if (!canManageDelegations) {
      return;
    }
    
    try {
      const data = await delegationService.getAllDelegations();
      if (isMounted.current) {
        setAllDelegations(data);
      }
    } catch (error: any) {
      // Silent error
    }
  }, [canManageDelegations]);

  // ============================================================
  // ===== Load My Delegations =====
  // ============================================================

  const loadMyDelegations = useCallback(async () => {
    try {
      const data = await delegationService.getMyDelegations();
      if (isMounted.current) {
        setMyDelegations(data);
      }
    } catch (error: any) {
      // Silent error
    }
  }, []);

  // ============================================================
  // ===== Load Statistics =====
  // ============================================================

  const loadStatistics = useCallback(async () => {
    if (!canManageDelegations) return;
    
    try {
      const data = await delegationService.getDelegationStatistics();
      if (isMounted.current) {
        setStatistics(data);
      }
    } catch (error: any) {
      // Silent error
    }
  }, [canManageDelegations]);

  // ============================================================
  // ===== Load Delegation Usage =====
  // ============================================================

  const loadDelegationUsage = useCallback(async (delegationId: number) => {
    if (!canManageDelegations) return;
    
    try {
      const data = await delegationService.getDelegationUsage(delegationId);
      if (isMounted.current) {
        setUsageLogs(data);
      }
    } catch (error: any) {
      // Silent error
    }
  }, [canManageDelegations]);

  // ============================================================
  // ===== Load Delegation By ID =====
  // ============================================================

  const loadDelegationById = useCallback(async (id: number) => {
    try {
      const data = await delegationService.getDelegationById(id);
      if (isMounted.current) {
        setSelectedDelegation(data);
        await loadDelegationUsage(id);
      }
      return data;
    } catch (error: any) {
      return null;
    }
  }, [loadDelegationUsage]);

  // ============================================================
  // ===== Action Functions =====
  // ============================================================

  const createDelegation = useCallback(async (dto: CreateDelegationDto) => {
    if (!canManageDelegations) {
      toast.error('ليس لديك صلاحية لإنشاء تفويض');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await delegationService.createDelegation(dto);
      toast.success('تم إنشاء التفويض بنجاح');
      await Promise.all([
        loadAllDelegations(),
        loadMyDelegations(),
        loadStatistics()
      ]);
      return result;
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء التفويض');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [canManageDelegations, loadAllDelegations, loadMyDelegations, loadStatistics]);

  const updateDelegation = useCallback(async (id: number, dto: UpdateDelegationDto) => {
    if (!canManageDelegations) {
      toast.error('ليس لديك صلاحية لتحديث التفويض');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await delegationService.updateDelegation(id, dto);
      toast.success('تم تحديث التفويض بنجاح');
      await Promise.all([
        loadAllDelegations(),
        loadMyDelegations(),
        loadStatistics(),
        loadDelegationById(id)
      ]);
      return result;
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث التفويض');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [canManageDelegations, loadAllDelegations, loadMyDelegations, loadStatistics, loadDelegationById]);

  const addPermissions = useCallback(async (id: number, permissionIds: number[]) => {
    if (!canManageDelegations) {
      toast.error('ليس لديك صلاحية لإضافة صلاحيات');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await delegationService.addPermissionsToDelegation(id, permissionIds);
      toast.success('تم إضافة الصلاحيات بنجاح');
      await Promise.all([
        loadAllDelegations(),
        loadDelegationById(id)
      ]);
      return result;
    } catch (error: any) {
      toast.error(error.message || 'فشل إضافة الصلاحيات');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [canManageDelegations, loadAllDelegations, loadDelegationById]);

  const revokeDelegation = useCallback(async (id: number, reason?: string) => {
    if (!canManageDelegations) {
      toast.error('ليس لديك صلاحية لإلغاء التفويض');
      return;
    }
    
    setIsLoading(true);
    try {
      await delegationService.revokeDelegation(id, reason);
      toast.success('تم إلغاء التفويض بنجاح');
      await Promise.all([
        loadAllDelegations(),
        loadMyDelegations(),
        loadStatistics()
      ]);
      if (isMounted.current) {
        setSelectedDelegation(null);
        setUsageLogs([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل إلغاء التفويض');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [canManageDelegations, loadAllDelegations, loadMyDelegations, loadStatistics]);

  const revokeExpiredDelegations = useCallback(async () => {
    if (!isAdmin) {
      toast.error('ليس لديك صلاحية لإلغاء التفويضات المنتهية');
      return;
    }
    
    setIsLoading(true);
    try {
      const count = await delegationService.revokeExpiredDelegations();
      toast.success(`تم إلغاء ${count} تفويض منتهي`);
      await loadStatistics();
      return count;
    } catch (error: any) {
      toast.error(error.message || 'فشل إلغاء التفويضات المنتهية');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isAdmin, loadStatistics]);

  const addDefaultDelegations = useCallback(async () => {
    if (!canManageDelegations) {
      toast.error('ليس لديك صلاحية لإضافة التفويضات الافتراضية');
      return;
    }
    
    setIsLoading(true);
    try {
      const count = await delegationService.addDefaultDelegations();
      toast.success(`تم إضافة ${count} تفويض افتراضي`);
      await Promise.all([
        loadAllDelegations(),
        loadMyDelegations(),
        loadStatistics()
      ]);
      return count;
    } catch (error: any) {
      toast.error(error.message || 'فشل إضافة التفويضات الافتراضية');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [canManageDelegations, loadAllDelegations, loadMyDelegations, loadStatistics]);

  const resetDefaultDelegations = useCallback(async () => {
    if (!isAdmin) {
      toast.error('ليس لديك صلاحية لإعادة تعيين التفويضات الافتراضية');
      return;
    }
    
    setIsLoading(true);
    try {
      const count = await delegationService.resetDefaultDelegations();
      toast.success(`تم إعادة تعيين ${count} تفويض افتراضي`);
      await Promise.all([
        loadAllDelegations(),
        loadMyDelegations(),
        loadStatistics()
      ]);
      return count;
    } catch (error: any) {
      toast.error(error.message || 'فشل إعادة تعيين التفويضات الافتراضية');
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isAdmin, loadAllDelegations, loadMyDelegations, loadStatistics]);
  
  // ============================================================
  // ===== Load All Data =====
  // ============================================================

  const loadAllData = useCallback(async () => {
    isMounted.current = true;
    
    const promises: Promise<any>[] = [
      loadMyPermissions(),
      loadMyDelegations(),
      loadUsers(),
    ];

    if (canManageDelegations) {
      promises.push(
        loadAvailablePermissions(),
        loadAllDelegations(),
        loadStatistics()
      );
    }

    await Promise.allSettled(promises);
  }, [
    loadMyPermissions,
    loadMyDelegations,
    loadUsers,
    loadAvailablePermissions,
    loadAllDelegations,
    loadStatistics,
    canManageDelegations
  ]);

  // ============================================================
  // ===== Initialize =====
  // ============================================================

  useEffect(() => {
    isMounted.current = true;
    
    (async () => {
      await loadAllData();
    })();

    return () => {
      isMounted.current = false;
    };
  }, [loadAllData]);

  // ============================================================
  // ===== Return =====
  // ============================================================

  return {
    isLoading,
    availablePermissions,
    myPermissions,
    allDelegations,
    myDelegations,
    statistics,
    selectedDelegation,
    usageLogs,
    employees,
    deans,
    allUsers,
    canManageDelegations,
    isAdmin,
    isDean,

    loadAvailablePermissions,
    loadMyPermissions,
    loadAllDelegations,
    loadMyDelegations,
    loadStatistics,
    loadDelegationUsage,
    loadDelegationById,
    loadAllData,
    loadUsers,

    createDelegation,
    updateDelegation,
    addPermissions,
    revokeDelegation,
    revokeExpiredDelegations,
    addDefaultDelegations,
    resetDefaultDelegations,
  };
}