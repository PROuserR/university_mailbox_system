/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/distribution/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { useSearchStore } from "@/store/searchStore";
import { InboxEmailList } from "@/components/distribution/InboxEmailList";
import { OutboxEmailList } from "@/components/distribution/OutboxEmailList";
import { InboxEmailDetail } from "@/components/distribution/InboxEmailDetail";
import { OutboxEmailDetail } from "@/components/distribution/OutboxEmailDetail";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Drawer } from "vaul";
import {
  RefreshCw,
  Filter,
  ChevronDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSearchParams, useRouter } from "next/navigation";
import type {
  DistributionInboxDto,
  DistributionOutboxDto,
} from "@/types/api/distribution.types";
import { ApiResult } from "@/types/api/ApiResult";

import { useAuth } from "@/hooks/useAuth";


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
  const { searchQuery } = useSearchStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { hasPermission, isLoading: authLoading } = useAuth();
  const canViewOutbox = hasPermission("ViewDistribution");

  // ===== Modern Mode States =====
  const [activeTab, setActiveTab] = useState<TabType>("inbox");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modernSortField, setModernSortField] =
    useState<ModernSortField>("distributeddate");
  const [modernSortOrder, setModernSortOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [mainTypeFilter, setMainTypeFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "outbox") {
      if (!canViewOutbox) {
        router.push("/unauthorized");
        return;
      }
      setActiveTab("outbox");
    } else {
      setActiveTab("inbox");
    }
  }, [searchParams, canViewOutbox, router]);

  // ==========================================
  // ===== MODERN MODE FETCH =====
  // ==========================================

  const fetchModernInbox = async (
    page: number
  ): Promise<PageResponseModern<DistributionInboxDto>> => {
    const params: any = {
      page,
      pageSize: 20,
      sortBy: modernSortField,
      sortDescending: modernSortOrder === "desc",
    };

    if (searchQuery) params.search = searchQuery;
    if (mainTypeFilter !== "all") params.mainType = mainTypeFilter;
    if (professionalFilter !== "all")
      params.isProfessional = professionalFilter === "true";

    const res = await apiWrapper.get<
      ApiResult<PageResponseModern<DistributionInboxDto>>
    >("/Distributions/my-inbox", params);

    if (!res.success || !res.data || !res.data.isSuccess) {
      throw new Error(res.data?.message || "Failed to load inbox");
    }

    return res.data.data;
  };

  const fetchModernOutbox = async (
    page: number
  ): Promise<PageResponseModern<DistributionOutboxDto>> => {
    const params: any = {
      page,
      pageSize: 20,
      sortBy: modernSortField,
      sortDescending: modernSortOrder === "desc",
    };

    if (searchQuery) params.search = searchQuery;
    if (mainTypeFilter !== "all") params.mainType = mainTypeFilter;
    if (professionalFilter !== "all")
      params.isProfessional = professionalFilter === "true";

    const res = await apiWrapper.get<
      ApiResult<PageResponseModern<DistributionOutboxDto>>
    >("/Distributions/my-outbox", params);

    if (!res.success || !res.data || !res.data.isSuccess) {
      throw new Error(res.data?.message || "Failed to load outbox");
    }

    return res.data.data;
  };

  // ✅ Inbox Query - دائماً مفعل (للجميع)
  const {
    data: inboxData,
    fetchNextPage: fetchNextInbox,
    hasNextPage: hasNextInbox,
    isFetchingNextPage: isFetchingNextInbox,
    isLoading: isLoadingInbox,
    isError: isErrorInbox,
    refetch: refetchInbox,
  } = useInfiniteQuery({
    queryKey: [
      "distribution-inbox",
      modernSortField,
      modernSortOrder,
      searchQuery,
      mainTypeFilter,
      professionalFilter,
    ],
    queryFn: ({ pageParam = 1 }) => fetchModernInbox(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    enabled: activeTab === "inbox",
  });

  // ✅ Outbox Query - مفعل فقط إذا كان المستخدم لديه صلاحية والتبويب نشط
  const {
    data: outboxData,
    fetchNextPage: fetchNextOutbox,
    hasNextPage: hasNextOutbox,
    isFetchingNextPage: isFetchingNextOutbox,
    isLoading: isLoadingOutbox,
    isError: isErrorOutbox,
    refetch: refetchOutbox,
  } = useInfiniteQuery({
    queryKey: [
      "distribution-outbox",
      modernSortField,
      modernSortOrder,
      searchQuery,
      mainTypeFilter,
      professionalFilter,
    ],
    queryFn: ({ pageParam = 1 }) => fetchModernOutbox(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    enabled: activeTab === "outbox" && canViewOutbox,
  });

  // ============================================================
  // ✅ منع تكرار الـ keys باستخدام Set
  // ============================================================
  const inboxItems = useMemo(() => {
    if (!inboxData?.pages) return [];
    const seen = new Set<number>();
    const result: DistributionInboxDto[] = [];
    inboxData.pages.forEach((page) => {
      page.items.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      });
    });
    return result;
  }, [inboxData]);

  const outboxItems = useMemo(() => {
    if (!outboxData?.pages) return [];
    const seen = new Set<number>();
    const result: DistributionOutboxDto[] = [];
    outboxData.pages.forEach((page) => {
      page.items.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      });
    });
    return result;
  }, [outboxData]);

  const totalInbox = inboxData?.pages[0]?.totalCount ?? 0;
  const totalOutbox = outboxData?.pages[0]?.totalCount ?? 0;

  const modernItems = activeTab === "inbox" ? inboxItems : outboxItems;
  const hasMoreModern = activeTab === "inbox" ? hasNextInbox : hasNextOutbox;
  const isFetchingMoreModern =
    activeTab === "inbox" ? isFetchingNextInbox : isFetchingNextOutbox;
  const isLoadingModern =
    activeTab === "inbox" ? isLoadingInbox : isLoadingOutbox;
  const isErrorModern = activeTab === "inbox" ? isErrorInbox : isErrorOutbox;

  const selectedItem =
    modernItems.find((item) => item.id === selectedId) || null;
  const currentIndex = selectedId
    ? modernItems.findIndex((item) => item.id === selectedId)
    : -1;

  // ==========================================
  // ===== MODERN HANDLERS =====
  // ==========================================

  const handleTabChange = (tab: TabType) => {
    // ✅ منع الانتقال إلى الصادر إذا لم يكن لديه صلاحية
    if (tab === "outbox" && !canViewOutbox) {
      router.push("/unauthorized");
      return;
    }

    setActiveTab(tab);
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

  const handleRefresh = () => {
    if (activeTab === "inbox") {
      queryClient.resetQueries({
        queryKey: [
          "distribution-inbox",
          modernSortField,
          modernSortOrder,
          searchQuery,
          mainTypeFilter,
          professionalFilter,
        ],
      });
    } else {
      queryClient.resetQueries({
        queryKey: [
          "distribution-outbox",
          modernSortField,
          modernSortOrder,
          searchQuery,
          mainTypeFilter,
          professionalFilter,
        ],
      });
    }
  };

  const toggleModernSortOrder = () => {
    setModernSortOrder(modernSortOrder === "desc" ? "asc" : "desc");
  };

  // ==========================================
  // ===== INFINITE SCROLL =====
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
    [
      isFetchingMoreModern,
      hasMoreModern,
      activeTab,
      fetchNextInbox,
      fetchNextOutbox,
    ]
  );

  // ==========================================
  // ===== RENDER =====
  // ==========================================

  // ✅ إذا كان لا يزال يتحقق من الصلاحية
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

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
        <Button onClick={handleRefresh}>
          <RefreshCw className="ml-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // ========== DESKTOP ==========
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
                    إجمالي {activeTab === "inbox" ? totalInbox : totalOutbox}{" "}
                    مراسلة
                    {modernItems.length > 0 && ` · عرض ${modernItems.length}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRefresh}
                  >
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
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleModernSortOrder}
                    className="p-1 rounded hover:bg-muted/50 text-muted-foreground"
                  >
                    {modernSortOrder === "desc" ? (
                      <SortDesc className="h-4 w-4" />
                    ) : (
                      <SortAsc className="h-4 w-4" />
                    )}
                  </button>
                  <select
                    value={modernSortField}
                    onChange={(e) =>
                      setModernSortField(e.target.value as ModernSortField)
                    }
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

  // ========== MOBILE ==========
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
            <Button variant="ghost" size="icon-sm" onClick={handleRefresh}>
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
                {modernSortOrder === "desc" ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </button>
              <select
                value={modernSortField}
                onChange={(e) =>
                  setModernSortField(e.target.value as ModernSortField)
                }
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
              document.body.style.overflow = "unset";
            }
          }}
          modal={true}
          dismissible={true}
          closeThreshold={0.05}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] rounded-t-xl bg-white p-0 outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-200">
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none shrink-0">
                <div className="h-1 w-12 rounded-full bg-gray-300" />
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {selectedItem &&
                  (activeTab === "inbox" ? (
                    <InboxEmailDetail
                      item={selectedItem as DistributionInboxDto}
                      onClose={handleCloseDetail}
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
                  ))}
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <DistributionContent />
    </Suspense>
  );
}