// app/(dashboard)/dean/ignored-report/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
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
  faRotateLeft,
  faXmark,
  faCheckCircle,
  faChartPie,
  faUser,
  faCalendar,
  faCircle,
  faFileLines,
  faInfoCircle,
  faTrash,
  faRefresh,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";

// ==============================
// TYPES
// ==============================

interface IgnoredReceiverDetailDto {
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  distributedDate: string;
  daysPending: number;
}

interface IgnoredCorrespondenceDto {
  correspondenceId: number;
  correspondenceNumber: string;
  correspondenceTitle: string;
  distributedDate: string;
  daysPending: number;
  ignoredReceivers: IgnoredReceiverDetailDto[];
}

interface IgnoredReportDto {
  ignoredDaysThreshold: number;
  totalIgnored: number;
  ignoredCorrespondences: IgnoredCorrespondenceDto[];
}

// ==============================
// HELPERS
// ==============================

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

// ==============================
// MAIN COMPONENT
// ==============================

export default function IgnoredReportPage() {
  useAuthGuard();
  const router = useRouter();
  const { role } = useUserInfoStore();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<IgnoredReportDto | null>(null);
  const [daysThreshold, setDaysThreshold] = useState<number>(7);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const isDean = role === "Dean";

  // ==============================
  // FETCH DATA
  // ==============================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiWrapper.get<{
        data: IgnoredReportDto;
      }>(`/Reports/ignored?daysThreshold=${daysThreshold}`);

      if (response.success && response.data) {
        setData(response.data.data);
      } else {
        toast.error(response.error || "فشل تحميل التقرير");
      }
    } catch {
      toast.error("حدث خطأ أثناء تحميل التقرير");
    } finally {
      setLoading(false);
    }
  }, [daysThreshold]);

  useEffect(() => {
    if (isDean) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isDean, fetchData]);

  // ==============================
  // PROCESS IGNORED
  // ==============================

  const handleProcessIgnored = async () => {
    if (!window.confirm("هل أنت متأكد من معالجة جميع المراسلات المتجاهلة؟"))
      return;

    try {
      setProcessing(true);
      const response = await apiWrapper.post(
        `/Reports/process-ignored?daysThreshold=${daysThreshold}`
      );

      if (response.success) {
        toast.success("تمت معالجة المراسلات المتجاهلة بنجاح");
        await fetchData();
      } else {
        toast.error(response.error || "فشل معالجة المراسلات");
      }
    } catch {
      toast.error("حدث خطأ أثناء المعالجة");
    } finally {
      setProcessing(false);
    }
  };

  // ==============================
  // TOGGLE CARD
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

  // ==============================
  // RENDER
  // ==============================

  if (!isDean) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-600">غير مصرح</h2>
        <p className="text-sm text-slate-400 mt-1">
          هذه الصفحة متاحة للعميد فقط
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
        >
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          العودة
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-3xl text-blue-600"
        />
        <span className="mr-3 text-blue-600 text-sm">
          جاري تحميل التقرير...
        </span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-4">
      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faBan} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                تقرير المراسلات المتجاهلة
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-slate-400" />
                الحد الأدنى للأيام:{" "}
                {data?.ignoredDaysThreshold || daysThreshold} يوم
                {data && ` · إجمالي المتجاهل: ${data.totalIgnored}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector الأيام */}
            <select
              value={daysThreshold}
              onChange={(e) => setDaysThreshold(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400"
            >
              <option value={3}>3 أيام</option>
              <option value={7}>7 أيام</option>
              <option value={14}>14 يوم</option>
              <option value={30}>30 يوم</option>
              <option value={60}>60 يوم</option>
            </select>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm"
              disabled={loading}
            >
              <FontAwesomeIcon
                icon={faRefresh}
                className={loading ? "animate-spin" : ""}
              />
              تحديث
            </button>

            <button
              onClick={handleProcessIgnored}
              disabled={processing || data?.totalIgnored === 0}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon
                icon={processing ? faSpinner : faTrash}
                spin={processing}
              />
              {processing ? "جاري المعالجة..." : "معالجة المتجاهل"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== STATISTICS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">إجمالي المتجاهل</span>
            <FontAwesomeIcon icon={faBan} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {data?.totalIgnored || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">عدد المراسلات</span>
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {data?.ignoredCorrespondences?.length || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-yellow-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">الحد الأدنى للأيام</span>
            <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {data?.ignoredDaysThreshold || daysThreshold} يوم
          </p>
        </div>
      </div>

      {/* ===== IGNORED CORRESPONDENCES LIST ===== */}
      {data?.ignoredCorrespondences?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-100 p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-600">
            لا توجد مراسلات متجاهلة
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            جميع المراسلات في الحدود الطبيعية
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.ignoredCorrespondences.map((item) => {
            const isExpanded = expandedCards.has(item.correspondenceId);
            const daysColor = getDaysColor(item.daysPending);

            return (
              <motion.div
                key={item.correspondenceId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden"
              >
                {/* ===== CARD HEADER ===== */}
                <div
                  className="px-4 py-3 bg-gradient-to-r from-red-50 to-white cursor-pointer hover:bg-red-100/50 transition flex items-center justify-between"
                  onClick={() => toggleCard(item.correspondenceId)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-800 truncate">
                        {item.correspondenceTitle}
                      </h3>
                      <span className="text-xs text-slate-400">
                        #{item.correspondenceNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span>📅 {formatDate(item.distributedDate)}</span>
                      <span className="text-slate-300">|</span>
                      <span className={`font-medium ${daysColor}`}>
                        {item.daysPending} يوم بانتظار
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-red-500">
                        {item.ignoredReceivers.length} مستلم متجاهل
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      {item.ignoredReceivers.length}
                    </span>
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
                      <div className="p-4 border-t border-red-100 space-y-2">
                        <p className="text-xs font-medium text-slate-600 mb-2">
                          المستلمون المتجاهلون:
                        </p>

                        {item.ignoredReceivers.map((receiver) => (
                          <div
                            key={receiver.receiverId}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-500 text-white flex items-center justify-center font-bold text-[10px]">
                                {receiver.receiverName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-sm">
                                  {receiver.receiverName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {receiver.receiverEmail}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">
                                📅 {formatDate(receiver.distributedDate)}
                              </span>
                              <span
                                className={`font-medium ${getDaysColor(
                                  receiver.daysPending
                                )}`}
                              >
                                {receiver.daysPending} يوم
                              </span>
                              <button
                                onClick={() => {
                                  const uiMode =
                                    localStorage.getItem("ui-mode-storage");
                                  let isModern = false;
                                  try {
                                    const parsed = JSON.parse(uiMode || "{}");
                                    isModern =
                                      parsed.state?.uiMode === "modern";
                                  } catch {
                                    isModern = false;
                                  }

                                  if (isModern) {
                                    router.push(`/correspondences?id=${item.correspondenceId}`);
                                  } else {
                                    router.push(
                                      `/mail/${item.correspondenceId}`
                                    );
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-[10px]"
                              >
                                عرض
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
