// types/profile.ts

/**
 * Profile Response DTO
 */
export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  roles: string[];
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Update Profile Request DTO
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * User Settings DTO
 */
export interface UserSettings {
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  notifyOnDistribution: boolean;
  notifyOnCorrespondenceUpdate: boolean;
  notifyOnDeanChange: boolean;
  theme: string;
  language: string;
  itemsPerPage: number;
  compactView: boolean;
  defaultDashboard: string;
}

/**
 * Update Settings Request DTO
 */
export interface UpdateSettingsRequest {
  enableEmailNotifications?: boolean;
  enableInAppNotifications?: boolean;
  notifyOnDistribution?: boolean;
  notifyOnCorrespondenceUpdate?: boolean;
  notifyOnDeanChange?: boolean;
  theme?: string;
  language?: string;
  itemsPerPage?: number;
  compactView?: boolean;
  defaultDashboard?: string;
}