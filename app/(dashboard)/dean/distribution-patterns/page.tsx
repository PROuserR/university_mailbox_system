/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/dean/distribution-patterns/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faChartBar,
    faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";

// Import components
import { PatternsSummaryCards } from "@/components/distribution-patterns/PatternsSummaryCards";
import { DistributionByTypeChart } from "@/components/distribution-patterns/DistributionByTypeChart";
import { DistributionByDayChart } from "@/components/distribution-patterns/DistributionByDayChart";
import { DistributionByHourChart } from "@/components/distribution-patterns/DistributionByHourChart";
import { DistributionByMonthChart } from "@/components/distribution-patterns/DistributionByMonthChart";
import { TopDistributorsTable } from "@/components/distribution-patterns/TopDistributorsTable";
import { TopSenderEntitiesTable } from "@/components/distribution-patterns/TopSenderEntitiesTable";
import { TopDocumentTypesTable } from "@/components/distribution-patterns/TopDocumentTypesTable";

// ==============================
// TYPES
// ==============================

interface DistributionPatternsDto {
    distributionByType: DistributionByTypeDto[];
    distributionByDay: DistributionByDayDto[];
    distributionByHour: DistributionByHourDto[];
    distributionByMonth: DistributionByMonthDto[];
    topDistributors: TopDistributorDto[];
    topSenderEntities: TopSenderEntityDto[];
    topDocumentTypes: TopDocumentTypeDto[];
    summary: DistributionSummaryDto;
    averageDailyDistributions: number;
    averageWeeklyDistributions: number;
    averageMonthlyDistributions: number;
    peakDistributionDay: string;
    peakDistributionHour: string;
    mostActiveMonth: string;
}

interface DistributionByTypeDto {
    type: string;
    count: number;
    percentage: number;
}

interface DistributionByDayDto {
    day: string;
    count: number;
    percentage: number;
}

interface DistributionByHourDto {
    hour: string;
    count: number;
    percentage: number;
}

interface DistributionByMonthDto {
    month: string;
    count: number;
    percentage: number;
}

interface TopDistributorDto {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    distributionsCount: number;
    percentageOfTotal: number;
    totalReceivers: number;
    averageReceiversPerDistribution: number;
}

interface TopSenderEntityDto {
    senderEntityId: number;
    name: string;
    count: number;
    percentage: number;
}

interface TopDocumentTypeDto {
    documentTypeId: number;
    name: string;
    count: number;
    percentage: number;
}

interface DistributionSummaryDto {
    totalDistributions: number;
    totalCorrespondencesDistributed: number;
    totalReceivers: number;
    averageReceiversPerDistribution: number;
    firstDistributionDate: string | null;
    lastDistributionDate: string | null;
    daysActive: number;
}

// ==============================
// MAIN COMPONENT
// ==============================

export default function DistributionPatternsPage() {
    useAuthGuard();
    const router = useRouter();
    const { role } = useUserInfoStore();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DistributionPatternsDto | null>(null);

    const isDean = role === "Dean";

    // ==============================
    // FETCH DATA
    // ==============================

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiWrapper.get<{
                data: DistributionPatternsDto;
            }>("/v2/Charts/dean/distribution-patterns");

            if (response.success && response.data) {
                setData(response.data.data);
            } else {
                toast.error(response.error || "فشل تحميل البيانات");
            }
        } catch {
            toast.error("حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isDean) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isDean]);

    // ==============================
    // RENDER
    // ==============================

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

    if (loading) {
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
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    <FontAwesomeIcon icon={faRefresh} className="ml-2" />
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={faChartBar} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">أنماط التوزيع</h1>
                            <p className="text-xs text-slate-500">تحليل شامل لأنماط التوزيع والإحصائيات</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faRefresh} className={loading ? "animate-spin" : ""} />
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
            />

            {/* ===== CHARTS GRID ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* By Type */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">حسب النوع</h3>
                    <DistributionByTypeChart data={data.distributionByType} />
                </div>

                {/* By Day */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">حسب اليوم</h3>
                    <DistributionByDayChart data={data.distributionByDay} />
                </div>

                {/* By Hour */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">حسب الساعة</h3>
                    <DistributionByHourChart data={data.distributionByHour} />
                </div>

                {/* By Month */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">حسب الشهر</h3>
                    <DistributionByMonthChart data={data.distributionByMonth} />
                </div>
            </div>

            {/* ===== TABLES ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Distributors */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        🏆 أفضل الموزعين
                    </h3>
                    <TopDistributorsTable data={data.topDistributors} />
                </div>

                {/* Top Sender Entities */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        🏛️ أفضل الجهات المرسلة
                    </h3>
                    <TopSenderEntitiesTable data={data.topSenderEntities} />
                </div>

                {/* Top Document Types */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        📄 أفضل أنواع الوثائق
                    </h3>
                    <TopDocumentTypesTable data={data.topDocumentTypes} />
                </div>
            </div>
        </div>
    );
}