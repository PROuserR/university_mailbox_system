/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/ignored-users/page.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faSpinner,
  faUsers,
  faEnvelope,
  faClock,
  faBan,
  faEye,
  faUser,
  faCalendar,
  faFileLines,
  faRefresh,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
  faTrash,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useIgnoredUsers, useProcessIgnored } from "@/hooks/useAnalytics";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PermissionGate } from "@/components/auth/PermissionGate";
import toast from "react-hot-toast";

// ============================================================
// ===== Constants =====
// ============================================================

const DAYS_OPTIONS = [
  { value: 1, label: "1 أيام" },
  { value: 3, label: "3 أيام" },
  { value: 7, label: "7 أيام" },
  { value: 14, label: "14 يوم" },
  { value: 30, label: "30 يوم" },
  { value: 60, label: "60 يوم" },
];

// ============================================================
// ===== Helpers =====
// ============================================================

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getDaysColor = (days: number) => {
  if (days <= 7) return "text-yellow-600";
  if (days <= 14) return "text-orange-600";
  if (days <= 30) return "text-red-500";
  return "text-red-700";
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function IgnoredUsersPage() {
  const router = useRouter();
  const { isAuthorized, isLoading: isAuthLoading } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== State =====
  const [daysThreshold, setDaysThreshold] = useState<number>(7);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  // ===== Confirm Modal =====
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
    data,
    isLoading: isDataLoading,
    refetch,
  } = useIgnoredUsers({
    daysThreshold,
    page,
    pageSize,
  });

  // ===== Mutations =====
  const processMutation = useProcessIgnored(() => {
    refetch();
  });

  const isProcessing = processMutation.isPending;
  const isLoading = isAuthLoading || isDataLoading;

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const toggleUser = (userId: number) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleProcessIgnored = () => {
    setConfirmModal({
      isOpen: true,
      title: "معالجة المراسلات المتجاهلة",
      message: `سيتم معالجة جميع المراسلات المتجاهلة لأكثر من ${daysThreshold} يوم. هل أنت متأكد من المتابعة؟`,
      variant: "warning",
      icon: faExclamationTriangle,
      onConfirm: () => {
        processMutation.mutate(daysThreshold);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success("تم تحديث التقرير", { duration: 2000 });
  };

  // ============================================================
  // ===== Computed =====
  // ============================================================

  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;
  const hasPreviousPage = data?.hasPreviousPage || false;
  const hasNextPage = data?.hasNextPage || false;

  const totalIgnoredCorrespondences = useMemo(() => {
    return items.reduce(
      (acc, user) => acc + user.ignoredCorrespondences.length,
      0
    );
  }, [items]);

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
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800">
                المستخدمون المتجاهلون
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-slate-400" />
                الحد الأدنى للأيام: {daysThreshold} يوم
                {totalCount > 0 && ` · إجمالي المستخدمين: ${totalCount}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={daysThreshold}
              onChange={(e) => {
                setDaysThreshold(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400"
              disabled={isLoading}
            >
              {DAYS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm disabled:opacity-50"
              disabled={isLoading}
            >
              <FontAwesomeIcon
                icon={faRefresh}
                className={isLoading ? "animate-spin" : ""}
              />
              تحديث
            </button>

            <PermissionGate
              permissions={[PERMISSIONS.VIEW_ANALYTICS]}
              disableOnUnauthorized
            >
              <button
                onClick={handleProcessIgnored}
                disabled={isProcessing || items.length === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon
                  icon={isProcessing ? faSpinner : faTrash}
                  spin={isProcessing}
                />
                {isProcessing ? "جاري المعالجة..." : "تطبيق التجاهل"}
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* ===== STATISTICS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-400">
              إجمالي المستخدمين المتجاهلين
            </span>
            <FontAwesomeIcon icon={faUsers} className="text-red-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
            {totalCount}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-orange-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-400">
              إجمالي المراسلات المتجاهلة
            </span>
            <FontAwesomeIcon icon={faEnvelope} className="text-orange-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
            {totalIgnoredCorrespondences}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-yellow-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-slate-400">
              الحد الأدنى للأيام
            </span>
            <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">
            {daysThreshold} يوم
          </p>
        </div>
      </div>

      {/* ===== USERS LIST ===== */}
      {isLoading && items.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-3xl text-blue-600"
          />
          <span className="mr-3 text-blue-600 text-sm">
            جاري تحميل التقرير...
          </span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-100 p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-600">
            لا يوجد مستخدمون متجاهلون
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            جميع المستخدمين في الحدود الطبيعية
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((user, index) => {
              const isExpanded = expandedUsers.has(user.userId);
              const totalIgnored = user.ignoredCorrespondences.length;

              return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden"
                >
                  {/* ===== USER HEADER ===== */}
                  <div
                    className="px-3 sm:px-4 py-3 bg-gradient-to-r from-orange-50 to-white cursor-pointer hover:bg-orange-100/50 transition flex items-center justify-between"
                    onClick={() => toggleUser(user.userId)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                          {user.fullName}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-400">
                          @{user.userName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="text-slate-400 text-[10px] sm:text-xs"
                        />
                        <span className="font-medium text-slate-700">
                          {user.unreadCount}
                        </span>
                        <span className="text-slate-400 text-[10px] sm:text-xs hidden sm:inline">
                          غير مقروء
                        </span>
                      </div>
                      {user.oldestUnreadDate && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="text-slate-400 text-[10px] sm:text-xs"
                          />
                          <span className="text-slate-500 text-[10px] sm:text-xs hidden md:inline">
                            {formatDate(user.oldestUnreadDate)}
                          </span>
                        </div>
                      )}
                      <span className="text-[10px] sm:text-xs bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 rounded-full">
                        {totalIgnored}
                      </span>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className="text-slate-400 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* ===== USER BODY ===== */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 sm:p-4 border-t border-orange-100 space-y-2">
                          {totalIgnored === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-2">
                              لا توجد مراسلات متجاهلة لهذا المستخدم
                            </p>
                          ) : (
                            <>
                              <p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-2">
                                المراسلات المتجاهلة ({totalIgnored})
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {user.ignoredCorrespondences.map((corr) => (
                                  <div
                                    key={corr.correspondenceId}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-xs"
                                  >
                                    <div className="min-w-0 flex-1 mr-2">
                                      <p className="font-medium text-slate-700 truncate text-[11px] sm:text-xs">
                                        {corr.title}
                                      </p>
                                      <p className="text-slate-400 text-[9px] sm:text-[10px]">
                                        #{corr.correspondenceNumber} ·{" "}
                                        {formatDate(corr.distributedAt)}
                                      </p>
                                    </div>
                                    <span
                                      className={`font-medium mr-2 text-[10px] sm:text-xs ${getDaysColor(
                                        corr.daysPending
                                      )}`}
                                    >
                                      {corr.daysPending} يوم
                                    </span>
                                    {/* ✅ تم إزالة زر "عرض" */}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <button
                onClick={() => goToPage(1)}
                disabled={!hasPreviousPage}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FontAwesomeIcon icon={faAnglesRight} />
              </button>
              <button
                onClick={() => goToPage(page - 1)}
                disabled={!hasPreviousPage}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>

              <span className="text-sm text-slate-600 mx-2">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={!hasNextPage}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={!hasNextPage}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </button>
            </div>
          )}
        </>
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
