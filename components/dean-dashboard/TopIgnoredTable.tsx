// components/dean-dashboard/TopIgnoredTable.tsx

"use client";

import { TopIgnoredReceiverDto } from "@/types/api/deanDashboard.types";

interface TopIgnoredTableProps {
    data: TopIgnoredReceiverDto[];
}

export function TopIgnoredTable({ data }: TopIgnoredTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">#</th>
                        <th className="pb-2 font-medium text-gray-500">المستخدم</th>
                        <th className="pb-2 font-medium text-gray-500">متجاهل</th>
                        <th className="pb-2 font-medium text-gray-500">إجمالي مستلم</th>
                        <th className="pb-2 font-medium text-gray-500">النسبة</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.userId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2 text-center text-gray-400">{index + 1}</td>
                            <td className="py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                        {item.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.userName}</p>
                                        <p className="text-xs text-gray-400">{item.userEmail}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 font-semibold text-red-600">{item.ignoredCount}</td>
                            <td className="py-2 text-gray-600">{item.totalReceived}</td>
                            <td className="py-2 text-gray-600">{item.ignoredPercentage.toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}