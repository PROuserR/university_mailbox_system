/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { profileService } from "@/services/profile.service";
import type { ProfileResponse, UpdateProfileRequest, UserSettings, UpdateSettingsRequest } from "@/types/api/profile";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تحميل الملف الشخصي";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      toast.success("تم تحديث الملف الشخصي بنجاح");
      return updated;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تحديث الملف الشخصي";
      toast.error(message);
      throw err;
    }
  }, []);

  const uploadPicture = useCallback(async (file: File) => {
    try {
      const result = await profileService.uploadProfilePicture(file);
      setProfile(prev => prev ? { ...prev, profileImageUrl: result } : null);
      // toast.success("تم رفع الصورة الشخصية بنجاح");
      // await fetchProfile();
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في رفع الصورة الشخصية";
      toast.error(message);
      throw err;
    }
  }, []);

  const removePicture = useCallback(async () => {
    try {
      await profileService.removeProfilePicture();
      setProfile(prev => prev ? { ...prev, profileImageUrl: undefined } : null);
      // toast.success("تم حذف الصورة الشخصية بنجاح");
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في حذف الصورة الشخصية";
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadPicture,
    removePicture,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getSettings();
      setSettings(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تحميل الإعدادات";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (data: UpdateSettingsRequest) => {
    try {
      const updated = await profileService.updateSettings(data);
      setSettings(updated);
      // toast.success("تم تحديث الإعدادات بنجاح");
      return updated;
    } catch (err: any) {
      const message = err.response?.data?.message || "فشل في تحديث الإعدادات";
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}