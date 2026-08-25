/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/approvals/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
    faLock,
    faCheckDouble,
    faBan,
} from "@fortawesome/free-solid-svg-icons";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { usePendingApprovals } from "@/hooks/usePendingApprovals";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { distributionService } from "@/services/distribution.service";
import ConfirmationModal from "@/components/ui/ConfirmationModal"; 
import { useAuth } from "@/hooks/useAuth";

// ==============================
// HELPERS
// ==============================

function getMainTypeLabel(type: string) {
    switch (type?.toLowerCase()) {
        case "incoming": return "وارد";
        case "outgoing": return "صادر";
        case "internal": return "داخلي";
        default: return type || "غير محدد";
    }
}

function getMainTypeColor(type: string) {
    switch (type?.toLowerCase()) {
        case "incoming": return "bg-emerald-100 text-emerald-700";
        case "outgoing": return "bg-blue-100 text-blue-700";
        case "internal": return "bg-purple-100 text-purple-700";
        default: return "bg-gray-100 text-gray-700";
    }
}

function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA");
}

// ==============================
// MAIN COMPONENT
// ==============================

function ApprovalsContent() {
    const { isLoading: isAuthLoading } = useAuthGuard({
        requiredPermissions: ['ViewPendingApprovals'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });
    const {
        items,
        isLoading,
        isLoadingMore,
        hasMore,
        totalCount,
        selectedItems,
        isProcessing,
        loadMore,
        refresh,
        toggleSelectItem,
        selectAll,
        deselectAll,
        approveSelected,
        rejectSelected,
        approveAllByCorrespondence,
        rejectAllByCorrespondence,
    } = usePendingApprovals(20);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
    const [rejectReason, setRejectReason] = useState("");

    // ✅ Modal States
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
    const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
    const [modalTarget, setModalTarget] = useState<"single" | "selected" | "all" | null>(null);
    const [modalTargetId, setModalTargetId] = useState<number | null>(null);
    const [modalReceiverId, setModalReceiverId] = useState<number | null>(null);

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
                item.correspondenceNumber?.toString().includes(searchValue) ||
                item.senderEntity?.toLowerCase().includes(searchValue);

            const matchesFilter =
                filter === "all" ||
                item.mainType?.toLowerCase().includes(filter);

            return matchesSearch && matchesFilter;
        });
    }, [items, search, filter]);

    // ==============================
    // HANDLERS - MODALS
    // ==============================

    const openApproveModal = (target: "single" | "selected" | "all", id?: number) => {
        setModalAction("approve");
        setModalTarget(target);
        if (target === "single" && id) {
            setModalReceiverId(id);
        } else {
            setModalTargetId(id || null);
        }
        setShowApproveModal(true);
    };

    const openRejectConfirmModal = (target: "single" | "selected" | "all", id?: number) => {
        setModalAction("reject");
        setModalTarget(target);
        if (target === "single" && id) {
            setModalReceiverId(id);
        } else {
            setModalTargetId(id || null);
        }
        setShowRejectConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        try {
            if (modalAction === "approve") {
                if (modalTarget === "single" && modalReceiverId) {
                    await handleSingleApprove(modalReceiverId);
                } else if (modalTarget === "selected") {
                    await approveSelected();
                } else if (modalTarget === "all" && modalTargetId) {
                    await approveAllByCorrespondence(modalTargetId);
                }
            } else if (modalAction === "reject") {
                if (modalTarget === "single" && modalReceiverId) {
                    await handleSingleReject(modalReceiverId, rejectReason || undefined);
                } else if (modalTarget === "selected") {
                    await rejectSelected(rejectReason || undefined);
                } else if (modalTarget === "all" && modalTargetId) {
                    await rejectAllByCorrespondence(modalTargetId, rejectReason || undefined);
                }
            }
            
            setShowApproveModal(false);
            setShowRejectConfirmModal(false);
            setRejectReason("");
            setModalAction(null);
            setModalTarget(null);
            setModalTargetId(null);
            setModalReceiverId(null);
            await refresh();
        } catch {
            // الخطأ معالج في الـ Hook
        }
    };

    // ==============================
    // HANDLERS - ORIGINAL
    // ==============================

    const handleSingleApprove = async (distributionId: number) => {
        setProcessingIds((prev) => new Set(prev).add(distributionId));
        try {
            await distributionService.approveDistribution(distributionId);
            await refresh();
        } catch (error: any) {
            toast.error(error.message || "فشل اعتماد التوزيع");
            throw error;
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(distributionId);
                return newSet;
            });
        }
    };

    const handleSingleReject = async (distributionId: number, reason?: string) => {
        setProcessingIds((prev) => new Set(prev).add(distributionId));
        try {
            await distributionService.rejectDistribution(distributionId, reason);
            await refresh();
        } catch (error: any) {
            toast.error(error.message || "فشل رفض التوزيع");
            throw error;
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(distributionId);
                return newSet;
            });
        }
    };

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

    const toggleSelectAllForCorrespondence = (correspondenceId: number) => {
        const item = items.find((i) => i.correspondenceId === correspondenceId);
        if (!item) return;

        const ids = item.pendingReceivers.map((r) => r.distributionId);
        const allSelected = ids.every((id) => selectedItems.includes(id));

        if (allSelected) {
            ids.forEach(id => {
                if (selectedItems.includes(id)) {
                    toggleSelectItem(id);
                }
            });
        } else {
            ids.forEach(id => {
                if (!selectedItems.includes(id)) {
                    toggleSelectItem(id);
                }
            });
        }
    };

    const isAllSelectedForCorrespondence = (correspondenceId: number) => {
        const item = items.find((i) => i.correspondenceId === correspondenceId);
        if (!item) return false;
        const ids = item.pendingReceivers.map((r) => r.distributionId);
        return ids.length > 0 && ids.every((id) => selectedItems.includes(id));
    };

    // ==============================
    // RENDER
    // ==============================

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="bg-white border border-blue-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faRotate} className={isLoading ? "animate-spin" : ""} />
                        تحديث
                    </button>
                </div>
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
                {selectedItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                        <span className="text-sm font-medium text-slate-700">
                            تم تحديد {selectedItems.length} توزيع
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <PermissionGate permissions={['ApproveDistribution']} disableOnUnauthorized={true} >
                                <button
                                    onClick={() => openApproveModal("selected")}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-1"
                                >
                                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                    اعتماد المحدد
                                </button>
                            </PermissionGate>

                            <PermissionGate permissions={['RejectDistribution']} disableOnUnauthorized={true} >
                                <button
                                    onClick={() => openRejectConfirmModal("selected")}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-1"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                    رفض المحدد
                                </button>
                            </PermissionGate>

                            <button
                                onClick={deselectAll}
                                className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition"
                            >
                                إلغاء الاختيار
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== CARDS ===== */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-blue-500" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-blue-200 py-12 text-center shadow-sm">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-4xl text-blue-300 mb-3" />
                        <h2 className="text-lg font-bold text-slate-600">لا توجد توزيعات بانتظار الاعتماد</h2>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const isExpanded = expandedCards.has(item.correspondenceId);
                        const allSelected = isAllSelectedForCorrespondence(item.correspondenceId);

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
                                                {item.attachments && item.attachments.length > 0 && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <FontAwesomeIcon icon={faPaperclip} className="text-slate-400" />
                                                        <span className="text-slate-500">المرفقات:</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {item.attachments
                                                                .filter(att => att !== null && att !== undefined)
                                                                .map((att) => (
                                                                    <span key={att.id} className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                                        {att.fileName || 'ملف بدون اسم'}
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
                                                                toggleSelectAllForCorrespondence(item.correspondenceId);
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
                                                                        checked={selectedItems.includes(receiver.distributionId)}
                                                                        onChange={() => toggleSelectItem(receiver.distributionId)}
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
                                                                    <PermissionGate permissions={['ApproveDistribution']} disableOnUnauthorized={true} >
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openApproveModal("single", receiver.distributionId);
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
                                                                    </PermissionGate>

                                                                    <PermissionGate permissions={['RejectDistribution']} disableOnUnauthorized={true} >
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openRejectConfirmModal("single", receiver.distributionId);
                                                                            }}
                                                                            disabled={processingIds.has(receiver.distributionId)}
                                                                            className="w-7 h-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center disabled:opacity-50"
                                                                            title="رفض"
                                                                        >
                                                                            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                                                        </button>
                                                                    </PermissionGate>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* ===== Bulk Actions ===== */}
                                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                                    <PermissionGate permissions={['ApproveDistribution']} disableOnUnauthorized={true} >
                                                        <button
                                                            onClick={() => openApproveModal("all", item.correspondenceId)}
                                                            disabled={isProcessing || item.pendingReceivers.length === 0}
                                                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <FontAwesomeIcon icon={faUserCheck} className="text-[10px]" />
                                                            اعتماد الكل
                                                        </button>
                                                    </PermissionGate>

                                                    <PermissionGate permissions={['RejectDistribution']} disableOnUnauthorized={true} >
                                                        <button
                                                            onClick={() => openRejectConfirmModal("all", item.correspondenceId)}
                                                            disabled={isProcessing || item.pendingReceivers.length === 0}
                                                            className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <FontAwesomeIcon icon={faUserXmark} className="text-[10px]" />
                                                            رفض الكل
                                                        </button>
                                                    </PermissionGate>
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

            {/* ===== Load More ===== */}
            {hasMore && !isLoading && (
                <div className="text-center py-4">
                    <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="bg-white border border-blue-200 px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLoadingMore ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                جاري التحميل...
                            </>
                        ) : (
                            'تحميل المزيد'
                        )}
                    </button>
                </div>
            )}

            {/* ===== Approve Confirmation Modal ===== */}
            <ConfirmationModal
                isOpen={showApproveModal}
                onClose={() => {
                    setShowApproveModal(false);
                    setModalAction(null);
                    setModalTarget(null);
                    setModalTargetId(null);
                    setModalReceiverId(null);
                }}
                onConfirm={handleConfirmAction}
                title="تأكيد الموافقة"
                message={
                    modalTarget === "single"
                        ? "هل أنت متأكد من الموافقة على هذا التوزيع؟"
                        : modalTarget === "selected"
                        ? `هل أنت متأكد من الموافقة على ${selectedItems.length} توزيع؟`
                        : "هل أنت متأكد من الموافقة على جميع التوزيعات لهذه المراسلة؟"
                }
                confirmText="موافقة"
                variant="success"
            />

            {/* ===== Reject Confirmation Modal ===== */}
            <ConfirmationModal
                isOpen={showRejectConfirmModal}
                onClose={() => {
                    setShowRejectConfirmModal(false);
                    setRejectReason("");
                    setModalAction(null);
                    setModalTarget(null);
                    setModalTargetId(null);
                    setModalReceiverId(null);
                }}
                onConfirm={handleConfirmAction}
                title="تأكيد الرفض"
                message={
                    modalTarget === "single"
                        ? "هل أنت متأكد من رفض هذا التوزيع؟"
                        : modalTarget === "selected"
                        ? `هل أنت متأكد من رفض ${selectedItems.length} توزيع؟`
                        : "هل أنت متأكد من رفض جميع التوزيعات لهذه المراسلة؟"
                }
                confirmText="رفض"
                variant="danger"
            />
        </div>
    );
}

// ==============================
// MAIN EXPORT
// ==============================

export default function ApprovalsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }
        >
            <ApprovalsContent />
        </Suspense>
    );
}