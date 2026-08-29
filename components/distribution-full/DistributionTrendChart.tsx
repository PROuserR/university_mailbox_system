// components/distribution-full/DistributionTrendChart.tsx

"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faChartArea,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

interface DistributionTrendItemDto {
  date: string;
  total: number;
  pending: number;
  read: number;
  ignored: number;
  rejected: number;
  pendingApproval: number;
  revoked: number;
  readRate: number;
  ignoreRate: number;
}

interface DistributionTrendChartProps {
  data: DistributionTrendItemDto[];
}

type ChartType = "area" | "line" | "bar";

const chartTypes = [
  { value: "area", label: "مساحي", icon: faChartArea },
  { value: "line", label: "خطي", icon: faChartLine },
  { value: "bar", label: "أعمدة", icon: faChartBar },
];

export function DistributionTrendChart({ data }: DistributionTrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        لا توجد بيانات
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "8px 12px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="read" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ignored" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "8px 12px",
              }}
            />
            <Legend />
            <Bar dataKey="read" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ignored" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "8px 12px",
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="read" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Area type="monotone" dataKey="ignored" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
          </AreaChart>
        );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 mb-3">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setChartType(type.value as ChartType)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              chartType === type.value
                ? "bg-indigo-100 text-indigo-700"
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