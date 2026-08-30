// ============================================================
// ===== app/(dashboard)/distribution/all/page.tsx =====
// ============================================================

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, Filter } from "lucide-react"; // ✅ استخدام Lucide بدلاً من FontAwesome
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { DistributionList } from "@/components/distribution/DistributionList";
import { DistributionDetail } from "@/components/distribution/DistributionDetail";
import { AdvancedSearchModal } from "@/components/ui/AdvancedSearchModal";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Drawer } from "vaul";
import { useSearchStore } from "@/store/searchStore";
import { useDocumentTypes } from "@/hooks/useCorrespondence";
import { useSenderEntities } from "@/hooks/useCorrespondence";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAllDistributionsInfinite } from "@/hooks/useDistribute";
import { format } from "date-fns";

const PAGE_HEIGHT = "calc(100vh - 64px)";

// ============================================================
// ===== Clean Text =====
// ============================================================

const cleanText = (text: string): string => {
    return text.replace(/\s+/g, " ").trim();
};

// ============================================================
// ===== Main Component =====
// ============================================================

function DistributionsAllContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: [PERMISSIONS.VIEW_ALL_DISTRIBUTIONS],
        redirectTo: "/auth/login",
        unauthorizedPath: "/unauthorized",
    });

    // ===== State =====
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // ===== Search Store =====
    const { searchQuery, clearSearch } = useSearchStore();

    // ===== Document Types & Sender Entities =====
    const { data: documentTypesData } = useDocumentTypes();
    const { data: senderEntitiesData } = useSenderEntities();
    const documentTypes = documentTypesData || [];
    const senderEntities = senderEntitiesData || [];

    // ===== Advanced Search =====
    const {
        searchParams: advSearchParams,
        tempParams,
        isOpen: isAdvancedOpen,
        setSearchText,
        setMainType,
        setProfessional,
        setDocumentType,
        setSenderEntity,
        setDistributionStatus,
        setCorrespondenceStatus,
        setSort,
        setNumber,
        setTempParams,
        resetFilters,
        openModal,
        closeModal,
        applyFilters,
    } = useAdvancedSearch<any>({
        sortField: "distributedDate",
        sortDirection: "desc",
    });

    // ===== URL Param Handler =====
    const distributionId = searchParams.get("id");
    const hasSetFromUrl = useRef(false);

    useEffect(() => {
        if (distributionId) {
            const id = Number(distributionId);
            if (!isNaN(id) && id > 0) {
                const rafId = requestAnimationFrame(() => {
                    setSelectedId(id);
                    setDetailOpen(true);
                    hasSetFromUrl.current = true;
                });

                router.replace("/distribution/all");

                return () => cancelAnimationFrame(rafId);
            }
        } else {
            if (!hasSetFromUrl.current) {
                const rafId = requestAnimationFrame(() => {
                    setDetailOpen(false);
                    setSelectedId(null);
                });
                return () => cancelAnimationFrame(rafId);
            }
        }
    }, [distributionId, router]);

    // ===== Mobile Detection =====
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // ===== Sync search from store =====
    useEffect(() => {
        const cleaned = cleanText(searchQuery);
        setSearchText(cleaned);
    }, [searchQuery, setSearchText]);

    // ============================================================
    // ===== Query (Infinite Scroll) =====
    // ============================================================

    const {
        data,
        isLoading: isDataLoading,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useAllDistributionsInfinite({
        search: advSearchParams.searchText || undefined,
        status: advSearchParams.distributionStatus !== undefined
            ? Number(advSearchParams.distributionStatus)
            : undefined,
        correspondenceStatus: advSearchParams.correspondenceStatus !== undefined
            ? Number(advSearchParams.correspondenceStatus)
            : undefined,
        correspondenceNumber: advSearchParams.number !== undefined && advSearchParams.number > 0
            ? advSearchParams.number
            : undefined,
        correspondenceMainType: advSearchParams.mainType && advSearchParams.mainType !== "0"
            ? Number(advSearchParams.mainType)
            : undefined,
        isProfessional: advSearchParams.isProfessional,
        documentTypeId: advSearchParams.documentTypeId || undefined,
        senderEntityId: advSearchParams.senderEntityId || undefined,
        sortBy: advSearchParams.sortField === "distributedDate"
            ? "DistributedDate"
            : advSearchParams.sortField === "issuedDate"
                ? "IssuedDate"
                : advSearchParams.sortField === "createdAt"
                    ? "CreatedAt"
                    : advSearchParams.sortField === "receivedDate"
                        ? "ReceivedDate"
                        : advSearchParams.sortField === "sentDate"
                            ? "SentDate"
                            : advSearchParams.sortField === "number"
                                ? "CorrespondenceNumber"
                                : "DistributedDate",
        sortDescending: advSearchParams.sortDirection === "desc",
    });

    const isLoading = isAuthLoading || isDataLoading;

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // ===== Flatten items =====
    const items = useMemo(() => {
        return data?.pages?.flatMap((page) => page.items) || [];
    }, [data]);

    const totalCount = data?.pages?.[0]?.totalCount || 0;

    // ===== Selected Item =====
    const selectedItem = items.find((item) => item.id === selectedId) || null;

    const getCurrentIndex = () => items.findIndex((i) => i.id === selectedId);
    const currentIndex = getCurrentIndex();
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < items.length - 1;

    const handleSelectItem = useCallback((id: number) => {
        setSelectedId(id);
        setDetailOpen(true);
        router.push(`/distribution/all?id=${id}`);
    }, [router]);

    const handleCloseDetail = useCallback(() => {
        setDetailOpen(false);
        setSelectedId(null);
        hasSetFromUrl.current = false;
        router.push("/distribution/all");
    }, [router]);

    const handlePrevious = useCallback(() => {
        if (hasPrevious) {
            const newId = items[currentIndex - 1].id;
            setSelectedId(newId);
            router.push(`/distribution/all?id=${newId}`);
        }
    }, [hasPrevious, currentIndex, items, router]);

    const handleNext = useCallback(() => {
        if (hasNext) {
            const newId = items[currentIndex + 1].id;
            setSelectedId(newId);
            router.push(`/distribution/all?id=${newId}`);
        }
    }, [hasNext, currentIndex, items, router]);

    // ============================================================
    // ===== Apply Filters =====
    // ============================================================

    const handleApplyFilters = useCallback(() => {
        applyFilters();
    }, [applyFilters]);

    const handleResetFilters = useCallback(() => {
        resetFilters();
        clearSearch();
    }, [resetFilters, clearSearch]);

    // ============================================================
    // ===== Active Filters Count =====
    // ============================================================

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (advSearchParams.mainType) count++;
        if (advSearchParams.isProfessional !== undefined) count++;
        if (advSearchParams.documentTypeId) count++;
        if (advSearchParams.senderEntityId) count++;
        if (advSearchParams.distributionStatus !== undefined) count++;
        if (advSearchParams.correspondenceStatus !== undefined) count++;
        if (advSearchParams.number && advSearchParams.number > 0) count++;
        return count;
    }, [advSearchParams]);

    // ============================================================
    // ===== Render =====
    // ============================================================

    if (isAuthLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthorized) {
        return null;
    }

    // ========== Mobile View ==========
    if (isMobile) {
        return (
            <div className="flex flex-col overflow-hidden" style={{ height: PAGE_HEIGHT }}>
                <div className="shrink-0 bg-background border-b border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">جميع التوزيعات</h1>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} توزيع
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
                        {/* ✅ نفس شكل الأزرار في صفحة المراسلات */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="gap-1"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openModal}
                                className="gap-1 relative"
                            >
                                <Filter className="h-4 w-4" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {!detailOpen && (
                    <div className="flex-1 overflow-y-auto">
                        <DistributionList
                            items={items}
                            selectedId={selectedId}
                            onSelectItem={handleSelectItem}
                            isLoading={isLoading}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            fetchNextPage={fetchNextPage}
                        />
                    </div>
                )}

                <Drawer.Root
                    open={detailOpen}
                    onOpenChange={(open) => {
                        setDetailOpen(open);
                        if (!open) {
                            document.body.style.overflow = "unset";
                            if (!distributionId) {
                                router.push("/distribution/all");
                            }
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
                                {selectedItem && (
                                    <DistributionDetail
                                        item={selectedItem}
                                        onClose={handleCloseDetail}
                                        onPrevious={handlePrevious}
                                        onNext={handleNext}
                                        hasPrevious={hasPrevious}
                                        hasNext={hasNext}
                                        currentIndex={currentIndex}
                                        totalCount={items.length}
                                    />
                                )}
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>

                <AdvancedSearchModal
                    isOpen={isAdvancedOpen}
                    onClose={closeModal}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                    mainType={tempParams.mainType}
                    onMainTypeChange={setMainType}
                    isProfessional={tempParams.isProfessional}
                    onProfessionalChange={setProfessional}
                    documentTypeId={tempParams.documentTypeId}
                    onDocumentTypeChange={setDocumentType}
                    documentTypes={documentTypes}
                    senderEntityId={tempParams.senderEntityId}
                    onSenderEntityChange={setSenderEntity}
                    senderEntities={senderEntities}
                    distributionStatus={tempParams.distributionStatus}
                    onDistributionStatusChange={setDistributionStatus}
                    correspondenceStatus={tempParams.correspondenceStatus}
                    onCorrespondenceStatusChange={setCorrespondenceStatus}
                    sortField={tempParams.sortField || "distributedDate"}
                    sortDirection={tempParams.sortDirection || "desc"}
                    onSortChange={setSort}
                    activeFiltersCount={activeFiltersCount}
                    number={tempParams.number}
                    onNumberChange={setNumber}
                    tempParams={tempParams}
                    setTempParams={setTempParams}
                />
            </div>
        );
    }

    // ========== Desktop View ==========
    return (
        <div className="flex overflow-hidden" style={{ height: PAGE_HEIGHT }}>
            <div className="w-96 shrink-0 border-l border-border flex flex-col h-full overflow-hidden">
                <div className="shrink-0 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">جميع التوزيعات</h2>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} توزيع
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
                        {/* ✅ نفس شكل الأزرار في صفحة المراسلات (Desktop) */}
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleRefresh}
                                className="relative"
                                title="تحديث"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={openModal}
                                className="relative"
                            >
                                <Filter className="h-4 w-4" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <DistributionList
                        items={items}
                        selectedId={selectedId}
                        onSelectItem={setSelectedId}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {selectedItem ? (
                    <DistributionDetail
                        item={selectedItem}
                        onClose={() => {
                            setSelectedId(null);
                            router.push("/distribution/all");
                        }}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                        currentIndex={currentIndex}
                        totalCount={items.length}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="text-center">
                            <p className="text-lg">📋</p>
                            <p>اختر توزيعاً من القائمة</p>
                        </div>
                    </div>
                )}
            </div>

            <AdvancedSearchModal
                isOpen={isAdvancedOpen}
                onClose={closeModal}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                mainType={tempParams.mainType}
                onMainTypeChange={setMainType}
                isProfessional={tempParams.isProfessional}
                onProfessionalChange={setProfessional}
                documentTypeId={tempParams.documentTypeId}
                onDocumentTypeChange={setDocumentType}
                documentTypes={documentTypes}
                senderEntityId={tempParams.senderEntityId}
                onSenderEntityChange={setSenderEntity}
                senderEntities={senderEntities}
                distributionStatus={tempParams.distributionStatus}
                onDistributionStatusChange={setDistributionStatus}
                correspondenceStatus={tempParams.correspondenceStatus}
                onCorrespondenceStatusChange={setCorrespondenceStatus}
                sortField={tempParams.sortField || "distributedDate"}
                sortDirection={tempParams.sortDirection || "desc"}
                onSortChange={setSort}
                activeFiltersCount={activeFiltersCount}
                number={tempParams.number}
                onNumberChange={setNumber}
                tempParams={tempParams}
                setTempParams={setTempParams}
            />
        </div>
    );
}

// ============================================================
// ===== Export =====
// ============================================================

export default function DistributionsAllPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <DistributionsAllContent />
        </Suspense>
    );
}