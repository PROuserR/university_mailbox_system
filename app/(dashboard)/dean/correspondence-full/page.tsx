/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/correspondence-full/page.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRefresh,
  faSpinner,
  faChartBar,
  faFile,
  faEye,
  faClock,
  faBan,
  faCalendar,
  faFilter,
  faExclamationTriangle,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faMinus,
  faChartPie,
  faTable,
  faBars,
  faThLarge,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useCorrespondenceFull } from "@/hooks/useAnalytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ============================================================
// ===== Types =====
// ============================================================

type TrendViewType = "stacked" | "grouped" | "line" | "area";

// ============================================================
// ===== Constants =====
// ============================================================

const TREND_VIEWS = [
  { value: "stacked", label: "مكدسة", icon: faChartBar },
  { value: "grouped", label: "متجاورة", icon: faThLarge },
  { value: "line", label: "خطي", icon: faChartLine },
  { value: "area", label: "مساحي", icon: faChartLine },
] as const;

const COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
const STATUS_COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];

// ============================================================
// ===== Helpers =====
// ============================================================

const getDefaultDates = () => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 3);
  return {
    fromDate: format(startDate, "yyyy-MM-dd"),
    toDate: format(endDate, "yyyy-MM-dd"),
  };
};

const formatDate = (date: string) => {
  if (!date) return "-";
  return format(parseISO(date), "dd MMM", { locale: ar });
};

const formatDateFull = (date: string) => {
  if (!date) return "-";
  return format(parseISO(date), "dd MMM yyyy", { locale: ar });
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "High": return "text-red-600 bg-red-50 border-red-200";
    case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "Low": return "text-green-600 bg-green-50 border-green-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getRiskLabel = (riskLevel: string) => {
  switch (riskLevel) {
    case "High": return "عالية";
    case "Medium": return "متوسطة";
    case "Low": return "منخفضة";
    default: return riskLevel;
  }
};

const getTrendIcon = (direction: string) => {
  if (direction === "Increasing") return { icon: faArrowUp, color: "text-emerald-500" };
  if (direction === "Decreasing") return { icon: faArrowDown, color: "text-red-500" };
  return { icon: faMinus, color: "text-gray-500" };
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "draft": return "bg-gray-100 text-gray-700 border-gray-300";
    case "distributed": return "bg-blue-100 text-blue-700 border-blue-300";
    case "archived": return "bg-purple-100 text-purple-700 border-purple-300";
    case "read": return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "ignored": return "bg-red-100 text-red-700 border-red-300";
    case "rejected": return "bg-rose-100 text-rose-700 border-rose-300";
    default: return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

// ============================================================
// ===== Custom Tooltip =====
// ============================================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[140px]">
      <p className="text-xs font-medium text-gray-700 mb-1.5">{label}</p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-500">{item.name}</span>
          </span>
          <span className="font-medium text-gray-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// ===== Custom Types Pie Chart =====
// ============================================================

const CustomPieChart = ({ data, total }: { data: any[]; total: number }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-8">لا توجد بيانات</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value} مراسلة`]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "8px 12px",
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          مهني: <span className="font-medium text-gray-700">{data.reduce((acc, d) => acc + (d.isProfessional ? d.value : 0), 0)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          غير مهني: <span className="font-medium text-gray-700">{data.reduce((acc, d) => acc + (!d.isProfessional ? d.value : 0), 0)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400" />
          الإجمالي: <span className="font-medium text-gray-700">{total}</span>
        </span>
      </div>
    </div>
  );
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function CorrespondenceFullPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== Default Dates (3 months) =====
  const defaultDates = useMemo(() => getDefaultDates(), []);

  // ===== Filters =====
  const [fromDate, setFromDate] = useState<string>(defaultDates.fromDate);
  const [toDate, setToDate] = useState<string>(defaultDates.toDate);
  const [groupBy, setGroupBy] = useState<string>("day");

  // ===== View Settings =====
  const [trendView, setTrendView] = useState<TrendViewType>("stacked");

  // ===== Query =====
  const {
    data,
    isLoading: isDataLoading,
    refetch,
  } = useCorrespondenceFull({
    fromDate: fromDate || null,
    toDate: toDate || null,
    groupBy,
    topIgnoredCount: 10,
  });

  const isLoading = isAuthLoading || isDataLoading;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ============================================================
  // ===== Prepare Chart Data =====
  // ============================================================

  const chartData = useMemo(() => {
    if (!data?.trend?.items) return [];
    return data.trend.items.slice(-14).map((item) => ({
      ...item,
      date: formatDate(item.date),
      fullDate: item.date,
    }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data?.types?.items) return [];
    return data.types.items.map((item) => ({
      name: item.type === "Incoming" ? "وارد" : item.type === "Outgoing" ? "صادر" : "داخلي",
      value: item.count,
      percentage: item.percentage,
      isProfessional: item.type === "Professional" || false,
    }));
  }, [data]);

  const statusData = useMemo(() => {
    if (!data?.statusSummary?.items) return [];
    return data.statusSummary.items.map((item) => ({
      name: item.status,
      value: item.count,
      percentage: item.percentage,
    }));
  }, [data]);

  // ============================================================
  // ===== Render Trend Chart =====
  // ============================================================

  const renderTrendChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-gray-400">
          لا توجد بيانات
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    if (trendView === "stacked") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  incoming: "وارد",
                  outgoing: "صادر",
                  internal: "داخلي",
                };
                return <span className="text-xs text-gray-600">{labels[value] || value}</span>;
              }}
              iconType="circle"
            />
            <Bar dataKey="internal" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="outgoing" stackId="a" fill="#10b981" />
            <Bar dataKey="incoming" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (trendView === "grouped") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  incoming: "وارد",
                  outgoing: "صادر",
                  internal: "داخلي",
                };
                return <span className="text-xs text-gray-600">{labels[value] || value}</span>;
              }}
              iconType="circle"
            />
            <Bar dataKey="incoming" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={18} />
            <Bar dataKey="outgoing" fill="#10b981" radius={[2, 2, 0, 0]} barSize={18} />
            <Bar dataKey="internal" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (trendView === "area") {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  incoming: "وارد",
                  outgoing: "صادر",
                  internal: "داخلي",
                };
                return <span className="text-xs text-gray-600">{labels[value] || value}</span>;
              }}
              iconType="circle"
            />
            <Area type="monotone" dataKey="incoming" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="internal" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // line
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                incoming: "وارد",
                outgoing: "صادر",
                internal: "داخلي",
              };
              return <span className="text-xs text-gray-600">{labels[value] || value}</span>;
            }}
            iconType="circle"
          />
          <Line type="monotone" dataKey="incoming" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="outgoing" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="internal" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
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

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
        <span className="mr-3 text-blue-600 text-sm">جاري تحميل تقرير المراسلات...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-slate-600">لا توجد بيانات</h2>
        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على بيانات المراسلات</p>
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

  const { types, trend, statusSummary, topIgnored } = data;
  const trendIcon = getTrendIcon(trend?.trendDirection || "Stable");

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/80 p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faFile} />
            </span>
            تقرير المراسلات الكامل
          </h1>
          <p className="text-sm text-gray-500 mt-1 mr-11">تحليل شامل للمراسلات والإحصائيات</p>
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

      {/* ===== FILTERS ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-6">
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

      {/* ===== TYPES (Pie Chart) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faChartPie} />
            </span>
            أنواع المراسلات
          </h3>
          <CustomPieChart data={pieData} total={types?.total || 0} />
        </div>

        {/* ===== TREND ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faChartLine} />
              </span>
              الاتجاه الزمني
            </h3>

            <div className="flex items-center gap-1">
              {TREND_VIEWS.map((view) => (
                <button
                  key={view.value}
                  onClick={() => setTrendView(view.value)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition flex items-center gap-1 ${
                    trendView === view.value
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <FontAwesomeIcon icon={view.icon} className="text-[10px]" />
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===== Quick Stats ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="text-[8px] text-blue-500">الإجمالي</p>
              <p className="text-sm font-bold text-blue-700">{trend?.total || 0}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <p className="text-[8px] text-emerald-500">المتوسط اليومي</p>
              <p className="text-sm font-bold text-emerald-700">{trend?.averageDaily?.toFixed(1) || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <p className="text-[8px] text-purple-500">يوم الذروة</p>
              <p className="text-xs font-bold text-purple-700">{trend?.peakDay ? formatDateFull(trend.peakDay) : "-"}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-[8px] text-indigo-500">الاتجاه</p>
                <FontAwesomeIcon icon={trendIcon.icon} className={`${trendIcon.color} text-[10px]`} />
              </div>
              <p className="text-sm font-bold text-indigo-700">
                {trend?.trendDirection === "Increasing" ? "تصاعدي" :
                 trend?.trendDirection === "Decreasing" ? "تنازلي" :
                 "مستقر"}
              </p>
            </div>
          </div>

          {renderTrendChart()}
        </div>
      </div>

      {/* ===== STATUS SUMMARY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faChartBar} />
              </span>
              ملخص حالة المراسلات
            </h3>
            <span className="text-xs text-gray-400">{statusSummary?.total || 0} إجمالي</span>
          </div>

          {statusData.length === 0 ? (
            <div className="text-center text-gray-400 py-4">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              {statusData.map((item, index) => {
                const percentage = statusSummary?.total > 0 ? (item.value / statusSummary.total) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(item.name)}`}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{item.value}</span>
                        <span className="text-gray-400 text-[10px]">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, 2)}%`,
                          backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== TOP IGNORED ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faBan} />
              </span>
              أكثر المراسلات تجاهلاً
            </h3>
            <span className="text-xs text-gray-400">{topIgnored?.total || 0} مراسلة</span>
          </div>

          {topIgnored?.items?.length === 0 ? (
            <div className="text-center text-gray-400 py-4">لا توجد بيانات</div>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-red-50 text-slate-700">
                    <th className="p-2 font-semibold w-8">#</th>
                    <th className="p-2 font-semibold">المراسلة</th>
                    <th className="p-2 font-semibold">النوع</th>
                    <th className="p-2 font-semibold">التوزيعات</th>
                    <th className="p-2 font-semibold">متجاهل</th>
                    <th className="p-2 font-semibold">المخاطرة</th>
                  </tr>
                </thead>
                <tbody>
                  {topIgnored.items.map((item, index) => (
                    <tr key={item.correspondenceId} className="border-t border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-2 text-center text-gray-400">{index + 1}</td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[100px]">{item.title}</p>
                          <p className="text-[9px] text-slate-400">#{item.number}</p>
                        </div>
                      </td>
                      <td className="p-2 text-slate-600">{item.type}</td>
                      <td className="p-2 text-slate-600">{item.totalDistributions}</td>
                      <td className="p-2 text-red-600 font-medium">{item.ignoredCount}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${getRiskColor(item.riskLevel)}`}>
                          {getRiskLabel(item.riskLevel)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}