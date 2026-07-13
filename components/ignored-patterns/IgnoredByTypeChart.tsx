/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ignored-patterns/IgnoredByTypeChart.tsx

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
    Cell,
    PieChart,
    Pie,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChartBar, 
    faChartPie, 
    faCircle,
    faBarsStaggered,
} from "@fortawesome/free-solid-svg-icons";
import { IgnoredByTypeDto } from "@/types/api/ignoredPatterns.types";

interface IgnoredByTypeChartProps {
    data: IgnoredByTypeDto[];
}

type ChartType = "bar" | "barHorizontal" | "pie" | "donut";

const COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

const TYPE_LABELS: Record<string, string> = {
    Incoming: "وارد",
    Outgoing: "صادر",
    Internal: "داخلي",
};

const chartTypes = [
    { value: "bar", label: "أعمدة رأسية", icon: faChartBar },
    { value: "barHorizontal", label: "أعمدة أفقية", icon: faBarsStaggered },
    { value: "pie", label: "دائري", icon: faChartPie },
    { value: "donut", label: "دونات", icon: faCircle },
];

export function IgnoredByTypeChart({ data }: IgnoredByTypeChartProps) {
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
        name: TYPE_LABELS[item.type] || item.type,
    }));

    const renderChart = () => {
        switch (chartType) {
            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={0}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="ignored"
                            nameKey="name"
                            label={({ name, percent }: any) => {
                                const percentage = (percent || 0) * 100;
                                return `${name} ${percentage.toFixed(0)}%`;
                            }}
                            labelLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                            ))}
                        </Pie>
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
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                        />
                    </PieChart>
                );

            case "donut":
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="ignored"
                            nameKey="name"
                            label={({ name, percent }: any) => {
                                const percentage = (percent || 0) * 100;
                                return `${name} ${percentage.toFixed(0)}%`;
                            }}
                            labelLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                            ))}
                        </Pie>
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
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                        />
                    </PieChart>
                );

            case "barHorizontal":
                return (
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={60} />
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
                        <Bar dataKey="ignored" radius={[0, 4, 4, 0]}>
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );

            default: // bar (عمودي)
                return (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        <Bar dataKey="ignored" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
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