// app/(dashboard)/dean/ignored-patterns/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faChartBar,
    faRefresh,
    faBan,
    faClock,faUsers,faFile
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";
import { useIgnoredPatterns } from "@/hooks/useIgnoredPatterns";

// Import components
import { IgnoredSummaryCards } from "@/components/ignored-patterns/IgnoredSummaryCards";
import { TopIgnoredUsersTable } from "@/components/ignored-patterns/TopIgnoredUsersTable";
import { TopIgnoredCorrespondencesTable } from "@/components/ignored-patterns/TopIgnoredCorrespondencesTable";
import { IgnoredTrendChart } from "@/components/ignored-patterns/IgnoredTrendChart";
import { IgnoredByTypeChart } from "@/components/ignored-patterns/IgnoredByTypeChart";
import { IgnoredByDayChart } from "@/components/ignored-patterns/IgnoredByDayChart";

export default function IgnoredPatternsPage() {
    useAuthGuard();
    const router = useRouter();
    const { role } = useUserInfoStore();

    const { data, isLoading, error, refetch } = useIgnoredPatterns();
    const isDean = role === "Dean";

    const handleRefresh = useCallback(() => {
        refetch();
        toast.success("تم تحديث البيانات");
    }, [refetch]);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل البيانات...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-slate-600">حدث خطأ</h2>
                <p className="text-sm text-slate-400 mt-1">فشل تحميل بيانات أنماط التجاهل</p>
                <button
                    onClick={handleRefresh}
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
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-sm">
                            <FontAwesomeIcon icon={faBan} />
                        </span>
                        أنماط التجاهل
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 mr-11">تحليل شامل لأنماط التجاهل والإحصائيات</p>
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

            {/* ===== SUMMARY CARDS ===== */}
            <IgnoredSummaryCards data={data.summary} />

            {/* ===== CHARTS ROW ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faChartBar} />
                        </span>
                        الاتجاه الشهري
                        <span className="text-xs font-normal text-gray-400 mr-1">
                            ({data.trend.direction} · {data.trend.averageMonthlyIgnored.toFixed(1)} شهرياً)
                        </span>
                    </h3>
                    <IgnoredTrendChart data={data.trend.data} />
                </div>

                {/* By Day */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faClock} />
                        </span>
                        التجاهل حسب اليوم
                        <span className="text-xs font-normal text-gray-400 mr-1">
                            (الأكثر: {data.mostIgnoredDay})
                        </span>
                    </h3>
                    <IgnoredByDayChart data={data.ignoredByDay} />
                </div>
            </div>

            {/* ===== TABLES ROW ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faUsers} />
                        </span>
                        أكثر المستخدمين تجاهلاً
                    </h3>
                    <TopIgnoredUsersTable data={data.topIgnoredUsers} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                            <FontAwesomeIcon icon={faFile} />
                        </span>
                        أكثر المراسلات تجاهلاً
                    </h3>
                    <TopIgnoredCorrespondencesTable data={data.topIgnoredCorrespondences} />
                </div>
            </div>

            {/* ===== BY TYPE ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                        <FontAwesomeIcon icon={faChartBar} />
                    </span>
                    التجاهل حسب النوع
                </h3>
                <IgnoredByTypeChart data={data.ignoredByType} />
            </div>
        </div>
    );
}