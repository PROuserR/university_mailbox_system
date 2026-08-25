/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import userInfoStore from "@/store/userInfoStore";
import { UserRole } from "@/types/api/user";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializedRef = useRef(false);
  
  const { 
    setId, setEmail, setFirstname, setLastname, setRole, setRoles,
    setIsLoggedIn, clearUser, setPhone, setIsActive, setIsPermanentReceiver, 
    setProfileImageUrl
  } = userInfoStore();

  const initializeUser = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    try {
      const user = await authService.getCurrentUser();
      
      if (user) {
        setId(user.id);
        setEmail(user.email);
        setFirstname(user.firstName);
        setLastname(user.lastName);
        setRoles(user.roles);
        setPhone(user.phone || null);
        setIsActive(user.isActive);
        setIsPermanentReceiver(user.isPermanentReceiver);
        setProfileImageUrl(user.profileImageUrl || null);
        setIsLoggedIn(true);
        
        await authService.loadDelegatedPermissions();
      }
    } catch (err) {
      clearUser();
    } finally {
      setIsInitialized(true);
    }
  }, [
    setId, setEmail, setFirstname, setLastname, setRoles,
    setPhone, setIsActive, setIsPermanentReceiver, setProfileImageUrl,
    setIsLoggedIn, clearUser
  ]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      
      setEmail(user.email);
      setFirstname(user.firstName);
      setLastname(user.lastName);
      setRole(user.role);
      setIsLoggedIn(true);
      
      toast.success(`مرحباً ${user.firstName} ${user.lastName}`);
      
      router.push("/");
      return user;
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في تسجيل الدخول");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, setEmail, setFirstname, setLastname, setRole, setIsLoggedIn]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      clearUser();
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في تسجيل الخروج");
    } finally {
      setIsLoading(false);
    }
  }, [router, clearUser]);

  const getCurrentUser = useCallback(async () => {
    try {
      return await authService.getCurrentUser();
    } catch (err) {
      console.error("Failed to get current user", err);
      return null;
    }
  }, []);

  const hasPermission = useCallback(async (permissionName: string): Promise<boolean> => {
    return await authService.hasPermission(permissionName);
  }, []);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    await authService.refreshDelegatedPermissions();
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    const state = userInfoStore.getState();
    if (!state.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.role as UserRole);
    }
    return state.role === role;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("تم تغيير كلمة المرور بنجاح");
      return true;
    } catch (err: any) {
      toast.error(err.message || "فشل في تغيير كلمة المرور");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("تم إرسال رمز التأكيد. يرجى التحقق من بريدك الإلكتروني");
      return true;
    } catch (err: any) {
      toast.error(err.message || "فشل في إرسال رمز التأكيد");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(email, code, newPassword);
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      return true;
    } catch (err: any) {
      toast.error("فشل في إعادة تعيين كلمة المرور");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    const state = userInfoStore.getState();
    return state.isLoggedIn && state.id > 0;
  }, []);

  return {
    login,
    logout,
    getCurrentUser,
    initializeUser,
    changePassword,
    forgotPassword,
    resetPassword,
    isLoading,
    isInitialized,
    hasPermission,
    refreshPermissions,
    hasRole,
    isAuthenticated,
  };
}