// components/dean-dashboard/WeeklyStats.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInbox,
    faPaperPlane,
    faFile,
    faCalendarWeek,
} from "@fortawesome/free-solid-svg-icons";
import { DeanSummaryCardsDto } from "@/types/api/deanDashboard.types";

interface WeeklyStatsProps {
    data: DeanSummaryCardsDto;
}

export function WeeklyStats({ data }: WeeklyStatsProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faCalendarWeek} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-700">إحصائيات هذا الأسبوع</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-blue-50 rounded-xl">
                    <FontAwesomeIcon icon={faInbox} className="text-blue-500 text-sm" />
                    <p className="text-xs text-gray-500 mt-1">وارد</p>
                    <p className="text-lg font-bold text-blue-600">{data.thisWeekIncoming}</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-xl">
                    <FontAwesomeIcon icon={faPaperPlane} className="text-emerald-500 text-sm" />
                    <p className="text-xs text-gray-500 mt-1">صادر</p>
                    <p className="text-lg font-bold text-emerald-600">{data.thisWeekOutgoing}</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-xl">
                    <FontAwesomeIcon icon={faFile} className="text-purple-500 text-sm" />
                    <p className="text-xs text-gray-500 mt-1">داخلي</p>
                    <p className="text-lg font-bold text-purple-600">{data.thisWeekInternal}</p>
                </div>
            </div>
        </div>
    );
}