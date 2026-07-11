// services/notification.service.ts
import myAPI from "@/utils/myAPI";
import type { ApiResult } from "@/types/api/ApiResult";
import type {
  Notification,
  NotificationPageResponse,
} from "@/types/api/notification";

export const notificationService = {
  /**
   * Get paginated notifications with unread count
   * GET /api/Notification?page=1&pageSize=20
   */
  async getNotifications(
    page: number = 1,
    pageSize: number = 20
  ): Promise<NotificationPageResponse> {
    const response = await myAPI.get<ApiResult<NotificationPageResponse>>(
      "/Notifications",
      {
        params: { page, pageSize },
      }
    );
    return response.data.data;
  },

  /**
   * Get unread notifications
   * GET /api/Notification/unread
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await myAPI.get<ApiResult<Notification[]>>(
      "/Notifications/unread"
    );
    return response.data.data;
  },

  /**
   * Get unread count
   * GET /api/Notification/unread-count
   */
  async getUnreadCount(): Promise<number> {
    const response = await myAPI.get<ApiResult<number>>(
      "/Notifications/unread-count"
    );
    return response.data.data;
  },

  /**
   * Mark a notification as read
   * POST /api/Notification/{id}/read
   */
  async markAsRead(id: number): Promise<void> {
    await myAPI.post(`/Notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   * POST /api/Notification/read-all
   */
  async markAllAsRead(): Promise<void> {
    await myAPI.post("/Notifications/read-all");
  },

  /**
   * Delete a notification
   * DELETE /api/Notification/{id}
   */
  async deleteNotification(id: number): Promise<void> {
    await myAPI.delete(`/Notifications/${id}`);
  },
};
