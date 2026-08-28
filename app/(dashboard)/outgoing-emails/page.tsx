/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/outgoing-emails/page.tsx

"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { OutgoingEmailList } from "@/components/outgoing-email/OutgoingEmailList";
import { OutgoingEmailDetail } from "@/components/outgoing-email/OutgoingEmailDetail";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, RotateCcw, X } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Drawer } from "vaul";
import { useSearchParams, useRouter } from "next/navigation";
import { EmailStatus } from "@/types/api/outgoing-email";
import { useOutgoingEmails, useProcessFailedEmails } from "@/hooks/useOutgoingEmail";
import useSafeBottomTrigger from "@/hooks/useInfiniteScroll";
import toast from "react-hot-toast";

const PAGE_HEIGHT = "calc(100vh - 64px)";

// ============================================================
// ===== Filter Modal Component =====
// ============================================================

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    tempFilters: {
        search: string;
        to: string;
        subject: string;
        status: EmailStatus | "";
        hasAttachments: boolean | undefined;
        dateFrom: string;
        dateTo: string;
        sortBy: string;
        sortDescending: boolean;
    };
    setTempFilters: React.Dispatch<React.SetStateAction<any>>;
    onApply: () => void;
    onReset: () => void;
}

function FilterModal({
    isOpen,
    onClose,
    tempFilters,
    setTempFilters,
    onApply,
    onReset,
}: FilterModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">تصفية البريد الصادر</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">بحث</label>
                        <input
                            type="text"
                            value={tempFilters.search}
                            onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
                            placeholder="بحث في المرسل إليه أو الموضوع..."
                            className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">المرسل إليه</label>
                        <input
                            type="text"
                            value={tempFilters.to}
                            onChange={(e) => setTempFilters({ ...tempFilters, to: e.target.value })}
                            placeholder="البريد الإلكتروني للمستلم"
                            className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">الموضوع</label>
                        <input
                            type="text"
                            value={tempFilters.subject}
                            onChange={(e) => setTempFilters({ ...tempFilters, subject: e.target.value })}
                            placeholder="الموضوع"
                            className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">الحالة</label>
                        <select
                            value={tempFilters.status}
                            onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value as EmailStatus | "" })}
                            className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                        >
                            <option value="">الكل</option>
                            <option value={EmailStatus.Sent}>مرسل</option>
                            <option value={EmailStatus.Failed}>فاشل</option>
                            <option value={EmailStatus.Pending}>قيد الانتظار</option>
                            <option value={EmailStatus.RetryPending}>بانتظار إعادة المحاولة</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">مرفقات</label>
                        <select
                            value={tempFilters.hasAttachments === undefined ? "" : String(tempFilters.hasAttachments)}
                            onChange={(e) => {
                                const val = e.target.value;
                                setTempFilters({
                                    ...tempFilters,
                                    hasAttachments: val === "" ? undefined : val === "true",
                                });
                            }}
                            className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                        >
                            <option value="">الكل</option>
                            <option value="true">يحتوي على مرفقات</option>
                            <option value="false">بدون مرفقات</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">من تاريخ</label>
                            <input
                                type="date"
                                value={tempFilters.dateFrom}
                                onChange={(e) => setTempFilters({ ...tempFilters, dateFrom: e.target.value })}
                                className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">إلى تاريخ</label>
                            <input
                                type="date"
                                value={tempFilters.dateTo}
                                onChange={(e) => setTempFilters({ ...tempFilters, dateTo: e.target.value })}
                                className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">ترتيب حسب</label>
                        <div className="flex gap-2 mt-1">
                            <select
                                value={tempFilters.sortBy}
                                onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
                                className="flex-1 border rounded-xl p-2.5 text-sm"
                            >
                                <option value="SentAt">تاريخ الإرسال</option>
                                <option value="To">المرسل إليه</option>
                                <option value="Subject">الموضوع</option>
                                <option value="Status">الحالة</option>
                            </select>
                            <button
                                onClick={() => setTempFilters({ ...tempFilters, sortDescending: !tempFilters.sortDescending })}
                                className="border rounded-xl px-3 text-sm"
                            >
                                {tempFilters.sortDescending ? "↓" : "↑"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onReset}
                        className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                    >
                        إعادة تعيين
                    </button>
                    <button
                        onClick={onApply}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition"
                    >
                        تطبيق
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// ===== Main Component =====
// ============================================================

function OutgoingEmailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['ManageOutgoingEmail'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // ===== Filters =====
    const [filters, setFilters] = useState({
        search: "",
        to: "",
        subject: "",
        status: "" as EmailStatus | "",
        hasAttachments: undefined as boolean | undefined,
        dateFrom: "",
        dateTo: "",
        sortBy: "SentAt" as string,
        sortDescending: true,
    });

    const [tempFilters, setTempFilters] = useState(filters);

    // ===== API =====
    const {
        data: emailsData,
        isLoading,
        error,
        refetch,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useOutgoingEmails({
        page: 1,
        pageSize: 20,
        search: filters.search || undefined,
        to: filters.to || undefined,
        subject: filters.subject || undefined,
        status: filters.status || undefined,
        hasAttachments: filters.hasAttachments,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : undefined,
        sortBy: filters.sortBy,
        sortDescending: filters.sortDescending,
    });

    // ===== Process Failed =====
    // ✅ استخدام mutateAsync بدلاً من mutate
    const { mutateAsync: processFailed, isPending: isProcessing } = useProcessFailedEmails(() => {
        // هذا الـ onSuccess يُستخدم لتحديث القائمة بعد المعالجة
        refetch();
    });

    // ✅ استخدام mutateAsync مع await للانتظار حتى الرد
    const handleProcessFailed = async () => {
        try {
            // انتظر حتى يعود الـ Response من الخادم
            const count = await processFailed();
            // التوست يظهر من الـ Hook تلقائياً
            console.log("تمت معالجة:", count, "بريد فاشل");
        } catch (error) {
            // الخطأ يعالج في الـ Hook
            console.error("خطأ في معالجة البريد الفاشل:", error);
        }
    };

    // ===== Error Handling =====
    useEffect(() => {
        if (error) {
            toast.error(error.message || "حدث خطأ أثناء تحميل البريد الصادر");
        }
    }, [error]);

    // ===== URL Param =====
    const emailId = searchParams.get("id");
    const hasSetFromUrl = useRef(false);

    useEffect(() => {
        if (emailId) {
            const id = Number(emailId);
            if (!isNaN(id) && id > 0) {
                const rafId = requestAnimationFrame(() => {
                    setSelectedId(id);
                    setDetailOpen(true);
                    hasSetFromUrl.current = true;
                });
                router.replace("/outgoing-emails");
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
    }, [emailId, router]);

    // ===== Mobile =====
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // ===== Data =====
    const allPages = emailsData?.pages || [];
    const items = useMemo(() => allPages.flatMap(page => page.items || []), [emailsData]);
    const totalCount = useMemo(() => allPages.length > 0 ? allPages[0]?.totalCount || 0 : 0, [emailsData]);
    const selectedItem = useMemo(() => {
        if (!selectedId) return null;
        return items.find(item => item.id === selectedId) || null;
    }, [items, selectedId]);

    const getCurrentIndex = () => items.findIndex((i) => i.id === selectedId);
    const currentIndex = getCurrentIndex();
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < items.length - 1;

    // ===== Handlers =====
    const handleSelectItem = useCallback((id: number) => {
        setSelectedId(id);
        setDetailOpen(true);
        router.push(`/outgoing-emails?id=${id}`);
    }, [router]);

    const handleCloseDetail = useCallback(() => {
        setDetailOpen(false);
        setSelectedId(null);
        router.push("/outgoing-emails");
    }, [router]);

    const handlePrevious = useCallback(() => {
        if (hasPrevious) {
            const newId = items[currentIndex - 1].id;
            setSelectedId(newId);
            router.push(`/outgoing-emails?id=${newId}`);
        }
    }, [hasPrevious, items, currentIndex, router]);

    const handleNext = useCallback(() => {
        if (hasNext) {
            const newId = items[currentIndex + 1].id;
            setSelectedId(newId);
            router.push(`/outgoing-emails?id=${newId}`);
        }
    }, [hasNext, items, currentIndex, router]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleApplyFilters = useCallback(() => {
        setFilters(tempFilters);
        setIsFilterOpen(false);
    }, [tempFilters]);

    const handleResetFilters = useCallback(() => {
        const reset = {
            search: "",
            to: "",
            subject: "",
            status: "" as EmailStatus | "",
            hasAttachments: undefined,
            dateFrom: "",
            dateTo: "",
            sortBy: "SentAt",
            sortDescending: true,
        };
        setFilters(reset);
        setTempFilters(reset);
        setIsFilterOpen(false);
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.to) count++;
        if (filters.subject) count++;
        if (filters.status) count++;
        if (filters.hasAttachments !== undefined) count++;
        if (filters.dateFrom) count++;
        if (filters.dateTo) count++;
        return count;
    }, [filters]);

    // ===== Infinite Scroll =====
    const bottomRef = useSafeBottomTrigger({
        onBottom: useCallback(() => {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
        isLoading: isLoading || isFetchingNextPage,
        hasMore: hasNextPage || false,
        dataLength: items.length,
    });

    // ===== Loading & Auth =====
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center" style={{ height: PAGE_HEIGHT }}>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center" style={{ height: PAGE_HEIGHT }}>
                <div className="text-center">
                    <p className="text-red-500 text-lg">ليس لديك صلاحية لعرض هذه الصفحة</p>
                    <Button onClick={() => window.location.href = "/"} className="mt-4">
                        العودة للرئيسية
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading && items.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height: PAGE_HEIGHT }}>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // ========== Mobile View ==========
    if (isMobile) {
        return (
            <div className="flex flex-col overflow-hidden" style={{ height: PAGE_HEIGHT }}>
                <div className="shrink-0 bg-background border-b border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">البريد الصادر</h1>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} بريد
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleProcessFailed}
                                disabled={isProcessing}
                                className="gap-1"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
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
                                onClick={() => setIsFilterOpen(true)}
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
                        <OutgoingEmailList
                            items={items}
                            selectedId={selectedId}
                            onSelectItem={handleSelectItem}
                            isLoading={isLoading}
                            bottomRef={bottomRef}
                            isFetchingNextPage={isFetchingNextPage}
                        />
                    </div>
                )}

                <Drawer.Root
                    open={detailOpen}
                    onOpenChange={(open) => {
                        setDetailOpen(open);
                        if (!open) {
                            document.body.style.overflow = "unset";
                            if (!emailId) {
                                router.push("/outgoing-emails");
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
                                    <OutgoingEmailDetail
                                        item={selectedItem}
                                        onClose={handleCloseDetail}
                                        onPrevious={handlePrevious}
                                        onNext={handleNext}
                                        hasPrevious={hasPrevious}
                                        hasNext={hasNext}
                                        currentIndex={currentIndex}
                                        totalCount={items.length}
                                        onRefresh={handleRefresh}
                                        onProcessFailed={handleProcessFailed}
                                        isProcessing={isProcessing}
                                    />
                                )}
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>

                <FilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    tempFilters={tempFilters}
                    setTempFilters={setTempFilters}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
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
                            <h2 className="text-lg font-semibold">البريد الصادر</h2>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} بريد
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleProcessFailed}
                                disabled={isProcessing}
                                title="معالجة البريد الفاشل"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleRefresh}
                                title="تحديث"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setIsFilterOpen(true)}
                                className="relative"
                                title="تصفية"
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
                    <OutgoingEmailList
                        items={items}
                        selectedId={selectedId}
                        onSelectItem={handleSelectItem}
                        isLoading={isLoading}
                        bottomRef={bottomRef}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {selectedItem ? (
                    <OutgoingEmailDetail
                        item={selectedItem}
                        onClose={() => {
                            setSelectedId(null);
                            router.push("/outgoing-emails");
                        }}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                        currentIndex={currentIndex}
                        totalCount={items.length}
                        onRefresh={handleRefresh}
                        onProcessFailed={handleProcessFailed}
                        isProcessing={isProcessing}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="text-center">
                            <p className="text-lg">📧</p>
                            <p>اختر بريداً صادراً من القائمة</p>
                        </div>
                    </div>
                )}
            </div>

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                tempFilters={tempFilters}
                setTempFilters={setTempFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
        </div>
    );
}

export default function OutgoingEmailsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <OutgoingEmailsContent />
        </Suspense>
    );
}