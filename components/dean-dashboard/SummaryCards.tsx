// components/dean-dashboard/SummaryCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faEye,
    faClock,
    faBan,
    faCheckCircle,
    faXmark,
    faUsers,
    faInbox,
    faPaperPlane,
    faFile,
} from "@fortawesome/free-solid-svg-icons";
import { DeanSummaryCardsDto } from "@/types/api/deanDashboard.types";

interface SummaryCardsProps {
    data: DeanSummaryCardsDto;
}

export function SummaryCards({ data }: SummaryCardsProps) {
    const cards = [
        {
            title: "إجمالي المراسلات",
            value: data.totalCorrespondences,
            icon: faEnvelope,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
        },
        {
            title: "إجمالي المستلمين",
            value: data.totalReceivers,
            icon: faUsers,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
        },
        {
            title: "مقروءة",
            value: data.readCount,
            icon: faEye,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            suffix: `${data.readPercentage.toFixed(0)}%`,
        },
        {
            title: "قيد الانتظار",
            value: data.pendingReadCount,
            icon: faClock,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-100",
        },
        {
            title: "متجاهلة",
            value: data.ignoredCount,
            icon: faBan,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
        },
        {
            title: "بانتظار الموافقة",
            value: data.pendingApprovalCount,
            icon: faCheckCircle,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
        },
        {
            title: "مرفوضة",
            value: data.rejectedCount,
            icon: faXmark,
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-100",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
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
                    <p className="text-xl font-bold text-gray-800 mt-1">
                        {card.value}
                        {card.suffix && (
                            <span className="text-xs font-normal text-gray-400 mr-1">
                                ({card.suffix})
                            </span>
                        )}
                    </p>
                </div>
            ))}
        </div>
    );
}