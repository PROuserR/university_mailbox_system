/* eslint-disable @typescript-eslint/no-explicit-any */
// components/overlays/UserSettings.tsx

"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSignOutAlt,
    faTimes,
    faUserEdit,
    faChartArea,
    faUserAlt,
    faUser,
    faChartBar,
    faCog,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import userSettingsOverlayStore from '@/store/userSettingsOverlayStore';
import { useRouter } from "next/navigation";
import { UserInfo } from '@/types/api/User/UserInfo';
import { apiWrapper } from '@/utils/apiClient';
import useUserInfoStore from '@/store/userInfoStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

type Props = {
    user: UserInfo;
};

export default function UserSettingsOverlay({ user }: Props) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const { triggerUserSettings } = userSettingsOverlayStore();
    const { role } = useUserInfoStore();

    // ✅ إغلاق عند الضغط خارج الـ Overlay
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
                triggerUserSettings();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [triggerUserSettings]);

    const handleSignout = async () => {
        await apiWrapper.post('/auth/logout');
        triggerUserSettings();
        localStorage.clear();
        router.push("/auth/login");
    };

    const handleNavigation = (path: string) => {
        triggerUserSettings();
        router.push(path);
    };

    const getUserRoleInArabic = (userRole: string) => {
        switch (userRole) {
            case "Dean": return "عميد";
            case "Admin": return "مدير النظام";
            case "Employee": return "موظف";
            case "User": return "دكتور";
            default: return userRole;
        }
    };

    return (
        <AnimatePresence>
            {true && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="absolute left-5  w-72 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl z-50"
                    style={{ top: 'calc(100% - 7px)' }}
                >
                    {/* ===== User Info ===== */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {user.name?.charAt(0) || "?"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-medium bg-blue-100 text-blue-700">
                                    {getUserRoleInArabic(user.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ===== Menu ===== */}
                    <div className="p-1.5">
                        <MenuItem
                            icon={faUser}
                            label="الملف الشخصي"
                            onClick={() => handleNavigation("/profile")}
                        />

                        <MenuItem
                            icon={faChartBar}
                            label="الإحصائيات"
                            onClick={() => handleNavigation(
                                role === "Dean" || role === "Admin" ? "/statistics" : "/user-statistics"
                            )}
                        />

                        {role === "Dean" && (
                            <MenuItem
                                icon={faUserAlt}
                                label="التفويضات"
                                onClick={() => handleNavigation("/delegations")}
                            />
                        )}

                        {(role === "Dean" || role === "Admin") && (
                            <MenuItem
                                icon={faCog}
                                label="الإدارة"
                                onClick={() => handleNavigation("/users")}
                            />
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        <MenuItem
                            icon={faSignOutAlt}
                            label="تسجيل الخروج"
                            onClick={handleSignout}
                            className="text-red-600 hover:bg-red-50"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ==============================
// MenuItem Component
// ==============================

function MenuItem({
    icon,
    label,
    onClick,
    className = "",
}: {
    icon: any;
    label: string;
    onClick: () => void;
    className?: string;
}) {
    return (
        <motion.button
            whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.06)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-right text-sm text-gray-700 hover:text-blue-600 ${className}`}
        >
            <FontAwesomeIcon icon={icon} className="w-4 text-gray-400" />
            <span>{label}</span>
        </motion.button>
    );
}