/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dean-dashboard/DistributionPieChart.tsx

// ✅ حذف RadialBarChart بالكامل من الخيارات

"use client";

import { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChartPie, 
    faChartBar, 
    faCircle,
    faBarsStaggered,
} from "@fortawesome/free-solid-svg-icons";
import { DistributionPointDto } from "@/types/api/deanDashboard.types";

interface DistributionPieChartProps {
    data: DistributionPointDto[];
}

type ChartType = "pie" | "donut" | "bar" | "barHorizontal";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

const chartTypes = [
    { value: "pie", label: "دائري", icon: faChartPie },
    { value: "donut", label: "دونات", icon: faCircle },
    { value: "bar", label: "أعمدة رأسية", icon: faChartBar },
    { value: "barHorizontal", label: "أعمدة أفقية", icon: faBarsStaggered },
];

export function DistributionPieChart({ data }: DistributionPieChartProps) {
    const [chartType, setChartType] = useState<ChartType>("pie");

    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case "donut":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="count"
                            nameKey="category"
                            label={({ name, percent }: any) => {
                                const percentage = (percent || 0) * 100;
                                return `${name} ${percentage.toFixed(0)}%`;
                            }}
                            labelLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`, name];
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

            case "bar":
                return (
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`, name];
                            }}
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "8px 12px",
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );

            case "barHorizontal":
                return (
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={60} />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`, name];
                            }}
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "8px 12px",
                            }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );

            default: // pie
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={0}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="count"
                            nameKey="category"
                            label={({ name, percent }: any) => {
                                const percentage = (percent || 0) * 100;
                                return `${name} ${percentage.toFixed(0)}%`;
                            }}
                            labelLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} مراسلة`, name];
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
                                ? "bg-purple-100 text-purple-700"
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