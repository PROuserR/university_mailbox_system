/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/reading-behavior/page.tsx

"use client";

import { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRefresh,
  faSpinner,
  faChartBar,
  faEye,
  faClock,
  faUsers,
  faCalendarDay,
  faHourglassHalf,
  faArrowUp,
  faArrowDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useReadingBehavior } from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

const getPerformanceColor = (percentage: number) => {
  if (percentage >= 80) return "text-emerald-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-red-600";
};

const getTrendIcon = (direction: string) => {
  switch (direction) {
    case "Increasing": return { icon: faArrowUp, color: "text-emerald-500" };
    case "Decreasing": return { icon: faArrowDown, color: "text-red-500" };
    default: return { icon: faMinus, color: "text-gray-500" };
  }
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function ReadingBehaviorPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== Query =====
  const {
    data,
    isLoading: isDataLoading,
    refetch,
  } = useReadingBehavior();

  const isLoading = isAuthLoading || isDataLoading;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ============================================================
  // ===== Render =====
  // ============================================================

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return null;
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
        <span className="mr-3 text-blue-600 text-sm">جاري تحميل تقرير سلوك القراءة...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-slate-600">لا توجد بيانات</h2>
        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على بيانات سلوك القراءة</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faRefresh} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { topReaders, worstReaders, averageReadTimeHours, peakReadingHours, bestDayForReading, monthlyTrend, generatedAt } = data;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/80 p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faChartBar} />
            </span>
            سلوك القراءة
          </h1>
          <p className="text-sm text-gray-500 mt-1 mr-11">تحليل شامل لسلوك القراءة والإحصائيات</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm font-medium shadow-sm disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRefresh} className={isLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* ===== STATISTICS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">متوسط وقت القراءة</span>
            <FontAwesomeIcon icon={faClock} className="text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-1">{averageReadTimeHours.toFixed(1)} ساعة</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">أفضل يوم للقراءة</span>
            <FontAwesomeIcon icon={faCalendarDay} className="text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-1">{bestDayForReading}</p>
        </div>
        <div className="bg-white rounded-xl border border-purple-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">ساعات الذروة</span>
            <FontAwesomeIcon icon={faHourglassHalf} className="text-purple-500" />
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{peakReadingHours.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">نسبة القراءة الإجمالية</span>
            <FontAwesomeIcon icon={faEye} className="text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{monthlyTrend.overallReadPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* ===== PEAK READING HOURS ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faClock} />
          </span>
          ساعات الذروة للقراءة
        </h3>
        <div className="flex flex-wrap gap-2">
          {peakReadingHours.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد بيانات</p>
          ) : (
            peakReadingHours.map((hour, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-xl bg-orange-50 text-orange-700 font-medium text-sm border border-orange-200"
              >
                {hour}
              </span>
            ))
          )}
        </div>
      </div>

     {/* ===== MONTHLY TREND ===== */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
        <FontAwesomeIcon icon={faChartBar} />
      </span>
      الاتجاه الشهري للقراءة
    </h3>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">الاتجاه:</span>
      {(() => {
        const trend = getTrendIcon(monthlyTrend.trendDirection);
        return (
          <span className={`text-sm font-medium ${trend.color} flex items-center gap-1`}>
            <FontAwesomeIcon icon={trend.icon} />
            {monthlyTrend.trendDirection === "Increasing" ? "تصاعدي" :
             monthlyTrend.trendDirection === "Decreasing" ? "تنازلي" :
             "مستقر"}
          </span>
        );
      })()}
    </div>
  </div>
  
  {monthlyTrend.data.length === 0 ? (
    <div className="flex h-64 items-center justify-center text-gray-400">
      لا توجد بيانات
    </div>
  ) : (
    <>
      <div className="w-full h-64">
        <div className="flex items-end justify-around h-full w-full gap-2 px-2">
          {monthlyTrend.data.map((item, index) => {
            // ✅ حساب القيم مع التأكد من عدم القسمة على صفر
            const maxValue = Math.max(...monthlyTrend.data.map(d => Math.max(d.received, d.read)), 1);
            const totalHeight = (item.received / maxValue) * 100;
            const readHeight = (item.read / maxValue) * 100;
            const unreadHeight = Math.max(totalHeight - readHeight, 0);

            return (
              <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-full max-w-[48px] flex flex-col items-center justify-end h-[75%]">
                  {/* ✅ الشريط الكامل (المستلم) - خلفية */}
                  <div
                    className="w-full bg-blue-100 rounded-t-lg relative overflow-hidden"
                    style={{
                      height: `${Math.max(totalHeight, 5)}%`,
                      minHeight: '8px',
                    }}
                  >
                    {/* ✅ الجزء المقروء (أخضر في الأسفل) */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 cursor-pointer"
                      style={{
                        height: `${Math.max(readHeight, 2)}%`,
                        minHeight: '4px',
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        مقروء: {item.read} / {item.received}
                      </div>
                    </div>
                  </div>
                </div>
                {/* التسميات */}
                <span className="text-[10px] text-gray-500 mt-2 font-medium">
                  {item.month}
                </span>
                <span className={`text-[9px] font-medium ${item.readPercentage >= 70 ? 'text-emerald-600' : item.readPercentage >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {item.readPercentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Legend ===== */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
          <span className="text-xs text-gray-600">مقروء</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-blue-100" />
          <span className="text-xs text-gray-600">غير مقروء</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-gray-200" />
          <span className="text-xs text-gray-600">الإجمالي: {monthlyTrend.data.reduce((acc, d) => acc + d.received, 0)}</span>
        </div>
      </div>

      {/* ===== إحصائيات سريعة ===== */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400">أعلى قراءة</p>
          <p className="text-sm font-bold text-emerald-600">
            {Math.max(...monthlyTrend.data.map(d => d.read))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">أعلى استلام</p>
          <p className="text-sm font-bold text-blue-600">
            {Math.max(...monthlyTrend.data.map(d => d.received))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">متوسط القراءة</p>
          <p className="text-sm font-bold text-purple-600">
            {(monthlyTrend.data.reduce((acc, d) => acc + d.readPercentage, 0) / monthlyTrend.data.length).toFixed(1)}%
          </p>
        </div>
      </div>
    </>
  )}
</div>

      {/* ===== TOP READERS & WORST READERS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Readers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            أفضل القراء ({topReaders.length})
          </h3>
          {topReaders.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">
              لا توجد بيانات
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topReaders.map((reader, index) => (
                <div
                  key={reader.userId}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-gray-400 w-5">{index + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {reader.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{reader.fullName}</p>
                      <p className="text-[10px] text-gray-400">{reader.role}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-emerald-600">{reader.readPercentage.toFixed(1)}%</p>
                    <p className="text-[9px] text-gray-400">{reader.readCount}/{reader.receivedCount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Worst Readers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            أقل القراء ({worstReaders.length})
          </h3>
          {worstReaders.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">
              لا توجد بيانات
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {worstReaders.map((reader, index) => (
                <div
                  key={reader.userId}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-gray-400 w-5">{index + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {reader.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{reader.fullName}</p>
                      <p className="text-[10px] text-gray-400">{reader.role}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-red-600">{reader.readPercentage.toFixed(1)}%</p>
                    <p className="text-[9px] text-gray-400">{reader.readCount}/{reader.receivedCount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-6 text-center text-[10px] text-gray-400">
        تم إنشاء التقرير: {formatDate(generatedAt)}
      </div>
    </div>
  );
}