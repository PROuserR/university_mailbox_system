/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ignored-patterns/IgnoredTrendChart.tsx

"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { IgnoredMonthlyTrendDto } from "@/types/api/ignoredPatterns.types";

interface IgnoredTrendChartProps {
    data: IgnoredMonthlyTrendDto[];
}

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

export function IgnoredTrendChart({ data }: IgnoredTrendChartProps) {
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

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        formatter={(value: any, name: any) => {
                            const numValue = Number(value) || 0;
                            const labels: Record<string, string> = {
                                ignoredCount: "متجاهل",
                                totalDistributions: "إجمالي التوزيعات",
                            };
                            return [`${numValue}`, labels[name] || name];
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
                                ignoredCount: "متجاهل",
                                totalDistributions: "إجمالي التوزيعات",
                            };
                            return <span className="text-sm text-gray-600">{labels[value] || value}</span>;
                        }}
                        iconType="circle"
                    />
                    <Line
                        type="monotone"
                        dataKey="ignoredCount"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#ef4444" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="totalDistributions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#3b82f6" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}