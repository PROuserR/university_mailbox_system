// components/dropdown/NotificationsDropdown.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faCircleInfo,
    faTriangleExclamation,
    faSpinner,
    faXmark,
    faCircleCheck,
    faCheck,
    faCheckDouble,
    faTrash,
    faInbox,
} from "@fortawesome/free-solid-svg-icons";

import { apiWrapper } from "@/utils/apiClient";
import { NotificationsResponse } from "@/types/api/Notifications/NotificationsResponse";
import { NotificationItem } from "@/types/api/Notifications/NotificationItem";

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useQuery<NotificationsResponse>({
        queryKey: ["notifications"],
        queryFn: async (): Promise<NotificationsResponse> => {
            try {
                const response = await apiWrapper.get<NotificationsResponse>(
                    "/Notifications"
                );

                if (!response.data) {
                    throw new Error("لم يتم العثور على بيانات الإشعارات");
                }

                return response.data;
            } catch (error) {
                toast.error("فشل في تحميل الإشعارات");
                throw error;
            }
        },
        refetchInterval: 30000,
        enabled: true,
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId: number) => {
            await apiWrapper.post(`/Notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast.error("فشل في تحديد الإشعار كمقروء");
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await apiWrapper.post("/Notifications/read-all");
        },
        onSuccess: () => {
            toast.success("تم تحديد جميع الإشعارات كمقروءة");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast.error("فشل في تحديد جميع الإشعارات كمقروءة");
        },
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: async (notificationId: number) => {
            await apiWrapper.delete(`Notifications/${notificationId}`);
        },
        onSuccess: () => {
            toast.success("تم حذف الإشعار");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast.error("فشل في حذف الإشعار");
        },
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const notifications = data?.data?.items || [];
    const unreadCount = data?.data?.unreadCount || 0;

    const getNotificationIcon = (type: NotificationItem["type"]) => {
        switch (type) {
            case "Success": return faCircleCheck;
            case "Warning": return faTriangleExclamation;
            case "Error": return faXmark;
            default: return faCircleInfo;
        }
    };

    const getNotificationStyle = (type: NotificationItem["type"]) => {
        switch (type) {
            case "Success": return "bg-green-50 text-green-600 border-green-100";
            case "Warning": return "bg-yellow-50 text-yellow-600 border-yellow-100";
            case "Error": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-blue-50 text-blue-600 border-blue-100";
        }
    };

    const getNotificationBg = (type: NotificationItem["type"], isRead: boolean) => {
        if (isRead) return "bg-white hover:bg-gray-50";
        switch (type) {
            case "Success": return "bg-green-50/60 hover:bg-green-50";
            case "Warning": return "bg-yellow-50/60 hover:bg-yellow-50";
            case "Error": return "bg-red-50/60 hover:bg-red-50";
            default: return "bg-blue-50/60 hover:bg-blue-50";
        }
    };

    const handleReadNotification = async (notificationId: number) => {
        try {
            await markAsReadMutation.mutateAsync(notificationId);
        } catch {
            // خطأ تم معالجته في الـ mutation
        }
    };

    return (
        <div className="relative z-10" ref={dropdownRef} dir="rtl">
            {/* ===== زر الجرس ===== */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative w-8 h-8 rounded-xl bg-white/80 border border-blue-200/50 text-blue-600 hover:bg-blue-50 transition flex items-center justify-center"
            >
                <FontAwesomeIcon icon={faBell} className="text-sm" />

                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[8px] font-bold px-0.5"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.div>
                )}
            </button>

            {/* ===== القائمة المنسدلة ===== */}
           <AnimatePresence>
    {open && (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute mt-2 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl
                w-[360px]
                max-sm:w-[calc(100vw-32px)] max-sm:max-w-[300px]
                left-0 max-sm:left-[-20px] max-sm:-translate-x-1/2
                max-sm:origin-top"
        >
                        {/* ===== الهيدر ===== */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBell} className="text-[10px]" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-bold text-gray-800">الإشعارات</h2>
                                    <p className="text-[9px] text-gray-400">
                                        {unreadCount} غير مقروءة
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsReadMutation.mutate()}
                                        disabled={markAllAsReadMutation.isPending}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[9px] font-medium hover:bg-blue-600 transition disabled:opacity-50"
                                    >
                                        {markAllAsReadMutation.isPending ? (
                                            <FontAwesomeIcon icon={faSpinner} spin className="text-[7px]" />
                                        ) : (
                                            <FontAwesomeIcon icon={faCheckDouble} className="text-[7px]" />
                                        )}
                                        الكل
                                    </button>
                                )}

                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-6 h-6 rounded-lg hover:bg-gray-100 transition flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                </button>
                            </div>
                        </div>

                        {/* ===== المحتوى ===== */}
                        <div className="max-h-[350px] overflow-y-auto">
                            {/* تحميل */}
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-blue-600">
                                    <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                                    <p className="text-[10px]">جاري تحميل الإشعارات...</p>
                                </div>
                            )}

                            {/* خطأ */}
                            {isError && (
                                <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-yellow-500">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
                                    <p className="text-[10px]">فشل في تحميل الإشعارات</p>
                                    <button
                                        onClick={() => refetch()}
                                        className="mt-1 px-3 py-0.5 rounded-lg bg-yellow-100 text-yellow-700 text-[9px] hover:bg-yellow-200 transition"
                                    >
                                        إعادة المحاولة
                                    </button>
                                </div>
                            )}

                            {/* فارغ */}
                            {!isLoading && !isError && notifications.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1.5">
                                        <FontAwesomeIcon icon={faInbox} className="text-lg" />
                                    </div>
                                    <p className="text-[10px] font-medium">لا توجد إشعارات</p>
                                    <p className="text-[9px]">ستظهر الإشعارات هنا عند ورودها</p>
                                </div>
                            )}

                            {/* القائمة */}
                            {!isLoading && !isError && notifications.length > 0 && (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification, index) => {
                                        const NotificationContent = (
                                            <div
                                                className={`p-2.5 transition-all duration-150 cursor-pointer ${getNotificationBg(notification.type, notification.isRead)}`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    {/* أيقونة */}
                                                    <div
                                                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationStyle(notification.type)}`}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={getNotificationIcon(notification.type)}
                                                            className="text-[9px]"
                                                        />
                                                    </div>

                                                    {/* المحتوى */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-1.5">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-semibold text-gray-800 truncate">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-[9px] text-gray-600 mt-0.5 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-[8px] text-gray-400 mt-0.5">
                                                                    {new Date(notification.createdAt).toLocaleString("ar", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        day: "numeric",
                                                                        month: "short",
                                                                    })}
                                                                </p>
                                                            </div>

                                                            {/* نقطة غير مقروء */}
                                                            {!notification.isRead && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                                                            )}
                                                        </div>

                                                        {/* الأزرار */}
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleReadNotification(notification.id);
                                                                    }}
                                                                    disabled={markAsReadMutation.isPending}
                                                                    className="px-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-medium hover:bg-blue-100 transition disabled:opacity-50 flex items-center gap-0.5"
                                                                >
                                                                    {markAsReadMutation.isPending ? (
                                                                        <FontAwesomeIcon icon={faSpinner} spin className="text-[6px]" />
                                                                    ) : (
                                                                        <FontAwesomeIcon icon={faCheck} className="text-[6px]" />
                                                                    )}
                                                                    مقروء
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    deleteNotificationMutation.mutate(notification.id);
                                                                }}
                                                                disabled={deleteNotificationMutation.isPending}
                                                                className="px-1.5 py-0.5 rounded-lg bg-red-50 text-red-500 text-[8px] font-medium hover:bg-red-100 transition disabled:opacity-50 flex items-center gap-0.5"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="text-[6px]" />
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                            >
                                                {notification.link ? (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => {
                                                            if (!notification.isRead) {
                                                                handleReadNotification(notification.id);
                                                            }
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {NotificationContent}
                                                    </Link>
                                                ) : (
                                                    NotificationContent
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ===== الفوتر ===== */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-100 p-1.5 text-center">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="text-[9px] text-blue-500 hover:text-blue-700 font-medium transition"
                                >
                                    عرض جميع الإشعارات
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}