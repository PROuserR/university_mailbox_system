/* eslint-disable @typescript-eslint/no-explicit-any */
// components/auth/PermissionGate.tsx
"use client";

import { ReactNode, useEffect, useState, useRef, Children, cloneElement, isValidElement } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api/user';

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
  const checkedRef = useRef(false); // ✅ منع التكرار

  useEffect(() => {
    // ✅ نتأكد من أن الفحص يحدث مرة واحدة فقط
    if (checkedRef.current) return;
    checkedRef.current = true;

    const checkAccess = async () => {
      let access = true;

      // 1. التحقق من الأدوار
      if (roles.length > 0) {
        const roleCheck = roles.some(role => hasRole(role));
        if (!roleCheck) {
          access = false;
        }
      }

      // 2. التحقق من الصلاحيات (مع await لأنها Promise)
      if (access && permissions.length > 0) {
        const results = await Promise.all(permissions.map(p => hasPermission(p)));
        if (requireAll) {
          access = results.every(r => r === true);
        } else {
          access = results.some(r => r === true);
        }
      }

      setHasAccess(access);
    };

    checkAccess();
  }, []); // ✅ مصفوفة فارغة → يُنفذ مرة واحدة فقط

  // حالة التحميل
  if (isLoading || hasAccess === null) {
    return loadingFallback || (
      <div className="flex items-center justify-center p-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // لديه صلاحية → عرض المحتوى
  if (hasAccess) {
    return <>{children}</>;
  }

  // ليس لديه صلاحية + وضع التعطيل مفعل
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

  // ليس لديه صلاحية والإخفاء مفعل
  return <>{fallback}</>;
}

// ============================================================
// ===== المكونات المساعدة (نفسها مع إضافة disableOnUnauthorized) =====
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