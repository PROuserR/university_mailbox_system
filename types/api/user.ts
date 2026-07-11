// types/user.ts

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
  isBanned: boolean;
  isPermanentReceiver: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  profileImageUrl?: string;
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
  role: string;
  roles: string[];
  phone?: string;
  isActive: boolean;
  isBanned: boolean;
  isPermanentReceiver: boolean;
  isEmailConfirmed: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  profileImageUrl?: string;
}