/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/dashboard/page.tsx

"use client";

import { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRefresh,
  faSpinner,
  faGaugeHigh,
  faChartBar,
  faBan,
  faClock,
  faUsers,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useDeanDashboard } from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import components
import { SummaryCards } from "@/components/dean-dashboard/SummaryCards";
import { DistributionStatusCards } from "@/components/dean-dashboard/DistributionStatusCards";
import { MonthlyTrendChart } from "@/components/dean-dashboard/MonthlyTrendChart";
import { DistributionPieChart } from "@/components/dean-dashboard/DistributionPieChart";
import { TopIgnoredTable } from "@/components/dean-dashboard/TopIgnoredTable";
import { RecentActivities } from "@/components/dean-dashboard/RecentActivities";
import { ReadingPerformanceTable } from "@/components/dean-dashboard/ReadingPerformanceTable";

// ============================================================
// ===== Main Component =====
// ============================================================

export default function DeanDashboardPage() {
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
  } = useDeanDashboard();

  const isLoading = isAuthLoading || isDataLoading;

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("تم تحديث لوحة العميد");
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
        <span className="mr-3 text-blue-600 text-sm">جاري تحميل لوحة العميد...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-slate-600">لا توجد بيانات</h2>
        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على بيانات لوحة العميد</p>
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

  // ✅ استخدام kpiCards بدلاً من kpi
  const kpiCards = data.kpiCards;
  const quickStats = data.quickStats;
  const charts = data.charts;
  const topLists = data.topLists;
  const readingPerformance = data.readingPerformance || [];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/80 p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faGaugeHigh} />
            </span>
            لوحة العميد
          </h1>
          <p className="text-sm text-gray-500 mt-1 mr-11">نظرة عامة على أداء النظام والإحصائيات</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium shadow-sm disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRefresh} className={isLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* ===== SUMMARY CARDS (KPI) ===== */}
      <SummaryCards data={kpiCards} />

      {/* ===== QUICK STATS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
          <p className="text-[10px] text-gray-400">توزيعات اليوم</p>
          <p className="text-lg font-bold text-blue-600">{quickStats.todayDistributions}</p>
        </div>
        <div className="bg-white rounded-xl border border-purple-100 p-3 shadow-sm">
          <p className="text-[10px] text-gray-400">توزيعات هذا الأسبوع</p>
          <p className="text-lg font-bold text-purple-600">{quickStats.thisWeekDistributions}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
          <p className="text-[10px] text-gray-400">توزيعات هذا الشهر</p>
          <p className="text-lg font-bold text-emerald-600">{quickStats.thisMonthDistributions}</p>
        </div>
        <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-sm">
          <p className="text-[10px] text-gray-400">متوسط يومي</p>
          <p className="text-lg font-bold text-indigo-600">{quickStats.dailyAverage.toFixed(1)}</p>
        </div>
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faChartBar} />
            </span>
            الاتجاه الشهري
          </h3>
          <MonthlyTrendChart data={charts.monthlyTrend} />
        </div>

        {/* Distribution By Type */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faChartBar} />
            </span>
            التوزيع حسب النوع
          </h3>
          <DistributionPieChart data={charts.byType} />
        </div>
      </div>

      {/* ===== DISTRIBUTION STATUS ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faEye} />
          </span>
          حالة التوزيعات
        </h3>
        <DistributionStatusCards data={charts.distributionStatus} />
      </div>

      {/* ===== TABLES ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faBan} />
            </span>
            أكثر المستخدمين تجاهلاً
          </h3>
          <TopIgnoredTable data={topLists.topIgnoredUsers} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faClock} />
            </span>
            الأنشطة الأخيرة
          </h3>
          <RecentActivities data={topLists.recentActivities} />
        </div>
      </div>

      {/* ===== READING PERFORMANCE ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faUsers} />
          </span>
          أداء القراءة
        </h3>
        <ReadingPerformanceTable data={readingPerformance} />
      </div>
    </div>
  );
}