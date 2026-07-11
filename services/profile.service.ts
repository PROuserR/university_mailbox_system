// services/profile.service.ts
import myAPI from "@/utils/myAPI";
import type { ApiResult } from "@/types/api/ApiResult";
import type { ProfileResponse, UpdateProfileRequest, UserSettings, UpdateSettingsRequest } from "@/types/api/profile";

export const profileService = {
  /**
   * Get current user profile
   * GET /api/Profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await myAPI.get<ApiResult<ProfileResponse>>("/Profiles");
    return response.data.data;
  },

  /**
   * Update current user profile
   * PUT /api/Profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await myAPI.put<ApiResult<ProfileResponse>>("/Profiles", data);
    return response.data.data;
  },

  /**
   * Upload profile picture
   * POST /api/Profile/picture
   */
  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await myAPI.post<ApiResult<string>>("/Profiles/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  /**
   * Remove profile picture
   * DELETE /api/Profile/picture
   */
  async removeProfilePicture(): Promise<void> {
    await myAPI.delete("/Profiles/picture");
  },

  /**
   * Get user settings
   * GET /api/Profile/settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await myAPI.get<ApiResult<UserSettings>>("/Profiles/settings");
    return response.data.data;
  },

  /**
   * Update user settings
   * PUT /api/Profile/settings
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<UserSettings> {
    const response = await myAPI.put<ApiResult<UserSettings>>("/Profiles/settings", data);
    return response.data.data;
  },
};