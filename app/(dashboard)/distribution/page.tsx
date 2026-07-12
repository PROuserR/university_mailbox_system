/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/distribution/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchStore } from "@/store/searchStore";
import useUserInfoStore from "@/store/userInfoStore";
import useUIModeStore from "@/store/uiModeStore";
import useShowMailDetailsStore from "@/store/showMailDetails";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import MailCard from "@/components/mail/MailCard";
import MailViewer from "@/components/mail/MailViewer";
import MailListLoader from "@/components/ui/MailListLoader";
import MailListError from "@/components/ui/MailListError";
import { Mail } from "@/types/api/Mail/Mail";
import { InboxEmailList } from "@/components/distribution/InboxEmailList";
import { OutboxEmailList } from "@/components/distribution/OutboxEmailList";
import { InboxEmailDetail } from "@/components/distribution/InboxEmailDetail";
import { OutboxEmailDetail } from "@/components/distribution/OutboxEmailDetail";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Drawer } from 'vaul';
import { useSwipeable } from 'react-swipeable';
import {
  RefreshCw,
  Filter,
  ChevronDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
    faInbox,
    faPaperPlane,
    faSortAmountDown,
    faSortAmountUp,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { DistributionInboxDto, DistributionOutboxDto } from "@/types/api/distribution";
import type { ApiResult } from "@/utils/apiClient";

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

// ================= SORT TYPES =================

type ModernSortField = 
  | "distributeddate" 
  | "title" 
  | "number" 
  | "status" 
  | "sender" 
  | "distributor" 
  | "receiver" 
  | "issueddate" 
  | "receiveddate" 
  | "sentdate";

const sortOptions: { value: ModernSortField; label: string }[] = [
  { value: "distributeddate", label: "تاريخ التوزيع" },
  { value: "title", label: "العنوان" },
  { value: "number", label: "الرقم" },
  { value: "status", label: "الحالة" },
  { value: "sender", label: "الجهة المرسلة" },
  { value: "distributor", label: "المرسل" },
  { value: "receiver", label: "المستلم" },
  { value: "issueddate", label: "تاريخ الإصدار" },
  { value: "receiveddate", label: "تاريخ الاستلام" },
  { value: "sentdate", label: "تاريخ الإرسال" },
];

type TabType = "inbox" | "outbox";

interface PageResponseModern<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ================= COMPONENT CONTENT =================

function DistributionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { role } = useUserInfoStore();
    const { searchQuery } = useSearchStore();
    const { uiMode } = useUIModeStore();
    const isMobile = useMediaQuery("(max-width: 768px)");

    // ===== Classic Mode States =====
    const {
        isMailDetailsStoreShown,
        triggerMailDetailsStoreShown,
    } = useShowMailDetailsStore();
    const [folder, setFolder] = useState<"inbox" | "outbox">("inbox");
    const [sortBy, setSortBy] = useState<
        "DistributedDate" | "title" | "number"
    >("DistributedDate");
    const [sortDescending, setSortDescending] = useState(true);
    const [selectedMailData, setSelectedMailData] = useState<Mail>();

    // ===== Modern Mode States =====
    const [activeTab, setActiveTab] = useState<TabType>("inbox");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [modernSortField, setModernSortField] = useState<ModernSortField>("distributeddate");
    const [modernSortOrder, setModernSortOrder] = useState<"asc" | "desc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [mainTypeFilter, setMainTypeFilter] = useState<string>("all");
    const [professionalFilter, setProfessionalFilter] = useState<string>("all");

    const isModernMode = uiMode === "modern";
    const canViewOutbox = role === "Dean" || role === "Admin" || role === "Employee";

    // ✅ قراءة نوع التبويب من الـ URL وتحديث الحالة
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "inbox") {
            setActiveTab("inbox");
            setFolder("inbox");
        } else if (tab === "outbox") {
            setActiveTab("outbox");
            setFolder("outbox");
        }
    }, [searchParams]);


    
    // ==========================================
    // ===== CLASSIC MODE FETCH =====
    // ==========================================

    const fetchClassicMails = async (page: number): Promise<PageResponse> => {
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
            search: searchQuery || undefined,
        });

        if (!res.success || !res.data) {
            throw new Error("Failed loading mails");
        }

        return res.data.data;
    };

    const {
        data: classicData,
        fetchNextPage: fetchNextClassic,
        hasNextPage: hasNextClassic,
        isFetchingNextPage: isFetchingNextClassic,
        isLoading: isLoadingClassic,
        isError: isErrorClassic,
        refetch: refetchClassic,
    } = useInfiniteQuery<PageResponse>({
        queryKey: ["distribution-classic", folder, sortBy, sortDescending, searchQuery],
        queryFn: ({ pageParam = 1 }) => fetchClassicMails(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
        },
        enabled: !isModernMode,
    });

    const classicMails = classicData?.pages.flatMap((page) => page.items) ?? [];

    const classicBottomRef = useInfiniteScroll({
        onBottom: () => {
            fetchNextClassic();
        },
        isLoading: isFetchingNextClassic,
        hasMore: !!hasNextClassic,
        dataLength: classicMails.length,
    });

    const swipeHandlers = useSwipeable({
        onSwipedDown: () => {
            if (detailOpen) handleCloseDetail();
        },
        trackMouse: true,
        trackTouch: true,
        delta: 50,
    });

    const openMail = (mail: Mail) => {
        setSelectedMailData(mail);
        triggerMailDetailsStoreShown();
    };

    // ✅ دالة التحديث للـ Classic Mode
    const handleRefreshClassic = () => {
        queryClient.resetQueries({
            queryKey: ["distribution-classic", folder, sortBy, sortDescending, searchQuery],
        });
    };

    // ==========================================
    // ===== MODERN MODE FETCH =====
    // ==========================================

    const fetchModernInbox = async (page: number): Promise<PageResponseModern<DistributionInboxDto>> => {
        const params: any = {
            page,
            pageSize: 20,
            sortBy: modernSortField,
            sortDescending: modernSortOrder === "desc",
        };

        if (searchQuery) params.search = searchQuery;
        if (mainTypeFilter !== "all") params.mainType = mainTypeFilter;
        if (professionalFilter !== "all") params.isProfessional = professionalFilter === "true";

        const res = await apiWrapper.get<ApiResult<PageResponseModern<DistributionInboxDto>>>(
            "/Distributions/my-inbox",
            params
        );

        if (!res.success || !res.data || !res.data.isSuccess) {
            throw new Error(res.data?.message || "Failed to load inbox");
        }

        return res.data.data;
    };

    const fetchModernOutbox = async (page: number): Promise<PageResponseModern<DistributionOutboxDto>> => {
        const params: any = {
            page,
            pageSize: 20,
            sortBy: modernSortField,
            sortDescending: modernSortOrder === "desc",
        };

        if (searchQuery) params.search = searchQuery;
        if (mainTypeFilter !== "all") params.mainType = mainTypeFilter;
        if (professionalFilter !== "all") params.isProfessional = professionalFilter === "true";

        const res = await apiWrapper.get<ApiResult<PageResponseModern<DistributionOutboxDto>>>(
            "/Distributions/my-outbox",
            params
        );

        if (!res.success || !res.data || !res.data.isSuccess) {
            throw new Error(res.data?.message || "Failed to load outbox");
        }

        return res.data.data;
    };

    // Inbox Query (Modern)
    const {
        data: inboxData,
        fetchNextPage: fetchNextInbox,
        hasNextPage: hasNextInbox,
        isFetchingNextPage: isFetchingNextInbox,
        isLoading: isLoadingInbox,
        isError: isErrorInbox,
        refetch: refetchInbox,
    } = useInfiniteQuery({
        queryKey: ["distribution-inbox", modernSortField, modernSortOrder, searchQuery, mainTypeFilter, professionalFilter],
        queryFn: ({ pageParam = 1 }) => fetchModernInbox(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
        },
        enabled: activeTab === "inbox" && isModernMode,
    });

    // Outbox Query (Modern)
    const {
        data: outboxData,
        fetchNextPage: fetchNextOutbox,
        hasNextPage: hasNextOutbox,
        isFetchingNextPage: isFetchingNextOutbox,
        isLoading: isLoadingOutbox,
        isError: isErrorOutbox,
        refetch: refetchOutbox,
    } = useInfiniteQuery({
        queryKey: ["distribution-outbox", modernSortField, modernSortOrder, searchQuery, mainTypeFilter, professionalFilter],
        queryFn: ({ pageParam = 1 }) => fetchModernOutbox(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
        },
        enabled: activeTab === "outbox" && canViewOutbox && isModernMode,
    });

    const inboxItems = inboxData?.pages.flatMap((p) => p.items) ?? [];
    const outboxItems = outboxData?.pages.flatMap((p) => p.items) ?? [];
    const totalInbox = inboxData?.pages[0]?.totalCount ?? 0;
    const totalOutbox = outboxData?.pages[0]?.totalCount ?? 0;

    const modernItems = activeTab === "inbox" ? inboxItems : outboxItems;
    const hasMoreModern = activeTab === "inbox" ? hasNextInbox : hasNextOutbox;
    const isFetchingMoreModern = activeTab === "inbox" ? isFetchingNextInbox : isFetchingNextOutbox;
    const isLoadingModern = activeTab === "inbox" ? isLoadingInbox : isLoadingOutbox;
    const isErrorModern = activeTab === "inbox" ? isErrorInbox : isErrorOutbox;

    const selectedItem = modernItems.find((item) => item.id === selectedId) || null;
    const currentIndex = selectedId ? modernItems.findIndex((item) => item.id === selectedId) : -1;

    // ==========================================
    // ===== MODERN HANDLERS =====
    // ==========================================

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setFolder(tab);
        setSelectedId(null);
        setDetailOpen(false);
        router.push(`/distribution?tab=${tab}`);
    };

    const handleSelectItem = (id: number) => {
        setSelectedId(id);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedId(null);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setSelectedId(modernItems[currentIndex - 1].id);
        }
    };

    const handleNext = () => {
        if (currentIndex < modernItems.length - 1) {
            setSelectedId(modernItems[currentIndex + 1].id);
        }
    };

    const handleMarkAsRead = async () => {
        if (!selectedId) return;
        
        const selected = modernItems.find(item => item.id === selectedId);
        if (!selected) {
            toast.error("لم يتم العثور على المراسلة");
            return;
        }

        try {
            const response = await apiWrapper.post<ApiResult<object>>(
                "/Distributions/mark-as-read",
                {
                    correspondenceId: selected.correspondenceId
                }
            );

            if (response.success && response.data?.isSuccess) {
                toast.success(response.data.message || "تم تحديد البريد كمقروء");
                if (activeTab === "inbox") {
                    refetchInbox();
                } else {
                    refetchOutbox();
                }
            } else {
                toast.error(response.data?.message || "فشل تحديث الحالة");
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || "فشل تحديث الحالة";
            toast.error(message);
        }
    };

    // ✅ دالة التحديث للـ Modern Mode
    const handleRefreshModern = () => {
        if (activeTab === "inbox") {
            queryClient.resetQueries({
                queryKey: ["distribution-inbox", modernSortField, modernSortOrder, searchQuery, mainTypeFilter, professionalFilter],
            });
        } else {
            queryClient.resetQueries({
                queryKey: ["distribution-outbox", modernSortField, modernSortOrder, searchQuery, mainTypeFilter, professionalFilter],
            });
        }
    };

    const toggleModernSortOrder = () => {
        setModernSortOrder(modernSortOrder === "desc" ? "asc" : "desc");
    };

    // ==========================================
    // ===== INFINITE SCROLL (MODERN) =====
    // ==========================================

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback(
        (node: HTMLDivElement) => {
            if (isFetchingMoreModern) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreModern) {
                    if (activeTab === "inbox") {
                        fetchNextInbox();
                    } else {
                        fetchNextOutbox();
                    }
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [isFetchingMoreModern, hasMoreModern, activeTab, fetchNextInbox, fetchNextOutbox]
    );

    // ==========================================
    // ===== RENDER =====
    // ==========================================

    // ===== CLASSIC MODE =====
    if (!isModernMode) {
        if (isLoadingClassic) return <MailListLoader />;
        if (isErrorClassic) return <MailListError />;

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
                        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(
                                                    e.target.value as
                                                        | "DistributedDate"
                                                        | "title"
                                                        | "number"
                                                )
                                            }
                                            className="text-xs sm:text-sm bg-transparent outline-none text-gray-600 cursor-pointer"
                                        >
                                            <option value="DistributedDate">التاريخ</option>
                                            <option value="title">العنوان</option>
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

                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm" 
                                        onClick={handleRefreshClassic}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isFetchingNextClassic ? "animate-spin" : ""}`} />
                                    </Button>

                                    <h2 className="text-xs sm:text-sm font-semibold text-blue-700">
                                        {folder === "inbox" ? "البريد الوارد" : "البريد الصادر"}
                                        <span className="text-gray-400 mr-1 font-normal">
                                            (إجمالي {classicData?.pages[0]?.totalCount ?? 0} · عرض {classicMails.length})
                                        </span>
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {classicMails.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="text-5xl mb-3">📭</div>
                                    <p className="text-base font-medium">
                                        {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد رسائل"}
                                    </p>
                                </div>
                            ) : (
                                classicMails.map((mail, index) => (
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

                            <div ref={classicBottomRef} className="py-2">
                                {isFetchingNextClassic && (
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

    // ===== MODERN MODE =====
    if (isLoadingModern) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isErrorModern) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">حدث خطأ أثناء تحميل التوزيعات</p>
                <Button onClick={handleRefreshModern}>
                    <RefreshCw className="ml-2 h-4 w-4" />
                    إعادة المحاولة
                </Button>
            </div>
        );
    }

    // ========== MODERN - DESKTOP ==========
    if (!isMobile) {
        return (
            <TooltipProvider>
                <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                    <div className="w-96 shrink-0 border-l border-border flex flex-col h-full overflow-hidden">
                        <div className="shrink-0 border-b border-border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {activeTab === "inbox" ? "الوارد" : "الصادر"}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        إجمالي {activeTab === "inbox" ? totalInbox : totalOutbox} مراسلة
                                        {modernItems.length > 0 && ` · عرض ${modernItems.length}`}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon-sm" onClick={handleRefreshModern}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    فلاتر
                                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={toggleModernSortOrder}
                                        className="p-1 rounded hover:bg-muted/50 text-muted-foreground"
                                    >
                                        {modernSortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                                    </button>
                                    <select
                                        value={modernSortField}
                                        onChange={(e) => setModernSortField(e.target.value as ModernSortField)}
                                        className="bg-transparent text-xs outline-none text-muted-foreground"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <select
                                        value={mainTypeFilter}
                                        onChange={(e) => setMainTypeFilter(e.target.value)}
                                        className="text-xs border border-border rounded-md px-2 py-1 bg-background"
                                    >
                                        <option value="all">جميع الأنواع</option>
                                        <option value="Incoming">وارد</option>
                                        <option value="Outgoing">صادر</option>
                                        <option value="Internal">داخلي</option>
                                    </select>
                                    <select
                                        value={professionalFilter}
                                        onChange={(e) => setProfessionalFilter(e.target.value)}
                                        className="text-xs border border-border rounded-md px-2 py-1 bg-background"
                                    >
                                        <option value="all">الكل</option>
                                        <option value="true">مهني</option>
                                        <option value="false">عادي</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto hide-scrollbar">
                            {activeTab === "inbox" ? (
                                <InboxEmailList
                                    items={inboxItems}
                                    selectedId={selectedId}
                                    onSelectItem={handleSelectItem}
                                    isLoadingMore={isFetchingMoreModern}
                                    hasMore={hasMoreModern}
                                />
                            ) : (
                                <OutboxEmailList
                                    items={outboxItems}
                                    selectedId={selectedId}
                                    onSelectItem={handleSelectItem}
                                    isLoadingMore={isFetchingMoreModern}
                                    hasMore={hasMoreModern}
                                />
                            )}
                            <div ref={loadMoreRef} className="h-1" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {selectedItem ? (
                            activeTab === "inbox" ? (
                                <InboxEmailDetail
                                    item={selectedItem as DistributionInboxDto}
                                    onClose={handleCloseDetail}
                                    onMarkAsRead={handleMarkAsRead}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    hasPrevious={currentIndex > 0}
                                    hasNext={currentIndex < modernItems.length - 1}
                                    currentIndex={currentIndex}
                                    totalCount={modernItems.length}
                                />
                            ) : (
                                <OutboxEmailDetail
                                    item={selectedItem as DistributionOutboxDto}
                                    onClose={handleCloseDetail}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    hasPrevious={currentIndex > 0}
                                    hasNext={currentIndex < modernItems.length - 1}
                                    currentIndex={currentIndex}
                                    totalCount={modernItems.length}
                                />
                            )
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                <div className="text-center">
                                    <p className="text-lg">📬</p>
                                    <p>اختر مراسلة من القائمة</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </TooltipProvider>
        );
    }

    // ========== MODERN - MOBILE ==========
    return (
        <TooltipProvider>
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="shrink-0 border-b border-border p-4 space-y-3 bg-background">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                {activeTab === "inbox" ? "الوارد" : "الصادر"}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {activeTab === "inbox" ? totalInbox : totalOutbox} مراسلة
                                {modernItems.length > 0 && ` · عرض ${modernItems.length}`}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={handleRefreshModern}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={mainTypeFilter}
                            onChange={(e) => setMainTypeFilter(e.target.value)}
                            className="flex-1 text-xs border border-border rounded-md px-2 py-1.5 bg-background"
                        >
                            <option value="all">جميع الأنواع</option>
                            <option value="Incoming">وارد</option>
                            <option value="Outgoing">صادر</option>
                            <option value="Internal">داخلي</option>
                        </select>
                        <select
                            value={professionalFilter}
                            onChange={(e) => setProfessionalFilter(e.target.value)}
                            className="flex-1 text-xs border border-border rounded-md px-2 py-1.5 bg-background"
                        >
                            <option value="all">الكل</option>
                            <option value="true">مهني</option>
                            <option value="false">عادي</option>
                        </select>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggleModernSortOrder}
                                className="p-1.5 border border-border rounded-md hover:bg-muted/50"
                            >
                                {modernSortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                            </button>
                            <select
                                value={modernSortField}
                                onChange={(e) => setModernSortField(e.target.value as ModernSortField)}
                                className="text-xs border border-border rounded-md px-2 py-1.5 bg-background"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    {activeTab === "inbox" ? (
                        <InboxEmailList
                            items={inboxItems}
                            selectedId={selectedId}
                            onSelectItem={handleSelectItem}
                            isLoadingMore={isFetchingMoreModern}
                            hasMore={hasMoreModern}
                        />
                    ) : (
                        <OutboxEmailList
                            items={outboxItems}
                            selectedId={selectedId}
                            onSelectItem={handleSelectItem}
                            isLoadingMore={isFetchingMoreModern}
                            hasMore={hasMoreModern}
                        />
                    )}
                    <div ref={loadMoreRef} className="h-1" />
                </div>

                <Drawer.Root 
                    open={detailOpen} 
                    onOpenChange={(open) => {
                        setDetailOpen(open);
                        if (!open) {
                            document.body.style.overflow = 'unset';
                        }
                    }}
                    modal={true}
                    dismissible={true}
                    closeThreshold={0.05}
                >
                    <Drawer.Portal>
                        <Drawer.Overlay 
                            className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150"
                        />
                        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] rounded-t-xl bg-white p-0 outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-200">
                            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none shrink-0">
                                <div className="h-1 w-12 rounded-full bg-gray-300" />
                            </div>
                            
                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                                {selectedItem && (
                                    activeTab === "inbox" ? (
                                        <InboxEmailDetail
                                            item={selectedItem as DistributionInboxDto}
                                            onClose={handleCloseDetail}
                                            onMarkAsRead={handleMarkAsRead}
                                            onPrevious={handlePrevious}
                                            onNext={handleNext}
                                            hasPrevious={currentIndex > 0}
                                            hasNext={currentIndex < modernItems.length - 1}
                                            currentIndex={currentIndex}
                                            totalCount={modernItems.length}
                                        />
                                    ) : (
                                        <OutboxEmailDetail
                                            item={selectedItem as DistributionOutboxDto}
                                            onClose={handleCloseDetail}
                                            onPrevious={handlePrevious}
                                            onNext={handleNext}
                                            hasPrevious={currentIndex > 0}
                                            hasNext={currentIndex < modernItems.length - 1}
                                            currentIndex={currentIndex}
                                            totalCount={modernItems.length}
                                        />
                                    )
                                )}
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>
            </div>
        </TooltipProvider>
    );
}

// ================= MAIN EXPORT WITH SUSPENSE =================

export default function DistributionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <DistributionContent />
        </Suspense>
    );
}