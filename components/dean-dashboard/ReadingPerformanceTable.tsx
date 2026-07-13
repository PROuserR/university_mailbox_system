// components/dean-dashboard/ReadingPerformanceTable.tsx

"use client";

import { ReadingPerformanceStatDto } from "@/types/api/deanDashboard.types";

interface ReadingPerformanceTableProps {
    data: ReadingPerformanceStatDto[];
}

export function ReadingPerformanceTable({ data }: ReadingPerformanceTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 80) return "text-emerald-600";
        if (percentage >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">المستخدم</th>
                        <th className="pb-2 font-medium text-gray-500">مستلم</th>
                        <th className="pb-2 font-medium text-gray-500">مقروء</th>
                        <th className="pb-2 font-medium text-gray-500">النسبة</th>
                        <th className="pb-2 font-medium text-gray-500">متوسط الوقت</th>
                        <th className="pb-2 font-medium text-gray-500">معلق</th>
                        <th className="pb-2 font-medium text-gray-500">متجاهل</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.userId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {item.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.fullName}</p>
                                        <p className="text-xs text-gray-400">@{item.userName}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 text-gray-600">{item.totalReceived}</td>
                            <td className="py-2 text-gray-600">{item.totalRead}</td>
                            <td className={`py-2 font-semibold ${getPerformanceColor(item.readPercentage)}`}>
                                {item.readPercentage.toFixed(1)}%
                            </td>
                            <td className="py-2 text-gray-600">
                                {item.averageReadTimeHours > 0 ? `${item.averageReadTimeHours.toFixed(1)} ساعة` : "—"}
                            </td>
                            <td className="py-2 text-yellow-600">{item.pendingCount}</td>
                            <td className="py-2 text-red-600">{item.ignoredCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}