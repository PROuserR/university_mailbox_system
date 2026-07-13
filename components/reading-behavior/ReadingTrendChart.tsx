/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reading-behavior/ReadingTrendChart.tsx

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
import { MonthlyReadingTrendDto } from "@/types/api/readingBehavior.types";

interface ReadingTrendChartProps {
    data: MonthlyReadingTrendDto[];
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

export function ReadingTrendChart({ data }: ReadingTrendChartProps) {
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
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        formatter={(value: any, name: any) => {
                            const numValue = Number(value) || 0;
                            const labels: Record<string, string> = {
                                received: "مستلم",
                                read: "مقروء",
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
                                received: "مستلم",
                                read: "مقروء",
                            };
                            return <span className="text-sm text-gray-600">{labels[value] || value}</span>;
                        }}
                        iconType="circle"
                    />
                    <Line
                        type="monotone"
                        dataKey="received"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#94a3b8" }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="read"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#6366f1" }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}