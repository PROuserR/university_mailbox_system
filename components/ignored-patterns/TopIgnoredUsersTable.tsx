// components/ignored-patterns/TopIgnoredUsersTable.tsx

"use client";

import { TopIgnoredUserDto } from "@/types/api/analytics.types";

interface TopIgnoredUsersTableProps {
  data: TopIgnoredUserDto[];
}

export function TopIgnoredUsersTable({ data }: TopIgnoredUsersTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-400">
        لا توجد بيانات
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-gray-200 text-right">
            <th className="pb-2 font-medium text-gray-500">#</th>
            <th className="pb-2 font-medium text-gray-500">المستخدم</th>
            <th className="pb-2 font-medium text-gray-500">الدور</th>
            <th className="pb-2 font-medium text-gray-500">مستلم</th>
            <th className="pb-2 font-medium text-gray-500">متجاهل</th>
            <th className="pb-2 font-medium text-gray-500">النسبة</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.userId} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="py-2 text-center text-gray-400">{index + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{item.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 text-gray-600 text-xs">{item.role}</td>
              <td className="py-2 text-gray-600">{item.totalReceived}</td>
              <td className="py-2 font-semibold text-red-600">{item.ignoredCount}</td>
              <td className="py-2 text-gray-600">{item.ignoredPercentage.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}