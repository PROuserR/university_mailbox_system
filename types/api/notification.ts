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


export interface NotificationPageResponse extends PagedResponse<Notification> {
  unreadCount: number;
}