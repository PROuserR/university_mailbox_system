/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/auth/PermissionGate.tsx

"use client";

import { ReactNode, useEffect, useState, useCallback, useRef, Children, cloneElement, isValidElement } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api/user';
import userInfoStore from '@/store/userInfoStore';

interface PermissionGateProps {
    children: ReactNode;
    permissions?: string[];
    roles?: UserRole[];
    fallback?: ReactNode;
    requireAll?: boolean;
    loadingFallback?: ReactNode;
    disableOnUnauthorized?: boolean;
}

export function PermissionGate({
    children,
    permissions = [],
    roles = [],
    fallback = null,
    requireAll = true,
    loadingFallback,
    disableOnUnauthorized = false,
}: PermissionGateProps) {
    const { hasPermission, hasRole, isLoading } = useAuth();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const isMounted = useRef(true);

    const checkAccess = useCallback(async () => {
        if (roles.length > 0) {
            const roleCheck = roles.some(role => hasRole(role));
            if (!roleCheck) {
                if (isMounted.current) setHasAccess(false);
                return;
            }
        }

        if (permissions.length === 0) {
            if (isMounted.current) setHasAccess(true);
            return;
        }
         const state = userInfoStore.getState();
  const delegatedPermissions = state.delegatedPermissions || [];
  
  let permissionCheck: boolean;
  if (requireAll) {
    permissionCheck = permissions.every(p => delegatedPermissions.includes(p));
  } else {
    permissionCheck = permissions.some(p => delegatedPermissions.includes(p));
  }

  if (isMounted.current) setHasAccess(permissionCheck);
  
}, [permissions, roles, requireAll, hasRole]);
    useEffect(() => {
        isMounted.current = true;
        checkAccess();
        return () => {
            isMounted.current = false;
        };
    }, [checkAccess]);

    if (isLoading || hasAccess === null) {
        return loadingFallback || (
            <div className="flex items-center justify-center p-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (disableOnUnauthorized) {
        return (
            <>
                {Children.map(children, (child) => {
                    if (!isValidElement(child)) return child;
                    const originalProps = child.props as any;
                    const newProps = {
                        ...originalProps,
                        disabled: true,
                        onClick: (e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                        },
                        className: `${originalProps.className || ''} opacity-50 cursor-not-allowed pointer-events-none`,
                        style: { ...originalProps.style, pointerEvents: 'none' },
                    };
                    return cloneElement(child, newProps);
                })}
            </>
        );
    }

    return <>{fallback}</>;
}

// ============================================================
// ===== المكونات المساعدة - تعتمد فقط على الأدوار =====
// ============================================================

export const IsAdmin = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate roles={[UserRole.ADMIN]} fallback={fallback} disableOnUnauthorized={disableOnUnauthorized}>
        {children}
    </PermissionGate>
);

export const IsDean = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate roles={[UserRole.DEAN]} fallback={fallback} disableOnUnauthorized={disableOnUnauthorized}>
        {children}
    </PermissionGate>
);

export const IsDeanOrAdmin = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate roles={[UserRole.DEAN, UserRole.ADMIN]} fallback={fallback} disableOnUnauthorized={disableOnUnauthorized}>
        {children}
    </PermissionGate>
);

export const IsEmployee = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate roles={[UserRole.EMPLOYEE]} fallback={fallback} disableOnUnauthorized={disableOnUnauthorized}>
        {children}
    </PermissionGate>
);

// ============================================================
// ===== المكونات المساعدة - تعتمد على الصلاحيات الأساسية =====
// ============================================================

export const CanManageDelegations = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate
        permissions={['CreateDelegation', 'UpdateDelegation', 'RevokeDelegation']}
        requireAll={false}
        fallback={fallback}
        disableOnUnauthorized={disableOnUnauthorized}
    >
        {children}
    </PermissionGate>
);

export const CanManageCorrespondence = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate
        permissions={['CreateCorrespondence', 'EditCorrespondence', 'DeleteCorrespondence']}
        requireAll={false}
        fallback={fallback}
        disableOnUnauthorized={disableOnUnauthorized}
    >
        {children}
    </PermissionGate>
);