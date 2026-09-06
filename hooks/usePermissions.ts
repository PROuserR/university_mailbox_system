// hooks/usePermissions.ts
"use client";

import { useMemo } from "react";
import useUserInfoStore from "@/store/userInfoStore";

export function usePermissions() {
  const { delegatedPermissions } = useUserInfoStore();

  const hasPermission = (permissionName: string): boolean => {
    return delegatedPermissions.includes(permissionName);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => delegatedPermissions.includes(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => delegatedPermissions.includes(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    delegatedPermissions,
  };
}