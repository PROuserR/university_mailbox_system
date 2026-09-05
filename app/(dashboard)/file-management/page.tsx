/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/file-management/page.tsx

"use client";

import { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRefresh,
  faSpinner,
  faFile,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faHardDrive,
  faRotateRight,
  faSearch,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useUnresolvedFailedFiles,
  useRetryFailedDeletions,
  useMarkFailedFileAsResolved,
  useSearchTempFiles,
  useDeleteTempFiles,
  useTempFolderSize,
} from "@/hooks/useFileManagement";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

// ============================================================
// ===== Helpers =====
// ============================================================

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const getStatusBadge = (isResolved: boolean) => {
  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
        <FontAwesomeIcon icon={faCheckCircle} className="text-[8px]" />
        محلول
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px]">
      <FontAwesomeIcon icon={faTimesCircle} className="text-[8px]" />
      غير محلول
    </span>
  );
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function FileManagementPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.MANAGE_FAILED_FILE_DELETIONS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== State =====
  const [activeTab, setActiveTab] = useState<"failed" | "temp">("failed");
  const [olderThanMinutes, setOlderThanMinutes] = useState<number>(60);
  const [forceDelete, setForceDelete] = useState<boolean>(false);

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
  const {
    data: failedFiles = [],
    refetch: refetchFailed,
    isLoading: isFailedLoading,
  } = useUnresolvedFailedFiles();

  const {
    data: tempFiles,
    refetch: refetchTemp,
    isLoading: isTempLoading,
  } = useSearchTempFiles({ olderThanMinutes });

  const { data: tempSize, refetch: refetchSize } = useTempFolderSize();

  // ===== Mutations =====
  const retryMutation = useRetryFailedDeletions(() => {
    refetchFailed();
  });

  const resolveMutation = useMarkFailedFileAsResolved(() => {
    refetchFailed();
  });

  const deleteTempMutation = useDeleteTempFiles(() => {
    refetchTemp();
    refetchSize();
  });

  const isProcessing =
    retryMutation.isPending ||
    resolveMutation.isPending ||
    deleteTempMutation.isPending;

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const handleRetryAll = () => {
    setConfirmModal({
      isOpen: true,
      title: "إعادة محاولة حذف الملفات الفاشلة",
      message: "هل أنت متأكد من إعادة محاولة حذف جميع الملفات الفاشلة؟",
      variant: "warning",
      icon: faRotateRight,
      onConfirm: () => {
        retryMutation.mutate();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleResolve = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "تحديث حالة الملف",
      message: "هل أنت متأكد من تحديث حالة الملف إلى محلول؟",
      variant: "success",
      icon: faCheckCircle,
      onConfirm: () => {
        resolveMutation.mutate(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteTemp = () => {
    setConfirmModal({
      isOpen: true,
      title: "حذف الملفات المؤقتة",
      message: `سيتم حذف الملفات المؤقتة الأقدم من ${olderThanMinutes} دقيقة. هل أنت متأكد؟`,
      variant: "danger",
      icon: faTrash,
      onConfirm: () => {
        deleteTempMutation.mutate({ olderThanMinutes, forceDelete });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRefresh = () => {
    refetchFailed();
    refetchTemp();
    refetchSize();
    toast.success("تم تحديث البيانات", { duration: 2000 });
  };

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
      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <FontAwesomeIcon icon={faFile} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              إدارة الملفات
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              إدارة الملفات المؤقتة والملفات الفاشلة في الحذف
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

      {/* ===== TABS ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-1 mb-3 sm:mb-4 flex">
        <button
          onClick={() => setActiveTab("failed")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
            activeTab === "failed"
              ? "bg-red-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FontAwesomeIcon icon={faTimesCircle} className="ml-2" />
          الملفات الفاشلة ({failedFiles.length})
        </button>
        <button
          onClick={() => setActiveTab("temp")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
            activeTab === "temp"
              ? "bg-blue-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FontAwesomeIcon icon={faHardDrive} className="ml-2" />
          الملفات المؤقتة
        </button>
      </div>

      {/* ============================================================ */}
      {/* ===== FAILED FILES TAB ===== */}
      {/* ============================================================ */}
      {activeTab === "failed" && (
        <div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 mb-3 flex flex-wrap items-center justify-between">
            <span className="text-xs text-slate-500">
              عدد الملفات الفاشلة: <strong>{failedFiles.length}</strong>
            </span>
            <button
              onClick={handleRetryAll}
              disabled={isProcessing || failedFiles.length === 0}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              إعادة محاولة الكل
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            {isFailedLoading && failedFiles.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                <p className="text-sm">جاري التحميل...</p>
              </div>
            ) : failedFiles.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-emerald-500" />
                <p className="text-sm">لا توجد ملفات فاشلة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-red-50 text-slate-700">
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المعرف</th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الملف</th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">
                        العملية
                      </th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                        التاريخ
                      </th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المحاولات</th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedFiles.map((file) => (
                      <tr key={file.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-2 sm:p-3 whitespace-nowrap text-slate-500">#{file.id}</td>
                        <td className="p-2 sm:p-3 whitespace-nowrap">
                          <span className="font-medium text-slate-800 text-xs sm:text-sm">
                            {file.fileIdentifier}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">
                          {file.operation}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-500 text-xs hidden lg:table-cell">
                          {formatDate(file.failedAt)}
                        </td>
                        <td className="p-2 sm:p-3 whitespace-nowrap text-center">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                            {file.retryCount}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 whitespace-nowrap">
                          {getStatusBadge(file.isResolved)}
                        </td>
                        <td className="p-2 sm:p-3 whitespace-nowrap">
                          {!file.isResolved && (
                            <button
                              onClick={() => handleResolve(file.id)}
                              disabled={isProcessing}
                              className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center disabled:opacity-50"
                              title="تحديد كمحلول"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== TEMP FILES TAB ===== */}
      {/* ============================================================ */}
      {activeTab === "temp" && (
        <div>
          {/* ===== Stats ===== */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">إجمالي الملفات</span>
                <FontAwesomeIcon icon={faFile} className="text-blue-500" />
              </div>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {tempFiles?.totalFiles || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-purple-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">الحجم الإجمالي</span>
                <FontAwesomeIcon icon={faHardDrive} className="text-purple-500" />
              </div>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {tempFiles?.totalSizeFormatted || "0 B"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">حجم المجلد</span>
                <FontAwesomeIcon icon={faHardDrive} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {tempSize !== undefined ? formatSize(tempSize) : "..."}
              </p>
            </div>
          </div>

          {/* ===== Actions ===== */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 mb-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">أقدم من:</label>
              <input
                type="number"
                min={1}
                value={olderThanMinutes}
                onChange={(e) => setOlderThanMinutes(Number(e.target.value))}
                className="w-20 border border-slate-200 rounded-xl px-2 py-1 text-xs outline-none focus:border-blue-400"
              />
              <span className="text-xs text-slate-500">دقيقة</span>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={forceDelete}
                onChange={(e) => setForceDelete(e.target.checked)}
                className="rounded border-slate-300"
              />
              حذف قسري
            </label>
            <div className="flex-1" />
            <button
              onClick={() => {
                refetchTemp();
                refetchSize();
              }}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faSearch} />
              بحث
            </button>
            <button
              onClick={handleDeleteTemp}
              disabled={isProcessing || !tempFiles || tempFiles.totalFiles === 0}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faTrash} />
              حذف
            </button>
          </div>

          {/* ===== Files List ===== */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            {isTempLoading && !tempFiles ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                <p className="text-sm">جاري التحميل...</p>
              </div>
            ) : !tempFiles || tempFiles.files.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FontAwesomeIcon icon={faFile} className="text-3xl" />
                <p className="text-sm">لا توجد ملفات مؤقتة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-blue-50 text-slate-700">
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الملف</th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">
                        المسار
                      </th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحجم</th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                        العمر
                      </th>
                      <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">تاريخ الإنشاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempFiles.files.map((file, index) => (
                      <tr key={index} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-2 sm:p-3 whitespace-nowrap">
                          <span className="font-medium text-slate-800 text-xs sm:text-sm">
                            {file.fileName}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-slate-500 text-[10px] hidden md:table-cell truncate max-w-[150px]">
                          {file.filePath}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-600 whitespace-nowrap">
                          {file.sizeFormatted}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-500 text-xs hidden lg:table-cell">
                          <span className={`font-medium ${file.ageMinutes > 60 ? 'text-red-500' : 'text-slate-600'}`}>
                            {file.ageMinutes} دقيقة
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-slate-500 text-xs whitespace-nowrap">
                          {formatDate(file.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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