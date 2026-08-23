// components/layout/Navbar.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faUserCircle,
    faBars,
    faXmark,
    faPalette,
    faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import useUserInfoStore from "@/store/userInfoStore";
import NotificationsDropdown from "../dropdown/NotificationsDropdown";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { apiWrapper } from "@/utils/apiClient";
import { useSearchStore } from "@/store/searchStore";

// ==============================
// ✅ NavButton Component (للموبايل فقط)
// ==============================

interface NavButtonProps {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
    closeMenu?: () => void;
}

function NavButton({
    icon,
    label,
    href,
    onClick,
    className = "",
    isActive = false,
    closeMenu,
}: NavButtonProps) {
    const router = useRouter();
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (href) {
            router.push(href);
        }
        if (closeMenu) {
            closeMenu();
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
                className={`w-5 ${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                }`}
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
// ✅ MAIN COMPONENT
// ==============================

function NavbarContent() {
    const router = useRouter();
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { isUserSettingsShown, triggerUserSettings } =
        userSettingsOverlayStore();
    const { email, firstname, lastname, role } = useUserInfoStore();
    const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();

    const { searchQuery, setSearchQuery, clearSearch } = useSearchStore();

    const [searchValue, setSearchValue] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAuthPage = pathname?.startsWith("/auth");

    // ✅ أزرار الموبايل حسب الدور
    const getMobileNavButtons = () => {
        const isUser = role === "User";
        const isEmployee = role === "Employee";
        const isDean = role === "Dean";
        const isAdmin = role === "Admin";
        const isDeanOrAdmin = isDean || isAdmin;

        const commonButtons = [
            { icon: faUserCircle, label: "الملف الشخصي", href: "/profile" },
        ];

        if (isUser) {
            return [
                { icon: faUserCircle, label: "الملف الشخصي", href: "/profile" },
            ];
        }

        if (isEmployee) {
            return [
                { icon: faUserCircle, label: "الملف الشخصي", href: "/profile" },
            ];
        }

        if (isDeanOrAdmin) {
            return [
                { icon: faUserCircle, label: "الملف الشخصي", href: "/profile" },
            ];
        }

        return commonButtons;
    };

    useEffect(() => {
        setSearchValue(searchQuery);
    }, [searchQuery]);

    const cleanText = (text: string): string => {
        return text.replace(/\s+/g, " ").trim();
    };

    const handleSearchChange = useCallback(
        (value: string) => {
            const cleanedValue = cleanText(value);
            setSearchValue(cleanedValue);

            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            if (cleanedValue === "") {
                clearSearch();
                return;
            }

            debounceTimeoutRef.current = setTimeout(() => {
                setSearchQuery(cleanedValue);
            }, 500);
        },
        [setSearchQuery, clearSearch]
    );

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                const target = event.target as HTMLElement;
                if (!target.closest("[data-menu-toggle]")) {
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

    const handleLogout = async () => {
        await apiWrapper.post("/auth/logout");
        localStorage.clear();
        router.push("/auth/login");
    };

    const mobileNavButtons = getMobileNavButtons();

    return (
        <>
            <nav
                className="flex h-16 w-full items-center justify-between border-b border-blue-200/50 bg-blue-100/90 px-4 sm:px-6 lg:px-8 text-gray-800 backdrop-blur-md shadow-sm"
                dir="rtl"
            >
                {/* ===== LEFT - Logo + Toggle Sidebar ===== */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* ✅ زر فتح/إغلاق الـ Sidebar - يظهر في جميع الصفحات (باستثناء Auth) */}
                    {!isAuthPage && (
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={triggerSidebar}
                            className="text-xl text-blue-700 hover:text-blue-900 transition p-1"
                            title={isSidebarToggleShown ? "إغلاق القائمة" : "فتح القائمة"}
                        >
                            <FontAwesomeIcon
                                icon={faAngleRight}
                                className={`transition-transform duration-300 ${
                                    isSidebarToggleShown ? "rotate-180" : "rotate-0"
                                }`}
                            />
                        </motion.button>
                    )}

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
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-white/80 border border-blue-200/50 rounded-xl px-4 py-2 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                        />
                        {searchValue && (
                            <button
                                onClick={() => handleSearchChange("")}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-sm" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== RIGHT - Actions ===== */}
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

                    <NotificationsDropdown />

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
            <div
                id="mobile-search"
                className="md:hidden hidden px-4 py-2 bg-blue-100/90 border-b border-blue-200/50"
            >
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="بحث في البريد..."
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-white/80 border border-blue-200/50 rounded-xl px-4 py-2 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition"
                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                    />
                    {searchValue && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-sm" />
                        </button>
                    )}
                </div>
            </div>

            {/* ===== Mobile Menu ===== */}
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
                            {mobileNavButtons.map((btn) => (
                                <NavButton
                                    key={btn.href}
                                    icon={btn.icon}
                                    label={btn.label}
                                    href={btn.href}
                                    isActive={pathname === btn.href}
                                    closeMenu={() => setIsMobileMenuOpen(false)}
                                />
                            ))}

                            <div className="border-t border-gray-100 my-2" />

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

// ✅ المكون الرئيسي مع Suspense
export default function Navbar() {
    return (
        <Suspense fallback={<div className="h-16 bg-blue-100/90 animate-pulse" />}>
            <NavbarContent />
        </Suspense>
    );
}