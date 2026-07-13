// app/(dashboard)/dean/dashboard/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faChartBar,
    faRefresh,
    faUsers,
    faClock,
    faBan,
    faEye,
    faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";
import {
    useDeanDashboard,
    useDistributionData,
    useTimeSeriesData,
    useReadingPerformance,
} from "@/hooks/useDeanDashboard";

// Import components
import { SummaryCards } from "@/components/dean-dashboard/SummaryCards";
import { WeeklyStats } from "@/components/dean-dashboard/WeeklyStats";
import { MonthlyTrendChart } from "@/components/dean-dashboard/MonthlyTrendChart";
import { TimeSeriesChart } from "@/components/dean-dashboard/TimeSeriesChart";
import { DistributionPieChart } from "@/components/dean-dashboard/DistributionPieChart";
import { TopIgnoredTable } from "@/components/dean-dashboard/TopIgnoredTable";
import { RecentActivities } from "@/components/dean-dashboard/RecentActivities";
import { ReadingPerformanceTable } from "@/components/dean-dashboard/ReadingPerformanceTable";

// ==============================
// DATE FILTER HELPERS
// ==============================

const getDefaultDateRange = () => {
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setMonth(now.getMonth() - 6);
    return {
        fromDate: fromDate.toISOString().split("T")[0],
        toDate: now.toISOString().split("T")[0],
    };
};

// ==============================
// MAIN COMPONENT
// ==============================

export default function DeanDashboardPage() {
    useAuthGuard();
    const router = useRouter();
    const { role } = useUserInfoStore();

    // ✅ Time Series Filters
    const [timeSeriesFilter, setTimeSeriesFilter] = useState({
        fromDate: "",
        toDate: "",
        groupBy: "day",
    });

    // ✅ Reading Performance Filters (منفصل)
    const [readingPerformanceFilter, setReadingPerformanceFilter] = useState({
        fromDate: "",
        toDate: "",
    });

    const [distributionBy, setDistributionBy] = useState<string>("mainType");

    const {
        data: dashboardData,
        isLoading: dashboardLoading,
        error: dashboardError,
        refetch: refetchDashboard,
    } = useDeanDashboard();

    const {
        data: distributionData,
        isLoading: distributionLoading,
        refetch: refetchDistribution,
    } = useDistributionData(distributionBy);

    const {
        data: timeSeriesData,
        isLoading: timeSeriesLoading,
        refetch: refetchTimeSeries,
    } = useTimeSeriesData(
        timeSeriesFilter.fromDate || undefined,
        timeSeriesFilter.toDate || undefined,
        timeSeriesFilter.groupBy
    );

    const {
        data: readingPerformance,
        isLoading: readingLoading,
        refetch: refetchReadingPerformance,
    } = useReadingPerformance(
        readingPerformanceFilter.fromDate || undefined,
        readingPerformanceFilter.toDate || undefined
    );

    const isDean = role === "Dean";

    const handleRefreshAll = useCallback(() => {
        refetchDashboard();
        refetchTimeSeries();
        refetchDistribution();
        refetchReadingPerformance();
        toast.success("تم تحديث جميع البيانات");
    }, [refetchDashboard, refetchTimeSeries, refetchDistribution, refetchReadingPerformance]);

    const handleTimeSeriesFilterChange = (
        field: "fromDate" | "toDate" | "groupBy",
        value: string
    ) => {
        setTimeSeriesFilter((prev) => ({ ...prev, [field]: value }));
    };

    const handleReadingPerformanceFilterChange = (
        field: "fromDate" | "toDate",
        value: string
    ) => {
        setReadingPerformanceFilter((prev) => ({ ...prev, [field]: value }));
    };

    const handleDistributionByChange = (value: string) => {
        setDistributionBy(value);
        setTimeout(() => refetchDistribution(), 100);
    };

    if (!isDean) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-slate-600">غير مصرح</h2>
                <p className="text-sm text-slate-400 mt-1">هذه الصفحة متاحة للعميد فقط</p>
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

    if (dashboardLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل لوحة التحكم...</span>
            </div>
        );
    }

    if (dashboardError || !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-slate-600">حدث خطأ</h2>
                <p className="text-sm text-slate-400 mt-1">فشل تحميل بيانات لوحة التحكم</p>
                <button
                    onClick={handleRefreshAll}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    <FontAwesomeIcon icon={faRefresh} className="ml-2" />
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50/80 p-4 md:p-6">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm">
                            <FontAwesomeIcon icon={faGaugeHigh} />
                        </span>
                        لوحة التحكم
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 mr-11">نظرة عامة على أداء التوزيعات والمراسلات</p>
                </div>

                <button
                    onClick={handleRefreshAll}
                    disabled={dashboardLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium shadow-sm disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faRefresh} className={dashboardLoading ? "animate-spin" : ""} />
                    تحديث الكل
                </button>
            </div>

            {/* ===== SUMMARY CARDS ===== */}
            <SummaryCards data={dashboardData.summary} />

            {/* ===== WEEKLY STATS ===== */}
            <div className="mb-6">
                <WeeklyStats data={dashboardData.summary} />
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
                    <MonthlyTrendChart data={dashboardData.monthlyTrend.data} />
                </div>

                {/* Distribution Pie */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                                <FontAwesomeIcon icon={faChartBar} />
                            </span>
                            توزيع المراسلات
                        </h3>
                        <div className="flex items-center gap-2">
                            <select
                                value={distributionBy}
                                onChange={(e) => handleDistributionByChange(e.target.value)}
                                className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-white"
                            >
                                <option value="mainType">حسب النوع</option>
                                <option value="documentType">حسب نوع الوثيقة</option>
                                <option value="senderEntity">حسب الجهة المرسلة</option>
                            </select>
                            <button
                                onClick={() => refetchDistribution()}
                                disabled={distributionLoading}
                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faRefresh} className={distributionLoading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>
                    <DistributionPieChart data={distributionData || []} />
                </div>
            </div>

            {/* ===== TIME SERIES ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faChartBar} />
                        </span>
                        الاتجاه الزمني
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={timeSeriesFilter.fromDate}
                            onChange={(e) => handleTimeSeriesFilterChange("fromDate", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 w-28"
                        />
                        <span className="text-xs text-gray-400">إلى</span>
                        <input
                            type="date"
                            value={timeSeriesFilter.toDate}
                            onChange={(e) => handleTimeSeriesFilterChange("toDate", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 w-28"
                        />
                        <select
                            value={timeSeriesFilter.groupBy}
                            onChange={(e) => handleTimeSeriesFilterChange("groupBy", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400"
                        >
                            <option value="day">يومي</option>
                            <option value="week">أسبوعي</option>
                            <option value="month">شهري</option>
                        </select>
                        <button
                            onClick={() => refetchTimeSeries()}
                            disabled={timeSeriesLoading}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faRefresh} className={timeSeriesLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
                <TimeSeriesChart data={timeSeriesData || []} />
            </div>

            {/* ===== TABLES ROW ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faBan} />
                        </span>
                        أكثر المستخدمين تجاهلاً
                        <span className="text-xs font-normal text-gray-400 mr-1">(أعلى 5)</span>
                    </h3>
                    <TopIgnoredTable data={dashboardData.topIgnored} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faClock} />
                        </span>
                        الأنشطة الأخيرة
                        <span className="text-xs font-normal text-gray-400 mr-1">(آخر 10)</span>
                    </h3>
                    <RecentActivities data={dashboardData.recentActivities} />
                </div>
            </div>

            {/* ===== READING PERFORMANCE (منفصل مع فلتر خاص) ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faUsers} />
                        </span>
                        أداء القراءة
                        {readingLoading && (
                            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-xs" />
                        )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={readingPerformanceFilter.fromDate}
                            onChange={(e) => handleReadingPerformanceFilterChange("fromDate", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 w-28"
                            placeholder="من"
                        />
                        <span className="text-xs text-gray-400">إلى</span>
                        <input
                            type="date"
                            value={readingPerformanceFilter.toDate}
                            onChange={(e) => handleReadingPerformanceFilterChange("toDate", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400 w-28"
                            placeholder="إلى"
                        />
                        <button
                            onClick={() => refetchReadingPerformance()}
                            disabled={readingLoading}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faRefresh} className={readingLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
                <ReadingPerformanceTable data={readingPerformance || dashboardData.readingPerformance || []} />
            </div>
        </div>
    );
}