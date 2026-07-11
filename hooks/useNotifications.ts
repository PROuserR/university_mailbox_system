/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { notificationService } from "@/services/notification.service";
import { startSignalRConnection, stopSignalRConnection } from "@/lib/signalR";
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

  // جلب الصفحة الأولى أو Refresh
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

  // تحميل المزيد (الصفحة التالية)
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading || isLoadingMoreRef.current) return;
    const nextPage = currentPage + 1;
    fetchNotifications(nextPage, true);
  }, [hasMore, loadingMore, loading, currentPage, fetchNotifications]);

  // إعادة تحميل الصفحة الأولى
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // جلب عدد غير المقروء فقط
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // SignalR for real-time notifications
  useEffect(() => {
    if (signalRInitialized.current) return;
    signalRInitialized.current = true;

    const handleNewNotification = async (notification: Notification) => {
      console.log("🔔 Real-time notification received:", notification);
      
      // تحديث العدد غير المقروء
      setUnreadCount(prev => prev + 1);
      setTotalCount(prev => prev + 1);
      
      // إضافة الإشعار الجديد إلى بداية القائمة (إذا كنا في الصفحة الأولى)
      if (currentPage === 1) {
        setNotifications(prev => [notification, ...prev]);
      }
      
      // عرض Toast
      toast.success(notification.title, {
        duration: 5000,
        position: "top-center",
        icon: "🔔",
      });
    };

    startSignalRConnection(handleNewNotification);

    return () => {
      stopSignalRConnection();
      signalRInitialized.current = false;
    };
  }, [currentPage]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      // تحديث القائمة محلياً
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
      // تحديث القائمة محلياً
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

  // SignalR for real-time updates
  useEffect(() => {
    if (signalRInitialized.current) return;
    signalRInitialized.current = true;

    const handleNewNotification = () => {
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