// components/distribution-patterns/DistributionByMonthChart.tsx

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DistributionByMonthDto {
    month: string;
    count: number;
    percentage: number;
}

interface DistributionByMonthChartProps {
    data: DistributionByMonthDto[];
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

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6"];

export function DistributionByMonthChart({ data }: DistributionByMonthChartProps) {
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
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
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