/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
// app/(dashboard)/statistics/page.tsx

"use client";

import { useEffect, useState } from "react";
import { apiWrapper, ApiResult } from "@/utils/apiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInbox,
  faPaperPlane,
  faBuilding,
  faEnvelope,
  faEye,
  faTriangleExclamation,
  faClockRotateLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// ==============================
// TYPES
// ==============================

interface DashboardResponse {
  isSuccess: boolean;
  data: {
    summary: Summary;
    monthlyStatistics: MonthlyStatistics;
    overallReadingStatus: OverallReadingStatus;
    topIgnoredReceivers: TopIgnoredReceiver[];
    recentActivities: RecentActivity[];
    documentTypeDistribution: DocumentTypeDistribution;
  };
}

interface Summary {
  totalIncoming: number;
  totalOutgoing: number;
  totalInternal: number;
  totalCorrespondences: number;
  pendingReadCount: number;
  readCount: number;
  ignoredCount: number;
  readPercentage: number;
}

interface MonthlyStatistics {
  year: number;
  data: {
    month: string;
    incoming: number;
    outgoing: number;
    internal: number;
    total: number;
  }[];
}

interface OverallReadingStatus {
  totalReceivers: number;
  readCount: number;
  pendingCount: number;
  ignoredCount: number;
  readPercentage: number;
}

interface TopIgnoredReceiver {
  userId: number;
  userName: string;
  ignoredCount: number;
  totalReceived: number;
  ignoredPercentage: number;
}

interface RecentActivity {
  action: string;
  userId: number;
  userName: string;
  entityName: string;
  createdAt: string;
}

interface DocumentTypeDistribution {
  documentTypes: {
    documentTypeName: string;
    count: number;
    percentage: number;
  }[];
}

const PIE_COLORS = ["#60A5FA", "#F87171", "#FACC15"];

export default function DeanDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await apiWrapper.get<
        ApiResult<DashboardResponse["data"]>
      >("/Reports/dashboard/dean");

      if (response.data?.isSuccess) {
        setDashboard(response.data.data);
      }
    } catch (error) {
      console.error("Dashboard Error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-3xl text-blue-600"
        />
        <span className="mr-3 text-blue-600 text-sm">
          جاري تحميل الإحصائيات...
        </span>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500 text-sm">
        فشل تحميل البيانات
      </div>
    );
  }

  const cards = [
    {
      title: "إجمالي المراسلات",
      value: dashboard.summary.totalCorrespondences,
      icon: faEnvelope,
    },
    { title: "الواردة", value: dashboard.summary.totalIncoming, icon: faInbox },
    {
      title: "الصادرة",
      value: dashboard.summary.totalOutgoing,
      icon: faPaperPlane,
    },
    {
      title: "الداخلية",
      value: dashboard.summary.totalInternal,
      icon: faBuilding,
    },
    {
      title: "نسبة القراءة",
      value: `${dashboard.summary.readPercentage.toFixed(1)}%`,
      icon: faEye,
    },
    {
      title: "المتجاهلة",
      value: dashboard.summary.ignoredCount,
      icon: faTriangleExclamation,
    },
  ];

  const readingData = [
    { name: "مقروء", value: dashboard.overallReadingStatus.readCount },
    { name: "متجاهل", value: dashboard.overallReadingStatus.ignoredCount },
    {
      name: "قيد الانتظار",
      value: dashboard.overallReadingStatus.pendingCount,
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
      <div className="space-y-4">
        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            لوحة إحصائيات المراسلات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            نظرة شاملة على أداء المراسلات وحالة القراءة
          </p>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={card.icon} className="text-xs" />
                </div>
                <span className="text-[10px] text-slate-500">{card.title}</span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-800">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* ===== 1. تطور المراسلات - لوحده (كامل العرض) ===== */}
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-3">
            📈 تطور المراسلات خلال العام
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            مقارنة المراسلات الواردة والصادرة والداخلية
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={dashboard.monthlyStatistics.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
              <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="incoming"
                name="الواردة"
                stackId="1"
                stroke="#3B82F6"
                fill="#BFDBFE"
              />
              <Area
                type="monotone"
                dataKey="outgoing"
                name="الصادرة"
                stackId="1"
                stroke="#F59E0B"
                fill="#FDE68A"
              />
              <Area
                type="monotone"
                dataKey="internal"
                name="الداخلية"
                stackId="1"
                stroke="#8B5CF6"
                fill="#C4B5FD"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ===== 2. حالة القراءة + أنواع المراسلات (جنباً إلى جنب) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* حالة القراءة - Pie Chart */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3">
              📊 حالة القراءة
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={readingData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  labelLine={false}
                  label={({ name, percent = 0 }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {readingData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}`, "العدد"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">
                {dashboard.overallReadingStatus.readPercentage.toFixed(1)}%
              </h3>
              <p className="text-xs text-slate-500">نسبة القراءة</p>
            </div>
          </div>

          {/* أنواع المراسلات - Bar Chart */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3">
              📋 أنواع المراسلات
            </h2>
            {dashboard.documentTypeDistribution.documentTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={dashboard.documentTypeDistribution.documentTypes}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  barSize={32}
                  maxBarSize={40}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E0E7FF"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="documentTypeName"
                    stroke="#94A3B8"
                    tick={{ fontSize: 9 }}
                    interval={0}
                  />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 9 }} />
                  <Tooltip
                    formatter={(value) => [`${value} مراسلة`, "العدد"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[5, 5, 0, 0]}
                    fill="#60A5FA"
                    label={{
                      position: "top",
                      fontSize: 9,
                      fill: "#475569",
                      formatter: (value: any) => {
                        if (typeof value === "number") {
                          return value;
                        }
                        return 0;
                      },
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
                لا توجد أنواع مراسلات
              </div>
            )}
          </div>
        </div>

        {/* ===== 3. أكثر المستلمين تجاهلاً + آخر الأنشطة (جنباً إلى جنب) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Ignored */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3">
              ⚠️ أكثر المستلمين تجاهلاً
            </h2>
            <div className="space-y-3">
              {dashboard.topIgnoredReceivers.length > 0 ? (
                dashboard.topIgnoredReceivers.map((receiver, index) => (
                  <div key={receiver.userId}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        {index + 1}. {receiver.userName}
                      </span>
                      <span className="font-bold text-slate-800">
                        {receiver.ignoredPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-blue-100 mt-0.5">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${receiver.ignoredPercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
                  لا توجد بيانات
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className="text-blue-500 text-sm"
              />
              <h2 className="text-sm font-bold text-slate-700">
                🕐 آخر الأنشطة
              </h2>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {dashboard.recentActivities.length > 0 ? (
                dashboard.recentActivities
                  .slice(0, 6)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition"
                    >
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {activity.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.action} — {activity.entityName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(activity.createdAt).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
                  لا توجد أنشطة حديثة
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
