/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useNotifications.ts
"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { notificationService } from "@/services/notification.service";
import { 
  registerNotificationCallback,
  stopSignalRConnection,
} from "@/lib/signalR";
import { authService } from "@/services/auth.service";
import type { NotificationPageData } from "@/types/api/notification";

// ============================================================
// ===== Main Hook =====
// ============================================================

export function useNotifications(pageSize: number = 20) {
  const queryClient = useQueryClient();
  const signalRInitialized = useRef(false);
  const unregisterCallback = useRef<(() => void) | null>(null);

  // ============================================================
  // ===== Query =====
  // ============================================================

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<NotificationPageData>({
    queryKey: ["notifications", "list", pageSize],
    queryFn: async () => {
      return await notificationService.getNotifications(1, pageSize);
    },
    staleTime: 10000,
    refetchInterval: 30000,
    enabled: true,
  });

  // ============================================================
  // ===== Flatten Notifications =====
  // ============================================================

  const notifications = data?.items || [];
  const unreadCount = data?.unreadCount || 0;
  const totalCount = data?.totalCount || 0;

  // ============================================================
  // ===== Handle New Notification from SignalR =====
  // ============================================================

  const handleNewNotification = useCallback(
    async (notification: any) => {
      const notificationType = notification?.Type || notification?.type;

      if (notificationType === "PermissionsUpdated") {
        toast.success("تم تحديث صلاحياتك", {
          duration: 3000,
          icon: "🔑",
        });
        try {
          await authService.refreshDelegatedPermissions();
        } catch (error) {
          // تجاهل
        }
        return;
      }

      if (notification && notification.title) {
        queryClient.setQueryData<NotificationPageData>(
          ["notifications", "list", pageSize],
          (oldData) => {
            if (!oldData || !oldData.items) {
              return {
                items: [notification],
                totalCount: 1,
                pageNumber: 1,
                pageSize: pageSize,
                totalPages: 1,
                unreadCount: 1,
                hasPreviousPage: false,
                hasNextPage: false,
              };
            }
            return {
              ...oldData,
              items: [notification, ...oldData.items],
              unreadCount: (oldData.unreadCount || 0) + 1,
              totalCount: (oldData.totalCount || 0) + 1,
            };
          }
        );

        toast.success(notification.title, {
          duration: 3000,
          position: "top-center",
          icon: "🔔",
        });
      }
    },
    [queryClient, pageSize]
  );

  // ============================================================
  // ===== SignalR =====
  // ============================================================

  useEffect(() => {
    if (signalRInitialized.current) return;
    signalRInitialized.current = true;

    // ✅ تسجيل الـ callback (سيبدأ الاتصال تلقائياً)
    unregisterCallback.current = registerNotificationCallback(handleNewNotification);

    return () => {
      // ✅ إلغاء تسجيل الـ callback
      if (unregisterCallback.current) {
        unregisterCallback.current();
        unregisterCallback.current = null;
      }
      stopSignalRConnection();
      signalRInitialized.current = false;
    };
  }, [handleNewNotification]);

  // ============================================================
  // ===== Actions =====
  // ============================================================

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await notificationService.markAsRead(id);

        queryClient.setQueryData<NotificationPageData>(
          ["notifications", "list", pageSize],
          (oldData) => {
            if (!oldData || !oldData.items) return oldData;
            return {
              ...oldData,
              unreadCount: Math.max(0, (oldData.unreadCount || 0) - 1),
              items: oldData.items.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
              ),
            };
          }
        );

        toast.success("تم تحديد الإشعار كمقروء", { duration: 3000 });
      } catch (err: any) {
        if (err?.message) {
          toast.error(err.message, { duration: 3000 });
        }
      }
    },
    [queryClient, pageSize]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      queryClient.setQueryData<NotificationPageData>(
        ["notifications", "list", pageSize],
        (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          return {
            ...oldData,
            unreadCount: 0,
            items: oldData.items.map((n) => ({ ...n, isRead: true })),
          };
        }
      );

      toast.success("تم تحديد جميع الإشعارات كمقروءة", { duration: 3000 });
    } catch (err: any) {
      if (err?.message) {
        toast.error(err.message, { duration: 3000 });
      }
    }
  }, [queryClient, pageSize]);

  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        await notificationService.deleteNotification(id);

        queryClient.setQueryData<NotificationPageData>(
          ["notifications", "list", pageSize],
          (oldData) => {
            if (!oldData || !oldData.items) return oldData;
            const deletedItem = oldData.items.find((n) => n.id === id);
            return {
              ...oldData,
              items: oldData.items.filter((n) => n.id !== id),
              totalCount: Math.max(0, (oldData.totalCount || 0) - 1),
              unreadCount: deletedItem && !deletedItem.isRead
                ? Math.max(0, (oldData.unreadCount || 0) - 1)
                : oldData.unreadCount,
            };
          }
        );

        toast.success("تم حذف الإشعار", { duration: 3000 });
      } catch (err: any) {
        if (err?.message) {
          toast.error(err.message, { duration: 3000 });
        }
      }
    },
    [queryClient, pageSize]
  );

  const refreshPermissions = useCallback(async () => {
    try {
      await authService.refreshDelegatedPermissions();
      toast.success("تم تحديث الصلاحيات", {
        duration: 3000,
        icon: "🔑",
      });
    } catch (error) {
      // تجاهل
    }
  }, []);

  // ============================================================
  // ===== Return =====
  // ============================================================

  return {
    notifications,
    totalCount,
    unreadCount,
    isLoading,
    loadingMore: false,
    hasMore: false,
    loadMore: () => {},
    refresh: refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshPermissions,
  };
}

// ============================================================
// ===== Unread Count Only =====
// ============================================================

export function useUnreadCount() {
  const queryClient = useQueryClient();
  const signalRInitialized = useRef(false);
  const unregisterCallback = useRef<(() => void) | null>(null);

  const { data, isLoading, refetch } = useQuery<number>({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      return await notificationService.getUnreadCount();
    },
    staleTime: 10000,
    refetchInterval: 30000,
    enabled: true,
  });

  useEffect(() => {
    if (signalRInitialized.current) return;
    signalRInitialized.current = true;

    const handleNewNotification = (notification: any) => {
      const notificationType = notification?.Type || notification?.type;

      if (notificationType === "PermissionsUpdated") {
        authService.refreshDelegatedPermissions().catch(() => {});
        toast.success("تم تحديث صلاحياتك", {
          duration: 3000,
          icon: "🔑",
        });
        return;
      }

      queryClient.setQueryData<number>(
        ["notifications", "unreadCount"],
        (old) => {
          return ((old as number) || 0) + 1;
        }
      );
    };

    unregisterCallback.current = registerNotificationCallback(handleNewNotification);

    return () => {
      if (unregisterCallback.current) {
        unregisterCallback.current();
        unregisterCallback.current = null;
      }
      stopSignalRConnection();
      signalRInitialized.current = false;
    };
  }, []);

  return {
    unreadCount: data || 0,
    loading: isLoading,
    refetch,
  };
}