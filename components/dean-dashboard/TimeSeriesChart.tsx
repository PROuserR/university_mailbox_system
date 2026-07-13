/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dean-dashboard/TimeSeriesChart.tsx

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
import { TimeSeriesPointDto } from "@/types/api/deanDashboard.types";

interface TimeSeriesChartProps {
    data: TimeSeriesPointDto[];
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                        dataKey="period"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                    />
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
                    <Line
                        type="monotone"
                        dataKey="incoming"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#6366f1" }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="outgoing"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#10b981" }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="internal"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#8b5cf6" }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}