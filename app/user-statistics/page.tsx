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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiWrapper } from "@/utils/apiClient";



interface DashboardData {
    summary: {
        unreadCount: number;
        readCount: number;
        ignoredCount: number;
        totalReceived: number;
        readPercentage: number;
    };
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

interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}

export default function ReceiverDashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await apiWrapper.get<DashboardResponse>("/Reports/dashboard/receiver");

            if (response?.success) {
                if (response.data)
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
            <div className="flex h-[70vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="p-10 text-center text-red-500">
                فشل في تحميل البيانات
            </div>
        );
    }

    const summary = dashboard.summary;
    const performance = dashboard.readingPerformance;

    const pieData = [
        {
            name: "مقروءة",
            value: summary.readCount,
        },
        {
            name: "غير مقروءة",
            value: summary.unreadCount,
        },
        {
            name: "متجاهلة",
            value: summary.ignoredCount,
        },
    ];

    const COLORS = [
        "#60A5FA",
        "#FCD34D",
        "#F87171",
    ];

    return (
        <div
            dir="rtl"
            className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-6"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    لوحة إحصائيات المستخدم
                </h1>

                <p className="mt-2 text-slate-500">
                    ملخص المراسلات المستلمة وأداء القراءة
                </p>
            </div>

            {/* Summary Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="إجمالي المستلم"
                    value={summary.totalReceived}
                    icon={faInbox}
                    bg="from-blue-100 to-blue-50"
                />

                <StatCard
                    title="المقروءة"
                    value={summary.readCount}
                    icon={faEnvelopeOpen}
                    bg="from-green-100 to-green-50"
                />

                <StatCard
                    title="غير المقروءة"
                    value={summary.unreadCount}
                    icon={faEnvelope}
                    bg="from-yellow-100 to-yellow-50"
                />

                <StatCard
                    title="المتجاهلة"
                    value={summary.ignoredCount}
                    icon={faBan}
                    bg="from-red-100 to-red-50"
                />
            </div>

            {/* Charts */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
                {/* Area Chart */}
                <div className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-2">
                    <h2 className="mb-6 text-lg font-bold text-slate-700">
                        الإحصائيات الشهرية
                    </h2>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >
                        <AreaChart
                            data={dashboard.monthlyReadingStats.data}
                        >
                            <defs>
                                <linearGradient
                                    id="received"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#60A5FA"
                                        stopOpacity={0.7}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#60A5FA"
                                        stopOpacity={0}
                                    />
                                </linearGradient>

                                <linearGradient
                                    id="read"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#FCD34D"
                                        stopOpacity={0.7}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#FCD34D"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="month" />

                            <YAxis />

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="received"
                                stroke="#60A5FA"
                                fill="url(#received)"
                                name="المستلم"
                            />

                            <Area
                                type="monotone"
                                dataKey="read"
                                stroke="#FCD34D"
                                fill="url(#read)"
                                name="المقروء"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="rounded-3xl bg-white p-6 shadow-lg">
                    <h2 className="mb-6 text-lg font-bold text-slate-700">
                        توزيع المراسلات
                    </h2>

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                outerRadius={110}
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {summary.readPercentage}%
                        </div>

                        <div className="text-sm text-slate-500">
                            نسبة القراءة
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
                <PerformanceCard
                    title="متوسط القراءة"
                    value={`${performance.averageReadTimeHours} ساعة`}
                    icon={faClock}
                />

                <PerformanceCard
                    title="أفضل شهر"
                    value={performance.bestMonthName}
                    icon={faTrophy}
                />

                <PerformanceCard
                    title="إجمالي المقروء"
                    value={performance.totalRead}
                    icon={faBookOpen}
                />
            </div>

            {/* Recent Reads */}
            <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-slate-700">
                    آخر المراسلات المقروءة
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-blue-50">
                                <th className="p-4 text-right">
                                    الرقم
                                </th>
                                <th className="p-4 text-right">
                                    العنوان
                                </th>
                                <th className="p-4 text-right">
                                    تاريخ القراءة
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {dashboard.recentReads.map((item) => (
                                <tr
                                    key={item.correspondenceId}
                                    className="border-b hover:bg-yellow-50"
                                >
                                    <td className="p-4">
                                        {item.number}
                                    </td>

                                    <td className="p-4">
                                        {item.title}
                                    </td>

                                    <td className="p-4">
                                        {new Date(
                                            item.readAt
                                        ).toLocaleString(
                                            "ar-SA"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    bg,
}: any) {
    return (
        <div
            className={`bg-gradient-to-br ${bg} rounded-3xl p-6 shadow-md`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500">
                        {title}
                    </div>

                    <div className="mt-2 text-3xl font-bold text-slate-800">
                        {value}
                    </div>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow">
                    <FontAwesomeIcon
                        icon={icon}
                        className="text-xl text-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

function PerformanceCard({
    title,
    value,
    icon,
}: any) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                <FontAwesomeIcon
                    icon={icon}
                    className="text-xl text-blue-600"
                />
            </div>

            <div className="text-sm text-slate-500">
                {title}
            </div>

            <div className="mt-2 text-2xl font-bold text-slate-800">
                {value}
            </div>
        </div>
    );
}