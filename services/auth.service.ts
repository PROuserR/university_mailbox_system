/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResult, ApiResultWithoutData } from "@/types/api/ApiResult";
import { CurrentUserResponse, LoginResponse } from "@/types/api/user";
import myAPI from "@/utils/myAPI";
import userInfoStore from "@/store/userInfoStore";

interface PermissionDto {
    id: number;
    name: string;
    displayName: string;
    category: string | null;
    isGranted: boolean;
}

export const authService = {
  
  // ============================================================
  // ===== Delegated Permissions Management =====
  // ============================================================

  setDelegatedPermissions(permissions: string[]): void {
    userInfoStore.getState().setDelegatedPermissions(permissions);
  },

  getDelegatedPermissions(): string[] {
    return userInfoStore.getState().delegatedPermissions || [];
  },

  async loadDelegatedPermissions(): Promise<string[]> {
    try {
      const response = await myAPI.get<ApiResult<PermissionDto[]>>("/Delegations/my-permissions");
      
      if (!response.data?.isSuccess) {
        return [];
      }
      
      const permissions = response.data.data
        .filter(p => p.isGranted)
        .map(p => p.name);
      
      this.setDelegatedPermissions(permissions);
      userInfoStore.getState().setDelegatedPermissions(permissions);
      return permissions;
    } catch (error) {
      return [];
    }
  },

  async refreshDelegatedPermissions(): Promise<void> {
    await this.loadDelegatedPermissions();
  },

  hasPermission(permissionName: string): boolean {
    const permissions = this.getDelegatedPermissions();
    return permissions.includes(permissionName);
  },

  hasAnyPermission(...permissionNames: string[]): boolean {
    const permissions = this.getDelegatedPermissions();
    return permissionNames.some(p => permissions.includes(p));
  },

  hasAllPermissions(...permissionNames: string[]): boolean {
    const permissions = this.getDelegatedPermissions();
    return permissionNames.every(p => permissions.includes(p));
  },

  // ============================================================
  // ===== Auth API Calls =====
  // ============================================================

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await myAPI.post<ApiResult<LoginResponse>>("/Auth/login", { email, password });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في تسجيل الدخول");
      }
      
      const userData = response.data.data;
      
      await this.loadDelegatedPermissions();
      
      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/logout");
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في تسجيل الخروج");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    } finally {
      this.setDelegatedPermissions([]);
      userInfoStore.getState().setDelegatedPermissions([]);
    }
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    try {
      const response = await myAPI.get<ApiResult<CurrentUserResponse>>("/Auth/me");
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في الحصول على معلومات المستخدم");
      }
      
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  // ============================================================
  // ===== Password Management =====
  // ============================================================

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/change-password", { 
        currentPassword, 
        newPassword 
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في تغيير كلمة المرور");
      }
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/forgot-password", { email });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في إرسال رمز إعادة التعيين");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/reset-password", { 
        email, 
        code, 
        newPassword 
      });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في إعادة تعيين كلمة المرور");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  // ============================================================
  // ===== Token Management =====
  // ============================================================

  async refreshToken(): Promise<void> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/refresh");
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في تحديث الرمز");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  async revokeTokens(): Promise<void> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/revoke-tokens");
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في إبطال الرموز");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

  async ensureValidToken(): Promise<boolean> {
    try {
      const state = userInfoStore.getState();
      if (!state.isLoggedIn || state.id === 0) {
        return false;
      }

      await this.refreshToken();
      return true;
    } catch {
      return false;
    }
  },

  // ============================================================
  // ===== Session Helpers =====
  // ============================================================

  isAuthenticated(): boolean {
    const state = userInfoStore.getState();
    return state.isLoggedIn && state.id > 0;
  },

  getCurrentRole(): string | null {
    const state = userInfoStore.getState();
    return state.role || null;
  }
};