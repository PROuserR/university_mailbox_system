// components/distribution-patterns/DistributionByDayChart.tsx

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DistributionByDayDto {
    day: string;
    count: number;
    percentage: number;
}

interface DistributionByDayChartProps {
    data: DistributionByDayDto[];
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

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#60a5fa", "#3b82f6", "#1d4ed8"];

export function DistributionByDayChart({ data }: DistributionByDayChartProps) {
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                   
<Tooltip
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                        {chartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}