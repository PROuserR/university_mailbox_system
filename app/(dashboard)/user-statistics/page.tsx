/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/receiver/dashboard/page.tsx

"use client";

import { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRefresh,
  faSpinner,
  faGaugeHigh,
  faChartBar,
  faClock,
  faEye,
  faBan,
  faEnvelope,
  faCalendarAlt,
  faClock as faClockIcon,
} from "@fortawesome/free-solid-svg-icons";
import { useReceiverDashboard } from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthGuard } from "@/hooks/useAuthGuard";

// ============================================================
// ===== Helpers =====
// ============================================================

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDaysColor = (days: number) => {
  if (days <= 3) return "text-yellow-600";
  if (days <= 7) return "text-orange-600";
  if (days <= 14) return "text-red-500";
  return "text-red-700";
};

const getDaysBg = (days: number) => {
  if (days <= 3) return "bg-yellow-50";
  if (days <= 7) return "bg-orange-50";
  if (days <= 14) return "bg-red-50";
  return "bg-red-100";
};

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

// ============================================================
// ===== Monthly Reading Chart =====
// ============================================================

const MonthlyReadingChart = ({ data, year }: { data: any[]; year: number }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        لا توجد بيانات
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: item.month,
    read: item.read,
    received: item.received,
    readPercentage: item.readPercentage,
  }));

  const maxReceived = Math.max(...data.map((d) => d.received), 1);

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: any, name: any) => {
              const labels: Record<string, string> = {
                read: "مقروء",
                received: "مستلم",
              };
              return [`${value}`, labels[name] || name];
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "8px 12px",
            }}
          />
          <Bar dataKey="received" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="read" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>

      {/* ===== Legend ===== */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
          <span className="text-xs text-gray-600">مقروء</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-blue-300" />
          <span className="text-xs text-gray-600">مستلم</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-gray-200" />
          <span className="text-xs text-gray-600">
            الإجمالي: {data.reduce((acc, d) => acc + d.received, 0)}
          </span>
        </div>
      </div>

      {/* ===== إحصائيات سريعة ===== */}
      <div className="grid grid-cols-3 gap-3 mt-3 pt-2 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400">أعلى قراءة</p>
          <p className="text-sm font-bold text-emerald-600">
            {Math.max(...data.map((d) => d.read))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">أعلى استلام</p>
          <p className="text-sm font-bold text-blue-600">
            {Math.max(...data.map((d) => d.received))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">متوسط القراءة</p>
          <p className="text-sm font-bold text-purple-600">
            {(data.reduce((acc, d) => acc + d.readPercentage, 0) / data.length).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function ReceiverDashboardPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    redirectTo: "/auth/login",
  });

  // ===== Query =====
  const {
    data,
    isLoading: isDataLoading,
    refetch,
  } = useReceiverDashboard();

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
        <span className="mr-3 text-blue-600 text-sm">جاري تحميل لوحة المستلم...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-slate-600">لا توجد بيانات</h2>
        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على بيانات لوحة المستلم</p>
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

  const { summary, monthlyReading, pending, recentReads, performance } = data;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/80 p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faGaugeHigh} />
            </span>
            لوحة المستلم
          </h1>
          <p className="text-sm text-gray-500 mt-1 mr-11">نظرة عامة على أداء القراءة والتوزيعات</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm font-medium shadow-sm disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRefresh} className={isLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">إجمالي المستلم</span>
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{summary.totalReceived}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">مقروء</span>
            <FontAwesomeIcon icon={faEye} className="text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {summary.totalRead}
            <span className="text-sm font-normal text-gray-400 mr-1">
              ({summary.readPercentage.toFixed(1)}%)
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">معلق</span>
            <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
          </div>
          <p className="text-xl font-bold text-yellow-600 mt-1">
            {summary.totalPending}
            <span className="text-sm font-normal text-gray-400 mr-1">
              ({summary.pendingPercentage.toFixed(1)}%)
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">متجاهل</span>
            <FontAwesomeIcon icon={faBan} className="text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">
            {summary.totalIgnored}
            <span className="text-sm font-normal text-gray-400 mr-1">
              ({summary.ignoredPercentage.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      {/* ===== PERFORMANCE ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-purple-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClockIcon} className="text-purple-500" />
            <span className="text-[10px] text-gray-500">متوسط وقت القراءة</span>
          </div>
          <p className="text-lg font-bold text-purple-600 mt-1">
            {performance.averageReadTimeHours.toFixed(1)} ساعة
          </p>
        </div>
        <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="text-indigo-500" />
            <span className="text-[10px] text-gray-500">أفضل شهر قراءة</span>
          </div>
          <p className="text-lg font-bold text-indigo-600 mt-1">
            {performance.bestMonthName}
            <span className="text-sm font-normal text-gray-400 mr-1">
              ({performance.bestMonthReadCount} قراءة)
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEye} className="text-emerald-500" />
            <span className="text-[10px] text-gray-500">إجمالي القراءات</span>
          </div>
          <p className="text-lg font-bold text-emerald-600 mt-1">{performance.totalRead}</p>
        </div>
      </div>

      {/* ===== MONTHLY READING CHART ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faChartBar} />
          </span>
          القراءة الشهرية ({monthlyReading.year})
        </h3>
        <MonthlyReadingChart data={monthlyReading.data} year={monthlyReading.year} />
      </div>

      {/* ===== PENDING & RECENT READS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faClock} />
            </span>
            المراسلات المعلقة ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">
              لا توجد مراسلات معلقة
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${getDaysBg(item.daysPending)} hover:opacity-80 transition`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>#{item.number}</span>
                      <span>•</span>
                      <span>{item.mainType}</span>
                      <span>•</span>
                      <span>{formatDate(item.distributedDate)}</span>
                    </div>
                  </div>
                  <span className={`font-medium text-xs ${getDaysColor(item.daysPending)}`}>
                    {item.daysPending} يوم
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reads */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faEye} />
            </span>
            أحدث القراءات ({recentReads.length})
          </h3>
          {recentReads.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">
              لا توجد قراءات حديثة
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentReads.map((item) => (
                <div
                  key={item.correspondenceId}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>#{item.number}</span>
                      <span>•</span>
                      <span>{formatDateTime(item.readAt)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.daysSinceRead === 0 ? 'اليوم' : `${item.daysSinceRead} يوم`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}