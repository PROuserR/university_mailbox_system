/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/auth/PermissionGate.tsx

"use client";

import { ReactNode, useEffect, useState, useCallback, useRef, Children, cloneElement, isValidElement } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api/user';

interface PermissionGateProps {
    children: ReactNode;
    permissions?: string[];
    roles?: UserRole[];
    fallback?: ReactNode;
    requireAll?: boolean;
    loadingFallback?: ReactNode;
    /** 
     * إذا كان true: يتم تعطيل الأزرار (تظهر معطلة)
     * إذا كان false أو غير موجود: يتم إخفاء الأزرار تماماً
     */
    disableOnUnauthorized?: boolean;
}

export function PermissionGate({
    children,
    permissions = [],
    roles = [],
    fallback = null,
    requireAll = true,
    loadingFallback,
    disableOnUnauthorized = false, // ✅ افتراضي: إخفاء
}: PermissionGateProps) {
    const { hasPermission, hasRole, isLoading, refreshPermissions } = useAuth();
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

        if (permissions.length > 0) {
            let permissionCheck: boolean;
            if (requireAll) {
                const results = await Promise.all(permissions.map(p => hasPermission(p)));
                permissionCheck = results.every(r => r === true);
            } else {
                const results = await Promise.all(permissions.map(p => hasPermission(p)));
                permissionCheck = results.some(r => r === true);
            }

            if (!permissionCheck) {
                await refreshPermissions();
                if (requireAll) {
                    const results = await Promise.all(permissions.map(p => hasPermission(p)));
                    permissionCheck = results.every(r => r === true);
                } else {
                    const results = await Promise.all(permissions.map(p => hasPermission(p)));
                    permissionCheck = results.some(r => r === true);
                }
            }

            if (!permissionCheck) {
                if (isMounted.current) setHasAccess(false);
                return;
            }
        }

        if (isMounted.current) setHasAccess(true);
    }, [permissions, roles, requireAll, hasPermission, hasRole, refreshPermissions]);

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

    // ✅ لديه صلاحية → عرض المحتوى
    if (hasAccess) {
        return <>{children}</>;
    }

    // ✅ ليس لديه صلاحية + وضع التعطيل مفعل → تعطيل الأزرار
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

    // ✅ ليس لديه صلاحية والإخفاء مفعل (الافتراضي) → إخفاء
    return <>{fallback}</>;
}

// ============================================================
// ===== المكونات المساعدة =====
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

export const CanManageDistribution = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate
        permissions={['CreateDistribution', 'ApproveDistribution', 'RejectDistribution', 'RevokeDistribution']}
        requireAll={false}
        fallback={fallback}
        disableOnUnauthorized={disableOnUnauthorized}
    >
        {children}
    </PermissionGate>
);

export const CanViewDistribution = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate permissions={['ViewDistribution']} fallback={fallback} disableOnUnauthorized={disableOnUnauthorized}>
        {children}
    </PermissionGate>
);

export const CanApprove = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate
        permissions={['ApproveDistribution', 'ApproveIncomingEmail', 'ApproveOutgoingEmail', 'ApproveCorrespondence']}
        requireAll={false}
        fallback={fallback}
        disableOnUnauthorized={disableOnUnauthorized}
    >
        {children}
    </PermissionGate>
);

export const CanReject = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate
        permissions={['RejectDistribution', 'RejectIncomingEmail', 'RejectCorrespondence']}
        requireAll={false}
        fallback={fallback}
        disableOnUnauthorized={disableOnUnauthorized}
    >
        {children}
    </PermissionGate>
);

export const CanApproveOrReject = ({ children, fallback, disableOnUnauthorized = false }: any) => (
    <PermissionGate
        permissions={[
            'ApproveDistribution',
            'RejectDistribution',
            'ApproveIncomingEmail',
            'RejectIncomingEmail',
            'ApproveCorrespondence',
            'RejectCorrespondence',
        ]}
        requireAll={false}
        fallback={fallback}
        disableOnUnauthorized={disableOnUnauthorized}
    >
        {children}
    </PermissionGate>
);