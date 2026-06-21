"use client";

import { useEffect, useState } from "react";
import { apiWrapper } from "@/utils/apiClient";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInbox,
    faPaperPlane,
    faBuilding,
    faEnvelope,
    faEye,
    faTriangleExclamation,
    faClockRotateLeft,
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
    Cell
} from "recharts";

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

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export default function DeanDashboardPage() {
    const [dashboard, setDashboard] =
        useState<DashboardResponse["data"] | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response =
                await apiWrapper.get<DashboardResponse>(
                    "/Reports/dashboard/dean"
                );

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
            <div
                dir="rtl"
                className="flex min-h-screen items-center justify-center bg-slate-50"
            >
                جاري تحميل لوحة الإحصائيات...
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div
                dir="rtl"
                className="flex min-h-screen items-center justify-center bg-slate-50"
            >
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
        {
            title: "الواردة",
            value: dashboard.summary.totalIncoming,
            icon: faInbox,
        },
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
        {
            name: "مقروء",
            value: dashboard.overallReadingStatus.readCount,
        },
        {
            name: "متجاهل",
            value: dashboard.overallReadingStatus.ignoredCount,
        },
        {
            name: "قيد الانتظار",
            value: dashboard.overallReadingStatus.pendingCount,
        },
    ];

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        لوحة إحصائيات المراسلات
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        نظرة شاملة على أداء المراسلات وحالة القراءة والأنشطة الحديثة
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div className="rounded-2xl bg-slate-100 p-3">
                                    <FontAwesomeIcon
                                        icon={card.icon}
                                        className="text-slate-700"
                                    />
                                </div>

                                <span className="text-sm text-slate-500">
                                    {card.title}
                                </span>
                            </div>

                            <h2 className="mt-6 text-right text-4xl font-bold text-slate-900">
                                {card.value}
                            </h2>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">
                            تطور المراسلات خلال العام
                        </h2>

                        <p className="text-sm text-slate-500">
                            مقارنة المراسلات الواردة والصادرة والداخلية
                        </p>
                    </div>

                    <ResponsiveContainer width="100%" height={420}>
                        <AreaChart data={dashboard.monthlyStatistics.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />

                            <Area
                                type="monotone"
                                dataKey="incoming"
                                name="الواردة"
                                stackId="1"
                            />

                            <Area
                                type="monotone"
                                dataKey="outgoing"
                                name="الصادرة"
                                stackId="1"
                            />

                            <Area
                                type="monotone"
                                dataKey="internal"
                                name="الداخلية"
                                stackId="1"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold">
                            حالة القراءة
                        </h2>

                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={readingData}
                                    dataKey="value"
                                    innerRadius={80}
                                    outerRadius={120}
                                >
                                    {readingData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={PIE_COLORS[index]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="text-center">
                            <h3 className="text-5xl font-bold text-slate-900">
                                {dashboard.overallReadingStatus.readPercentage.toFixed(1)}%
                            </h3>

                            <p className="mt-2 text-slate-500">
                                نسبة القراءة
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold">
                            أنواع المراسلات
                        </h2>

                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                layout="vertical"
                                data={dashboard.documentTypeDistribution.documentTypes}
                            >
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    width={140}
                                    dataKey="documentTypeName"
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="count"
                                    radius={[10, 10, 10, 10]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-bold">
                            أكثر المستلمين تجاهلاً
                        </h2>

                        <div className="space-y-5">
                            {dashboard.topIgnoredReceivers.map(
                                (receiver, index) => (
                                    <div key={receiver.userId}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-medium">
                                                {index + 1}. {receiver.userName}
                                            </span>

                                            <span className="font-bold">
                                                {receiver.ignoredPercentage.toFixed(0)}%
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-red-500"
                                                style={{
                                                    width: `${receiver.ignoredPercentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <FontAwesomeIcon icon={faClockRotateLeft} />
                            <h2 className="text-xl font-bold">
                                آخر الأنشطة
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {dashboard.recentActivities.slice(0, 8).map(
                                (activity, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4"
                                    >
                                        <div className="mt-2 h-3 w-3 rounded-full bg-blue-600" />

                                        <div>
                                            <p className="font-semibold">
                                                {activity.userName}
                                            </p>

                                            <p className="text-slate-600">
                                                {activity.action} — {activity.entityName}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                {new Date(
                                                    activity.createdAt
                                                ).toLocaleString("ar-SA")}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
