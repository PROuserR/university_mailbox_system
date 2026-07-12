/* eslint-disable @typescript-eslint/no-explicit-any */
// components/distribution-patterns/DistributionByTypeChart.tsx

"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface DistributionByTypeDto {
  type: string;
  count: number;
  percentage: number;
}

interface DistributionByTypeChartProps {
  data: DistributionByTypeDto[];
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];

const TYPE_LABELS: Record<string, string> = {
  Incoming: "وارد",
  Outgoing: "صادر",
  Internal: "داخلي",
};

export function DistributionByTypeChart({
  data,
}: DistributionByTypeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        لا توجد بيانات
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: TYPE_LABELS[item.type] || item.type,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
       <Pie
    data={chartData}
    cx="50%"
    cy="50%"
    innerRadius={40}
    outerRadius={70}
    paddingAngle={2}
    dataKey="count"
    nameKey="name"
    label={({ name, percent }: any) => {
        const percentage = (percent || 0) * 100;
        return `${name} ${percentage.toFixed(1)}%`;
    }}
    labelLine={false}
>
    {chartData.map((_, index) => (
        <Cell key={index} fill={COLORS[index % COLORS.length]} />
    ))}
</Pie>

          <Tooltip
            formatter={(value: any, name: any) => {
              const numValue = Number(value) || 0;
              const label = String(name) || "";
              return [`${numValue} توزيع`, label];
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />

          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
