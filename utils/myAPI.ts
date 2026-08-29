/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/myAPI.ts
import axios from "axios";
import { authService } from "@/services/auth.service";
import userInfoStore from "@/store/userInfoStore";
import toast from "react-hot-toast";

const myAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api",
  withCredentials: true,
});

let isRefreshingToken = false;
let refreshTokenPromise: Promise<void> | null = null;
let isRefreshingPermissions = false;
let refreshPermissionPromise: Promise<void> | null = null;

const updateUserData = async (): Promise<boolean> => {
  try {
    const user = await authService.getCurrentUser();
    const store = userInfoStore.getState();
    
    store.setUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      userName: user.userName,
      roles: user.roles,
      phone: user.phone || null,
      isActive: user.isActive,
      isPermanentReceiver: user.isPermanentReceiver,
      isEmailConfirmed: user.isEmailConfirmed,
      isHeadOfDepartment: user.isHeadOfDepartment,
      departmentId: user.departmentId || null,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || null,
      profileImageUrl: user.profileImageUrl || null,
    });
    
    await authService.loadDelegatedPermissions();
    return true;
  } catch {
    return false;
  }
};

myAPI.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

myAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/logout") || originalRequest.url?.includes("/refresh")) {
      return Promise.reject(error);
    }

    // ============================================================
    // ===== 401 Unauthorized - Refresh Token =====
    // ============================================================
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshingToken) {
        await refreshTokenPromise;
        return myAPI(originalRequest);
      }

      isRefreshingToken = true;

      try {
        refreshTokenPromise = authService.refreshToken();
        await refreshTokenPromise;
        
        const updated = await updateUserData();
        
        if (!updated) {
          if (typeof window !== "undefined") {
            toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى", { duration: 5000 });
            window.location.href = "/auth/login";
          }
          return Promise.reject(error);
        }
        
        return myAPI(originalRequest);
      } catch (refreshError: any) {
        if (typeof window !== "undefined") {
          userInfoStore.getState().clearUser();
          toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى", { duration: 5000 });
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
        refreshTokenPromise = null;
      }
    }

    // ============================================================
    // ===== 403 Forbidden =====
    // ============================================================
    
    if (error.response?.status === 403 && !originalRequest._permissionRetry) {
      originalRequest._permissionRetry = true;

      const store = userInfoStore.getState();
      const hasExistingPermissions = store.delegatedPermissions?.length > 0;

      if (isRefreshingPermissions) {
        await refreshPermissionPromise;
        const updatedStore = userInfoStore.getState();
        if (updatedStore.delegatedPermissions?.length > 0) {
          return myAPI(originalRequest);
        }
        redirectToUnauthorized();
        return Promise.reject(error);
      }

      isRefreshingPermissions = true;

      try {
        refreshPermissionPromise = authService.refreshDelegatedPermissions();
        await refreshPermissionPromise;
        await updateUserData();

        const updatedStore = userInfoStore.getState();
        if (updatedStore.delegatedPermissions?.length > 0) {
          return myAPI(originalRequest);
        }

        const currentStore = userInfoStore.getState();
        if (currentStore.isLoggedIn) {
          redirectToUnauthorized();
        } else {
          if (typeof window !== "undefined") {
            toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى", { duration: 5000 });
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);

      } catch {
        const currentStore = userInfoStore.getState();
        
        if (hasExistingPermissions && currentStore.delegatedPermissions?.length > 0) {
          return myAPI(originalRequest);
        }
        
        if (currentStore.isLoggedIn) {
          redirectToUnauthorized();
        } else {
          if (typeof window !== "undefined") {
            toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى", { duration: 5000 });
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      } finally {
        isRefreshingPermissions = false;
        refreshPermissionPromise = null;
      }
    }

    if (!error.response && typeof window !== "undefined") {
      toast.error("خطأ في الاتصال بالخادم", { duration: 5000 });
    }

    return Promise.reject(error);
  }
);

const redirectToUnauthorized = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("redirectAfterAuth", window.location.pathname);
    window.location.href = "/unauthorized";
  }
};

export default myAPI;