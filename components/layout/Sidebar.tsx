/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/layout/Sidebar.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faCheckCircle,
  faChartBar,
  faBuilding,
  faUser,
  faBan,
  faGear,
  faInbox,
  faPaperPlane,
  faFolder,
  faPlus,
  faXmark,
  faFile,
  faUserCog,
  faEnvelope,
  faArrowRight,
  faArrowLeft,
  faFileAlt,
  faSitemap,
  faHistory,
  faDatabase,
  faChartPie,
  faClock,
  faEye,
  faChevronDown,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import useMailFilterStore from "@/store/mailFilterStore";
import SidebarItem from "./SidebarItem";
import { motion, AnimatePresence } from "framer-motion";
import useUserInfoStore from "@/store/userInfoStore";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PERMISSIONS } from "@/lib/permissions";
import { UserRole } from "@/types/api/user";

// ============================================================
// ===== Types =====
// ============================================================

interface NavItem {
  icon: any;
  label: string;
  path: string;
  permission?: string;
  role?: UserRole;
}

interface ReportItem {
  icon: any;
  label: string;
  path: string;
  permission?: string;
}

// ============================================================
// ===== Report Items =====
// ============================================================

const REPORT_ITEMS: ReportItem[] = [
  {
    icon: faChartBar,
    label: "لوحة العميد",
    path: "/dean/dashboard",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    icon: faArrowRight,
    label: "أنماط التوزيع",
    path: "/dean/distribution-patterns",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    icon: faChartBar,
    label: "تقرير التوزيع الكامل",
    path: "/dean/distribution-full",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    icon: faArrowLeft,
    label: "الأنماط المتجاهلة",
    path: "/dean/ignored-patterns",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    icon: faEye,
    label: "سلوك القراءة",
    path: "/dean/reading-behavior",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    icon: faFile,
    label: "تقرير المراسلات",
    path: "/dean/correspondence-full",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    icon: faUsers,
    label: "المستخدمين المتجاهلين",
    path: "/dean/ignored-users",
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
];

// ============================================================
// ===== Main Component =====
// ============================================================

function SidebarContentWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission, isLoading: authLoading } = useAuth();
  const { role, roles } = useUserInfoStore();
  const { filter, setFilter } = useMailFilterStore();
  const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ التحقق من وجود تقرير نشط لفتح الـ Dropdown تلقائياً
  useEffect(() => {
    if (mounted) {
      const isReportActive = REPORT_ITEMS.some(
        (item) => pathname === item.path || pathname?.startsWith(item.path + "/")
      );
      if (isReportActive) {
        setIsReportsOpen(true);
      }
    }
  }, [pathname, mounted]);

  const isAdmin = role === UserRole.ADMIN || roles?.includes(UserRole.ADMIN);

  // ============================================================
  // ===== Navigation Items (ثابتة) =====
  // ============================================================

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { icon: faHome, label: "الرئيسية", path: "/" },
    ];

    // ===== التوزيعات =====
    items.push({
      icon: faInbox,
      label: "التوزيعات الواردة",
      path: "/distribution?tab=inbox",
      permission: PERMISSIONS.VIEW_DISTRIBUTION,
    });
    items.push({
      icon: faPaperPlane,
      label: "التوزيعات الصادرة",
      path: "/distribution?tab=outbox",
      permission: PERMISSIONS.VIEW_DISTRIBUTION,
    });

    // ===== البريد =====
    items.push({
      icon: faEnvelope,
      label: "البريد الوارد",
      path: "/incoming-emails",
      permission: PERMISSIONS.MANAGE_INCOMING_EMAIL,
    });
    items.push({
      icon: faPaperPlane,
      label: "البريد الصادر",
      path: "/outgoing-emails",
      permission: PERMISSIONS.MANAGE_OUTGOING_EMAIL,
    });

    // ===== المراسلات =====
    items.push({
      icon: faFolder,
      label: "المراسلات",
      path: "/correspondences",
      permission: PERMISSIONS.VIEW_CORRESPONDENCE,
    });

    // ===== المستخدمين =====
    items.push({
      icon: faUsers,
      label: "المستخدمين",
      path: "/users",
      permission: PERMISSIONS.MANAGE_USERS,
    });

    // ===== الأقسام =====
    items.push({
      icon: faSitemap,
      label: "الأقسام",
      path: "/departments",
      permission: PERMISSIONS.MANAGE_DEPARTMENT,
    });

    // ===== تاريخ العمداء =====
    items.push({
      icon: faHistory,
      label: "تاريخ العمداء",
      path: "/dean-history",
      role: UserRole.ADMIN,
    });

    // ===== النسخ الاحتياطية =====
    items.push({
      icon: faDatabase,
      label: "النسخ الاحتياطية",
      path: "/backup",
      permission: PERMISSIONS.MANAGE_BACKUP,
    });

    items.push({
      icon: faClock,
      label: "تقدم العمليات",
      path: "/backup-progress",
      permission: PERMISSIONS.MANAGE_BACKUP,
    });

    // ===== الجهات المرسلة =====
    items.push({
      icon: faBuilding,
      label: "الجهات المرسلة",
      path: "/sender-entities",
      permission: PERMISSIONS.MANAGE_SENDER_ENTITIES,
    });

    // ===== أنواع الوثائق =====
    items.push({
      icon: faFile,
      label: "أنواع الوثائق",
      path: "/document-types",
      permission: PERMISSIONS.MANAGE_DOCUMENT_TYPES,
    });

    // ===== الموافقات =====
    items.push({
      icon: faCheckCircle,
      label: "الموافقات",
      path: "/pending-approvals",
      permission: PERMISSIONS.VIEW_PENDING_APPROVALS,
    });

    // ===== التفويضات =====
    items.push({
      icon: faUserCog,
      label: "التفويضات",
      path: "/delegations",
      permission: PERMISSIONS.VIEW_DELEGATIONS,
    });

    // ===== إحصائياتي =====
    items.push({
      icon: faChartBar,
      label: "إحصائياتي",
      path: "/user-statistics",
    });

    return items;
  }, []);

  // ============================================================
  // ===== Filter Items by Permission & Role =====
  // ============================================================

  const filteredNavItems = useMemo(() => {
    if (!mounted) {
      return navItems;
    }
    if (authLoading) {
      return navItems.filter((item) => item.path === "/" || item.path === "/profile");
    }
    return navItems.filter((item) => {
      if (item.role) {
        if (item.role === UserRole.ADMIN && !isAdmin) {
          return false;
        }
      }
      if (item.permission) {
        return hasPermission(item.permission);
      }
      return true;
    });
  }, [navItems, hasPermission, authLoading, mounted, isAdmin]);

  // ============================================================
  // ===== Filter Report Items by Permission =====
  // ============================================================

  const filteredReportItems = useMemo(() => {
    if (!mounted) return [];
    if (authLoading) return [];
    return REPORT_ITEMS.filter((item) => {
      if (item.permission) {
        return hasPermission(item.permission);
      }
      return true;
    });
  }, [hasPermission, authLoading, mounted]);

  // ============================================================
  // ===== Check if user can create correspondence =====
  // ============================================================

  const canCreateCorrespondence =
    mounted && !authLoading && hasPermission(PERMISSIONS.CREATE_CORRESPONDENCE);

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const handleDistributionClick = useCallback(
    (tab: string) => {
      router.push(`/distribution?tab=${tab}`);
      setFilter(tab);
      if (isMobile) {
        triggerSidebar();
      }
    },
    [router, setFilter, isMobile, triggerSidebar]
  );

  const goToHome = useCallback(() => {
    router.push("/");
    setFilter("");
    if (isMobile) {
      triggerSidebar();
    }
  }, [router, setFilter, isMobile, triggerSidebar]);

  const handleNavigation = useCallback(
    (path: string) => {
      router.push(path);
      if (isMobile) {
        triggerSidebar();
      }
    },
    [router, isMobile, triggerSidebar]
  );

  const isLinkActive = useCallback(
    (path: string): boolean => {
      if (path === "/") {
        return pathname === "/";
      }
      if (path === "/correspondences") {
        return pathname === "/correspondences" || pathname?.startsWith("/correspondences/");
      }
      if (path === "/departments") {
        return pathname === "/departments";
      }
      if (path === "/dean-history") {
        return pathname === "/dean-history";
      }
      if (path.includes("?")) {
        const basePath = path.split("?")[0];
        return pathname === basePath;
      }
      return pathname === path;
    },
    [pathname]
  );

  const isDistributionActive = useCallback(
    (tab: string): boolean => {
      return pathname === "/distribution" && filter === tab;
    },
    [pathname, filter]
  );

  const isReportActive = useCallback(
    (path: string): boolean => {
      return pathname === path || pathname?.startsWith(path + "/");
    },
    [pathname]
  );

  const toggleReports = () => {
    setIsReportsOpen((prev) => !prev);
  };

  if (!mounted) {
    return <div className="w-[260px] h-full bg-blue-50/50 animate-pulse" />;
  }

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <motion.aside
        dir="rtl"
        animate={{
          width: isSidebarToggleShown ? 260 : 72,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={`
          hidden md:flex
          h-[calc(100vh-64px)]
          bg-gradient-to-b from-blue-50 to-white
          border-l border-blue-100/50
          p-3
          flex-col
          shadow-lg
          overflow-hidden
          ${!isSidebarToggleShown ? "items-center" : ""}
        `}
      >
        <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
          {canCreateCorrespondence && (
            <div className="sticky top-0 z-10 bg-gradient-to-b from-blue-50 to-transparent pb-2">
              <button
                onClick={() => router.push("/correspondences/create")}
                className={`
                  w-full
                  bg-gradient-to-r from-blue-500 to-blue-600
                  text-white
                  py-2.5
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-md hover:shadow-lg
                  transition-all duration-200
                  hover:from-blue-600 hover:to-blue-700
                  ${isSidebarToggleShown ? "px-4" : "px-0"}
                `}
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                {isSidebarToggleShown && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    مراسلة جديدة
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              if (item.path.includes("/distribution?tab=")) {
                const tab = item.path.split("?tab=")[1];
                return (
                  <SidebarItem
                    key={item.path}
                    icon={item.icon}
                    label={isSidebarToggleShown ? item.label : ""}
                    onClick={() => handleDistributionClick(tab)}
                    active={isDistributionActive(tab)}
                    isCollapsed={!isSidebarToggleShown}
                  />
                );
              }
              return (
                <SidebarItem
                  key={item.path}
                  icon={item.icon}
                  label={isSidebarToggleShown ? item.label : ""}
                  onClick={() => handleNavigation(item.path)}
                  active={isLinkActive(item.path)}
                  isCollapsed={!isSidebarToggleShown}
                />
              );
            })}

            {/* ===== Reports Dropdown ===== */}
            {filteredReportItems.length > 0 && (
              <div className="mt-2 border-t border-blue-100/50 pt-2">
                {/* ===== زر التقارير ===== */}
                <button
                  onClick={toggleReports}
                  className={`
                    flex items-center gap-2 w-full px-4 py-2.5 rounded-xl
                    transition-all duration-200 text-right text-sm
                    ${isReportsOpen ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}
                    ${!isSidebarToggleShown ? "justify-center px-0" : ""}
                  `}
                >
                  <FontAwesomeIcon
                    icon={faChartPie}
                    className={`w-5 shrink-0 ${isReportsOpen ? "text-blue-600" : "text-gray-400"}`}
                  />
                  {isSidebarToggleShown && (
                    <span className="flex-1 text-right truncate">التقارير</span>
                  )}
                  {isSidebarToggleShown && (
                    <FontAwesomeIcon
                      icon={isReportsOpen ? faChevronDown : faChevronLeft}
                      className="text-xs text-gray-400 shrink-0"
                    />
                  )}
                </button>

                {/* ===== قائمة التقارير ===== */}
                <AnimatePresence>
                  {isReportsOpen && isSidebarToggleShown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pr-4 space-y-0.5">
                        {filteredReportItems.map((item) => (
                          <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            onClick={() => handleNavigation(item.path)}
                            active={isReportActive(item.path)}
                            isCollapsed={false}
                            className="text-xs !py-2 !px-3 !rounded-lg"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ===== عرض أيقونات التقارير في حالة التصغير ===== */}
                {!isSidebarToggleShown && isReportsOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-0.5 mt-1"
                  >
                    {filteredReportItems.map((item) => (
                      <SidebarItem
                        key={item.path}
                        icon={item.icon}
                        label=""
                        onClick={() => handleNavigation(item.path)}
                        active={isReportActive(item.path)}
                        isCollapsed={true}
                        className="!py-2"
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {isSidebarToggleShown && (
          <div className="sticky bottom-0 bg-gradient-to-t from-blue-50 to-transparent pt-2">
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100/50">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>التخزين</span>
                <span>2.4GB / 10GB</span>
              </div>
              <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: "24%" }}
                />
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* ===== Mobile Sidebar ===== */}
      <AnimatePresence>
        {isMobile && isSidebarToggleShown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={triggerSidebar}
            />

            <motion.aside
              dir="rtl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="
                fixed top-0 right-0 z-50
                w-[280px] h-full
                bg-gradient-to-b from-blue-50 to-white
                border-r border-blue-100/50
                p-4
                flex
                flex-col
                shadow-2xl
                md:hidden
              "
            >
              <button
                onClick={triggerSidebar}
                className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>

              <div className="flex-1 overflow-y-auto w-full mt-4 scrollbar-hide">
                {canCreateCorrespondence && (
                  <button
                    onClick={() => {
                      router.push("/correspondences/create");
                      triggerSidebar();
                    }}
                    className="
                      w-full
                      bg-gradient-to-r from-blue-500 to-blue-600
                      text-white
                      py-2.5
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      gap-2
                      mb-4
                      px-4
                      hover:from-blue-600 hover:to-blue-700
                      transition-all
                      duration-200
                      shadow-md hover:shadow-lg
                    "
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-sm" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      مراسلة جديدة
                    </span>
                  </button>
                )}

                <div className="space-y-1">
                  {filteredNavItems.map((item) => {
                    if (item.path.includes("/distribution?tab=")) {
                      const tab = item.path.split("?tab=")[1];
                      return (
                        <SidebarItem
                          key={item.path}
                          icon={item.icon}
                          label={item.label}
                          onClick={() => {
                            handleDistributionClick(tab);
                            triggerSidebar();
                          }}
                          active={isDistributionActive(tab)}
                          isCollapsed={false}
                        />
                      );
                    }
                    return (
                      <SidebarItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => {
                          handleNavigation(item.path);
                          triggerSidebar();
                        }}
                        active={isLinkActive(item.path)}
                        isCollapsed={false}
                      />
                    );
                  })}

                  {/* ===== Reports Dropdown (Mobile) ===== */}
                  {filteredReportItems.length > 0 && (
                    <div className="mt-2 border-t border-blue-100/50 pt-2">
                      <button
                        onClick={toggleReports}
                        className={`
                          flex items-center gap-2 w-full px-4 py-2.5 rounded-xl
                          transition-all duration-200 text-right text-sm
                          ${isReportsOpen ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}
                        `}
                      >
                        <FontAwesomeIcon
                          icon={faChartPie}
                          className={`w-5 shrink-0 ${isReportsOpen ? "text-blue-600" : "text-gray-400"}`}
                        />
                        <span className="flex-1 text-right truncate">التقارير</span>
                        <FontAwesomeIcon
                          icon={isReportsOpen ? faChevronDown : faChevronLeft}
                          className="text-xs text-gray-400 shrink-0"
                        />
                      </button>

                      <AnimatePresence>
                        {isReportsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pr-4 space-y-0.5">
                              {filteredReportItems.map((item) => (
                                <SidebarItem
                                  key={item.path}
                                  icon={item.icon}
                                  label={item.label}
                                  onClick={() => {
                                    handleNavigation(item.path);
                                    triggerSidebar();
                                  }}
                                  active={isReportActive(item.path)}
                                  isCollapsed={false}
                                  className="text-xs !py-2 !px-3 !rounded-lg"
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>التخزين</span>
                    <span>2.4GB / 10GB</span>
                  </div>
                  <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: "24%" }}
                    />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// ===== Export with Suspense =====
// ============================================================

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-[260px] h-full bg-blue-50/50 animate-pulse" />}>
      <SidebarContentWrapper />
    </Suspense>
  );
}