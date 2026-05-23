"use client";

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
} from "@fortawesome/free-solid-svg-icons";
import useMailComposeStore from "@/store/mailComposeStore";
import useMailFilterStore from "@/store/mailFilterStore";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { MailCounts } from "@/types/api/Mail/MailCounts";
import SidebarItem from "./SidebarItem";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
    const { isMailComposeShown, triggerMailCompose } =
        useMailComposeStore();

    const { filter, setFilter } = useMailFilterStore();

    const { isSidebarToggleShown } =
        useSidebarToggleStore();

    const fetchMailsCount = async (): Promise<MailCounts> => {
        const res = await apiWrapper.get<{
            data: MailCounts;
        }>(
            "/Correspondences/statistics/counts-by-type"
        );

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
    });

    return (
        <motion.aside
            dir="rtl"
            animate={{
                width: isSidebarToggleShown
                    ? 288 // w-72
                    : 80, // w-20
            }}
            transition={{
                duration: 0.35,
                ease: "easeInOut",
            }}
            className={`
                h-[calc(100vh-64px)]
                bg-blue-100
                p-4
                flex
                flex-col
                justify-between
                z-10
                overflow-hidden
                ${!isSidebarToggleShown ? "ml-auto" : ""}
            `}
        >
            {/* TOP SECTION */}
            <div>
                {/* Compose Button */}
                <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-blue-700 transition"
                    onClick={triggerMailCompose}
                >
                    <FontAwesomeIcon icon={faPlus} />

                    <AnimatePresence>
                        {isSidebarToggleShown && (
                            <motion.span
                                initial={{
                                    opacity: 0,
                                    x: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: 10,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                            >
                                انشاء بريد
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Main Navigation */}
                <div className="flex flex-col gap-y-2 justify-center">
                    <SidebarItem
                        icon={faEnvelope}
                        label={
                            isSidebarToggleShown
                                ? "صندوق البريد"
                                : ""
                        }
                        onClick={() =>
                            setFilter("")
                        }
                        active={filter === ""}
                        count={
                            isSidebarToggleShown
                                ? data.totalCount
                                : undefined
                        }
                    />

                    <SidebarItem
                        icon={faInbox}
                        label={
                            isSidebarToggleShown
                                ? "الوارد"
                                : ""
                        }
                        onClick={() =>
                            setFilter("Incoming")
                        }
                        active={
                            filter === "Incoming"
                        }
                        count={
                            isSidebarToggleShown
                                ? data.incomingCount
                                : undefined
                        }
                    />

                    <SidebarItem
                        icon={faPaperPlane}
                        label={
                            isSidebarToggleShown
                                ? "الصادر"
                                : ""
                        }
                        onClick={() =>
                            setFilter("Outgoing")
                        }
                        active={
                            filter === "Outgoing"
                        }
                        count={
                            isSidebarToggleShown
                                ? data.outgoingCount
                                : undefined
                        }
                    />

                    <SidebarItem
                        icon={faFile}
                        label={
                            isSidebarToggleShown
                                ? "الداخلي"
                                : ""
                        }
                        onClick={() =>
                            setFilter("Internal")
                        }
                        active={
                            filter === "Internal"
                        }
                        count={
                            isSidebarToggleShown
                                ? data.internalCount
                                : undefined
                        }
                    />

                    <SidebarItem
                        icon={faBriefcase}
                        label={
                            isSidebarToggleShown
                                ? "المهني"
                                : ""
                        }
                        onClick={() =>
                            setFilter(
                                "Professional"
                            )
                        }
                        active={
                            filter ===
                            "Professional"
                        }
                        count={
                            isSidebarToggleShown
                                ? data.professionalCount
                                : undefined
                        }
                    />
                </div>

                {/* Divider */}
                <div
                    className={`my-6 border-t ${isSidebarToggleShown
                            ? ""
                            : "border-blue-600"
                        }`}
                />

                {/* Folders */}
                <AnimatePresence>
                    {isSidebarToggleShown ? (
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 20,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{
                                opacity: 0,
                                x: 20,
                            }}
                            transition={{
                                duration: 0.25,
                            }}
                        >
                            <div className="flex w-60 items-center justify-between text-sm text-gray-500 mb-2">
                                <span>
                                    المجلدات
                                </span>

                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <SidebarItem
                                    icon={faFolder}
                                    label="الإعلانات"
                                />

                                <SidebarItem
                                    icon={faFolder}
                                    label="الدورات"
                                    count={12}
                                />

                                <SidebarItem
                                    icon={faFolder}
                                    label="المشاريع"
                                    count={3}
                                />

                                <SidebarItem
                                    icon={faFolder}
                                    label="إداري"
                                    count={4}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            className="flex flex-col"
                        >
                            <FontAwesomeIcon
                                icon={faFolderPlus}
                                className="cursor-pointer text-blue-600 mx-auto"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Storage */}
            <AnimatePresence>
                {isSidebarToggleShown && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 10,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="p-4 rounded-lg"
                    >
                        <p className="text-gray-500 mb-1">
                            التخزين
                        </p>

                        <div className="w-full bg-gray-300 h-2 rounded-full">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-200 h-2 rounded-full w-[24%]" />
                        </div>

                        <p className="text-xs text-gray-400 mt-1">
                            2.4GB من 10GB
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mail Compose */}
            {isMailComposeShown && <MailCompose />}
        </motion.aside>
    );
}