// components/reading-behavior/ReadingBehaviorSummary.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCalendarDay,
    faArrowUp,
    faArrowDown,
    faMinus,
    faEye,
} from "@fortawesome/free-solid-svg-icons";

interface ReadingBehaviorSummaryProps {
    averageReadTimeHours: number;
    bestDayForReading: string;
    overallReadPercentage: number;
    trendDirection: string;
    peakReadingHours: string[];
}

const DAYS_AR: Record<string, string> = {
    Sunday: "الأحد",
    Monday: "الإثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
};

export function ReadingBehaviorSummary({
    averageReadTimeHours,
    bestDayForReading,
    overallReadPercentage,
    trendDirection,
    peakReadingHours,
}: ReadingBehaviorSummaryProps) {
    const getTrendIcon = () => {
        if (trendDirection === "Up") return <FontAwesomeIcon icon={faArrowUp} className="text-emerald-500" />;
        if (trendDirection === "Down") return <FontAwesomeIcon icon={faArrowDown} className="text-red-500" />;
        return <FontAwesomeIcon icon={faMinus} className="text-yellow-500" />;
    };

    const getTrendLabel = () => {
        if (trendDirection === "Up") return "تحسن";
        if (trendDirection === "Down") return "تراجع";
        return "مستقر";
    };

    const cards = [
        {
            title: "متوسط وقت القراءة",
            value: `${averageReadTimeHours.toFixed(1)} ساعة`,
            icon: faClock,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "أفضل يوم للقراءة",
            value: DAYS_AR[bestDayForReading] || bestDayForReading,
            icon: faCalendarDay,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "نسبة القراءة الإجمالية",
            value: `${overallReadPercentage.toFixed(1)}%`,
            icon: faEye,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            title: "اتجاه القراءة",
            value: getTrendLabel(),
            icon: faArrowUp,
            color: trendDirection === "Up" ? "text-emerald-600" : trendDirection === "Down" ? "text-red-600" : "text-yellow-600",
            bg: trendDirection === "Up" ? "bg-emerald-50" : trendDirection === "Down" ? "bg-red-50" : "bg-yellow-50",
            iconComponent: getTrendIcon,
        },
    ];

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`${card.bg} border rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-gray-500">{card.title}</span>
                            <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                                <FontAwesomeIcon icon={card.icon} className={`${card.color} text-xs`} />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Peak Reading Hours */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                        <FontAwesomeIcon icon={faClock} />
                    </span>
                    ساعات الذروة للقراءة
                </h3>
                <div className="flex flex-wrap gap-2">
                    {peakReadingHours.map((hour) => (
                        <span
                            key={hour}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"
                        >
                            {hour}
                        </span>
                    ))}
                    {peakReadingHours.length === 0 && (
                        <span className="text-sm text-gray-400">لا توجد بيانات</span>
                    )}
                </div>
            </div>
        </>
    );
}