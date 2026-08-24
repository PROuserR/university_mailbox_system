// components/auth/PermissionGate.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api/user';

interface PermissionGateProps {
  children: ReactNode;
  permissions?: string[];
  roles?: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean;
  loadingFallback?: ReactNode;
}

export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  requireAll = true,
  loadingFallback,
}: PermissionGateProps) {
  const { hasPermission, hasRole, isLoading, refreshPermissions } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (roles.length > 0) {
        const roleCheck = roles.some(role => hasRole(role));
        if (!roleCheck) {
          setHasAccess(false);
          return;
        }
      }

      if (permissions.length > 0) {
        let permissionCheck: boolean;
        
        if (requireAll) {
          permissionCheck = permissions.every(permission => hasPermission(permission));
        } else {
          permissionCheck = permissions.some(permission => hasPermission(permission));
        }

        if (!permissionCheck) {
          await refreshPermissions();
          
          if (requireAll) {
            permissionCheck = permissions.every(permission => hasPermission(permission));
          } else {
            permissionCheck = permissions.some(permission => hasPermission(permission));
          }
        }

        if (!permissionCheck) {
          setHasAccess(false);
          return;
        }
      }

      setHasAccess(true);
    };

    checkAccess();
  }, [permissions, roles, requireAll, hasPermission, hasRole, refreshPermissions]);

  if (isLoading || hasAccess === null) {
    return loadingFallback || (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// ============================================================
// ===== مكونات مساعدة =====
// ============================================================

export const IsAdmin = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate roles={[UserRole.ADMIN]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const IsDean = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate roles={[UserRole.DEAN]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const IsDeanOrAdmin = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate roles={[UserRole.DEAN, UserRole.ADMIN]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const IsEmployee = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate roles={[UserRole.EMPLOYEE]} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanManageDelegations = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['CreateDelegation', 'UpdateDelegation', 'RevokeDelegation']} 
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanManageCorrespondence = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['CreateCorrespondence', 'EditCorrespondence', 'DeleteCorrespondence']} 
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanManageDistribution = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['CreateDistribution', 'ApproveDistribution', 'RejectDistribution', 'RevokeDistribution']} 
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanViewDistribution = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['ViewDistribution']} 
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanApprove = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['ApproveDistribution', 'ApproveIncomingEmail', 'ApproveOutgoingEmail', 'ApproveCorrespondence']} 
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanReject = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['RejectDistribution', 'RejectIncomingEmail', 'RejectCorrespondence']} 
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanApproveOrReject = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate 
    permissions={['ApproveDistribution', 'RejectDistribution', 'ApproveIncomingEmail', 'RejectIncomingEmail', 'ApproveCorrespondence', 'RejectCorrespondence']} 
    requireAll={false}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);