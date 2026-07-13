// components/dean-dashboard/RecentActivities.tsx

"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RecentActivityDto } from "@/types/api/deanDashboard.types";

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

const ACTION_COLORS: Record<string, string> = {
    Distributed: "text-blue-500",
    Read: "text-emerald-500",
    Approved: "text-green-500",
    Rejected: "text-red-500",
    Created: "text-purple-500",
    Updated: "text-amber-500",
    Deleted: "text-rose-500",
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
        return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ar });
    };

    return (
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
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
                                <p className="text-sm truncate">
                                    <span className="font-medium text-gray-800">{item.userName}</span>
                                    <span className={`mx-1 font-medium ${ACTION_COLORS[item.action] || "text-gray-500"}`}>
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
            {data.length > 5 && (
                <div className="text-center text-xs text-gray-400 py-1 border-t border-gray-100 mt-1">
                    عرض {data.length} نشاط
                </div>
            )}
        </div>
    );
}