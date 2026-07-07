/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/approvals/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { apiWrapper, ApiResult } from "@/utils/apiClient";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faClipboardCheck,
    faClock,
    faSearch,
    faRotate,
    faUsers,
    faFileLines,
    faPaperclip,
    faCheck,
    faXmark,
    faEye,
    faBolt,
    faSpinner,
    faChevronDown,
    faChevronUp,
    faUserCheck,
    faUserXmark,
} from "@fortawesome/free-solid-svg-icons";

// ==============================
// TYPES - مطابقة للـ DTOs
// ==============================

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

interface PendingReceiver {
    distributionId: number;
    receiverId: number;
    receiverName: string;
    receiverEmail: string;
    receiverRole: string | null;
    notes: string | null;
    isAutoDistributed: boolean;
    distributedDate: string;
    rejectionReason: string | null;
}

interface PendingCorrespondence {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    correspondenceContent: string;
    mainType: string;
    isProfessional: boolean;
    documentType: string | null;
    senderEntity: string | null;
    senderReference: string | null;
    issuedDate: string | null;
    receivedDate: string | null;
    sentDate: string | null;
    distributedDate: string;
    distributedBy: string;
    distributorName: string;
    attachments: Attachment[];
    pendingReceivers: PendingReceiver[];
}

interface GroupedResponse {
    items: PendingCorrespondence[];
}

// ==============================
// COMPONENT
// ==============================

export default function ApprovalsPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
    const [items, setItems] = useState<PendingCorrespondence[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    // ==============================
    // LOAD DATA
    // ==============================

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await apiWrapper.get<ApiResult<GroupedResponse>>(
                "/Distributions/pending-approval/grouped"
            );

            if (response.data?.isSuccess) {
                setItems(response.data.data?.items ?? []);
            } else {
                toast.error(response.data?.message || "فشل تحميل البيانات");
            }
        } catch {
            toast.error("فشل تحميل التوزيعات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==============================
    // STATISTICS
    // ==============================

    const statistics = useMemo(() => {
        const totalReceivers = items.reduce(
            (sum, item) => sum + item.pendingReceivers.length,
            0
        );
        const autoDistributed = items.reduce(
            (sum, item) =>
                sum + item.pendingReceivers.filter((r) => r.isAutoDistributed).length,
            0
        );

        return {
            totalCorrespondences: items.length,
            totalReceivers,
            autoDistributed,
            manualDistributed: totalReceivers - autoDistributed,
        };
    }, [items]);

    // ==============================
    // FILTER
    // ==============================

    const filteredItems = useMemo(() => {
        const searchValue = search.toLowerCase();

        return items.filter((item) => {
            const matchesSearch =
                item.correspondenceTitle?.toLowerCase().includes(searchValue) ||
                item.correspondenceNumber?.toLowerCase().includes(searchValue) ||
                item.senderEntity?.toLowerCase().includes(searchValue);

            const matchesFilter =
                filter === "all" ||
                item.mainType?.toLowerCase().includes(filter);

            return matchesSearch && matchesFilter;
        });
    }, [items, search, filter]);

    // ==============================
    // ACTIONS
    // ==============================

    const toggleCard = (id: number) => {
        setExpandedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleApprove = async (distributionId: number) => {
        if (!window.confirm("اعتماد هذا التوزيع؟")) return;

        setProcessingIds((prev) => new Set(prev).add(distributionId));
        try {
            await apiWrapper.post(`/Distributions/${distributionId}/approve`);
            toast.success("تم اعتماد التوزيع");
            await loadData();
        } catch {
            toast.error("فشل اعتماد التوزيع");
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(distributionId);
                return newSet;
            });
        }
    };

    const handleReject = async (distributionId: number) => {
        if (!window.confirm("رفض هذا التوزيع؟")) return;

        setProcessingIds((prev) => new Set(prev).add(distributionId));
        try {
            await apiWrapper.post(`/Distributions/${distributionId}/reject`);
            toast.success("تم رفض التوزيع");
            await loadData();
        } catch {
            toast.error("فشل رفض التوزيع");
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(distributionId);
                return newSet;
            });
        }
    };

    const handleApproveAll = async (correspondenceId: number) => {
        if (!window.confirm("اعتماد جميع المستلمين؟")) return;

        try {
            await apiWrapper.post(
                `/Distributions/correspondence/${correspondenceId}/approve-all`
            );
            toast.success("تم اعتماد جميع المستلمين");
            await loadData();
        } catch {
            toast.error("فشل العملية");
        }
    };

    const handleRejectAll = async (correspondenceId: number) => {
        if (!window.confirm("رفض جميع المستلمين؟")) return;

        try {
            await apiWrapper.post(
                `/Distributions/correspondence/${correspondenceId}/reject-all`
            );
            toast.success("تم رفض جميع المستلمين");
            await loadData();
        } catch {
            toast.error("فشل العملية");
        }
    };

    const handleBatchApprove = async () => {
        if (selected.length === 0) return;
        if (!window.confirm(`اعتماد ${selected.length} توزيع؟`)) return;

        try {
            await apiWrapper.post("/Distributions/batch/approve", {
                distributionIds: selected,
            });
            toast.success("تم اعتماد المحدد");
            setSelected([]);
            await loadData();
        } catch {
            toast.error("فشل العملية");
        }
    };

    const handleBatchReject = async () => {
        if (selected.length === 0) return;
        if (!window.confirm(`رفض ${selected.length} توزيع؟`)) return;

        try {
            await apiWrapper.post("/Distributions/batch/reject", {
                distributionIds: selected,
            });
            toast.success("تم رفض المحدد");
            setSelected([]);
            await loadData();
        } catch {
            toast.error("فشل العملية");
        }
    };

    const toggleSelectAll = (correspondenceId: number) => {
        const item = items.find((i) => i.correspondenceId === correspondenceId);
        if (!item) return;

        const ids = item.pendingReceivers.map((r) => r.distributionId);
        const allSelected = ids.every((id) => selected.includes(id));

        if (allSelected) {
            setSelected((prev) => prev.filter((id) => !ids.includes(id)));
        } else {
            setSelected((prev) => Array.from(new Set([...prev, ...ids])));
        }
    };

    // ==============================
    // HELPERS
    // ==============================

    const getMainTypeLabel = (type: string) => {
        switch (type?.toLowerCase()) {
            case "incoming": return "وارد";
            case "outgoing": return "صادر";
            case "internal": return "داخلي";
            default: return type || "غير محدد";
        }
    };

    const getMainTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case "incoming": return "bg-emerald-100 text-emerald-700";
            case "outgoing": return "bg-blue-100 text-blue-700";
            case "internal": return "bg-purple-100 text-purple-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("ar-SA");
    };

    const isAllSelected = (correspondenceId: number) => {
        const item = items.find((i) => i.correspondenceId === correspondenceId);
        if (!item) return false;
        const ids = item.pendingReceivers.map((r) => r.distributionId);
        return ids.length > 0 && ids.every((id) => selected.includes(id));
    };

    // ==============================
    // RENDER
    // ==============================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل مركز الاعتماد...</span>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <FontAwesomeIcon icon={faClipboardCheck} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">مركز اعتماد التوزيعات</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">مراجعة واعتماد أو رفض التوزيعات المعلقة</p>
                    </div>
                </div>

                <button
                    onClick={() => { setRefreshing(true); loadData().finally(() => setRefreshing(false)); }}
                    disabled={refreshing}
                    className="bg-white border border-blue-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                    <FontAwesomeIcon icon={faRotate} className={refreshing ? "animate-spin" : ""} />
                    تحديث
                </button>
            </div>

            {/* ===== STATS ===== */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm bg-white rounded-2xl border border-blue-100 p-2.5 sm:p-3 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-slate-400 text-[10px] sm:text-xs">📊</span>
                    <span className="text-slate-600 text-[11px] sm:text-xs">الإحصائيات:</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-slate-500">التوزيعات المعلقة:</span>
                    <span className="font-semibold text-slate-800">{statistics.totalReceivers}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-slate-500">المراسلات:</span>
                    <span className="font-semibold text-slate-800">{statistics.totalCorrespondences}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">توزيع تلقائي:</span>
                    <span className="font-semibold text-emerald-600">{statistics.autoDistributed}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-purple-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">توزيع يدوي:</span>
                    <span className="font-semibold text-purple-600">{statistics.manualDistributed}</span>
                </div>
            </div>

            {/* ===== TOOLBAR ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between">
                    <div className="relative flex-1">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] sm:text-sm"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث برقم أو عنوان المراسلة..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            { key: "all", label: "الكل" },
                            { key: "incoming", label: "الوارد" },
                            { key: "outgoing", label: "الصادر" },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setFilter(item.key as any)}
                                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition ${
                                    filter === item.key
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== BATCH ACTIONS ===== */}
            <AnimatePresence>
                {selected.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                        <span className="text-sm font-medium text-slate-700">
                            تم تحديد {selected.length} توزيع
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBatchApprove}
                                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition"
                            >
                                <FontAwesomeIcon icon={faCheck} className="ml-1" />
                                اعتماد المحدد
                            </button>
                            <button
                                onClick={handleBatchReject}
                                className="px-4 py-1.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                            >
                                <FontAwesomeIcon icon={faXmark} className="ml-1" />
                                رفض المحدد
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== CARDS ===== */}
            <div className="space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-blue-200 py-12 text-center shadow-sm">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-4xl text-blue-300 mb-3" />
                        <h2 className="text-lg font-bold text-slate-600">لا توجد توزيعات بانتظار الاعتماد</h2>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const isExpanded = expandedCards.has(item.correspondenceId);
                        const allSelected = isAllSelected(item.correspondenceId);

                        return (
                            <motion.div
                                key={item.correspondenceId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden"
                            >
                                {/* ===== CARD HEADER ===== */}
                                <div
                                    className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white cursor-pointer hover:bg-blue-100/50 transition flex items-center justify-between"
                                    onClick={() => toggleCard(item.correspondenceId)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">
                                                {item.correspondenceTitle}
                                            </h3>
                                            <span className="text-xs text-slate-400">#{item.correspondenceNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mt-0.5 flex-wrap">
                                            <span>الموزع: {item.distributorName}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className={`px-1.5 py-0.5 rounded-full ${getMainTypeColor(item.mainType)}`}>
                                                {getMainTypeLabel(item.mainType)}
                                            </span>
                                            {item.isProfessional && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">مهني</span>
                                            )}
                                            <span className="text-slate-400 text-[10px]">{formatDate(item.distributedDate)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                            {item.pendingReceivers.length} مستلم
                                        </span>
                                        <FontAwesomeIcon
                                            icon={isExpanded ? faChevronUp : faChevronDown}
                                            className="text-slate-400 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* ===== CARD BODY ===== */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 border-t border-blue-100 space-y-4">
                                                {/* Correspondence Info */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                                    {item.senderEntity && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-500">الجهة المرسلة:</span>
                                                            <span className="font-medium">{item.senderEntity}</span>
                                                        </div>
                                                    )}
                                                    {item.documentType && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-500">نوع الوثيقة:</span>
                                                            <span className="font-medium">{item.documentType}</span>
                                                        </div>
                                                    )}
                                                    {item.senderReference && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-500">مرجع المرسل:</span>
                                                            <span className="font-medium">{item.senderReference}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Attachments */}
                                                {item.attachments.length > 0 && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <FontAwesomeIcon icon={faPaperclip} className="text-slate-400" />
                                                        <span className="text-slate-500">المرفقات:</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {item.attachments.map((att) => (
                                                                <span key={att.id} className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                                    {att.fileName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Receivers List */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-medium text-slate-600">المستلمون</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSelectAll(item.correspondenceId);
                                                            }}
                                                            className="text-xs text-blue-500 hover:text-blue-600"
                                                        >
                                                            {allSelected ? "إلغاء الكل" : "تحديد الكل"}
                                                        </button>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {item.pendingReceivers.map((receiver) => (
                                                            <div
                                                                key={receiver.distributionId}
                                                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs sm:text-sm"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selected.includes(receiver.distributionId)}
                                                                        onChange={() => {
                                                                            setSelected((prev) =>
                                                                                prev.includes(receiver.distributionId)
                                                                                    ? prev.filter((id) => id !== receiver.distributionId)
                                                                                    : [...prev, receiver.distributionId]
                                                                            );
                                                                        }}
                                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="font-medium text-slate-800 truncate">
                                                                            {receiver.receiverName}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-500 truncate">
                                                                            {receiver.receiverEmail}
                                                                        </p>
                                                                    </div>
                                                                    {receiver.isAutoDistributed && (
                                                                        <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                                                            تلقائي
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex gap-1 flex-shrink-0">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleApprove(receiver.distributionId);
                                                                        }}
                                                                        disabled={processingIds.has(receiver.distributionId)}
                                                                        className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center disabled:opacity-50"
                                                                        title="اعتماد"
                                                                    >
                                                                        {processingIds.has(receiver.distributionId) ? (
                                                                            <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleReject(receiver.distributionId);
                                                                        }}
                                                                        disabled={processingIds.has(receiver.distributionId)}
                                                                        className="w-7 h-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center disabled:opacity-50"
                                                                        title="رفض"
                                                                    >
                                                                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Bulk Actions for this correspondence */}
                                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                                    <button
                                                        onClick={() => handleApproveAll(item.correspondenceId)}
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition flex items-center gap-1"
                                                    >
                                                        <FontAwesomeIcon icon={faUserCheck} className="text-[10px]" />
                                                        اعتماد الكل
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectAll(item.correspondenceId)}
                                                        className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition flex items-center gap-1"
                                                    >
                                                        <FontAwesomeIcon icon={faUserXmark} className="text-[10px]" />
                                                        رفض الكل
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}