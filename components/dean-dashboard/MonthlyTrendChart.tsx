/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dean-dashboard/MonthlyTrendChart.tsx

"use client";

import { useState } from "react";
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
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faChartLine, faChartArea } from "@fortawesome/free-solid-svg-icons";
import { MonthlyDataDto } from "@/types/api/deanDashboard.types";

interface MonthlyTrendChartProps {
    data: MonthlyDataDto[];
}

type ChartType = "bar" | "line" | "area";

const MONTHS_AR: Record<string, string> = {
    January: "يناير",
    February: "فبراير",
    March: "مارس",
    April: "أبريل",
    May: "مايو",
    June: "يونيو",
    July: "يوليو",
    August: "أغسطس",
    September: "سبتمبر",
    October: "أكتوبر",
    November: "نوفمبر",
    December: "ديسمبر",
};

const COLORS = {
    incoming: "#6366f1",
    outgoing: "#10b981",
    internal: "#8b5cf6",
};

const chartTypes = [
    { value: "bar", label: "أعمدة", icon: faChartBar },
    { value: "line", label: "خطي", icon: faChartLine },
    { value: "area", label: "مساحي", icon: faChartArea },
];

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
    const [chartType, setChartType] = useState<ChartType>("bar");

    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const chartData = data.map((item) => ({
        ...item,
        name: MONTHS_AR[item.month] || item.month,
    }));

    const renderChart = () => {
        switch (chartType) {
            case "line":
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`];
                            }}
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "8px 12px",
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    incoming: "وارد",
                                    outgoing: "صادر",
                                    internal: "داخلي",
                                };
                                return <span className="text-sm text-gray-600">{labels[value] || value}</span>;
                            }}
                            iconType="circle"
                        />
                        <Line type="monotone" dataKey="incoming" stroke={COLORS.incoming} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="outgoing" stroke={COLORS.outgoing} strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="internal" stroke={COLORS.internal} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                );
            case "area":
                return (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`];
                            }}
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "8px 12px",
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    incoming: "وارد",
                                    outgoing: "صادر",
                                    internal: "داخلي",
                                };
                                return <span className="text-sm text-gray-600">{labels[value] || value}</span>;
                            }}
                            iconType="circle"
                        />
                        <Area type="monotone" dataKey="incoming" fill={COLORS.incoming} fillOpacity={0.2} stroke={COLORS.incoming} strokeWidth={2} />
                        <Area type="monotone" dataKey="outgoing" fill={COLORS.outgoing} fillOpacity={0.2} stroke={COLORS.outgoing} strokeWidth={2} />
                        <Area type="monotone" dataKey="internal" fill={COLORS.internal} fillOpacity={0.2} stroke={COLORS.internal} strokeWidth={2} />
                    </AreaChart>
                );
            default:
                return (
                    <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`];
                            }}
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "8px 12px",
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    incoming: "وارد",
                                    outgoing: "صادر",
                                    internal: "داخلي",
                                };
                                return <span className="text-sm text-gray-600">{labels[value] || value}</span>;
                            }}
                            iconType="circle"
                        />
                        <Bar dataKey="incoming" fill={COLORS.incoming} radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="outgoing" fill={COLORS.outgoing} radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="internal" fill={COLORS.internal} radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                );
        }
    };

    return (
        <div>
            <div className="flex items-center gap-1 mb-3">
                {chartTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setChartType(type.value as ChartType)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            chartType === type.value
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        <FontAwesomeIcon icon={type.icon} className="text-[10px]" />
                        {type.label}
                    </button>
                ))}
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
}