/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/distribution-full/page.tsx

"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faRefresh,
  faSpinner,
  faFilter,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useDistributionFull } from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Components
import { DistributionStatusSummary } from "@/components/distribution-full/DistributionStatusSummary";
import { DistributionTrendChart } from "@/components/distribution-full/DistributionTrendChart";
import { DistributionPeaksCards } from "@/components/distribution-full/DistributionPeaksCards";
import { DistributionOverallStats } from "@/components/distribution-full/DistributionOverallStats";
import { DistributionSummaryCards } from "@/components/distribution-full/DistributionSummaryCards";

// ============================================================
// ===== Helpers =====
// ============================================================

const getDefaultDates = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // 3 أشهر ماضية
  
  return {
    fromDate: startDate.toISOString().split('T')[0],
    toDate: endDate.toISOString().split('T')[0],
  };
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function DistributionFullPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== Default Dates =====
  const defaultDates = useMemo(() => getDefaultDates(), []);

  // ===== Filters =====
  const [fromDate, setFromDate] = useState<string>(defaultDates.fromDate);
  const [toDate, setToDate] = useState<string>(defaultDates.toDate);
  const [groupBy, setGroupBy] = useState<string>("day");

  // ===== Query =====
  const {
    data,
    isLoading: isDataLoading,
    refetch,
  } = useDistributionFull({
    fromDate: fromDate || null,
    toDate: toDate || null,
    departmentId: null, // ✅ إلغاء فلتر القسم
    userId: null, // ✅ إلغاء فلتر المستخدم
    groupBy,
  });

  const isLoading = isAuthLoading || isDataLoading;

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
        <span className="mr-3 text-blue-600 text-sm">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-slate-600">لا توجد بيانات</h2>
        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على بيانات التوزيع</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faRefresh} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
              <FontAwesomeIcon icon={faChartBar} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800">تقرير التوزيع الكامل</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                تحليل شامل للتوزيعات والإحصائيات والاتجاهات
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            <FontAwesomeIcon icon={faRefresh} className={isLoading ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              <FontAwesomeIcon icon={faCalendar} className="ml-1" />
              من تاريخ
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              <FontAwesomeIcon icon={faCalendar} className="ml-1" />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              <FontAwesomeIcon icon={faFilter} className="ml-1" />
              التجميع حسب
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            >
              <option value="day">يومي</option>
              <option value="month">شهري</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== STATUS SUMMARY ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <h3 className="text-sm font-bold text-slate-700 mb-3">ملخص حالة التوزيعات</h3>
        <DistributionStatusSummary data={data.statusStatistics} />
      </div>

      {/* ===== TREND ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">اتجاه التوزيعات</h3>
          <div className="text-xs text-slate-500">
            <span className="font-medium">الاتجاه:</span> {data.trend.trendDirection}
            <span className="mr-2">
              ({data.trend.totalDistributions} توزيع)
            </span>
          </div>
        </div>
        <DistributionTrendChart data={data.trend.items} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-[10px] text-gray-400">المتوسط اليومي</p>
            <p className="text-sm font-bold text-slate-700">{data.trend.averageDaily.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">المتوسط الأسبوعي</p>
            <p className="text-sm font-bold text-slate-700">{data.trend.averageWeekly.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">المتوسط الشهري</p>
            <p className="text-sm font-bold text-slate-700">{data.trend.averageMonthly.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">يوم الذروة</p>
            <p className="text-sm font-bold text-slate-700">{data.trend.peakDay}</p>
            <p className="text-[10px] text-gray-400">({data.trend.peakDayCount} توزيع)</p>
          </div>
        </div>
      </div>

      {/* ===== PEAKS ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <h3 className="text-sm font-bold text-slate-700 mb-3">ساعات وأيام الذروة</h3>
        <DistributionPeaksCards
          peakHours={data.peaks.peakHours}
          peakHoursSummary={data.peaks.peakHoursSummary}
          peakDays={data.peaks.peakDays}
          peakDaysSummary={data.peaks.peakDaysSummary}
        />
      </div>

      {/* ===== OVERALL STATS ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <h3 className="text-sm font-bold text-slate-700 mb-3">الإحصائيات العامة</h3>
        <DistributionOverallStats data={data.overall} />
      </div>

      {/* ===== SUMMARY ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
        <h3 className="text-sm font-bold text-slate-700 mb-3">ملخص التوزيعات</h3>
        <DistributionSummaryCards data={data.summary} />
        <div className="mt-4 text-center text-[10px] text-gray-400">
          تم إنشاء التقرير: {new Date(data.generatedAt).toLocaleString("ar-SA")}
        </div>
      </div>
    </div>
  );
}