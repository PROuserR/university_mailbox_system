// types/notification.ts

import { PagedResponse } from "./PagedResponse";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "Info" | "Success" | "Warning" | "Error";
  isRead: boolean;
  link?: string;
  createdAt: string;
  readAt?: string;
}
export type NotificationItem = {
    id: number
    title: string
    message: string
    type: "Info" | "Success" | "Warning" | "Error"
    isRead: boolean
    link: string | null
    createdAt: string
    readAt: string | null
}

export interface NotificationsResponse {
  isSuccess: boolean;
  data: NotificationPageResponse;
  message: string;
  errors: string[] | null;
  statusCode: number;
}

export interface NotificationPageResponse extends PagedResponse<Notification> {
  unreadCount: number;
}