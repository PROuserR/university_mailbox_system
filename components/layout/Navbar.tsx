// components/layout/Navbar.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

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
  faEnvelope,
  faPalette,
  faInbox,
  faPaperPlane,
  faFolder,
  faUsers,
  faBuilding,
  faUser,faBan,faGear
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import useUserInfoStore from "@/store/userInfoStore";
import useUIModeStore from "@/store/uiModeStore";
import NotificationsDropdown from "../dropdown/NotificationsDropdown";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { apiWrapper } from "@/utils/apiClient";
import { useSearchStore } from "@/store/searchStore";

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
// ✅ NavIconButton Component
// ==============================

interface NavIconButtonProps {
  icon: any;
  href: string;
  label: string;
  isActive?: boolean;
}

function NavIconButton({
  icon,
  href,
  label,
  isActive = false,
}: NavIconButtonProps) {
  const router = useRouter();

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
function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isUserSettingsShown, triggerUserSettings } =
    userSettingsOverlayStore();
  const { email, firstname, lastname, role } = useUserInfoStore();
  const { uiMode, toggleUIMode } = useUIModeStore();
  const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();

  const { searchQuery, setSearchQuery, clearSearch } = useSearchStore();

  const [searchValue, setSearchValue] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = pathname?.startsWith("/auth");

  // ✅ صلاحيات المستخدم
  const isUser = role === "User";
  const isEmployee = role === "Employee";
  const isDean = role === "Dean";
  const isAdmin = role === "Admin";
  const isDeanOrAdmin = isDean || isAdmin;

  const showSidebarToggle = () => {
    if (uiMode === "modern") {
      return !isAuthPage;
    }
    return pathname === "/";
  };

  const showMobileMenuButton = () => {
    if (uiMode === "modern") {
      return false;
    }
    return true;
  };

  // ✅ تحديد أزرار الـ Navbar حسب الدور مع isActive
  const getNavButtons = () => {
    const tab = searchParams.get("tab");
    const isActiveInbox = pathname === "/distribution" && tab === "inbox";
    const isActiveOutbox = pathname === "/distribution" && tab === "outbox";
    const isActiveCorrespondences =
      pathname === "/correspondences" ||
      pathname?.startsWith("/correspondences/");
    const isActiveUsers = pathname === "/users";
    const isActiveSenderEntities = pathname === "/sender-entities";
    const isActiveDocumentTypes = pathname === "/document-types";
    const isActiveApprovals = pathname === "/approvals";
    const isActiveStatistics = pathname === "/statistics";
    const isActiveUserStatistics = pathname === "/user-statistics";
    const isActiveProfile = pathname === "/profile";
    if (isUser) {
      return [
        {
          icon: faInbox,
          href: "/distribution?tab=inbox",
          label: "الوارد",
          isActive: isActiveInbox,
        },
        {
          icon: faChartBar,
          href: "/user-statistics",
          label: "الإحصائيات",
          isActive: isActiveUserStatistics,
        },
        {
          icon: faUser,
          href: "/profile",
          label: "الملف الشخصي",
          isActive: isActiveProfile,
        },
      ];
    }

    if (isEmployee) {
      return [
        {
          icon: faInbox,
          href: "/distribution?tab=inbox",
          label: "الوارد",
          isActive: isActiveInbox,
        },
        {
          icon: faPaperPlane,
          href: "/distribution?tab=outbox",
          label: "الصادر",
          isActive: isActiveOutbox,
        },
        {
          icon: faFolder,
          href: "/correspondences",
          label: "المراسلات",
          isActive: isActiveCorrespondences,
        },
        {
          icon: faChartBar,
          href: "/user-statistics",
          label: "الإحصائيات",
          isActive: isActiveUserStatistics,
        },
        {
          icon: faUser,
          href: "/profile",
          label: "الملف الشخصي",
          isActive: isActiveProfile,
        },
      ];
    }

   

if (isDeanOrAdmin) {
    const tab = searchParams.get("tab");
    const isActiveInbox = pathname === "/distribution" && tab === "inbox";
    const isActiveOutbox = pathname === "/distribution" && tab === "outbox";
    const isActiveCorrespondences = pathname === "/correspondences" || pathname?.startsWith("/correspondences/");
    const isActiveUsers = pathname === "/users";
    const isActiveSenderEntities = pathname === "/sender-entities";
    const isActiveDocumentTypes = pathname === "/document-types";
    const isActiveApprovals = pathname === "/approvals";
    const isActiveStatistics = pathname === "/statistics";
    const isActiveIgnoredReport = pathname === "/dean/ignored-report";
    const isActiveIgnoredUsers = pathname === "/dean/ignored-users";
    const isActiveSettings = pathname === "/dean/settings";
    
    return [
        { icon: faInbox, href: "/distribution?tab=inbox", label: "الوارد", isActive: isActiveInbox },
        { icon: faPaperPlane, href: "/distribution?tab=outbox", label: "الصادر", isActive: isActiveOutbox },
        { icon: faFolder, href: "/correspondences", label: "المراسلات", isActive: isActiveCorrespondences },
        { icon: faUsers, href: "/users", label: "المستخدمين", isActive: isActiveUsers },
        { icon: faBuilding, href: "/sender-entities", label: "الجهات المرسلة", isActive: isActiveSenderEntities },
        { icon: faFile, href: "/document-types", label: "أنواع الوثائق", isActive: isActiveDocumentTypes },
        { icon: faCheck, href: "/approvals", label: "الموافقات", isActive: isActiveApprovals },
        { icon: faChartBar, href: "/statistics", label: "الإحصائيات", isActive: isActiveStatistics },
        { icon: faBan, href: "/dean/ignored-report", label: "تقرير المتجاهلين", isActive: isActiveIgnoredReport },
        { icon: faUsers, href: "/dean/ignored-users", label: "المستخدمين المتجاهلين", isActive: isActiveIgnoredUsers },
        { icon: faGear, href: "/dean/settings", label: "إعدادات النظام", isActive: isActiveSettings },
    ];
}

    return [];
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

  const showNavButtons = uiMode === "classic";

  const navButtons = getNavButtons();

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
          {showSidebarToggle() && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerSidebar}
              className="text-xl text-blue-700 hover:text-blue-900 transition p-1"
            >
              <FontAwesomeIcon icon={faAngleRight} />
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

        {/* ===== RIGHT (RTL) - Actions ===== */}
        <div className="flex items-center gap-1 sm:gap-2">
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

          {/* ✅ أزرار الـ Navbar حسب الدور (تظهر فقط في الكلاسيكي) */}
          {showNavButtons && (
            <div className="hidden lg:flex items-center gap-1">
              {navButtons.map((btn) => (
                <NavIconButton
                  key={btn.href}
                  icon={btn.icon}
                  href={btn.href}
                  label={btn.label}
                  isActive={btn.isActive || false}
                />
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleUIMode}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
              uiMode === "modern"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/80 border border-blue-200/50 text-blue-600 hover:bg-blue-50"
            }`}
            title={
              uiMode === "modern"
                ? "تبديل إلى الوضع الكلاسيكي"
                : "تبديل إلى الوضع الحديث"
            }
          >
            <FontAwesomeIcon icon={faPalette} className="text-sm" />
          </motion.button>

          {showMobileMenuButton() && (
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
          )}

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
              <NavButton
                icon={faHome}
                label="الصفحة الرئيسية"
                href="/"
                isActive={pathname === "/"}
                closeMenu={() => setIsMobileMenuOpen(false)}
              />

              {/* ✅ أزرار حسب الدور في الموبايل - مع isActive صحيح */}
              {navButtons.map((btn) => (
                <NavButton
                  key={`${btn.href}-${btn.isActive}`}
                  icon={btn.icon}
                  label={btn.label}
                  href={btn.href}
                  isActive={btn.isActive || false}
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
