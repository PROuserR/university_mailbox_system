/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ignored-patterns/IgnoredByDayChart.tsx

"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { IgnoredByDayDto } from "@/types/api/ignoredPatterns.types";

interface IgnoredByDayChartProps {
    data: IgnoredByDayDto[];
}

const DAYS_AR: Record<string, string> = {
    Sunday: "الأحد",
    Monday: "الإثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
};

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b"];

export function IgnoredByDayChart({ data }: IgnoredByDayChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const chartData = data.map((item) => ({
        ...item,
        name: DAYS_AR[item.day] || item.day,
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        formatter={(value: any) => {
                            const numValue = Number(value) || 0;
                            return [`${numValue} متجاهل`];
                        }}
                        contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            padding: "8px 12px",
                        }}
                    />
                    <Bar dataKey="ignoredCount" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}