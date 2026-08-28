// src/app/(dashboard)/correspondences/page.tsx

"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { useCorrespondences } from "@/hooks/useCorrespondence";
import { useDocumentTypes } from "@/hooks/useCorrespondence";
import { useSenderEntities } from "@/hooks/useCorrespondence";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { CorrespondenceEmailList } from "@/components/correspondence/CorrespondenceEmailList";
import { CorrespondenceEmailDetail } from "@/components/correspondence/CorrespondenceEmailDetail";
import { AdvancedSearchModal } from "@/components/ui/AdvancedSearchModal";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useSearchStore } from "@/store/searchStore";
import {
    CorrespondenceMainType,
    CorrespondenceSearchDto,
    CorrespondenceStatus,
} from "@/types/api/correspondence.types";
import toast from "react-hot-toast";
import { Drawer } from "vaul";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
const PAGE_HEIGHT = "calc(100vh - 64px)";

const cleanText = (text: string): string => {
    return text.replace(/\s+/g, " ").trim();
};

// ============================================================
// ===== Status Options =====
// ============================================================

interface DateValidationErrors {
    createdAt?: string;
    issuedDate?: string;
    receivedDate?: string;
    sentDate?: string;
}
function CorrespondencesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['ViewCorrespondence'],
        redirectTo: '/auth/login'
    });

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { searchQuery, clearSearch } = useSearchStore();

    
const {
    searchParams: advSearchParams,
    tempParams,
    hasActiveFilters,
    isOpen: isAdvancedOpen,
    setSearchText,
    setMainType,
    setProfessional,
    setDocumentType,
    setSenderEntity,
    setStatus,
    setSort,
    setNumber,
    setCreatedAtRange,
    setIssuedDateRange,
    setReceivedDateRange,
    setSentDateRange,
    setTempParams, 
    resetFilters,
    openModal,
    closeModal,
    applyFilters,
} = useAdvancedSearch<CorrespondenceSearchDto>({
    sortField: "issuedDate",
    sortDirection: "desc",
});

    const searchParams2 = useSearchParams();
    const correspondenceId = searchParams2.get("id");

    const { data: documentTypesData } = useDocumentTypes();
    const { data: senderEntitiesData } = useSenderEntities();

    const documentTypes = documentTypesData || [];
    const senderEntities = senderEntitiesData || [];

    const hasSetFromUrl = useRef(false);

    // ===== URL Param Handler =====
    useEffect(() => {
        if (correspondenceId) {
            const id = Number(correspondenceId);
            if (!isNaN(id) && id > 0) {
                const rafId = requestAnimationFrame(() => {
                    setSelectedId(id);
                    setDetailOpen(true);
                    hasSetFromUrl.current = true;
                });
                
                router.replace('/correspondences');
                
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
    }, [correspondenceId, router]);

    useEffect(() => {
        const cleaned = cleanText(searchQuery);
        setSearchText(cleaned);
    }, [searchQuery, setSearchText]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // ============================================================
    // ===== Validation Functions =====
    // ============================================================

    const validateDateRange = useCallback((
        from: Date | undefined,
        to: Date | undefined,
        field: keyof DateValidationErrors
    ): string | undefined => {
        if (from && to && to < from) {
            const fieldNames: Record<keyof DateValidationErrors, string> = {
                createdAt: "تاريخ الإنشاء",
                issuedDate: "تاريخ الإصدار",
                receivedDate: "تاريخ الاستلام",
                sentDate: "تاريخ الإرسال",
            };
            return `${fieldNames[field]} (إلى) لا يمكن أن يكون أقدم من ${fieldNames[field]} (من)`;
        }
        return undefined;
    }, []);

    const validateAllDates = useCallback(() => {
        const errors: DateValidationErrors = {};

        const createdAtError = validateDateRange(
            tempParams.createdAtFrom,
            tempParams.createdAtTo,
            'createdAt'
        );
        if (createdAtError) errors.createdAt = createdAtError;

        const issuedDateError = validateDateRange(
            tempParams.issuedDateFrom,
            tempParams.issuedDateTo,
            'issuedDate'
        );
        if (issuedDateError) errors.issuedDate = issuedDateError;

        const receivedDateError = validateDateRange(
            tempParams.receivedDateFrom,
            tempParams.receivedDateTo,
            'receivedDate'
        );
        if (receivedDateError) errors.receivedDate = receivedDateError;

        const sentDateError = validateDateRange(
            tempParams.sentDateFrom,
            tempParams.sentDateTo,
            'sentDate'
        );
        if (sentDateError) errors.sentDate = sentDateError;

        return Object.keys(errors).length === 0;
    }, [tempParams, validateDateRange]);

    // ===== API Params =====

const apiParams = useMemo(() => {
    const params: CorrespondenceSearchDto = {
        page: 1,
        pageSize: 50,
        sortBy:
            advSearchParams.sortField === "issuedDate"
                ? "IssuedDate"
                : advSearchParams.sortField === "createdAt"
                ? "CreatedAt"
                : advSearchParams.sortField === "receivedDate"
                ? "ReceivedDate"
                : advSearchParams.sortField === "sentDate"
                ? "SentDate"
                : advSearchParams.sortField === "title"
                ? "Title"
                : advSearchParams.sortField === "number"
                ? "Number"
                : advSearchParams.sortField === "senderEntity"
                ? "SenderEntity"
                : "MainType",
        sortOrderDESC: advSearchParams.sortDirection === "desc",
    };

    if (advSearchParams.searchText && advSearchParams.searchText.trim() !== "") {
        params.search = advSearchParams.searchText.trim();
    }

    if (advSearchParams.number) {
        params.number = advSearchParams.number;
    }

    if (advSearchParams.mainType) {
        params.mainType = Number(advSearchParams.mainType) as CorrespondenceMainType;
    }
    if (advSearchParams.isProfessional !== undefined) {
        params.isProfessional = advSearchParams.isProfessional;
    }
    if (advSearchParams.documentTypeId) {
        params.documentTypeId = advSearchParams.documentTypeId;
    }
    if (advSearchParams.senderEntityId) {
        params.senderEntityId = advSearchParams.senderEntityId;
    }
    if (advSearchParams.status !== undefined) {
        params.status = advSearchParams.status;
    }
    
    // ✅ تحويل Date إلى string (YYYY-MM-DD)
    if (advSearchParams.createdAtFrom) {
        params.createdAtFrom = advSearchParams.createdAtFrom.toISOString().split('T')[0];
    }
    if (advSearchParams.createdAtTo) {
        params.createdAtTo = advSearchParams.createdAtTo.toISOString().split('T')[0];
    }
    if (advSearchParams.issuedDateFrom) {
        params.issuedDateFrom = advSearchParams.issuedDateFrom.toISOString().split('T')[0];
    }
    if (advSearchParams.issuedDateTo) {
        params.issuedDateTo = advSearchParams.issuedDateTo.toISOString().split('T')[0];
    }
    if (advSearchParams.receivedDateFrom) {
        params.receivedDateFrom = advSearchParams.receivedDateFrom.toISOString().split('T')[0];
    }
    if (advSearchParams.receivedDateTo) {
        params.receivedDateTo = advSearchParams.receivedDateTo.toISOString().split('T')[0];
    }
    if (advSearchParams.sentDateFrom) {
        params.sentDateFrom = advSearchParams.sentDateFrom.toISOString().split('T')[0];
    }
    if (advSearchParams.sentDateTo) {
        params.sentDateTo = advSearchParams.sentDateTo.toISOString().split('T')[0];
    }

    return params;
}, [advSearchParams]);

    const { data, isLoading, error, refetch, isFetching } =
        useCorrespondences(apiParams);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const isApplyingFilters = useRef(false);
    const isResetting = useRef(false);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "حدث خطأ أثناء تحميل المراسلات");
        }
    }, [error]);

    const items = data?.items || [];
    const totalCount = data?.totalCount || 0;
    const selectedItem = items.find((item) => item.id === selectedId) || null;

    const getCurrentIndex = () => items.findIndex((i) => i.id === selectedId);
    const currentIndex = getCurrentIndex();
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < items.length - 1;

    const handleSelectItem = (id: number) => {
        setSelectedId(id);
        setDetailOpen(true);
        router.push(`/correspondences?id=${id}`);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedId(null);
        router.push('/correspondences');
    };

    const handlePrevious = () => {
        if (hasPrevious) {
            const newId = items[currentIndex - 1].id;
            setSelectedId(newId);
            router.push(`/correspondences?id=${newId}`);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            const newId = items[currentIndex + 1].id;
            setSelectedId(newId);
            router.push(`/correspondences?id=${newId}`);
        }
    };

    const handleApplyFilters = useCallback(() => {
        if (!validateAllDates()) {
            toast.error("يرجى تصحيح الأخطاء في التواريخ");
            return;
        }
        isApplyingFilters.current = true;
        applyFilters();
    }, [applyFilters, validateAllDates]);

    const handleResetFilters = useCallback(() => {
        isResetting.current = true;
        resetFilters();
        clearSearch();
    }, [resetFilters, clearSearch]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (advSearchParams.mainType) count++;
        if (advSearchParams.isProfessional !== undefined) count++;
        if (advSearchParams.documentTypeId) count++;
        if (advSearchParams.senderEntityId) count++;
        if (advSearchParams.status !== undefined) count++;
        if (advSearchParams.createdAtFrom) count++;
        if (advSearchParams.createdAtTo) count++;
        if (advSearchParams.issuedDateFrom) count++;
        if (advSearchParams.issuedDateTo) count++;
        if (advSearchParams.receivedDateFrom) count++;
        if (advSearchParams.receivedDateTo) count++;
        if (advSearchParams.sentDateFrom) count++;
        if (advSearchParams.sentDateTo) count++;
        return count;
    }, [advSearchParams]);

    if (isAuthLoading) {
        return (
            <div
                className="flex items-center justify-center"
                style={{ height: PAGE_HEIGHT }}
            >
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div
                className="flex items-center justify-center"
                style={{ height: PAGE_HEIGHT }}
            >
                <div className="text-center">
                    <p className="text-red-500 text-lg">ليس لديك صلاحية لعرض هذه الصفحة</p>
                    <Button
                        onClick={() => window.location.href = "/"}
                        className="mt-4"
                    >
                        العودة للرئيسية
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading && items.length === 0) {
        return (
            <div
                className="flex items-center justify-center"
                style={{ height: PAGE_HEIGHT }}
            >
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // ========== Mobile View ==========
    if (isMobile) {
        return (
            <div
                className="flex flex-col overflow-hidden"
                style={{ height: PAGE_HEIGHT }}
            >
                <div className="shrink-0 bg-background border-b border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">المراسلات</h1>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} مراسلة
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
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

                            <Link href="/correspondences/create">
                                <Button size="sm" className="gap-1">
                                    <Plus className="h-4 w-4" />
                                    جديد
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {!detailOpen && (
                    <div className="flex-1 overflow-y-auto">
                        <CorrespondenceEmailList
                            items={items}
                            selectedId={selectedId}
                            onSelectItem={handleSelectItem}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                <Drawer.Root
                    open={detailOpen}
                    onOpenChange={(open) => {
                        setDetailOpen(open);
                        if (!open) {
                            document.body.style.overflow = "unset";
                            if (!correspondenceId) {
                                router.push('/correspondences');
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
                                    <CorrespondenceEmailDetail
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
                status={tempParams.status}
                onStatusChange={setStatus}
                sortField={tempParams.sortField}
                sortDirection={tempParams.sortDirection}
                onSortChange={setSort}
                activeFiltersCount={activeFiltersCount}
                number={tempParams.number}
                onNumberChange={setNumber}
                // ✅ إضافة tempParams و setTempParams
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
                            <h2 className="text-lg font-semibold">المراسلات</h2>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} مراسلة
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
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

                            <Link href="/correspondences/create">
                                <Button variant="ghost" size="icon-sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <CorrespondenceEmailList
                        items={items}
                        selectedId={selectedId}
                        onSelectItem={setSelectedId}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {selectedItem ? (
                    <CorrespondenceEmailDetail
                        item={selectedItem}
                        onClose={() => {
                            setSelectedId(null);
                            router.push('/correspondences');
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
                            <p className="text-lg">📬</p>
                            <p>اختر مراسلة من القائمة</p>
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
            status={tempParams.status}
            onStatusChange={setStatus}
            sortField={tempParams.sortField}
            sortDirection={tempParams.sortDirection}
            onSortChange={setSort}
            activeFiltersCount={activeFiltersCount}
            number={tempParams.number}
            onNumberChange={setNumber}
            setTempParams={setTempParams}
            tempParams={tempParams}
        />
        </div>
    );
}

export default function CorrespondencesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <CorrespondencesContent />
        </Suspense>
    );
}