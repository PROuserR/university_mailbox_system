// components/distribution-patterns/TopDistributorsTable.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faUsers, faTrophy } from "@fortawesome/free-solid-svg-icons";

interface TopDistributorDto {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    distributionsCount: number;
    percentageOfTotal: number;
    totalReceivers: number;
    averageReceiversPerDistribution: number;
}

interface TopDistributorsTableProps {
    data: TopDistributorDto[];
}

export function TopDistributorsTable({ data }: TopDistributorsTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const getMedal = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `#${index + 1}`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">#</th>
                        <th className="pb-2 font-medium text-gray-500">الموزع</th>
                        <th className="pb-2 font-medium text-gray-500">عدد التوزيعات</th>
                        <th className="pb-2 font-medium text-gray-500">نسبة من الكل</th>
                        <th className="pb-2 font-medium text-gray-500">المستلمين</th>
                        <th className="pb-2 font-medium text-gray-500">متوسط/توزيع</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.userId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2 text-center">{getMedal(index)}</td>
                            <td className="py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {item.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.fullName}</p>
                                        <p className="text-xs text-gray-400">{item.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 font-semibold text-blue-600">{item.distributionsCount}</td>
                            <td className="py-2 text-gray-600">{item.percentageOfTotal.toFixed(1)}%</td>
                            <td className="py-2 text-gray-600">{item.totalReceivers}</td>
                            <td className="py-2 text-gray-600">{item.averageReceiversPerDistribution.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}