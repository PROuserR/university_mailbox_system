/* eslint-disable react-hooks/static-components */
// components/layout/Sidebar.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import MailCompose from "@/components/overlays/MailCompose";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
    faHome,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import useMailComposeStore from "@/store/mailComposeStore";
import useMailFilterStore from "@/store/mailFilterStore";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { MailCounts } from "@/types/api/Mail/MailCounts";
import SidebarItem from "./SidebarItem";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { motion, AnimatePresence } from "framer-motion";
import useUserInfoStore from "@/store/userInfoStore";
import { useEffect } from "react";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { role } = useUserInfoStore();
    const { isMailComposeShown, triggerMailCompose } = useMailComposeStore();
    const { filter, setFilter } = useMailFilterStore();
    const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();

    const isMailPage = pathname?.startsWith("/mail/") || pathname === "/distribution-page";
    const isHomePage = pathname === "/";

    const showAdminButtons = role === "Dean" || role === "Admin";

    useEffect(() => {
        if (isSidebarToggleShown) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isSidebarToggleShown]);

    const fetchMailsCount = async (): Promise<MailCounts> => {
        const res = await apiWrapper.get<{
            data: MailCounts;
        }>("/Correspondences/statistics/counts-by-type");

        if (!res.success || !res.data) {
            throw new Error("Failed to fetch mails");
        }

        return res.data.data;
    };

    const { data = {
        incomingCount: 0,
        outgoingCount: 0,
        internalCount: 0,
        professionalCount: 0,
        totalCount: 0,
    } } = useQuery({
        queryKey: ["mailsCount"],
        queryFn: fetchMailsCount,
        enabled: isHomePage,
    });

    const handleSidebarClick = (filterValue: string) => {
        if (isMailPage) {
            router.push(`/?filter=${filterValue}`);
        } else {
            setFilter(filterValue);
        }
        if (window.innerWidth < 768) {
            triggerSidebar();
        }
    };

    // ✅ محتوى الـ Sidebar
    const SidebarContent = () => (
        <>
            {/* ===== TOP SECTION ===== */}
            <div className="flex-1 overflow-y-auto w-full">
                {/* ===== Compose Button ===== */}
                <button
    onClick={() => {
        // ✅ إغلاق الـ Sidebar في الموبايل
        if (window.innerWidth < 768) {
            triggerSidebar();
        }
        router.push("/mail/create");
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
        ${!isSidebarToggleShown ? "px-0" : "px-4"}
    `}
>
    <FontAwesomeIcon icon={faPlus} className="text-sm" />
    <AnimatePresence>
        {isSidebarToggleShown && (
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

                {/* ===== Main Navigation ===== */}
                <div className="space-y-1">
                    <SidebarItem
                        icon={faHome}
                        label={isSidebarToggleShown ? "الرئيسية" : ""}
                        onClick={() => {
                            if (isMailPage) {
                                router.push("/");
                            } else {
                                setFilter("");
                            }
                            if (window.innerWidth < 768) triggerSidebar();
                        }}
                        active={pathname === "/" && filter === ""}
                        isCollapsed={!isSidebarToggleShown}
                    />

                    <div className="h-px bg-blue-100/50 my-2" />

                    <SidebarItem
                        icon={faEnvelope}
                        label={isSidebarToggleShown ? "صندوق البريد" : ""}
                        onClick={() => handleSidebarClick("")}
                        active={!isMailPage && filter === "" && pathname !== "/"}
                        count={isSidebarToggleShown ? data.totalCount : undefined}
                        isCollapsed={!isSidebarToggleShown}
                    />

                    <SidebarItem
                        icon={faInbox}
                        label={isSidebarToggleShown ? "الوارد" : ""}
                        onClick={() => handleSidebarClick("Incoming")}
                        active={!isMailPage && filter === "Incoming"}
                        count={isSidebarToggleShown ? data.incomingCount : undefined}
                        isCollapsed={!isSidebarToggleShown}
                    />

                    <SidebarItem
                        icon={faPaperPlane}
                        label={isSidebarToggleShown ? "الصادر" : ""}
                        onClick={() => handleSidebarClick("Outgoing")}
                        active={!isMailPage && filter === "Outgoing"}
                        count={isSidebarToggleShown ? data.outgoingCount : undefined}
                        isCollapsed={!isSidebarToggleShown}
                    />

                    <SidebarItem
                        icon={faFile}
                        label={isSidebarToggleShown ? "الداخلي" : ""}
                        onClick={() => handleSidebarClick("Internal")}
                        active={!isMailPage && filter === "Internal"}
                        count={isSidebarToggleShown ? data.internalCount : undefined}
                        isCollapsed={!isSidebarToggleShown}
                    />

                    <SidebarItem
                        icon={faBriefcase}
                        label={isSidebarToggleShown ? "المهني" : ""}
                        onClick={() => handleSidebarClick("Professional")}
                        active={!isMailPage && filter === "Professional"}
                        count={isSidebarToggleShown ? data.professionalCount : undefined}
                        isCollapsed={!isSidebarToggleShown}
                    />
                </div>

                {/* ===== Admin Section ===== */}
                {showAdminButtons && isSidebarToggleShown && (
                    <>
                        <div className="h-px bg-blue-100/50 my-3" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider px-3 mb-2">
                                الإدارة
                            </p>
                            <SidebarItem
                                icon={faUsers}
                                label="المستخدمين"
                                onClick={() => {
                                    router.push("/users");
                                    if (window.innerWidth < 768) triggerSidebar();
                                }}
                                active={pathname === "/users"}
                                isCollapsed={!isSidebarToggleShown}
                            />
                            <SidebarItem
                                icon={faCheckCircle}
                                label="الموافقات"
                                onClick={() => {
                                    router.push("/approvals");
                                    if (window.innerWidth < 768) triggerSidebar();
                                }}
                                active={pathname === "/approvals"}
                                isCollapsed={!isSidebarToggleShown}
                            />
                            <SidebarItem
                                icon={faChartBar}
                                label="التفويضات"
                                onClick={() => {
                                    router.push("/delegations");
                                    if (window.innerWidth < 768) triggerSidebar();
                                }}
                                active={pathname === "/delegations"}
                                isCollapsed={!isSidebarToggleShown}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* ===== BOTTOM SECTION ===== */}
            <div className="w-full">
                <AnimatePresence>
                    {isSidebarToggleShown && (
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

    return (
        <>
            {/* ===== Desktop Sidebar (RTL - على اليمين) ===== */}
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
                    border-r border-blue-100/50
                    p-3
                    flex-col
                    justify-between
                    z-10
                    overflow-hidden
                    shadow-lg
                    ${!isSidebarToggleShown ? "items-center" : ""}
                `}
            >
                <SidebarContent />
            </motion.aside>

            {/* ===== Mobile Sidebar (Overlay - من اليمين) ===== */}
            <AnimatePresence>
                {isSidebarToggleShown && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
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
                            {/* ===== Close Button (في الأعلى يسار) ===== */}
                            <button
                                onClick={triggerSidebar}
                                className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ===== Mail Compose ===== */}
            {isMailComposeShown && <MailCompose />}
        </>
    );
}