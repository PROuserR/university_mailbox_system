// components/distribution-full/DistributionOverallStats.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUsers,
  faUser,
  faCalendarDay,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

interface DistributionOverallDto {
  totalDistributions: number;
  totalCorrespondences: number;
  totalReceivers: number;
  uniqueEmployees: number;
  uniqueReceivers: number;
  averageReceiversPerDistribution: number;
  averageDistributionsPerEmployee: number;
  averageDistributionsPerReceiver: number;
  firstDistributionDate: string | null;
  lastDistributionDate: string | null;
  activeDays: number;
}

interface DistributionOverallStatsProps {
  data: DistributionOverallDto;
}

export function DistributionOverallStats({ data }: DistributionOverallStatsProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cards = [
    {
      label: "إجمالي التوزيعات",
      value: data.totalDistributions,
      icon: faEnvelope,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "إجمالي المراسلات",
      value: data.totalCorrespondences,
      icon: faEnvelope,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "إجمالي المستلمين",
      value: data.totalReceivers,
      icon: faUsers,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "الموظفين الفريدين",
      value: data.uniqueEmployees,
      icon: faUser,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const stats = [
    {
      label: "متوسط المستلمين/توزيع",
      value: data.averageReceiversPerDistribution.toFixed(1),
      color: "text-slate-700",
    },
    {
      label: "متوسط التوزيعات/موظف",
      value: data.averageDistributionsPerEmployee.toFixed(1),
      color: "text-slate-700",
    },
    {
      label: "متوسط التوزيعات/مستلم",
      value: data.averageDistributionsPerReceiver.toFixed(1),
      color: "text-slate-700",
    },
    {
      label: "أيام النشاط",
      value: data.activeDays,
      color: "text-slate-700",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ===== Main Cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bg} rounded-xl border border-gray-100 p-3 shadow-sm transition hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{card.label}</span>
              <FontAwesomeIcon icon={card.icon} className={`${card.color} text-sm`} />
            </div>
            <p className={`text-xl font-bold ${card.color} mt-1`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-[10px] text-gray-400">{stat.label}</p>
            <p className={`text-sm font-bold ${stat.color} mt-0.5`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ===== Dates ===== */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <p className="text-[10px] text-gray-400">أول توزيع</p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">{formatDate(data.firstDistributionDate)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <p className="text-[10px] text-gray-400">آخر توزيع</p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">{formatDate(data.lastDistributionDate)}</p>
        </div>
      </div>
    </div>
  );
}