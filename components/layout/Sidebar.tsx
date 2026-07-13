// components/layout/Sidebar.tsx

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useUIModeStore from "@/store/uiModeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInbox,
  faPaperPlane,
  faFile,
  faEnvelope,
  faFolder,
  faPlus,
  faBriefcase,
  faFolderPlus,
  faUsers,
  faCheckCircle,
  faChartBar,
  faBuilding,
  faShare,
  faUserCog,
  faXmark,
  faUser,
  faBan,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import useMailFilterStore from "@/store/mailFilterStore";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { MailCounts } from "@/types/api/Mail/MailCounts";
import SidebarItem from "./SidebarItem";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { motion, AnimatePresence } from "framer-motion";
import useUserInfoStore from "@/store/userInfoStore";
import { useEffect, useState, Suspense } from "react";

// ✅ مكون منفصل يستخدم useSearchParams مع Suspense
function SidebarContentWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useUserInfoStore();
  const { uiMode } = useUIModeStore();
  const { filter, setFilter } = useMailFilterStore();
  const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isMailPage =
    pathname?.startsWith("/mail/") || pathname === "/distribution-page";
  const isHomePage = pathname === "/";
  const isModernMode = uiMode === "modern";

  const isUser = role === "User";
  const isEmployee = role === "Employee";
  const isDean = role === "Dean";
  const isAdmin = role === "Admin";
  const isDeanOrAdmin = isDean || isAdmin;

  const fetchMailsCount = async (): Promise<MailCounts> => {
    const res = await apiWrapper.get<{
      data: MailCounts;
    }>("/Correspondences/statistics/counts-by-type");

    if (!res.success || !res.data) {
      throw new Error("Failed to fetch mails");
    }

    return res.data.data;
  };

  const {
    data = {
      incomingCount: 0,
      outgoingCount: 0,
      internalCount: 0,
      professionalCount: 0,
      totalCount: 0,
    },
  } = useQuery({
    queryKey: ["mailsCount"],
    queryFn: fetchMailsCount,
    enabled: isHomePage,
  });

  const handleFilterClick = (filterValue: string) => {
    router.push(`/?filter=${filterValue}`);
    setFilter(filterValue);
    if (isMobile) triggerSidebar();
  };

  const goToHome = () => {
    router.push("/");
    setFilter("");
    if (isMobile) triggerSidebar();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) triggerSidebar();
  };

  const isLinkActive = (path: string): boolean => {
    if (path.includes("?")) {
      const [basePath, queryString] = path.split("?");
      const params = new URLSearchParams(queryString);
      const tab = params.get("tab");

      if (pathname === basePath && tab) {
        return searchParams.get("tab") === tab;
      }
      return pathname === basePath;
    }

    if (path === "/") {
      return pathname === "/";
    }

    if (path === "/correspondences") {
      return (
        pathname === "/correspondences" ||
        pathname?.startsWith("/correspondences/")
      );
    }

    return pathname === path;
  };

  const getPagesByRole = () => {
    const commonPages = [
      { icon: faUser, label: "الملف الشخصي", path: "/profile" },
    ];

    if (isUser) {
      return [
        { icon: faInbox, label: "الوارد", path: "/distribution?tab=inbox" },
        { icon: faChartBar, label: "الإحصائيات", path: "/user-statistics" },
        ...commonPages,
      ];
    }

    if (isEmployee) {
      return [
        { icon: faInbox, label: "الوارد", path: "/distribution?tab=inbox" },
        {
          icon: faPaperPlane,
          label: "الصادر",
          path: "/distribution?tab=outbox",
        },
        { icon: faFolder, label: "المراسلات", path: "/correspondences" },
        { icon: faChartBar, label: "الإحصائيات", path: "/user-statistics" },
        ...commonPages,
      ];
    }

    if (isDeanOrAdmin) {
      return [
        { icon: faInbox, label: "الوارد", path: "/distribution?tab=inbox" },
        {
          icon: faPaperPlane,
          label: "الصادر",
          path: "/distribution?tab=outbox",
        },
        { icon: faFolder, label: "المراسلات", path: "/correspondences" },
        { icon: faUsers, label: "المستخدمين", path: "/users" },
        { icon: faBuilding, label: "الجهات المرسلة", path: "/sender-entities" },
        { icon: faFile, label: "أنواع الوثائق", path: "/document-types" },
        { icon: faCheckCircle, label: "الموافقات", path: "/approvals" },
        { icon: faChartBar, label: "الإحصائيات", path: "/statistics" },

        {
          icon: faBan,
          label: "تقرير المتجاهلين",
          path: "/dean/ignored-report",
        },
        {
          icon: faUsers,
          label: "المستخدمين المتجاهلين",
          path: "/dean/ignored-users",
        },
        { icon: faGear, label: "إعدادات النظام", path: "/dean/settings" },

        { icon: faUser, label: "الملف الشخصي", path: "/profile" },
      ];
    }

    return commonPages;
  };

  const renderSidebarContent = (isMobileView: boolean = false) => {
    const pages = getPagesByRole();

    return (
      <>
        <div className="flex-1 overflow-y-auto w-full">
          {!isUser && (
            <button
              onClick={() => {
                router.push("/mail/create");
                if (isMobileView) triggerSidebar();
              }}
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
                            mb-4
                            hover:from-blue-600 hover:to-blue-700
                            transition-all
                            duration-200
                            shadow-md hover:shadow-lg
                            ${
                              !isSidebarToggleShown && !isMobileView
                                ? "px-0"
                                : "px-4"
                            }
                        `}
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
              <AnimatePresence>
                {(isSidebarToggleShown || isMobileView) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    مراسلة جديدة
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          <div className="space-y-1">
            <SidebarItem
              icon={faHome}
              label={isSidebarToggleShown || isMobileView ? "الرئيسية" : ""}
              onClick={goToHome}
              active={isLinkActive("/")}
              isCollapsed={!isSidebarToggleShown && !isMobileView}
            />

            {!isModernMode && (
              <>
                <div className="h-px bg-blue-100/50 my-2" />

                <SidebarItem
                  icon={faEnvelope}
                  label={
                    isSidebarToggleShown || isMobileView ? "صندوق البريد" : ""
                  }
                  onClick={() => handleFilterClick("")}
                  active={filter === "" && pathname === "/"}
                  count={
                    isSidebarToggleShown || isMobileView
                      ? data.totalCount
                      : undefined
                  }
                  isCollapsed={!isSidebarToggleShown && !isMobileView}
                />

                <SidebarItem
                  icon={faInbox}
                  label={isSidebarToggleShown || isMobileView ? "الوارد" : ""}
                  onClick={() => handleFilterClick("Incoming")}
                  active={filter === "Incoming" && pathname === "/"}
                  count={
                    isSidebarToggleShown || isMobileView
                      ? data.incomingCount
                      : undefined
                  }
                  isCollapsed={!isSidebarToggleShown && !isMobileView}
                />

                <SidebarItem
                  icon={faPaperPlane}
                  label={isSidebarToggleShown || isMobileView ? "الصادر" : ""}
                  onClick={() => handleFilterClick("Outgoing")}
                  active={filter === "Outgoing" && pathname === "/"}
                  count={
                    isSidebarToggleShown || isMobileView
                      ? data.outgoingCount
                      : undefined
                  }
                  isCollapsed={!isSidebarToggleShown && !isMobileView}
                />

                <SidebarItem
                  icon={faFile}
                  label={isSidebarToggleShown || isMobileView ? "الداخلي" : ""}
                  onClick={() => handleFilterClick("Internal")}
                  active={filter === "Internal" && pathname === "/"}
                  count={
                    isSidebarToggleShown || isMobileView
                      ? data.internalCount
                      : undefined
                  }
                  isCollapsed={!isSidebarToggleShown && !isMobileView}
                />

                <SidebarItem
                  icon={faBriefcase}
                  label={isSidebarToggleShown || isMobileView ? "المهني" : ""}
                  onClick={() => handleFilterClick("Professional")}
                  active={filter === "Professional" && pathname === "/"}
                  count={
                    isSidebarToggleShown || isMobileView
                      ? data.professionalCount
                      : undefined
                  }
                  isCollapsed={!isSidebarToggleShown && !isMobileView}
                />
              </>
            )}

            {isModernMode && (
              <>
                <div className="h-px bg-blue-100/50 my-2" />
                {pages.map((page) => (
                  <SidebarItem
                    key={page.path}
                    icon={page.icon}
                    label={
                      isSidebarToggleShown || isMobileView ? page.label : ""
                    }
                    onClick={() => handleNavigation(page.path)}
                    active={isLinkActive(page.path)}
                    isCollapsed={!isSidebarToggleShown && !isMobileView}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="w-full">
          <AnimatePresence>
            {(isSidebarToggleShown || isMobileView) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  };

  return (
    <>
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
                    justify-between
                    z-10
                    overflow-hidden
                    shadow-lg
                    ${!isSidebarToggleShown ? "items-center" : ""}
                `}
      >
        {renderSidebarContent(false)}
      </motion.aside>

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
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="
                                fixed top-0 right-0 z-50
                                w-[280px] h-full
                                bg-gradient-to-b from-blue-50 to-white
                                border-r border-blue-100/50
                                p-4
                                flex
                                flex-col
                                justify-between
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

              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ✅ المكون الرئيسي مع Suspense
export default function Sidebar() {
  return (
    <Suspense
      fallback={<div className="w-16 h-full bg-blue-50/50 animate-pulse" />}
    >
      <SidebarContentWrapper />
    </Suspense>
  );
}
