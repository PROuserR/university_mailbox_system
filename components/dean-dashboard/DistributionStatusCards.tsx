// components/dean-dashboard/DistributionStatusCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faClock,
  faBan,
  faCheckCircle,
  faXmark,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { DistributionStatusChartDto } from "@/types/api/analytics.types";

interface DistributionStatusCardsProps {
  data?: DistributionStatusChartDto;
}

export function DistributionStatusCards({ data }: DistributionStatusCardsProps) {
  const defaultData: DistributionStatusChartDto = {
    read: 0,
    ignored: 0,
    pending: 0,
    rejected: 0,
    revoked: 0,
    pendingApproval: 0,
  };

  const d = data || defaultData;

  const cards = [
    {
      title: "مقروء",
      value: d.read,
      icon: faEye,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "معلق",
      value: d.pending,
      icon: faClock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "متجاهل",
      value: d.ignored,
      icon: faBan,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "قيد الموافقة",
      value: d.pendingApproval,
      icon: faCheckCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "مرفوض",
      value: d.rejected,
      icon: faXmark,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "ملغي",
      value: d.revoked,
      icon: faRotateLeft,
      color: "text-gray-600",
      bg: "bg-gray-50",
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
          <p className={`text-xl font-bold ${card.color} mt-1`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}