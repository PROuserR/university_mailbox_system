/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/distribution-patterns/page.tsx

"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faChartBar,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useDistributionPatterns } from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import components
import { PatternsSummaryCards } from "@/components/distribution-patterns/PatternsSummaryCards";
import { DistributionByTypeChart } from "@/components/distribution-patterns/DistributionByTypeChart";
import { DistributionByDayChart } from "@/components/distribution-patterns/DistributionByDayChart";
import { DistributionByHourChart } from "@/components/distribution-patterns/DistributionByHourChart";
import { DistributionByMonthChart } from "@/components/distribution-patterns/DistributionByMonthChart";
import { TopDistributorsTable } from "@/components/distribution-patterns/TopDistributorsTable";
import { TopSenderEntitiesTable } from "@/components/distribution-patterns/TopSenderEntitiesTable";
import { TopDocumentTypesTable } from "@/components/distribution-patterns/TopDocumentTypesTable";

// ============================================================
// ===== Main Component =====
// ============================================================

export default function DistributionPatternsPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== State =====
  const [topDistributorsCount] = useState(10);
  const [topSenderEntitiesCount] = useState(10);
  const [topDocumentTypesCount] = useState(10);
  const [months] = useState(12);

  // ===== Query =====
  const {
    data,
    isLoading: isDataLoading,
    refetch,
  } = useDistributionPatterns({
    topDistributorsCount,
    topSenderEntitiesCount,
    topDocumentTypesCount,
    months,
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
        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على بيانات الأنماط</p>
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
              <h1 className="text-base sm:text-lg font-bold text-slate-800">أنماط التوزيع</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">تحليل شامل لأنماط التوزيع والإحصائيات</p>
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

      {/* ===== SUMMARY CARDS ===== */}
      <PatternsSummaryCards
        summary={data.summary}
        averageDaily={data.averageDailyDistributions}
        averageWeekly={data.averageWeeklyDistributions}
        averageMonthly={data.averageMonthlyDistributions}
        peakDay={data.peakDistributionDay}
        peakHour={data.peakDistributionHour}
        mostActiveMonth={data.mostActiveMonth}
        totalReadCount={data.totalReadCount}
        totalIgnoredCount={data.totalIgnoredCount}
        overallReadPercentage={data.overallReadPercentage}
        growthRate={data.growthRate}
        averageDistributionsPerEmployee={data.averageDistributionsPerEmployee}
        averageDistributionsPerReceiver={data.averageDistributionsPerReceiver}
      />

      {/* ===== CHARTS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* By Type */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">حسب النوع</h3>
          <DistributionByTypeChart data={data.distributionByType} />
        </div>

        {/* By Day */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">حسب اليوم</h3>
          <DistributionByDayChart data={data.distributionByDay} />
        </div>

        {/* By Hour */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">حسب الساعة</h3>
          <DistributionByHourChart data={data.distributionByHour} />
        </div>

        {/* By Month */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">حسب الشهر</h3>
          <DistributionByMonthChart data={data.distributionByMonth} />
        </div>
      </div>

      {/* ===== TABLES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Top Distributors */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            🏆 أفضل الموزعين
          </h3>
          <TopDistributorsTable data={data.topDistributors} />
        </div>

        {/* Top Sender Entities */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            🏛️ أفضل الجهات المرسلة
          </h3>
          <TopSenderEntitiesTable data={data.topSenderEntities} />
        </div>

        {/* Top Document Types */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            📄 أفضل أنواع الوثائق
          </h3>
          <TopDocumentTypesTable data={data.topDocumentTypes} />
        </div>
      </div>
    </div>
  );
}