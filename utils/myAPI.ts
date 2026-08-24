// utils/myAPI.ts
import axios from "axios";
import { authService } from "@/services/auth.service";
import { delegationService } from "@/services/delegation.service";
import userInfoStore from "@/store/userInfoStore";
// import { authorizationService } from "@/services/authorization.service";
import toast from "react-hot-toast";

const myAPI = axios.create({   
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api",
  withCredentials: true
});

// ============================================================
// ===== Request Interceptor - مبسط =====
// ============================================================

myAPI.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// ===== Response Interceptor =====
// ============================================================

myAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ===== معالجة 401 - محاولة تجديد التوكن مرة واحدة فقط =====
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

  const permissionName = error.response?.data?.requiredPermission || 
                        error.response?.data?.permission ||
                        error.response?.data?.policy;

  console.log(`🔒 403 Forbidden - Permission: ${permissionName || 'unknown'}`);

  try {
    const permissions = await delegationService.getMyPermissions();
    const grantedPermissions = permissions
      .filter(p => p.isGranted)
      .map(p => p.name);

    const store = userInfoStore.getState();
    store.setPermissions(grantedPermissions);
    
    authService.setDelegatedPermissions(grantedPermissions);

    if (permissionName && grantedPermissions.includes(permissionName)) {
      console.log(`✅ Permission "${permissionName}" granted, retrying`);
      return myAPI(originalRequest);
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);

  } catch (refreshError) {
    console.error("Failed to refresh permissions:", refreshError);
    return Promise.reject(error);
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