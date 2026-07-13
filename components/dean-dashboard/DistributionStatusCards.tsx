// components/dean-dashboard/DistributionStatusCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faEye,
    faClock,
    faBan,
    faCheckCircle,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { OverallReadingStatusResponseDto } from "@/types/api/deanDashboard.types";

interface DistributionStatusCardsProps {
    data: OverallReadingStatusResponseDto;
}

export function DistributionStatusCards({ data }: DistributionStatusCardsProps) {
    const cards = [
        {
            title: "إجمالي المستلمين",
            value: data.totalReceivers,
            icon: faUsers,
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            title: "مقروء",
            value: data.readCount,
            icon: faEye,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            suffix: `${data.readPercentage.toFixed(0)}%`,
        },
        {
            title: "قيد الانتظار",
            value: data.pendingCount,
            icon: faClock,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
        },
        {
            title: "متجاهل",
            value: data.ignoredCount,
            icon: faBan,
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            title: "بانتظار الموافقة",
            value: data.pendingApprovalCount,
            icon: faCheckCircle,
            color: "text-purple-500",
            bg: "bg-purple-50",
        },
        {
            title: "مرفوض",
            value: data.rejectedCount,
            icon: faXmark,
            color: "text-rose-500",
            bg: "bg-rose-50",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.bg} rounded-xl border border-gray-100 p-3 shadow-sm transition hover:shadow-md`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{card.title}</span>
                        <FontAwesomeIcon icon={card.icon} className={`${card.color} text-sm`} />
                    </div>
                    <p className="text-xl font-bold text-gray-800 mt-1">
                        {card.value}
                        {card.suffix && (
                            <span className="text-sm font-normal text-gray-400 mr-1">
                                ({card.suffix})
                            </span>
                        )}
                    </p>
                </div>
            ))}
        </div>
    );
}