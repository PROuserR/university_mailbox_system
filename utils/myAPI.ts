// utils/myAPI.ts
import axios from "axios";
import { authService } from "@/services/auth.service";
import userInfoStore from "@/store/userInfoStore";
import toast from "react-hot-toast";

const myAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api",
  withCredentials: true
});

let isRefreshingPermissions = false;
let refreshPermissionPromise: Promise<void> | null = null;

// ============================================================
// ===== Request Interceptor =====
// ============================================================

myAPI.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ============================================================
// ===== Response Interceptor =====
// ============================================================

myAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ===== معالجة 401 =====
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();
        return myAPI(originalRequest);
      } catch {
        authService.logout();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
    }

    // ===== معالجة 403 =====
    if (error.response?.status === 403 && !originalRequest._permissionRetry) {
      originalRequest._permissionRetry = true;

      const permissionName =
        error.response?.data?.requiredPermission ||
        error.response?.data?.permission ||
        error.response?.data?.policy;

      if (isRefreshingPermissions) {
        await refreshPermissionPromise;
        return myAPI(originalRequest);
      }

      isRefreshingPermissions = true;

      try {
        refreshPermissionPromise = authService.refreshDelegatedPermissions();
        await refreshPermissionPromise;

        const state = userInfoStore.getState();
        const delegatedPermissions = state.delegatedPermissions || [];

        if (permissionName && delegatedPermissions.includes(permissionName)) {
          return myAPI(originalRequest);
        }

        if (delegatedPermissions.length > 0) {
          return myAPI(originalRequest);
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem("redirectAfterAuth", window.location.pathname);
          window.location.href = "/unauthorized";
        }

        return Promise.reject(error);
      } catch {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("redirectAfterAuth", window.location.pathname);
          window.location.href = "/unauthorized";
        }
        return Promise.reject(error);
      } finally {
        isRefreshingPermissions = false;
        refreshPermissionPromise = null;
      }
    }

    // ===== معالجة أخطاء الشبكة =====
    if (!error.response) {
      toast.error("خطأ في الاتصال بالخادم");
    }

    return Promise.reject(error);
  }
);

export default myAPI;
