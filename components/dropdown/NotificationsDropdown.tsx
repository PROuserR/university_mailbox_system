"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
} from "@fortawesome/free-solid-svg-icons"

import { apiWrapper } from "@/utils/apiClient"

import { NotificationsResponse } from "@/types/api/Notifications/NotificationsResponse"
import { NotificationItem } from "@/types/api/Notifications/NotificationItem"

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false)

    const dropdownRef =
        useRef<HTMLDivElement>(null)

    const queryClient = useQueryClient()

    const {
        data,
        isLoading,
        isError,
    } = useQuery<NotificationsResponse>({
        queryKey: ["notifications"],

        queryFn:
            async (): Promise<NotificationsResponse> => {
                try {
                    const response =
                        await apiWrapper.get<NotificationsResponse>(
                            "/Notifications"
                        )

                    if (!response.data) {
                        throw new Error(
                            "لم يتم العثور على بيانات الإشعارات"
                        )
                    }

                    return response.data
                } catch (error) {
                    toast.error(
                        "فشل في تحميل الإشعارات"
                    )

                    throw error
                }
            },

        refetchInterval: 30000,
    })

    // تحديد إشعار كمقروء
    const markAsReadMutation =
        useMutation({
            mutationFn: async (
                notificationId: number
            ) => {
                await apiWrapper.post(
                    `/Notifications/${notificationId}/read`
                )
            },

            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [
                        "notifications",
                    ],
                })
            },

            onError: () => {
                toast.error(
                    "فشل في تحديد الإشعار كمقروء"
                )
            },
        })

    // تحديد جميع الإشعارات كمقروءة
    const markAllAsReadMutation =
        useMutation({
            mutationFn: async () => {
                await apiWrapper.post(
                    "/Notifications/read-all"
                )
            },

            onSuccess: () => {
                toast.success(
                    "تم تحديد جميع الإشعارات كمقروءة"
                )

                queryClient.invalidateQueries({
                    queryKey: [
                        "notifications",
                    ],
                })
            },

            onError: () => {
                toast.error(
                    "فشل في تحديد جميع الإشعارات كمقروءة"
                )
            },
        })

    // حذف إشعار
    const deleteNotificationMutation =
        useMutation({
            mutationFn: async (
                notificationId: number
            ) => {
                await apiWrapper.delete(
                    `Notifications/${notificationId}`
                )
            },

            onSuccess: () => {
                toast.success(
                    "تم حذف الإشعار"
                )

                queryClient.invalidateQueries({
                    queryKey: [
                        "notifications",
                    ],
                })
            },

            onError: () => {
                toast.error(
                    "فشل في حذف الإشعار"
                )
            },
        })

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false)
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        )

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            )
        }
    }, [])

    const notifications =
        data?.data?.items || []

    const unreadCount =
        data?.data?.unreadCount || 0

    const getNotificationIcon = (
        type: NotificationItem["type"]
    ) => {
        switch (type) {
            case "Success":
                return faCircleCheck

            case "Warning":
                return faTriangleExclamation

            case "Error":
                return faXmark

            default:
                return faCircleInfo
        }
    }

    const getNotificationStyle = (
        type: NotificationItem["type"]
    ) => {
        switch (type) {
            case "Success":
                return "bg-green-100 text-green-600"

            case "Warning":
                return "bg-yellow-100 text-yellow-600"

            case "Error":
                return "bg-red-100 text-red-600"

            default:
                return "bg-blue-100 text-blue-600"
        }
    }

    const handleReadNotification =
        async (
            notificationId: number
        ) => {
            try {
                await markAsReadMutation.mutateAsync(
                    notificationId
                )
            } catch {
                //
            }
        }

    return (
        <div
            className="relative z-10"
            ref={dropdownRef}
            dir="rtl"
        >
            {/* زر الجرس */}
            <button
                onClick={() =>
                    setOpen((prev) => !prev)
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg transition hover:bg-blue-700"
            >
                <FontAwesomeIcon
                    icon={faBell}
                    className="cursor-pointer text-base"
                />

                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -left-1 -top-1 flex h-4 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-bold text-black"
                    >
                        {unreadCount}
                    </motion.div>
                )}
            </button>

            {/* القائمة المنسدلة */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10,
                            scale: 0.95,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -10,
                            scale: 0.95,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="absolute left-0 z-50 mt-3 w-[390px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl"
                    >
                        {/* الهيدر */}
                        <div className="border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-white">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        الإشعارات
                                    </h2>

                                    <p className="text-sm text-blue-100">
                                        {unreadCount}{" "}
                                        غير مقروءة
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {unreadCount >
                                        0 && (
                                            <button
                                                onClick={() =>
                                                    markAllAsReadMutation.mutate()
                                                }
                                                disabled={
                                                    markAllAsReadMutation.isPending
                                                }
                                                className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {markAllAsReadMutation.isPending ? (
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faSpinner
                                                        }
                                                        spin
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faCheckDouble
                                                        }
                                                    />
                                                )}

                                                تحديد
                                                الكل
                                                كمقروء
                                            </button>
                                        )}

                                    <button
                                        onClick={() =>
                                            setOpen(
                                                false
                                            )
                                        }
                                        className="rounded-full p-2 transition hover:bg-white/10"
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                faXmark
                                            }
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* المحتوى */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center gap-3 py-10 text-blue-600">
                                    <FontAwesomeIcon
                                        icon={
                                            faSpinner
                                        }
                                        spin
                                        className="text-2xl"
                                    />

                                    <p className="text-sm">
                                        جاري تحميل
                                        الإشعارات...
                                    </p>
                                </div>
                            )}

                            {isError && (
                                <div className="flex flex-col items-center justify-center gap-3 py-10 text-yellow-500">
                                    <FontAwesomeIcon
                                        icon={
                                            faTriangleExclamation
                                        }
                                        className="text-2xl"
                                    />

                                    <p className="text-sm">
                                        فشل في تحميل
                                        الإشعارات
                                    </p>
                                </div>
                            )}

                            {!isLoading &&
                                notifications.length ===
                                0 && (
                                    <div className="py-10 text-center text-gray-500">
                                        لا توجد
                                        إشعارات
                                    </div>
                                )}

                            {!isLoading &&
                                notifications.map(
                                    (
                                        notification
                                    ) => {
                                        const NotificationContent =
                                            (
                                                <div
                                                    className={`group border-b border-gray-100 p-4 transition hover:bg-blue-50 ${!notification.isRead
                                                            ? "bg-blue-50/40"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl ${getNotificationStyle(
                                                                notification.type
                                                            )}`}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={getNotificationIcon(
                                                                    notification.type
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="font-semibold text-gray-800">
                                                                            {
                                                                                notification.title
                                                                            }
                                                                        </h3>

                                                                        {!notification.isRead && (
                                                                            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                                                        )}
                                                                    </div>

                                                                    <p className="mt-1 text-sm text-gray-600">
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </p>

                                                                    <p className="mt-2 text-xs text-gray-400">
                                                                        {new Date(
                                                                            notification.createdAt
                                                                        ).toLocaleString(
                                                                            "ar"
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                                                                    {!notification.isRead && (
                                                                        <button
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()

                                                                                handleReadNotification(
                                                                                    notification.id
                                                                                )
                                                                            }}
                                                                            disabled={
                                                                                markAsReadMutation.isPending
                                                                            }
                                                                            className="flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    markAsReadMutation.isPending
                                                                                        ? faSpinner
                                                                                        : faCheck
                                                                                }
                                                                                spin={
                                                                                    markAsReadMutation.isPending
                                                                                }
                                                                            />

                                                                            مقروء
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault()
                                                                            e.stopPropagation()

                                                                            deleteNotificationMutation.mutate(
                                                                                notification.id
                                                                            )
                                                                        }}
                                                                        disabled={
                                                                            deleteNotificationMutation.isPending
                                                                        }
                                                                        className="flex items-center gap-1 rounded-xl bg-yellow-500 px-2.5 py-1.5 text-xs font-medium text-black shadow-md transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                deleteNotificationMutation.isPending
                                                                                    ? faSpinner
                                                                                    : faTrash
                                                                            }
                                                                            spin={
                                                                                deleteNotificationMutation.isPending
                                                                            }
                                                                        />

                                                                        حذف
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )

                                        return (
                                            <motion.div
                                                key={
                                                    notification.id
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    y: 10,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                            >
                                                {notification.link ? (
                                                    <Link
                                                        href={
                                                            notification.link
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                !notification.isRead
                                                            ) {
                                                                handleReadNotification(
                                                                    notification.id
                                                                )
                                                            }

                                                            setOpen(
                                                                false
                                                            )
                                                        }}
                                                    >
                                                        {
                                                            NotificationContent
                                                        }
                                                    </Link>
                                                ) : (
                                                    NotificationContent
                                                )}
                                            </motion.div>
                                        )
                                    }
                                )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}