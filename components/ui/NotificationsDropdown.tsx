"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBell,
    faCheckCircle,
    faCircleInfo,
    faTriangleExclamation,
    faSpinner,
    faXmark,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons"
import { apiWrapper } from "@/utils/apiClient"
import { NotificationsResponse } from "@/types/api/Notifications/NotificationsResponse"
import { NotificationItem } from "@/types/api/Notifications/NotificationItem"

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)

    const {
        data,
        isLoading,
        isError,
    } = useQuery<NotificationsResponse>({
        queryKey: ["notifications"],
        queryFn: async (): Promise<NotificationsResponse> => {
            try {
                const response =
                    await apiWrapper.get<NotificationsResponse>(
                        "/Notifications"
                    )

                if (!response.data) {
                    throw new Error(
                        "No notifications data found"
                    )
                }

                return response.data
            } catch (error) {
                toast.error(
                    "Failed to load notifications"
                )

                throw error
            }
        },
        refetchInterval: 30000,
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

    const notifications = data?.data?.items || []

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

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            {/* Bell Button */}
            <button
                onClick={() =>
                    setOpen((prev) => !prev)
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
            >
                <FontAwesomeIcon
                    icon={faBell}
                    className="text-lg"
                />

                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white"
                    >
                        {unreadCount}
                    </motion.div>
                )}
            </button>

            {/* Dropdown */}
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
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-white">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Notifications
                                </h2>

                                <p className="text-sm text-blue-100">
                                    {unreadCount} unread
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setOpen(false)
                                }
                                className="rounded-full p-2 transition hover:bg-white/10"
                            >
                                <FontAwesomeIcon
                                    icon={faXmark}
                                />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center gap-3 py-10 text-blue-600">
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        spin
                                        className="text-2xl"
                                    />

                                    <p className="text-sm">
                                        Loading
                                        notifications...
                                    </p>
                                </div>
                            )}

                            {isError && (
                                <div className="flex flex-col items-center justify-center gap-3 py-10 text-red-500">
                                    <FontAwesomeIcon
                                        icon={
                                            faTriangleExclamation
                                        }
                                        className="text-2xl"
                                    />

                                    <p className="text-sm">
                                        Failed to load
                                        notifications
                                    </p>
                                </div>
                            )}

                            {!isLoading &&
                                notifications.length ===
                                0 && (
                                    <div className="py-10 text-center text-gray-500">
                                        No notifications
                                        found
                                    </div>
                                )}

                            {!isLoading &&
                                notifications.map(
                                    (
                                        notification
                                    ) => (
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
                                                >
                                                    <div
                                                        className={`cursor-pointer border-b border-gray-100 p-4 transition hover:bg-blue-50 ${!notification.isRead
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
                                                                <div className="flex items-center justify-between gap-3">
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
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="border-b border-gray-100 p-4">
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
                                                            <div className="flex items-center justify-between gap-3">
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
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}