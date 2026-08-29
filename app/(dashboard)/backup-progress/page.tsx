/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/backup-progress/page.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faBan,
  faRefresh,
  faTrash,
  faStop,
  faEye,
  faXmark,
  faPlay,
  faQuestionCircle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useRunningOperations,
  useAllOperations,
  useProgressStatistics,
  useCancelOperation,
  useCleanupStaleOperations,
} from "@/hooks/useBackupProgress";
import { BackupProgressResponseDto } from "@/types/api/backup-progress.types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

// ============================================================
// ===== Type Guards =====
// ============================================================

function isBackupProgress(obj: unknown): obj is BackupProgressResponseDto {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "operationId" in obj &&
    "status" in obj &&
    "percentage" in obj
  );
}

// ============================================================
// ===== Main Component =====
// ============================================================

export default function BackupProgressPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.MANAGE_BACKUP],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cleanupMinutes, setCleanupMinutes] = useState<number>(60);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "success";
    icon?: any;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger",
  });

  // ===== Queries =====
  const { data: runningOps = [], refetch: refetchRunning } = useRunningOperations();
  const { data: allOps = [], refetch: refetchAll } = useAllOperations(statusFilter || undefined);
  const { data: statistics, refetch: refetchStats } = useProgressStatistics();

  // ===== Mutations =====
  const cancelMutation = useCancelOperation(() => {
    refetchRunning();
    refetchAll();
    refetchStats();
  });
  const cleanupMutation = useCleanupStaleOperations(() => {
    refetchRunning();
    refetchAll();
    refetchStats();
    setIsCleanupModalOpen(false);
  });

  const isProcessing = cancelMutation.isPending || cleanupMutation.isPending;

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Running":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
            <FontAwesomeIcon icon={faSpinner} className="text-[8px] animate-spin" />
            قيد التشغيل
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
            <FontAwesomeIcon icon={faCheckCircle} className="text-[8px]" />
            مكتملة
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px]">
            <FontAwesomeIcon icon={faTimesCircle} className="text-[8px]" />
            فشلت
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px]">
            <FontAwesomeIcon icon={faBan} className="text-[8px]" />
            ملغية
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
            غير معروف
          </span>
        );
    }
  };

  const getStageBadge = (stage: string) => {
    if (!stage) {
      return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
          -
        </span>
      );
    }
    const colors: Record<string, string> = {
      Collecting: "bg-purple-100 text-purple-700",
      Downloading: "bg-blue-100 text-blue-700",
      Zipping: "bg-indigo-100 text-indigo-700",
      Uploading: "bg-orange-100 text-orange-700",
      Restoring: "bg-green-100 text-green-700",
    };
    const color = colors[stage] || "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}>
        {stage}
      </span>
    );
  };

  const getOperationDisplayName = (op: BackupProgressResponseDto) => {
    const type = op.operationType || "عملية";
    const backup = op.backupType || "";
    if (backup) {
      return `${type} - ${backup}`;
    }
    return type;
  };

  const handleRefresh = () => {
    refetchRunning();
    refetchAll();
    refetchStats();
    toast.success("تم تحديث البيانات", { duration: 2000 });
  };

  // ✅ زر الإلغاء يظهر لجميع العمليات (وليس فقط Running)
  const handleCancel = (operationId: string, operationType: string) => {
    const displayName = operationType || "العملية";
    setConfirmModal({
      isOpen: true,
      title: "إلغاء العملية",
      message: `هل أنت متأكد من إلغاء (${displayName})؟`,
      variant: "warning",
      icon: faStop,
      onConfirm: () => {
        cancelMutation.mutate(operationId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ✅ تنظيف العمليات القديمة مع إدخال المستخدم
  const handleCleanup = () => {
    setConfirmModal({
      isOpen: true,
      title: "تنظيف العمليات القديمة",
      message: `هل أنت متأكد من تنظيف العمليات الأقدم من ${cleanupMinutes} دقيقة؟`,
      variant: "danger",
      icon: faTrash,
      onConfirm: () => {
        cleanupMutation.mutate(cleanupMinutes);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const filteredOps = useMemo(() => {
    if (!statusFilter) return allOps;
    return allOps.filter((op) => op.status === statusFilter);
  }, [allOps, statusFilter]);

  // ============================================================
  // ===== Render =====
  // ============================================================

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
      {/* ===== Header ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              تقدم عمليات النسخ الاحتياطي
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              تتبع تقدم عمليات النسخ والاستعادة في الوقت الفعلي
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isProcessing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faRefresh} className={isProcessing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {/* ===== Statistics ===== */}
      {statistics && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-white rounded-2xl border border-blue-100 p-2 sm:p-3 shadow-sm text-center">
            <p className="text-[9px] sm:text-[10px] text-slate-400">الإجمالي</p>
            <p className="text-base sm:text-lg font-bold text-slate-800">{statistics.totalOperations}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-2 sm:p-3 shadow-sm text-center">
            <p className="text-[9px] sm:text-[10px] text-slate-400">قيد التشغيل</p>
            <p className="text-base sm:text-lg font-bold text-blue-600">{statistics.runningOperations}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-2 sm:p-3 shadow-sm text-center">
            <p className="text-[9px] sm:text-[10px] text-slate-400">مكتملة</p>
            <p className="text-base sm:text-lg font-bold text-emerald-600">{statistics.completedOperations}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-2 sm:p-3 shadow-sm text-center">
            <p className="text-[9px] sm:text-[10px] text-slate-400">فشلت</p>
            <p className="text-base sm:text-lg font-bold text-red-600">{statistics.failedOperations}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-2 sm:p-3 shadow-sm text-center">
            <p className="text-[9px] sm:text-[10px] text-slate-400">ملغية</p>
            <p className="text-base sm:text-lg font-bold text-yellow-600">{statistics.cancelledOperations}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-2 sm:p-3 shadow-sm text-center">
            <p className="text-[9px] sm:text-[10px] text-slate-400">قديمة</p>
            <p className="text-base sm:text-lg font-bold text-gray-600">{statistics.staleOperations}</p>
          </div>
        </div>
      )}

      {/* ===== Running Operations ===== */}
      {runningOps.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 mb-3 sm:mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-2">
            <FontAwesomeIcon icon={faSpinner} className="ml-2 animate-spin text-blue-500" />
            العمليات الجارية ({runningOps.length})
          </h2>
          <div className="space-y-2">
            {runningOps.map((op) => (
              <div key={op.operationId} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-slate-800">
                      {getOperationDisplayName(op)}
                    </span>
                    {getStatusBadge(op.status)}
                    {getStageBadge(op.currentStage)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{op.percentage}%</span>
                    {/* ✅ زر الإلغاء يظهر دائماً */}
                    <button
                      onClick={() => handleCancel(op.operationId, op.operationType || "عملية")}
                      disabled={isProcessing}
                      className="w-7 h-7 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center disabled:opacity-50"
                      title="إلغاء"
                    >
                      <FontAwesomeIcon icon={faStop} className="text-[10px]" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${op.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>الملف: {op.currentFile || "-"}</span>
                    <span>{op.processedFiles} / {op.totalFiles} ملف</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Filter & Cleanup ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">
          <FontAwesomeIcon icon={faFilter} className="ml-1" />
          فلتر الحالة:
        </span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-400"
        >
          <option value="">الكل</option>
          <option value="Running">قيد التشغيل</option>
          <option value="Completed">مكتملة</option>
          <option value="Failed">فشلت</option>
          <option value="Cancelled">ملغية</option>
        </select>

        <div className="flex-1" />

        <span className="text-xs font-medium text-slate-600">تنظيف القديم:</span>
        <input
          type="number"
          min={1}
          max={1440}
          value={cleanupMinutes}
          onChange={(e) => setCleanupMinutes(Number(e.target.value))}
          className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-blue-400 text-center"
        />
        <span className="text-xs text-slate-500">دقيقة</span>
        <button
          onClick={handleCleanup}
          disabled={isProcessing || cleanupMinutes < 1}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faTrash} />
          تنظيف
        </button>
      </div>

      {/* ===== All Operations Table ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        {allOps.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
            <FontAwesomeIcon icon={faClock} className="text-3xl" />
            <p className="text-sm">لا توجد عمليات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-blue-50 text-slate-700">
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">العملية</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">
                    النوع
                  </th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                    التقدم
                  </th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                    تاريخ البدء
                  </th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOps.map((op) => {
                  const displayName = getOperationDisplayName(op);
                  const operationType = op.operationType || "عملية";
                  
                  return (
                    <tr key={op.operationId} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {operationType.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 text-xs sm:text-sm">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">
                        {op.backupType || "-"}
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${op.percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">{op.percentage}%</span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        {getStatusBadge(op.status)}
                      </td>
                      <td className="p-2 sm:p-3 text-slate-600 text-[10px] hidden lg:table-cell">
                        {formatDate(op.startedAt)}
                      </td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {/* ✅ زر الإلغاء يظهر لجميع العمليات */}
                          <button
                            onClick={() => handleCancel(op.operationId, operationType)}
                            disabled={isProcessing}
                            className="w-7 h-7 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center disabled:opacity-50"
                            title="إلغاء"
                          >
                            <FontAwesomeIcon icon={faStop} className="text-[10px]" />
                          </button>

                          {op.isFailed && op.errorMessage && (
                            <button
                              className="w-7 h-7 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center justify-center"
                              title={op.errorMessage}
                              onClick={() => toast.error(op.errorMessage || "خطأ في العملية")}
                            >
                              <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                            </button>
                          )}
                          
                          {op.status === "Completed" && (
                            <button
                              className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center"
                              title="مكتملة"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                            </button>
                          )}
                          
                          {!op.operationType && !op.backupType && (
                            <span className="text-[8px] text-slate-400" title="بيانات غير مكتملة">
                              <FontAwesomeIcon icon={faQuestionCircle} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Confirmation Modal ===== */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="تأكيد"
        cancelText="إلغاء"
        variant={confirmModal.variant || "danger"}
        icon={confirmModal.icon}
      />
    </div>
  );
}