/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService} from "@/services/auth.service";
import userInfoStore from "@/store/userInfoStore";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    setId, setEmail, setFirstname, setLastname, setRole, setRoles,
    setIsLoggedIn, clearUser, setPhone, setIsActive, setIsPermanentReceiver, setProfileImageUrl
  } = userInfoStore();

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      
      // تخزين معلومات المستخدم الأساسية
      setEmail(user.email);
      setFirstname(user.firstName);
      setLastname(user.lastName);
      setRole(user.role);
      setIsLoggedIn(true);
      
      toast.success(`مرحباً ${user.firstName} ${user.lastName}`);
      
      // التوجيه حسب الدور
      // switch (user.role) {
      //   case "Dean":
      //     router.push("/dean/dashboard");
      //     break;
      //   case "Employee":
      //     router.push("/dashboard");
      //     break;
      //   default:
      //     router.push("/receiver/dashboard");
      // }
      router.push("/")
      return user;
    } catch (err: any) {
      toast.error(err.message ||"حدث خطأ في تسجيل الدخول");
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
      const user = await authService.getCurrentUser();
      setId(user.id);
      setEmail(user.email);
      setFirstname(user.firstName);
      setLastname(user.lastName);
      setRole(user.role);
      setRoles(user.roles);
      setPhone(user.phone || null);
      setIsActive(user.isActive);
      setIsPermanentReceiver(user.isPermanentReceiver);
      setProfileImageUrl(user.profileImageUrl || null);
      setIsLoggedIn(true);
      return user;
    } catch (err) {
      console.error("Failed to get current user", err);
      return null;
    }
  }, [setId, setEmail, setFirstname, setLastname, setRole, setRoles, setPhone, setIsActive, setIsPermanentReceiver, setProfileImageUrl, setIsLoggedIn]);

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

  return {
    login,
    logout,
    getCurrentUser,
    changePassword,
    forgotPassword,
    resetPassword,
    isLoading,
  };
}