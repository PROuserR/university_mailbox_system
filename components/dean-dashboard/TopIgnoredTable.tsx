// components/dean-dashboard/TopIgnoredTable.tsx

"use client";

import { TopIgnoredUserAnalyticDto } from "@/types/api/analytics.types";

interface TopIgnoredTableProps {
  data: TopIgnoredUserAnalyticDto[];
}

export function TopIgnoredTable({ data }: TopIgnoredTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-400">
        لا توجد بيانات
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High": return "text-red-600 bg-red-50";
      case "Medium": return "text-yellow-600 bg-yellow-50";
      case "Low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-right">
            <th className="pb-2 font-medium text-gray-500">#</th>
            <th className="pb-2 font-medium text-gray-500">المستخدم</th>
            <th className="pb-2 font-medium text-gray-500">القسم</th>
            <th className="pb-2 font-medium text-gray-500">متجاهل</th>
            <th className="pb-2 font-medium text-gray-500">مستلم</th>
            <th className="pb-2 font-medium text-gray-500">المخاطرة</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.userId} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="py-2 text-center text-gray-400">{index + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    {item.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.fullName}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 text-gray-600 text-xs">{item.departmentName}</td>
              <td className="py-2 font-semibold text-red-600">{item.ignoredCount}</td>
              <td className="py-2 text-gray-600">{item.totalReceived}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getRiskColor(item.riskLevel)}`}>
                  {item.riskLevel === "High" ? "عالية" :
                   item.riskLevel === "Medium" ? "متوسطة" :
                   item.riskLevel === "Low" ? "منخفضة" : item.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}