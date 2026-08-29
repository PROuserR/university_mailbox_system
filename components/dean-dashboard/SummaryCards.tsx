// components/dean-dashboard/SummaryCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faFile,
  faUsers,
  faEye,
  faBan,
  faCheckCircle,
  faXmark,
  faRotateLeft,
  faBuilding,
  faHardDrive,
} from "@fortawesome/free-solid-svg-icons";
import { DeanKpiCardsDto } from "@/types/api/analytics.types";

interface SummaryCardsProps {
  data?: DeanKpiCardsDto;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const defaultData: DeanKpiCardsDto = {
    totalDistributions: 0,
    totalCorrespondences: 0,
    totalUsers: 0,
    totalDepartments: 0,
    readRate: 0,
    ignoreRate: 0,
    pendingApproval: 0,
    rejected: 0,
    revoked: 0,
    activeUsers: 0,
    totalAttachments: 0,
    totalStorageBytes: 0,
    todayDistributions: 0,
    thisWeekDistributions: 0,
    thisMonthDistributions: 0,
  };

  const d = data || defaultData;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const cards = [
    {
      title: "إجمالي التوزيعات",
      value: d.totalDistributions,
      icon: faEnvelope,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "إجمالي المراسلات",
      value: d.totalCorrespondences,
      icon: faFile,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "المستخدمين النشطين",
      value: d.activeUsers,
      icon: faUsers,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "الأقسام",
      value: d.totalDepartments,
      icon: faBuilding,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "نسبة القراءة",
      value: `${d.readRate.toFixed(1)}%`,
      icon: faEye,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "نسبة التجاهل",
      value: `${d.ignoreRate.toFixed(1)}%`,
      icon: faBan,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "التخزين المستخدم",
      value: formatBytes(d.totalStorageBytes),
      icon: faHardDrive,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "المرفقات",
      value: d.totalAttachments,
      icon: faFile,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bg} rounded-xl border border-gray-100 p-3 shadow-sm transition hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-500">{card.title}</span>
            <FontAwesomeIcon icon={card.icon} className={`${card.color} text-sm`} />
          </div>
          <p className={`text-lg font-bold ${card.color} mt-1`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}