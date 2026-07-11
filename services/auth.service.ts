/* eslint-disable @typescript-eslint/no-explicit-any */
// services/auth.service.ts
import { ApiResult, ApiResultWithoutData } from "@/types/api/ApiResult";
import { CurrentUserResponse, LoginResponse } from "@/types/api/user";
import myAPI from "@/utils/myAPI";

export const authService = {
  
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await myAPI.post<ApiResult<LoginResponse>>("/Auth/login", { email, password });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في تسجيل الدخول");
      }
      return response.data.data;
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

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/change-password", { currentPassword, newPassword });
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
      const response = await myAPI.post<ApiResultWithoutData>("/Auth/reset-password", { email, code, newPassword });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "فشل في إعادة تعيين كلمة المرور");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "حدث خطأ في الاتصال";
      throw new Error(message);
    }
  },

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
};