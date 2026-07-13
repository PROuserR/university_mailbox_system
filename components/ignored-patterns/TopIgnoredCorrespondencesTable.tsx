// components/ignored-patterns/TopIgnoredCorrespondencesTable.tsx

"use client";

import { TopIgnoredCorrespondenceDto } from "@/types/api/ignoredPatterns.types";

interface TopIgnoredCorrespondencesTableProps {
    data: TopIgnoredCorrespondenceDto[];
}

export function TopIgnoredCorrespondencesTable({ data }: TopIgnoredCorrespondencesTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">#</th>
                        <th className="pb-2 font-medium text-gray-500">المراسلة</th>
                        <th className="pb-2 font-medium text-gray-500">متجاهل</th>
                        <th className="pb-2 font-medium text-gray-500">إجمالي مستلم</th>
                        <th className="pb-2 font-medium text-gray-500">النسبة</th>
                        <th className="pb-2 font-medium text-gray-500">التاريخ</th>
                        <th className="pb-2 font-medium text-gray-500">أيام</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.correspondenceId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2 text-center text-gray-400">{index + 1}</td>
                            <td className="py-2">
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-400">#{item.number}</p>
                                </div>
                            </td>
                            <td className="py-2 font-semibold text-red-600">{item.ignoredCount}</td>
                            <td className="py-2 text-gray-600">{item.totalReceivers}</td>
                            <td className="py-2 text-gray-600">{item.ignoredPercentage.toFixed(1)}%</td>
                            <td className="py-2 text-gray-500 text-xs">{formatDate(item.distributedDate)}</td>
                            <td className="py-2 font-medium text-red-500">{item.daysPending} يوم</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}