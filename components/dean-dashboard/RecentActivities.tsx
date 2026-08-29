// components/dean-dashboard/RecentActivities.tsx

"use client";

import { RecentActivityDto } from "@/types/api/analytics.types";

interface RecentActivitiesProps {
  data: RecentActivityDto[];
}

const ACTION_LABELS: Record<string, string> = {
  Distributed: "توزيع",
  Read: "قراءة",
  Approved: "موافقة",
  Rejected: "رفض",
  Created: "إنشاء",
  Updated: "تحديث",
  Deleted: "حذف",
};

export function RecentActivities({ data }: RecentActivitiesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-400">
        لا توجد أنشطة
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-h-[280px] overflow-y-auto">
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs shrink-0">
                {item.userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-gray-800">{item.userName}</span>
                  <span className="mx-1 font-medium text-gray-500">
                    {ACTION_LABELS[item.action] || item.action}
                  </span>
                  <span className="text-gray-600 truncate">{item.entityName}</span>
                </p>
                <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}