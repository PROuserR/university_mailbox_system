/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/layout/Navbar.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserEdit,
    faSearch,
    faUserCircle,
    faAngleRight,
    faChartBar,
    faFile,
    faMessage,
    faShare,
    faCheck,
    faBars,
    faXmark,
    faHome,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import useSearchInputStore from "@/store/searchInputStore";
import useUserInfoStore from "@/store/userInfoStore";
import NotificationsDropdown from "../dropdown/NotificationsDropdown";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { apiWrapper } from "@/utils/apiClient";

// ==============================
// ✅ NavButton Component
// ==============================

interface NavButtonProps {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
}

function NavButton({ icon, label, href, onClick, className = "", isActive = false }: NavButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (href) {
            router.push(href);
        }
    };

    return (
        <motion.button
            whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-right text-sm ${
                isActive
                    ? "bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-500"
                    : "text-gray-700 hover:text-blue-600"
            } ${className}`}
        >
            <FontAwesomeIcon
                icon={icon}
                className={`w-5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}
            />
            <span>{label}</span>
            {isActive && (
                <motion.div
                    layoutId="mobile-active"
                    className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                />
            )}
        </motion.button>
    );
}

// ==============================
// ✅ NavIconButton Component
// ==============================

interface NavIconButtonProps {
    icon: any;
    href: string;
    label: string;
}

function NavIconButton({ icon, href, label }: NavIconButtonProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <motion.button
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(href)}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white/80 border border-blue-200/50 text-blue-600 hover:bg-blue-50"
            }`}
            title={label}
        >
            <FontAwesomeIcon icon={icon} className="text-sm" />
            {isActive && (
                <motion.div
                    layoutId="nav-active"
                    className="absolute -bottom-1 w-4 h-0.5 bg-yellow-400 rounded-full"
                />
            )}
        </motion.button>
    );
}

// ==============================
// ✅ MAIN COMPONENT
// ==============================

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);

    const { isUserSettingsShown, triggerUserSettings } = userSettingsOverlayStore();
    const { email, firstname, lastname, role } = useUserInfoStore();
    const { setSearchInput } = useSearchInputStore();
    const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();

    const [searchValue, setSearchValue] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ✅ البحث مع تأخير
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchInput(searchValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, setSearchInput]);

    // ✅ إغلاق الموبايل عند تغيير الصفحة
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // ✅ إغلاق الموبايل عند الضغط خارج القائمة
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // ✅ التحقق من أن الضغط ليس على زر القائمة
                const target = event.target as HTMLElement;
                if (!target.closest('[data-menu-toggle]')) {
                    setIsMobileMenuOpen(false);
                }
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // ✅ منع التمرير عند فتح القائمة
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    // ✅ أزرار الـ Navbar (تظهر فقط للـ Dean و Admin)
    const showAdminButtons = role === "Dean" || role === "Admin";

    // ✅ تسجيل الخروج
    const handleLogout = async () => {
        await apiWrapper.post("/auth/logout");
        localStorage.clear();
        router.push("/auth/login");
    };

    return (
        <>
            <nav
                className="flex h-16 w-full items-center justify-between border-b border-blue-200/50 bg-blue-100/90 px-4 sm:px-6 lg:px-8 text-gray-800 backdrop-blur-md shadow-sm"
                dir="rtl"
            >
                {/* ===== LEFT (RTL) - Logo + Toggle ===== */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Toggle Sidebar (only on home) */}
                    {pathname === "/" && (
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={triggerSidebar}
                            className="text-xl text-blue-700 hover:text-blue-900 transition p-1"
                        >
                            <FontAwesomeIcon icon={faAngleRight} />
                        </motion.button>
                    )}

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2"
                        >
                            <Image
                                width={36}
                                height={36}
                                src="/aleppo_university_logo.svg"
                                alt="Aleppo university logo"
                                className="drop-shadow-md"
                            />
                            <span className="hidden sm:inline text-sm font-bold text-blue-800">
                                ديوان جامعة حلب
                            </span>
                        </motion.div>
                    </Link>
                </div>

                {/* ===== CENTER - Search ===== */}
                <div className="hidden md:flex flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="بحث في البريد..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full bg-white/80 border border-blue-200/50 rounded-xl px-4 py-2 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                        />
                    </div>
                </div>

                {/* ===== RIGHT (RTL) - Actions ===== */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => {
                            const searchInput = document.getElementById("mobile-search");
                            if (searchInput) {
                                searchInput.classList.toggle("hidden");
                                if (!searchInput.classList.contains("hidden")) {
                                    searchInput.focus();
                                }
                            }
                        }}
                        className="md:hidden w-9 h-9 rounded-xl bg-white/80 border border-blue-200/50 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
                    >
                        <FontAwesomeIcon icon={faSearch} className="text-sm" />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        data-menu-toggle
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden w-9 h-9 rounded-xl bg-white/80 border border-blue-200/50 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition relative"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isMobileMenuOpen ? "close" : "open"}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FontAwesomeIcon
                                    icon={isMobileMenuOpen ? faXmark : faBars}
                                    className="text-sm"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    {/* Desktop Buttons */}
                    <div className="hidden lg:flex items-center gap-1">
                        {showAdminButtons && (
                            <NavIconButton icon={faFile} href="/document-types" label="أنواع الوثائق" />
                        )}
                        {showAdminButtons && (
                            <NavIconButton icon={faMessage} href="/sender-entities" label="الجهات المرسلة" />
                        )}
                        {showAdminButtons && (
                            <NavIconButton icon={faUserEdit} href="/users" label="المستخدمين" />
                        )}
                        {showAdminButtons && (
                            <NavIconButton icon={faCheck} href="/approvals" label="الموافقات" />
                        )}
                        <NavIconButton icon={faShare} href="/distribution" label="التوزيع" />
                    </div>

                    {/* Notifications */}
                    <NotificationsDropdown />

                    {/* Profile */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerUserSettings}
                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg transition flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faUserCircle} className="text-base" />
                    </motion.button>
                </div>
            </nav>

            {/* ===== Mobile Search ===== */}
            <div id="mobile-search" className="md:hidden hidden px-4 py-2 bg-blue-100/90 border-b border-blue-200/50">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="بحث في البريد..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full bg-white/80 border border-blue-200/50 rounded-xl px-4 py-2 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition"
                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                    />
                </div>
            </div>

            {/* ===== Mobile Menu (مع AnimatePresence) ===== */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="lg:hidden fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xl py-2 px-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
                    >
                        <div className="flex flex-col gap-0.5">
                            {/* الصفحة الرئيسية */}
                            <NavButton
                                icon={faHome}
                                label="الصفحة الرئيسية"
                                href="/"
                                isActive={pathname === "/"}
                            />

                            {/* التوزيع */}
                            <NavButton
                                icon={faShare}
                                label="التوزيع"
                                href="/distribution"
                                isActive={pathname === "/distribution"}
                            />

                            {/* الموافقات (للعميد والأدمن) */}
                            {showAdminButtons && (
                                <NavButton
                                    icon={faCheck}
                                    label="الموافقات"
                                    href="/approvals"
                                    isActive={pathname === "/approvals"}
                                />
                            )}

                            {/* أنواع الوثائق (للعميد والأدمن) */}
                            {showAdminButtons && (
                                <NavButton
                                    icon={faFile}
                                    label="أنواع الوثائق"
                                    href="/document-types"
                                    isActive={pathname === "/document-types"}
                                />
                            )}

                            {/* الجهات المرسلة (للعميد والأدمن) */}
                            {showAdminButtons && (
                                <NavButton
                                    icon={faMessage}
                                    label="الجهات المرسلة"
                                    href="/sender-entities"
                                    isActive={pathname === "/sender-entities"}
                                />
                            )}

                            {/* المستخدمين (للعميد والأدمن) */}
                            {showAdminButtons && (
                                <NavButton
                                    icon={faUserEdit}
                                    label="المستخدمين"
                                    href="/users"
                                    isActive={pathname === "/users"}
                                />
                            )}

                            {/* التفويضات (للعميد) */}
                            {role === "Dean" && (
                                <NavButton
                                    icon={faChartBar}
                                    label="التفويضات"
                                    href="/delegations"
                                    isActive={pathname === "/delegations"}
                                />
                            )}

                            {/* الإحصائيات */}
                            <NavButton
                                icon={faChartBar}
                                label="الإحصائيات"
                                href={role === "Dean" || role === "Admin" ? "/statistics" : "/user-statistics"}
                                isActive={
                                    pathname === "/statistics" || pathname === "/user-statistics"
                                }
                            />

                            {/* الملف الشخصي */}
                            <NavButton
                                icon={faUserCircle}
                                label="الملف الشخصي"
                                href="/profile"
                                isActive={pathname === "/profile"}
                            />

                            <div className="border-t border-gray-100 my-2" />

                            {/* تسجيل الخروج */}
                            <NavButton
                                icon={faXmark}
                                label="تسجيل الخروج"
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-50"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== User Settings Overlay ===== */}
            {isUserSettingsShown && (
                <UserSettingsOverlay
                    user={{
                        name: `${firstname} ${lastname}`,
                        email: email,
                        role: role,
                    }}
                />
            )}
        </>
    );
}