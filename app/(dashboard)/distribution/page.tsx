// app/(dashboard)/distribution/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import useShowMailDetailsStore from "@/store/showMailDetails";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import MailCard from "@/components/mail/MailCard";
import MailViewer from "@/components/mail/MailViewer";
import MailListLoader from "@/components/ui/MailListLoader";
import MailListError from "@/components/ui/MailListError";
import { Mail } from "@/types/api/Mail/Mail";
import {
    faInbox,
    faPaperPlane,
    faSortAmountDown,
    faSortAmountUp,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUserInfoStore from "@/store/userInfoStore";
import { useSearchStore } from "@/store/searchStore";
import { useCleanupFilters } from "@/hooks/useCleanupFilters";

// ================= TYPES =================

interface Attachment {
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    isPrimary: boolean;
    uploadedAt: string;
    uploadedBy: string;
    downloadUrl: string | null;
}

interface DistributionMail {
    id: number;
    distributedDate: string;
    status: string;
    readAt: string | null;
    isRead: boolean;
    isAutoDistributed: boolean;
    notes: string | null;
    distributorName?: string;
    distributorEmail?: string;
    distributorRole?: string;
    receiverId?: number;
    receiverName?: string;
    receiverEmail?: string;
    receiverRole?: string;
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    correspondenceContent: string | null;
    mainType: string;
    isProfessional: boolean;
    documentType: string;
    senderEntity: string | null;
    senderReference: string | null;
    issuedDate: string | null;
    receivedDate: string | null;
    sentDate: string | null;
    attachments: Attachment[];
}

interface PageResponse {
    items: DistributionMail[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// ================= NORMALIZE =================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMail = (mail: DistributionMail): any => {
    return {
        id: mail.id,
        number: mail.correspondenceNumber,
        title: mail.correspondenceTitle,
        content: mail.correspondenceContent ?? "",
        createdAt: mail.distributedDate,
        sender: mail.distributorName ?? mail.receiverName ?? "غير معروف",
        documentType: mail.documentType,
        documentTypeId: 0,
        senderEntityId: 0,
        totalReceivers: 1,
        senderEntity: mail.senderEntity ?? "",
        isProfessional: mail.isProfessional,
        mainType: mail.mainType,
        status: mail.status,
        isRead: mail.isRead,
        readAt: mail.readAt,
        attachments: mail.attachments ?? [],
        correspondenceId: mail.correspondenceId,
        correspondenceNumber: mail.correspondenceNumber,
        correspondenceTitle: mail.correspondenceTitle,
        correspondenceContent: mail.correspondenceContent,
        distributedDate: mail.distributedDate,
        issuedDate: mail.issuedDate,
        receivedDate: mail.receivedDate,
        sentDate: mail.sentDate,
    };
};

// ================= COMPONENT =================

export default function DistributionPage() {
    useCleanupFilters();
    const { role } = useUserInfoStore();
    const { searchQuery } = useSearchStore(); // ✅ استخدام searchQuery

    const {
        isMailDetailsStoreShown,
        triggerMailDetailsStoreShown,
    } = useShowMailDetailsStore();

    const [folder, setFolder] = useState<"inbox" | "outbox">("inbox");
    const [sortBy, setSortBy] = useState<
        "DistributedDate" | "CorrespondenceTitle" | "DistributorName" | "number"
    >("DistributedDate");
    const [sortDescending, setSortDescending] = useState(true);
    const [selectedMailData, setSelectedMailData] = useState<Mail>();

    // ================= FETCH =================

    const fetchMails = async (page: number): Promise<PageResponse> => {
        const endpoint =
            folder === "inbox"
                ? "/Distributions/my-inbox"
                : "/Distributions/my-outbox";

        const res = await apiWrapper.get<{
            data: PageResponse;
        }>(endpoint, {
            page,
            pageSize: 10,
            sortBy,
            sortDescending,
            search: searchQuery || undefined, // ✅ استخدام searchQuery
        });

        if (!res.success || !res.data) {
            throw new Error("Failed loading mails");
        }

        return res.data.data;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<PageResponse>({
        queryKey: ["distribution-mails", folder, sortBy, sortDescending, searchQuery], // ✅ استخدام searchQuery
        queryFn: ({ pageParam = 1 }) => fetchMails(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
        },
    });

    const mails = data?.pages.flatMap((page) => page.items) ?? [];

    const bottomRef = useInfiniteScroll({
        onBottom: () => {
            fetchNextPage();
        },
        isLoading: isFetchingNextPage,
        hasMore: !!hasNextPage,
        dataLength: mails.length,
    });

    const openMail = (mail: Mail) => {
        setSelectedMailData(mail);
        triggerMailDetailsStoreShown();
    };

    // ================= CLEANUP ON UNMOUNT =================
    useEffect(() => {
        return () => {
            // ✅ تنظيف عند الخروج من الصفحة
            // لا نقوم بمسح searchQuery لأن المستخدم قد يعود للصفحة
        };
    }, []);

    // ================= LOADING / ERROR =================

    if (isLoading) return <MailListLoader />;
    if (isError) return <MailListError />;

    // ================= RENDER =================

    return (
        <AnimatePresence mode="wait">
            {!isMailDetailsStoreShown ? (
                <motion.div
                    key="mail-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full w-full bg-gray-50"
                    dir="rtl"
                >
                    {/* ===== HEADER ===== */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {/* ===== SORT ===== */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(
                                                e.target.value as
                                                    | "DistributedDate"
                                                    | "CorrespondenceTitle"
                                                    | "DistributorName"
                                                    | "number"
                                            )
                                        }
                                        className="text-xs sm:text-sm bg-transparent outline-none text-gray-600 cursor-pointer"
                                    >
                                        <option value="DistributedDate">التاريخ</option>
                                        <option value="CorrespondenceTitle">العنوان</option>
                                        <option value="DistributorName">المرسل</option>
                                        <option value="number">الرقم</option>
                                        <option value="status">الحالة</option>
                                    </select>
                                    <button
                                        onClick={() => setSortDescending(!sortDescending)}
                                        className="text-blue-600 p-1 hover:bg-blue-50 rounded transition"
                                    >
                                        <FontAwesomeIcon
                                            icon={sortDescending ? faSortAmountDown : faSortAmountUp}
                                            className="text-xs sm:text-sm"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* ===== FOLDER TABS ===== */}
                            <div className="flex gap-1.5 bg-blue-50 rounded-xl p-1">
                                <button
                                    onClick={() => setFolder("inbox")}
                                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                                        folder === "inbox"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-blue-700 hover:bg-blue-100"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faInbox} className="ml-1" />
                                    الوارد
                                </button>

                                {role !== "User" && (
                                    <button
                                        onClick={() => setFolder("outbox")}
                                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                                            folder === "outbox"
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-blue-700 hover:bg-blue-100"
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="ml-1" />
                                        الصادر
                                    </button>
                                )}
                            </div>

                            {/* ===== TITLE ===== */}
                            <h2 className="text-xs sm:text-sm font-semibold text-blue-700">
                                {folder === "inbox" ? "البريد الوارد" : "البريد الصادر"}
                                <span className="text-gray-400 mr-1 font-normal">
                                    ({mails.length})
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* ===== MAIL LIST ===== */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {mails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="text-5xl mb-3">📭</div>
                                <p className="text-base font-medium">
                                    {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد رسائل"}
                                </p>
                                <p className="text-sm">
                                    {searchQuery
                                        ? `"${searchQuery}"`
                                        : folder === "inbox"
                                        ? "الوارد"
                                        : "الصادر"}
                                </p>
                            </div>
                        ) : (
                            mails.map((mail, index) => (
                                <MailCard
                                    key={mail.id}
                                    mail={normalizeMail(mail)}
                                    index={index}
                                    onClick={openMail}
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    editable={false}
                                />
                            ))
                        )}

                        {/* ===== LOAD MORE ===== */}
                        <div ref={bottomRef} className="py-2">
                            {isFetchingNextPage && (
                                <div className="flex items-center justify-center gap-2 text-blue-600 py-3">
                                    <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                                    <span className="text-xs">جاري تحميل المزيد...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="mail-viewer"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="p-4 w-full h-full"
                    dir="rtl"
                >
                    {selectedMailData && (
                        <MailViewer
                            data={selectedMailData}
                            hideActions={true}
                            onBack={() => {
                                triggerMailDetailsStoreShown();
                            }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}