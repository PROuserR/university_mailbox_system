/* eslint-disable react-hooks/immutability */
// app/(dashboard)/user-statistics/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import {
    faEnvelope,
    faEnvelopeOpen,
    faBan,
    faInbox,
    faClock,
    faTrophy,
    faBookOpen,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiWrapper, ApiResult } from "@/utils/apiClient";

// ==============================
// TYPES
// ==============================

interface DashboardData {
    summary: {
        unreadCount: number;
        readCount: number;
        ignoredCount: number;
        totalReceived: number;
        readPercentage: number;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingCorrespondences: any[];
    recentReads: {
        correspondenceId: number;
        number: string;
        title: string;
        readAt: string;
    }[];
    monthlyReadingStats: {
        year: number;
        data: {
            month: string;
            received: number;
            read: number;
            readPercentage: number;
        }[];
    };
    readingPerformance: {
        averageReadTimeHours: number;
        bestMonthReadCount: number;
        bestMonthName: string;
        totalRead: number;
    };
}

const COLORS = ["#60A5FA", "#FCD34D", "#F87171"];

export default function ReceiverDashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await apiWrapper.get<ApiResult<DashboardData>>(
                "/Reports/dashboard/receiver"
            );

            if (response.data?.isSuccess) {
                setDashboard(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل الإحصائيات...</span>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-red-500 text-sm">
                فشل في تحميل البيانات
            </div>
        );
    }

    const summary = dashboard.summary;
    const performance = dashboard.readingPerformance;

    const pieData = [
        { name: "مقروءة", value: summary.readCount },
        { name: "غير مقروءة", value: summary.unreadCount },
        { name: "متجاهلة", value: summary.ignoredCount },
    ];

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
            <div className="space-y-4">
                {/* ===== HEADER ===== */}
                <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800">لوحة إحصائيات المستخدم</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">ملخص المراسلات المستلمة وأداء القراءة</p>
                </div>

                {/* ===== STATS CARDS ===== */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <StatCard title="إجمالي المستلم" value={summary.totalReceived} icon={faInbox} bg="from-blue-50 to-blue-100" />
                    <StatCard title="المقروءة" value={summary.readCount} icon={faEnvelopeOpen} bg="from-green-50 to-green-100" />
                    <StatCard title="غير المقروءة" value={summary.unreadCount} icon={faEnvelope} bg="from-yellow-50 to-yellow-100" />
                    <StatCard title="المتجاهلة" value={summary.ignoredCount} icon={faBan} bg="from-red-50 to-red-100" />
                </div>

                {/* ===== CHARTS ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 mb-3">الإحصائيات الشهرية</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dashboard.monthlyReadingStats.data}>
                                <defs>
                                    <linearGradient id="received" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.7} />
                                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="read" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.7} />
                                        <stop offset="95%" stopColor="#FCD34D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                                <XAxis dataKey="month" stroke="#60A5FA" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#60A5FA" tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="received" stroke="#60A5FA" fill="url(#received)" name="المستلم" />
                                <Area type="monotone" dataKey="read" stroke="#FCD34D" fill="url(#read)" name="المقروء" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 mb-3">توزيع المراسلات</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{summary.readPercentage}%</div>
                            <div className="text-xs text-slate-500">نسبة القراءة</div>
                        </div>
                    </div>
                </div>

                {/* ===== PERFORMANCE ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <PerformanceCard title="متوسط القراءة" value={`${performance.averageReadTimeHours} ساعة`} icon={faClock} />
                    <PerformanceCard title="أفضل شهر" value={performance.bestMonthName} icon={faTrophy} />
                    <PerformanceCard title="إجمالي المقروء" value={performance.totalRead} icon={faBookOpen} />
                </div>

                {/* ===== RECENT READS ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 mb-3">آخر المراسلات المقروءة</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-blue-50 text-slate-700">
                                    <th className="p-2 text-right font-semibold">الرقم</th>
                                    <th className="p-2 text-right font-semibold">العنوان</th>
                                    <th className="p-2 text-right font-semibold hidden sm:table-cell">تاريخ القراءة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recentReads.map((item) => (
                                    <tr key={item.correspondenceId} className="border-b hover:bg-yellow-50/50 transition">
                                        <td className="p-2 text-slate-600 text-xs">{item.number}</td>
                                        <td className="p-2 text-slate-800 text-xs truncate max-w-[120px] sm:max-w-[200px]">{item.title}</td>
                                        <td className="p-2 text-slate-500 text-xs hidden sm:table-cell">
                                            {new Date(item.readAt).toLocaleString("ar-SA")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==============================
// COMPONENTS
// ==============================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, icon, bg }: any) {
    return (
        <div className={`bg-gradient-to-br ${bg} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[10px] text-slate-500">{title}</div>
                    <div className="mt-1 text-xl font-bold text-slate-800">{value}</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/80 shadow-sm flex items-center justify-center">
                    <FontAwesomeIcon icon={icon} className="text-sm text-blue-500" />
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PerformanceCard({ title, value, icon }: any) {
    return (
        <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={icon} className="text-sm text-yellow-600" />
                </div>
                <div>
                    <div className="text-[10px] text-slate-500">{title}</div>
                    <div className="text-base font-bold text-slate-800">{value}</div>
                </div>
            </div>
        </div>
    );
}