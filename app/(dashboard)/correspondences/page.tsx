// app/(dashboard)/correspondences/page.tsx

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
import { RefreshCw, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useSearchStore } from "@/store/searchStore";
import {
  CorrespondenceMainType,
  CorrespondenceSearchDto,
} from "@/types/api/correspondence.types";
import toast from "react-hot-toast";
import { Drawer } from "vaul";
import { useSearchParams } from "next/navigation";

const PAGE_HEIGHT = "calc(100vh - 64px)";

const cleanText = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
};

 function CorrespondencesContent() {
  useAuthGuard();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { searchQuery, clearSearch } = useSearchStore();

  const {
    searchParams,
    tempParams,
    hasActiveFilters,
    isOpen: isAdvancedOpen,
    setSearchText,
    setMainType,
    setProfessional,
    setDocumentType,
    setSenderEntity,
    setSort,
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
  
    useEffect(() => {
        if (correspondenceId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedId(Number(correspondenceId));
            setDetailOpen(true);
        }
    }, [correspondenceId]);


  const { data: documentTypesData } = useDocumentTypes();
  const { data: senderEntitiesData } = useSenderEntities();

  const documentTypes = documentTypesData || [];
  const senderEntities = senderEntitiesData || [];
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

  const apiParams = useMemo(() => {
    const params: CorrespondenceSearchDto = {
      page: 1,
      pageSize: 50,
      sortBy:
        searchParams.sortField === "issuedDate"
          ? "IssuedDate"
          : searchParams.sortField === "createdAt"
          ? "CreatedAt"
          : searchParams.sortField === "title"
          ? "Title"
          : searchParams.sortField === "number"
          ? "Number"
          : searchParams.sortField === "senderEntity"
          ? "SenderEntity"
          : "MainType",
      sortOrderDESC: searchParams.sortDirection === "desc",
    };

    if (searchParams.searchText && searchParams.searchText.trim() !== "") {
      params.search = searchParams.searchText.trim();
    }

    if (searchParams.mainType) {
      params.mainType = Number(searchParams.mainType) as CorrespondenceMainType;
    }
    if (searchParams.isProfessional !== undefined) {
      params.isProfessional = searchParams.isProfessional;
    }
    if (searchParams.documentTypeId) {
      params.documentTypeId = searchParams.documentTypeId;
    }
    if (searchParams.senderEntityId) {
      params.senderEntityId = searchParams.senderEntityId;
    }

    return params;
  }, [searchParams]);

  const { data, isLoading, error, refetch, isFetching } =
    useCorrespondences(apiParams);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "حدث خطأ أثناء تحميل المراسلات");
    }
  }, [error]);

  const isApplyingFilters = useRef(false);
  const isResetting = useRef(false);
  const previousApiParams = useRef<string>("");

  useEffect(() => {
    const currentParams = JSON.stringify(apiParams);
    previousApiParams.current = currentParams;

    if (isApplyingFilters.current) {
      isApplyingFilters.current = false;
    }
    if (isResetting.current) {
      isResetting.current = false;
    }
  }, [apiParams]);

  const hasSetInitialSelection = useRef(false);

  useEffect(() => {
    if (
      isInitialLoad &&
      data?.items &&
      data.items.length > 0 &&
      !selectedId &&
      !hasSetInitialSelection.current
    ) {
      hasSetInitialSelection.current = true;
      setIsInitialLoad(false);
      setSelectedId(data.items[0].id);
      setDetailOpen(true);
    }
  }, [data, isInitialLoad, selectedId]);

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
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedId(null);
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedId(items[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedId(items[currentIndex + 1].id);
    }
  };

  const handleApplyFilters = useCallback(() => {
    isApplyingFilters.current = true;
    applyFilters();
  }, [applyFilters]);

  const handleResetFilters = useCallback(() => {
    isResetting.current = true;
    resetFilters();
    clearSearch();
  }, [resetFilters, clearSearch]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.mainType) count++;
    if (searchParams.isProfessional !== undefined) count++;
    if (searchParams.documentTypeId) count++;
    if (searchParams.senderEntityId) count++;
    return count;
  }, [searchParams]);

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

              <Link href="/mail/create">
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
          sortField={tempParams.sortField}
          sortDirection={tempParams.sortDirection}
          onSortChange={setSort}
          activeFiltersCount={activeFiltersCount}
        />
      </div>
    );
  }

  // ========== Desktop View ==========
  return (
    <div className="flex overflow-hidden" style={{ height: PAGE_HEIGHT }}>
      {/* ===== القائمة ===== */}
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

              <Link href="/mail/create">
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

      {/* ===== التفاصيل ===== */}
      <div className="flex-1 overflow-hidden">
        {selectedItem ? (
          <CorrespondenceEmailDetail
            item={selectedItem}
            onClose={() => setSelectedId(null)}
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
        sortField={tempParams.sortField}
        sortDirection={tempParams.sortDirection}
        onSortChange={setSort}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
export default function CorrespondencesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>}>
            <CorrespondencesContent />
        </Suspense>
    );
}