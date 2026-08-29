/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/jobs/page.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faRotateRight,
  faClock,
  faTrash,
  faXmark,
  faCheckCircle,
  faTimesCircle,
  faHistory,
  faCog,
  faRefresh,
  faBan,
  faPen,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useAllJobsStatus,
  useRescheduleAllJobs,
  useTriggerJob,
  usePauseJob,
  useResumeJob,
  useCleanupOldJobs,
  useRescheduleJob,
  useUpdateJobSchedule,
} from "@/hooks/useJobs";
import { JobStatusDto, JobsStatusResponse } from "@/types/api/jobs.types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import cronstrue from "cronstrue";
import * as cronValidator from "cron-validator";

// ============================================================
// ===== Type Guards =====
// ============================================================

function isJobStatusDto(obj: unknown): obj is JobStatusDto {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "jobId" in obj &&
    "isEnabled" in obj &&
    "isActive" in obj &&
    "cronExpression" in obj &&
    "displayName" in obj
  );
}

// ============================================================
// ===== Main Component =====
// ============================================================

export default function JobsManagementPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.MANAGE_JOBS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  const {
    data: jobsStatus = {},
    isLoading: loadingJobs,
    refetch: refetchJobs,
  } = useAllJobsStatus();

  const [search, setSearch] = useState("");
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

  // ===== حالة مودال تعديل الجدولة =====
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    jobId: string | null;
    currentCron: string;
    newCron: string;
    error: string;
  }>({
    isOpen: false,
    jobId: null,
    currentCron: "",
    newCron: "",
    error: "",
  });

  // ============================================================
  // ===== Mutations =====
  // ============================================================

  const triggerMutation = useTriggerJob(() => refetchJobs());
  const pauseMutation = usePauseJob(() => refetchJobs());
  const resumeMutation = useResumeJob(() => refetchJobs());
  const rescheduleAllMutation = useRescheduleAllJobs(() => refetchJobs());
  const rescheduleMutation = useRescheduleJob(() => refetchJobs());
  const cleanupMutation = useCleanupOldJobs(() => refetchJobs());
  const updateScheduleMutation = useUpdateJobSchedule(() => {
    setScheduleModal((prev) => ({ ...prev, isOpen: false }));
    refetchJobs();
  });

  const isProcessing =
    triggerMutation.isPending ||
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    rescheduleAllMutation.isPending ||
    rescheduleMutation.isPending ||
    cleanupMutation.isPending ||
    updateScheduleMutation.isPending;

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const handleTrigger = (jobId: string) => {
    const job = jobsStatus[jobId];
    const displayName = isJobStatusDto(job) ? job.displayName : jobId;

    setConfirmModal({
      isOpen: true,
      title: "تنفيذ المهمة",
      message: `هل أنت متأكد من تنفيذ المهمة (${displayName})؟`,
      variant: "success",
      icon: faPlay,
      onConfirm: () => {
        triggerMutation.mutate(jobId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handlePause = (jobId: string) => {
    const job = jobsStatus[jobId];
    const displayName = isJobStatusDto(job) ? job.displayName : jobId;

    setConfirmModal({
      isOpen: true,
      title: "إيقاف المهمة",
      message: `هل أنت متأكد من إيقاف المهمة (${displayName})؟ سيتم إلغاء تنشيطها.`,
      variant: "warning",
      icon: faPause,
      onConfirm: () => {
        pauseMutation.mutate(jobId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleResume = (jobId: string) => {
    const job = jobsStatus[jobId];
    const displayName = isJobStatusDto(job) ? job.displayName : jobId;

    setConfirmModal({
      isOpen: true,
      title: "استئناف المهمة",
      message: `هل أنت متأكد من استئناف المهمة (${displayName})؟`,
      variant: "success",
      icon: faPlay,
      onConfirm: () => {
        resumeMutation.mutate(jobId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRescheduleAll = () => {
    setConfirmModal({
      isOpen: true,
      title: "إعادة جدولة جميع المهام",
      message: "هل أنت متأكد من إعادة جدولة جميع المهام؟",
      variant: "warning",
      icon: faRotateRight,
      onConfirm: () => {
        rescheduleAllMutation.mutate();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleReschedule = (jobId: string) => {
    const job = jobsStatus[jobId];
    const displayName = isJobStatusDto(job) ? job.displayName : jobId;

    setConfirmModal({
      isOpen: true,
      title: "إعادة جدولة المهمة",
      message: `هل أنت متأكد من إعادة جدولة المهمة (${displayName})؟`,
      variant: "warning",
      icon: faRotateRight,
      onConfirm: () => {
        rescheduleMutation.mutate(jobId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCleanup = () => {
    setConfirmModal({
      isOpen: true,
      title: "تنظيف المهام القديمة",
      message: "هل أنت متأكد من تنظيف المهام القديمة؟ سيتم إزالة المهام غير المستخدمة.",
      variant: "warning",
      icon: faTrash,
      onConfirm: () => {
        cleanupMutation.mutate();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRefresh = () => {
    refetchJobs();
    toast.success("تم تحديث حالة المهام", { duration: 2000 });
  };

  // ===== مودال تعديل الجدولة =====
  const openScheduleModal = (jobId: string, currentCron: string) => {
    setScheduleModal({
      isOpen: true,
      jobId,
      currentCron,
      newCron: currentCron,
      error: "",
    });
  };

  const closeScheduleModal = () => {
    setScheduleModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCronChange = (value: string) => {
    setScheduleModal((prev) => ({ ...prev, newCron: value, error: "" }));
  };

  const validateCron = (cron: string): boolean => {
    // التحقق من صحة تعبير Cron (بدون ثواني)
    return cronValidator.isValidCron(cron, { seconds: false });
  };

  const handleUpdateSchedule = () => {
    const { jobId, newCron } = scheduleModal;
    if (!jobId) return;

    if (!validateCron(newCron)) {
      setScheduleModal((prev) => ({
        ...prev,
        error:
          "تعبير Cron غير صحيح. يرجى استخدام الصيغة: دقيقة ساعة يوم شهر يوم_الأسبوع (مثال: 0 2 * * * يعني كل يوم في الساعة 2 صباحاً)",
      }));
      return;
    }

    updateScheduleMutation.mutate({ jobId, cronExpression: newCron });
  };

  // ===== عرض التاريخ =====
  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (job: unknown) => {
    if (!job || !isJobStatusDto(job)) {
      return (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
          <FontAwesomeIcon icon={faTimesCircle} className="text-[8px]" />
          غير معروف
        </span>
      );
    }

    if (!job.isActive) {
      return (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
          <FontAwesomeIcon icon={faBan} className="text-[8px]" />
          غير نشط
        </span>
      );
    }

    if (job.isEnabled) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
          <FontAwesomeIcon icon={faCheckCircle} className="text-[8px]" />
          نشط
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px]">
        <FontAwesomeIcon icon={faPause} className="text-[8px]" />
        موقف
      </span>
    );
  };

  const filteredJobs = useMemo(() => {
    const entries = Object.entries(jobsStatus);
    if (!search) return entries;
    return entries.filter(([_, job]) => {
      if (!isJobStatusDto(job)) return false;
      return job.displayName.toLowerCase().includes(search.toLowerCase());
    });
  }, [jobsStatus, search]);

  const stats = useMemo(() => {
    const entries = Object.values(jobsStatus).filter(isJobStatusDto);
    return {
      total: entries.length,
      active: entries.filter((j) => j.isActive && j.isEnabled).length,
      paused: entries.filter((j) => j.isActive && !j.isEnabled).length,
      inactive: entries.filter((j) => !j.isActive).length,
    };
  }, [jobsStatus]);

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
            <FontAwesomeIcon icon={faCog} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              إدارة المهام المجدولة
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              عرض والتحكم في المهام المجدولة في النظام
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loadingJobs}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faRefresh} className={loadingJobs ? "animate-spin" : ""} />
            تحديث
          </button>

          <button
            onClick={handleCleanup}
            disabled={cleanupMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faTrash} />
            تنظيف القديم
          </button>

          <button
            onClick={handleRescheduleAll}
            disabled={rescheduleAllMutation.isPending}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            إعادة جدولة الكل
          </button>
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm bg-white rounded-2xl border border-blue-100 p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-slate-400 text-[10px] sm:text-xs">📊</span>
          <span className="text-slate-600 text-[11px] sm:text-xs">الإحصائيات:</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-slate-500">إجمالي المهام:</span>
          <span className="font-semibold text-slate-800">{stats.total}</span>
        </div>
        <div className="w-px h-3 sm:h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
          <span className="text-slate-500">نشطة:</span>
          <span className="font-semibold text-emerald-600">{stats.active}</span>
        </div>
        <div className="w-px h-3 sm:h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-yellow-500 text-[8px] sm:text-[10px]">●</span>
          <span className="text-slate-500">موقفة:</span>
          <span className="font-semibold text-yellow-600">{stats.paused}</span>
        </div>
        <div className="w-px h-3 sm:h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-gray-500 text-[8px] sm:text-[10px]">●</span>
          <span className="text-slate-500">غير نشطة:</span>
          <span className="font-semibold text-gray-600">{stats.inactive}</span>
        </div>
      </div>

      {/* ===== Search ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faClock}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] sm:text-sm"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المهمة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* ===== Jobs Table ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        {loadingJobs ? (
          <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
            جاري تحميل المهام...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-2xl sm:text-3xl" />
            <p className="text-xs sm:text-sm">لا توجد مهام</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-blue-50 text-slate-700">
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المهمة</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">
                    الجدولة
                  </th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                    التنفيذ القادم
                  </th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                    آخر تنفيذ
                  </th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(([jobId, job]) => {
                  if (!isJobStatusDto(job)) return null;

                  return (
                    <tr key={jobId} className="border-t border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                            {job.displayName.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                            {job.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {job.cronExpression}
                        </code>
                      </td>
                      <td className="p-2 sm:p-3 text-slate-600 text-xs hidden lg:table-cell">
                        {formatDate(job.nextExecution)}
                      </td>
                      <td className="p-2 sm:p-3 text-slate-600 text-xs hidden lg:table-cell">
                        {formatDate(job.lastExecution)}
                      </td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">{getStatusBadge(job)}</td>
                      <td className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {/* ===== الحالة 1: نشط ومفعل ===== */}
                          {job.isActive && job.isEnabled && (
                            <>
                              {/* ✅ تنفيذ - أخضر */}
                              <button
                                onClick={() => handleTrigger(jobId)}
                                disabled={isProcessing}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center disabled:opacity-50"
                                title="تنفيذ"
                              >
                                <FontAwesomeIcon icon={faPlay} className="text-[10px] sm:text-sm" />
                              </button>
                              {/* ✅ إيقاف - أصفر (إلغاء تنشيط) */}
                              <button
                                onClick={() => handlePause(jobId)}
                                disabled={isProcessing}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition flex items-center justify-center disabled:opacity-50"
                                title="إيقاف"
                              >
                                <FontAwesomeIcon icon={faPause} className="text-[10px] sm:text-sm" />
                              </button>
                            </>
                          )}

                          {/* ===== الحالة 2: موقف ===== */}
                          {job.isActive && !job.isEnabled && (
                            <>
                              {/* ✅ تنفيذ - أخضر */}
                              <button
                                onClick={() => handleTrigger(jobId)}
                                disabled={isProcessing}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center disabled:opacity-50"
                                title="تنفيذ"
                              >
                                <FontAwesomeIcon icon={faPlay} className="text-[10px] sm:text-sm" />
                              </button>
                              {/* ✅ استئناف - أزرق */}
                              <button
                                onClick={() => handleResume(jobId)}
                                disabled={isProcessing}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center disabled:opacity-50"
                                title="استئناف"
                              >
                                <FontAwesomeIcon icon={faPlay} className="text-[10px] sm:text-sm" />
                              </button>
                            </>
                          )}

                          {/* ===== الحالة 3: غير نشط ===== */}
                          {!job.isActive && (
                            <>
                              {/* ✅ تنفيذ - أخضر */}
                              <button
                                onClick={() => handleTrigger(jobId)}
                                disabled={isProcessing}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center disabled:opacity-50"
                                title="تنفيذ"
                              >
                                <FontAwesomeIcon icon={faPlay} className="text-[10px] sm:text-sm" />
                              </button>
                              {/* ✅ استئناف - أزرق */}
                              <button
                                onClick={() => handleResume(jobId)}
                                disabled={isProcessing}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center disabled:opacity-50"
                                title="استئناف"
                              >
                                <FontAwesomeIcon icon={faPlay} className="text-[10px] sm:text-sm" />
                              </button>
                            </>
                          )}

                          {/* ===== أزرار مشتركة ===== */}
                          {/* ✅ إعادة جدولة - بنفسجي */}
                          <button
                            onClick={() => handleReschedule(jobId)}
                            disabled={isProcessing}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition flex items-center justify-center disabled:opacity-50"
                            title="إعادة جدولة"
                          >
                            <FontAwesomeIcon icon={faRotateRight} className="text-[10px] sm:text-sm" />
                          </button>

                          {/* ✅ تعديل الجدولة - برتقالي (جديد) */}
                          <button
                            onClick={() => openScheduleModal(jobId, job.cronExpression)}
                            disabled={isProcessing}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition flex items-center justify-center disabled:opacity-50"
                            title="تعديل الجدولة"
                          >
                            <FontAwesomeIcon icon={faPen} className="text-[10px] sm:text-sm" />
                          </button>
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

      {/* ===== مودال تعديل الجدولة ===== */}
      {scheduleModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                تعديل جدولة المهمة
              </h2>
              <button
                onClick={closeScheduleModal}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* عرض الجدولة الحالية بصيغة مفهومة */}
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-medium text-slate-600">الجدولة الحالية:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-white px-2 py-0.5 rounded text-xs font-mono text-slate-700">
                    {scheduleModal.currentCron}
                  </code>
                  <span className="text-xs text-slate-500">
                    ({cronstrue.toString(scheduleModal.currentCron, { locale: "ar" })})
                  </span>
                </div>
              </div>

              {/* حقل الإدخال */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  تعبير Cron الجديد <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scheduleModal.newCron}
                  onChange={(e) => handleCronChange(e.target.value)}
                  placeholder='مثال: 0 2 * * *'
                  className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none transition ${
                    scheduleModal.error
                      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-slate-200 focus:border-blue-400"
                  }`}
                  dir="ltr"
                />
                {scheduleModal.error && (
                  <p className="text-red-500 text-xs mt-1">{scheduleModal.error}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  الصيغة: دقيقة ساعة يوم شهر يوم_الأسبوع (مثال: 0 2 * * * = كل يوم في الساعة 2 صباحاً)
                </p>
              </div>

              {/* معاينة الجدولة الجديدة */}
              {scheduleModal.newCron && !scheduleModal.error && validateCron(scheduleModal.newCron) && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <p className="text-xs font-medium text-emerald-700">الجدولة الجديدة:</p>
                  <p className="text-sm text-emerald-800 mt-0.5">
                    {cronstrue.toString(scheduleModal.newCron, { locale: "ar" })}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleUpdateSchedule}
              disabled={
                updateScheduleMutation.isPending ||
                !scheduleModal.newCron ||
                scheduleModal.newCron === scheduleModal.currentCron ||
                !!scheduleModal.error
              }
              className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 sm:mt-5 flex items-center justify-center gap-2 ${
                updateScheduleMutation.isPending ||
                !scheduleModal.newCron ||
                scheduleModal.newCron === scheduleModal.currentCron ||
                scheduleModal.error
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {updateScheduleMutation.isPending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري التحديث...
                </>
              ) : (
                "تحديث الجدولة"
              )}
            </button>
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