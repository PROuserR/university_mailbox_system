// types/user.ts
export enum UpdateUserRole {
    User = "User",
    Employee = "Employee"
}

export enum CreateUserRole {
    Employee = 2,
    User = 3
}
export interface ResetUserPasswordRequest {
    userId: number;
    newPassword: string;
}
/**
 * User Response DTO from backend
 */
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isPermanentReceiver: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  profileImageUrl?: string;
  departmentId?: number | null;
  roles: string[];
}

export interface LoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  role: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}


export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  isPermanentReceiver?: boolean;
}

export interface CurrentUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userName: string;
  roles: string[];
  phone?: string | null;
  isActive: boolean;
  isPermanentReceiver: boolean;
  isEmailConfirmed: boolean;
  isHeadOfDepartment: boolean;
  departmentId: number | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  profileImageUrl?: string | null;
}

// ============================================================
// ===== Roles Enum =====
// ============================================================

export enum UserRole {
  ADMIN = 'Admin',
  DEAN = 'Dean',
  EMPLOYEE = 'Employee',
  HEAD_OF_DEPARTMENT = 'HeadOfDepartment', // ← إضافة الدور الجديد
  USER = 'User'
}

// ============================================================
// ===== Helper Functions =====
// ============================================================

export const getPrimaryRole = (roles: string[]): string => {
  if (roles.includes('HeadOfDepartment')) return 'HeadOfDepartment';
  if (roles.includes('Dean')) return 'Dean';
  if (roles.includes('Admin')) return 'Admin';
  if (roles.includes('Employee')) return 'Employee';
  return roles[0] || 'User';
};

export const hasRole = (roles: string[], role: string): boolean => {
  return roles.includes(role);
};

export const isDean = (roles: string[]): boolean => hasRole(roles, 'Dean');
export const isAdmin = (roles: string[]): boolean => hasRole(roles, 'Admin');
export const isEmployee = (roles: string[]): boolean => hasRole(roles, 'Employee');
export const isHeadOfDepartment = (roles: string[]): boolean => hasRole(roles, 'HeadOfDepartment');