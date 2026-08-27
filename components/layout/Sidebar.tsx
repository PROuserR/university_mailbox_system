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
} from "@fortawesome/free-solid-svg-icons";
import useMailFilterStore from "@/store/mailFilterStore";
import SidebarItem from "./SidebarItem";
import { motion, AnimatePresence } from "framer-motion";
import useUserInfoStore from "@/store/userInfoStore";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { useEffect, useState, Suspense } from "react";

function SidebarContentWrapper() {
    const router = useRouter();
    const pathname = usePathname();
    const { role } = useUserInfoStore();
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

    const isHomePage = pathname === "/";
    const isUser = role === "User";
    const isEmployee = role === "Employee";
    const isDean = role === "Dean";
    const isAdmin = role === "Admin";
    const isDeanOrAdmin = isDean || isAdmin;

    const handleDistributionClick = (tab: string) => {
        router.push(`/distribution?tab=${tab}`);
        setFilter(tab);
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
        if (path === "/") {
            return pathname === "/";
        }

        if (path === "/correspondences") {
            return (
                pathname === "/correspondences" ||
                pathname?.startsWith("/correspondences/")
            );
        }

        if (path.includes("?")) {
            const basePath = path.split("?")[0];
            return pathname === basePath;
        }

        return pathname === path;
    };

    const isDistributionActive = (tab: string): boolean => {
        return pathname === "/distribution" && filter === tab;
    };

    const getPagesByRole = () => {
        const commonPages = [
            { icon: faUser, label: "الملف الشخصي", path: "/profile" },
        ];

        if (isUser) {
            return [
                ...commonPages,
            ];
        }

        if (isEmployee) {
            return [
                { icon: faFolder, label: "المراسلات", path: "/correspondences" },
                { icon: faChartBar, label: "الإحصائيات", path: "/user-statistics" },
                ...commonPages,
            ];
        }

        if (isDeanOrAdmin) {
            return [
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
                { icon: faUserCog, label: "التفويضات", path: "/delegations" },
            ];
        }

        return commonPages;
    };

    const pages = getPagesByRole();

    const showDistributionLinks = !isUser;

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
                {/* ===== المحتوى ===== */}
                <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
                    {/* ✅ زر إنشاء مراسلة - مثبت في الأعلى */}
                    {!isUser && (
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

                    {/* ===== القسم الرئيسي ===== */}
                    <div className="space-y-1">
                        {/* الرئيسية */}
                        <SidebarItem
                            icon={faHome}
                            label={isSidebarToggleShown ? "الرئيسية" : ""}
                            onClick={goToHome}
                            active={isLinkActive("/")}
                            isCollapsed={!isSidebarToggleShown}
                        />


                        {showDistributionLinks && (
                            <>
                                <SidebarItem
                                    icon={faInbox}
                                    label={isSidebarToggleShown ? "الوارد" : ""}
                                    onClick={() => handleDistributionClick("inbox")}
                                    active={isDistributionActive("inbox")}
                                    isCollapsed={!isSidebarToggleShown}
                                />

                                <SidebarItem
                                    icon={faPaperPlane}
                                    label={isSidebarToggleShown ? "الصادر" : ""}
                                    onClick={() => handleDistributionClick("outbox")}
                                    active={isDistributionActive("outbox")}
                                    isCollapsed={!isSidebarToggleShown}
                                />

                            </>
                        )}

                        {/* ✅ روابط الصفحات حسب الدور */}
                        {pages.map((page) => (
                            <SidebarItem
                                key={page.path}
                                icon={page.icon}
                                label={isSidebarToggleShown ? page.label : ""}
                                onClick={() => handleNavigation(page.path)}
                                active={isLinkActive(page.path)}
                                isCollapsed={!isSidebarToggleShown}
                            />
                        ))}
                    </div>
                </div>

                {/* ===== BOTTOM SECTION (ثابت في الأسفل) ===== */}
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

            {/* ===== Mobile Sidebar (Overlay) ===== */}
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
                                shadow-2xl
                                md:hidden
                            "
                        >
                            {/* زر الإغلاق للموبايل */}
                            <button
                                onClick={triggerSidebar}
                                className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>

                            {/* المحتوى للموبايل */}
                            <div className="flex-1 overflow-y-auto w-full mt-4 scrollbar-hide">
                                {!isUser && (
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
                                    <SidebarItem
                                        icon={faHome}
                                        label="الرئيسية"
                                        onClick={() => {
                                            goToHome();
                                            triggerSidebar();
                                        }}
                                        active={isLinkActive("/")}
                                        isCollapsed={false}
                                    />

                                    <div className="h-px bg-blue-100/50 my-2" />

                                    {/* ✅ روابط التوزيعات في الموبايل */}
                                    {showDistributionLinks && (
                                        <>
                                            <SidebarItem
                                                icon={faInbox}
                                                label="الوارد"
                                                onClick={() => {
                                                    handleDistributionClick("inbox");
                                                    triggerSidebar();
                                                }}
                                                active={isDistributionActive("inbox")}
                                                isCollapsed={false}
                                            />

                                            <SidebarItem
                                                icon={faPaperPlane}
                                                label="الصادر"
                                                onClick={() => {
                                                    handleDistributionClick("outbox");
                                                    triggerSidebar();
                                                }}
                                                active={isDistributionActive("outbox")}
                                                isCollapsed={false}
                                            />

                                            <div className="h-px bg-blue-100/50 my-2" />
                                        </>
                                    )}

                                    {pages.map((page) => (
                                        <SidebarItem
                                            key={page.path}
                                            icon={page.icon}
                                            label={page.label}
                                            onClick={() => {
                                                handleNavigation(page.path);
                                                triggerSidebar();
                                            }}
                                            active={isLinkActive(page.path)}
                                            isCollapsed={false}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* BOTTOM SECTION للموبايل */}
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

export default function Sidebar() {
    return (
        <Suspense
            fallback={<div className="w-[260px] h-full bg-blue-50/50 animate-pulse" />}
        >
            <SidebarContentWrapper />
        </Suspense>
    );
}