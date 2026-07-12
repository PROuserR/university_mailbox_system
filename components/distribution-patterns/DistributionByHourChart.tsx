/* eslint-disable @typescript-eslint/no-explicit-any */
// components/distribution-patterns/DistributionByHourChart.tsx

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DistributionByHourDto {
    hour: string;
    count: number;
    percentage: number;
}

interface DistributionByHourChartProps {
    data: DistributionByHourDto[];
}

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b"];

export function DistributionByHourChart({ data }: DistributionByHourChartProps) {
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
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    
<Tooltip
    formatter={(value: any) => {
        const numValue = Number(value) || 0;
        return [`${numValue} توزيع`];
    }}
    contentStyle={{ 
        borderRadius: "12px", 
        border: "none", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
    }}
/>
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}