// components/reading-behavior/ReadersTable.tsx

"use client";

import { TopReaderDto } from "@/types/api/readingBehavior.types";

interface ReadersTableProps {
    data: TopReaderDto[];
    title: string;
    type: "top" | "worst";
}

export function ReadersTable({ data, title, type }: ReadersTableProps) {
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

    const getBadgeColor = (index: number) => {
        if (type === "top") {
            if (index === 0) return "bg-yellow-100 text-yellow-700 border-yellow-300";
            if (index === 1) return "bg-gray-100 text-gray-600 border-gray-300";
            if (index === 2) return "bg-amber-100 text-amber-700 border-amber-300";
        }
        return "bg-red-50 text-red-600 border-red-200";
    };

    const getMedal = (index: number) => {
        if (type === "top") {
            if (index === 0) return "🥇";
            if (index === 1) return "🥈";
            if (index === 2) return "🥉";
        }
        return `#${index + 1}`;
    };

    return (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">#</th>
                        <th className="pb-2 font-medium text-gray-500">المستخدم</th>
                        <th className="pb-2 font-medium text-gray-500">مستلم</th>
                        <th className="pb-2 font-medium text-gray-500">مقروء</th>
                        <th className="pb-2 font-medium text-gray-500">النسبة</th>
                        <th className="pb-2 font-medium text-gray-500">متوسط الوقت</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.userId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(index)}`}>
                                    {getMedal(index)}
                                </span>
                            </td>
                            <td className="py-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                        type === "top" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                    }`}>
                                        {item.fullName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{item.fullName}</p>
                                        <p className="text-xs text-gray-400 truncate">{item.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 text-gray-600">{item.receivedCount}</td>
                            <td className="py-2 text-gray-600">{item.readCount}</td>
                            <td className={`py-2 font-semibold ${getPerformanceColor(item.readPercentage)}`}>
                                {item.readPercentage.toFixed(1)}%
                            </td>
                            <td className="py-2 text-gray-600">
                                {item.averageReadTimeHours > 0 ? `${item.averageReadTimeHours.toFixed(1)} ساعة` : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}