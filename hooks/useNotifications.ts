/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { notificationService } from "@/services/notification.service";
import { startSignalRConnection, stopSignalRConnection } from "@/lib/signalR";
import { authService } from "@/services/auth.service";
import type { Notification, NotificationPageResponse } from "@/types/api/notification";

export function useNotifications(pageSize: number = 10) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const signalRInitialized = useRef(false);
  const isLoadingMoreRef = useRef(false);

  const fetchNotifications = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore && isLoadingMoreRef.current) return;
    
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
      isLoadingMoreRef.current = true;
    }

    try {
      const result: NotificationPageResponse = await notificationService.getNotifications(page, pageSize);
      
      if (isLoadMore) {
        setNotifications(prev => [...prev, ...result.items]);
      } else {
        setNotifications(result.items);
      }
      
      setUnreadCount(result.unreadCount);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.pageNumber);
      setHasMore(result.pageNumber < result.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      toast.error(err.response?.data?.message || "فشل في تحميل الإشعارات");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [pageSize]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading || isLoadingMoreRef.current) return;
    const nextPage = currentPage + 1;
    fetchNotifications(nextPage, true);
  }, [hasMore, loadingMore, loading, currentPage, fetchNotifications]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  const handleNewNotification = useCallback(async (notification: any) => {
    console.log("🔔 Real-time notification received:", notification);

    const notificationType = notification?.Type || notification?.type;

    if (notificationType === "PermissionsUpdated") {
      toast.success("تم تحديث صلاحياتك", {
        duration: 3000,
        icon: "🔑",
      });
      
      try {
        await authService.refreshDelegatedPermissions();
      } catch (error) {
        console.error("Failed to refresh permissions:", error);
      }
      return;
    }

    if (notification && notification.title) {
      setUnreadCount(prev => prev + 1);
      setTotalCount(prev => prev + 1);
      
      if (currentPage === 1) {
        setNotifications(prev => [notification, ...prev]);
      }
      
      toast.success(notification.title, {
        duration: 3000,
        position: "top-center",
        icon: "🔔",
      });
    }
  }, [currentPage]);

  // ============================================================
  // ===== SignalR Initialization =====
  // ============================================================

  useEffect(() => {
    if (signalRInitialized.current) return;
    signalRInitialized.current = true;

    startSignalRConnection(handleNewNotification);

    return () => {
      stopSignalRConnection();
      signalRInitialized.current = false;
    };
  }, [handleNewNotification]);

  // ============================================================
  // ===== Initial Fetch =====
  // ============================================================

  useEffect(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // ============================================================
  // ===== Actions =====
  // ============================================================

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في تحديد الإشعار كمقروء");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في تحديد الإشعارات كمقروءة");
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => prev - 1);
      const deletedNotif = notifications.find(n => n.id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success("تم حذف الإشعار");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في حذف الإشعار");
    }
  }, [notifications]);

  const refreshPermissions = useCallback(async () => {
    try {
      await authService.refreshDelegatedPermissions();
      toast.success("تم تحديث الصلاحيات", { icon: "🔑" });
    } catch (error) {
      toast.error("فشل تحديث الصلاحيات");
      console.error("Failed to refresh permissions:", error);
    }
  }, []);

  return {
    notifications,
    totalCount,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    currentPage,
    totalPages,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
    refetchUnreadCount: fetchUnreadCount,
    refreshPermissions,
  };
}

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const signalRInitialized = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (signalRInitialized.current) return;
    signalRInitialized.current = true;

    const handleNewNotification = (notification: any) => {
      const notificationType = notification?.Type || notification?.type;
      
      if (notificationType === "PermissionsUpdated") {
        authService.refreshDelegatedPermissions().catch(console.error);
        toast.success("تم تحديث صلاحياتك", {
          duration: 5000,
          icon: "🔑",
        });
      }
      fetchUnreadCount();
    };

    startSignalRConnection(handleNewNotification);

    return () => {
      stopSignalRConnection();
      signalRInitialized.current = false;
    };
  }, [fetchUnreadCount]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
}