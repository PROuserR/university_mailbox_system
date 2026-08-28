/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/incoming-emails/page.tsx

"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { IncomingEmailList } from "@/components/incoming-email/IncomingEmailList";
import { IncomingEmailDetail } from "@/components/incoming-email/IncomingEmailDetail";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, RotateCcw } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import toast from "react-hot-toast";
import { Drawer } from "vaul";
import { useSearchParams, useRouter } from "next/navigation";
import { IncomingEmailStatus } from "@/types/api/incoming-email";
import { 
    useProcessIncomingEmails, 
    useIncomingEmails, 
    useInfiniteScroll 
} from "@/hooks/useIncomingEmail";

const PAGE_HEIGHT = "calc(100vh - 64px)";

const statusColors: Record<IncomingEmailStatus, string> = {
    [IncomingEmailStatus.Pending]: "bg-yellow-100 text-yellow-700",
    [IncomingEmailStatus.Rejected]: "bg-red-100 text-red-700",
    [IncomingEmailStatus.Converted]: "bg-blue-100 text-blue-700",
    [IncomingEmailStatus.Skipped]: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<IncomingEmailStatus, string> = {
    [IncomingEmailStatus.Pending]: "قيد الانتظار",
    [IncomingEmailStatus.Rejected]: "مرفوض",
    [IncomingEmailStatus.Converted]: "محول",
    [IncomingEmailStatus.Skipped]: "تم التخطي",
};

function IncomingEmailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['ManageIncomingEmail'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    const [filters, setFilters] = useState({
        search: "",
        from: "",
        subject: "",
        status: undefined  as IncomingEmailStatus | undefined,
        hasAttachments: undefined as boolean | undefined,
        dateFrom: "",
        dateTo: "",
        sortBy: "ReceivedAt" as string,
        sortDescending: true,
    });

    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { 
        data: emailsData, 
        isLoading, 
        error, 
        refetch, 
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useIncomingEmails({
        page,
        pageSize,
        search: filters.search || undefined,
        from: filters.from || undefined,
        subject: filters.subject ,
        status: filters.status || undefined,
        hasAttachments: filters.hasAttachments,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        sortBy: filters.sortBy,
        sortDescending: filters.sortDescending,
    });

    const { mutate: processEmails, isPending: isProcessing } = useProcessIncomingEmails();

    const handleProcessEmails = useCallback(() => {
        processEmails(undefined, {
            onSuccess: (count) => {
                toast.success(`تمت معالجة ${count} بريد وارد`);
                refetch();
            },
            onError: (error: any) => {
                toast.error(error?.message || "فشل في معالجة البريد الوارد");
            },
        });
    }, [processEmails, refetch]);

    const allPages = emailsData?.pages || [];
    const items = useMemo(() => allPages.flatMap(page => page.items || []), [emailsData]);
    const totalCount = useMemo(() => allPages.length > 0 ? allPages[0]?.totalCount || 0 : 0, [emailsData]);
    const selectedItem = useMemo(() => {
        if (!selectedId) return null;
        return items.find(item => item.id === selectedId) || null;
    }, [items, selectedId]);

    const emailId = searchParams.get("id");
    const hasSetFromUrl = useRef(false);

    useEffect(() => {
        if (emailId) {
            const id = Number(emailId);
            if (!isNaN(id) && id > 0) {
                setSelectedId(id);
                setDetailOpen(true);
                hasSetFromUrl.current = true;
                router.replace("/incoming-emails");
            }
        } else {
            if (!hasSetFromUrl.current) {
                setDetailOpen(false);
                setSelectedId(null);
            }
        }
    }, [emailId, router]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "حدث خطأ أثناء تحميل البريد الوارد");
        }
    }, [error]);

    const getCurrentIndex = () => items.findIndex((i) => i.id === selectedId);
    const currentIndex = getCurrentIndex();
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < items.length - 1;

    const handleSelectItem = useCallback((id: number) => {
        setSelectedId(id);
        setDetailOpen(true);
        router.push(`/incoming-emails?id=${id}`);
    }, [router]);

    const handleCloseDetail = useCallback(() => {
        setDetailOpen(false);
        setSelectedId(null);
        router.push("/incoming-emails");
    }, [router]);

    const handlePrevious = useCallback(() => {
        if (hasPrevious) {
            const newId = items[currentIndex - 1].id;
            setSelectedId(newId);
            router.push(`/incoming-emails?id=${newId}`);
        }
    }, [hasPrevious, items, currentIndex, router]);

    const handleNext = useCallback(() => {
        if (hasNext) {
            const newId = items[currentIndex + 1].id;
            setSelectedId(newId);
            router.push(`/incoming-emails?id=${newId}`);
        }
    }, [hasNext, items, currentIndex, router]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleApplyFilters = useCallback(() => {
        setFilters(tempFilters);
        setPage(1);
        setIsFilterOpen(false);
    }, [tempFilters]);

    const handleResetFilters = useCallback(() => {
        const reset = {
            search: "",
            from: "",
            subject: "",
            status: undefined  as IncomingEmailStatus | undefined ,
            hasAttachments: undefined,
            dateFrom: "",
            dateTo: "",
            sortBy: "ReceivedAt",
            sortDescending: true,
        };
        setFilters(reset);
        setTempFilters(reset);
        setPage(1);
        setIsFilterOpen(false);
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.from) count++;
        if (filters.subject) count++;
        if (filters.status) count++;
        if (filters.hasAttachments !== undefined) count++;
        if (filters.dateFrom) count++;
        if (filters.dateTo) count++;
        return count;
    }, [filters]);

    const bottomRef = useInfiniteScroll({
        onBottom: useCallback(() => {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
        isLoading: isLoading || isFetchingNextPage,
        hasMore: hasNextPage || false,
        dataLength: items.length,
    });

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

    if (isMobile) {
        return (
            <div className="flex flex-col overflow-hidden" style={{ height: PAGE_HEIGHT }}>
                <div className="shrink-0 bg-background border-b border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">البريد الوارد</h1>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} بريد
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleProcessEmails}
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
                        <IncomingEmailList
                            items={items}
                            selectedId={selectedId}
                            onSelectItem={handleSelectItem}
                            isLoading={isLoading}
                            statusColors={statusColors}
                            statusLabels={statusLabels}
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
                                router.push("/incoming-emails");
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
                                    <IncomingEmailDetail
                                        item={selectedItem}
                                        onClose={handleCloseDetail}
                                        onPrevious={handlePrevious}
                                        onNext={handleNext}
                                        hasPrevious={hasPrevious}
                                        hasNext={hasNext}
                                        currentIndex={currentIndex}
                                        totalCount={items.length}
                                        onRefresh={handleRefresh}
                                        statusColors={statusColors}
                                        statusLabels={statusLabels}
                                    />
                                )}
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>

                {isFilterOpen && (
                    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">تصفية البريد الوارد</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">بحث</label>
                                    <input
                                        type="text"
                                        value={tempFilters.search}
                                        onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
                                        placeholder="بحث في المرسل أو الموضوع..."
                                        className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">المرسل</label>
                                    <input
                                        type="text"
                                        value={tempFilters.from}
                                        onChange={(e) => setTempFilters({ ...tempFilters, from: e.target.value })}
                                        placeholder="البريد الإلكتروني للمرسل"
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
        value={tempFilters.status ?? ""}
        onChange={(e) => {
            const val = e.target.value;
            setTempFilters({
                ...tempFilters,
                status: val === "" ? undefined : Number(val) as IncomingEmailStatus,
            });
        }}
        className="w-full mt-1 border rounded-xl p-2.5 text-sm"
    >
        <option value="">الكل</option>
        <option value={IncomingEmailStatus.Pending}>قيد الانتظار</option>
        <option value={IncomingEmailStatus.Rejected}>مرفوض</option>
        <option value={IncomingEmailStatus.Converted}>محول</option>
        <option value={IncomingEmailStatus.Skipped}>تم التخطي</option>
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
                                            <option value="ReceivedAt">تاريخ الاستلام</option>
                                            <option value="From">المرسل</option>
                                            <option value="Subject">الموضوع</option>
                                            <option value="Status">الحالة</option>
                                            <option value="CreatedAt">تاريخ الإنشاء</option>
                                        </select>
                                        <button
                                            onClick={() =>
                                                setTempFilters({ ...tempFilters, sortDescending: !tempFilters.sortDescending })
                                            }
                                            className="border rounded-xl px-3 text-sm"
                                        >
                                            {tempFilters.sortDescending ? "↓" : "↑"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button onClick={handleResetFilters} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                    إعادة تعيين
                                </button>
                                <button onClick={handleApplyFilters} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition">
                                    تطبيق
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex overflow-hidden" style={{ height: PAGE_HEIGHT }}>
            <div className="w-96 shrink-0 border-l border-border flex flex-col h-full overflow-hidden">
                <div className="shrink-0 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">البريد الوارد</h2>
                            <p className="text-xs text-muted-foreground">
                                إجمالي {totalCount} بريد
                                {items.length > 0 && ` · عرض ${items.length}`}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleProcessEmails}
                                disabled={isProcessing}
                                title="معالجة البريد الوارد"
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
                    <IncomingEmailList
                        items={items}
                        selectedId={selectedId}
                        onSelectItem={handleSelectItem}
                        isLoading={isLoading}
                        statusColors={statusColors}
                        statusLabels={statusLabels}
                        bottomRef={bottomRef}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {selectedItem ? (
                    <IncomingEmailDetail
                        item={selectedItem}
                        onClose={() => {
                            setSelectedId(null);
                            router.push("/incoming-emails");
                        }}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                        currentIndex={currentIndex}
                        totalCount={items.length}
                        onRefresh={handleRefresh}
                        statusColors={statusColors}
                        statusLabels={statusLabels}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="text-center">
                            <p className="text-lg">📧</p>
                            <p>اختر بريداً وارداً من القائمة</p>
                        </div>
                    </div>
                )}
            </div>

            {isFilterOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">تصفية البريد الوارد</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">بحث</label>
                                <input
                                    type="text"
                                    value={tempFilters.search}
                                    onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
                                    placeholder="بحث في المرسل أو الموضوع..."
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">المرسل</label>
                                <input
                                    type="text"
                                    value={tempFilters.from}
                                    onChange={(e) => setTempFilters({ ...tempFilters, from: e.target.value })}
                                    placeholder="البريد الإلكتروني للمرسل"
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
        value={tempFilters.status ?? ""}
        onChange={(e) => {
            const val = e.target.value;
            setTempFilters({
                ...tempFilters,
                status: val === "" ? undefined : Number(val) as IncomingEmailStatus,
            });
        }}
        className="w-full mt-1 border rounded-xl p-2.5 text-sm"
    >
        <option value="">الكل</option>
        <option value={IncomingEmailStatus.Pending}>قيد الانتظار</option>
        <option value={IncomingEmailStatus.Rejected}>مرفوض</option>
        <option value={IncomingEmailStatus.Converted}>محول</option>
        <option value={IncomingEmailStatus.Skipped}>تم التخطي</option>
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
                                        <option value="ReceivedAt">تاريخ الاستلام</option>
                                        <option value="From">المرسل</option>
                                        <option value="Subject">الموضوع</option>
                                        <option value="Status">الحالة</option>
                                        <option value="CreatedAt">تاريخ الإنشاء</option>
                                    </select>
                                    <button
                                        onClick={() =>
                                            setTempFilters({ ...tempFilters, sortDescending: !tempFilters.sortDescending })
                                        }
                                        className="border rounded-xl px-3 text-sm"
                                    >
                                        {tempFilters.sortDescending ? "↓" : "↑"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={handleResetFilters} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                إعادة تعيين
                            </button>
                            <button onClick={handleApplyFilters} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition">
                                تطبيق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function IncomingEmailsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <IncomingEmailsContent />
        </Suspense>
    );
}