// components/ignored-patterns/IgnoredSummaryCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBan,
    faEnvelope,
    faUsers,
    faFile,
    faChartLine,
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import { IgnoredSummaryDto } from "@/types/api/ignoredPatterns.types";

interface IgnoredSummaryCardsProps {
    data: IgnoredSummaryDto;
}

export function IgnoredSummaryCards({ data }: IgnoredSummaryCardsProps) {
    const cards = [
        {
            title: "إجمالي المتجاهل",
            value: data.totalIgnored,
            icon: faBan,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
        },
        {
            title: "إجمالي التوزيعات",
            value: data.totalDistributions,
            icon: faEnvelope,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
        },
        {
            title: "مستخدمين متجاهلين",
            value: data.uniqueUsersIgnored,
            icon: faUsers,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
        },
        {
            title: "مراسلات متجاهلة",
            value: data.uniqueCorrespondencesIgnored,
            icon: faFile,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
        },
        {
            title: "نسبة التجاهل الإجمالية",
            value: `${data.overallIgnoredPercentage.toFixed(1)}%`,
            icon: faChartLine,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
        },
        {
            title: "حد الأيام للتجاهل",
            value: `${data.daysThreshold} يوم`,
            icon: faClock,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.bg} ${card.border} border rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
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
    );
}