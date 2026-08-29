// components/distribution-full/DistributionSummaryCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCalendarDay,
  faCalendarWeek,
  faCalendar,
  faChartLine,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

interface DistributionSummaryAnalyticsDto {
  totalDistributions: number;
  todayDistributions: number;
  thisWeekDistributions: number;
  thisMonthDistributions: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  peakDayDistributions: number;
  peakDay: string;
  peakHourDistributions: number;
  peakHour: string;
  mostActiveEmployee: string;
  mostReceivedReceiver: string;
}

interface DistributionSummaryCardsProps {
  data: DistributionSummaryAnalyticsDto;
}

export function DistributionSummaryCards({ data }: DistributionSummaryCardsProps) {
  const cards = [
    {
      label: "إجمالي التوزيعات",
      value: data.totalDistributions,
      icon: faEnvelope,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "توزيعات اليوم",
      value: data.todayDistributions,
      icon: faCalendarDay,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "توزيعات هذا الأسبوع",
      value: data.thisWeekDistributions,
      icon: faCalendarWeek,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "توزيعات هذا الشهر",
      value: data.thisMonthDistributions,
      icon: faCalendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const averages = [
    {
      label: "المتوسط اليومي",
      value: data.dailyAverage.toFixed(1),
      color: "text-emerald-600",
    },
    {
      label: "المتوسط الأسبوعي",
      value: data.weeklyAverage.toFixed(1),
      color: "text-indigo-600",
    },
    {
      label: "المتوسط الشهري",
      value: data.monthlyAverage.toFixed(1),
      color: "text-purple-600",
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

      {/* ===== Averages ===== */}
      <div className="grid grid-cols-3 gap-3">
        {averages.map((avg, index) => (
          <div key={index} className="bg-slate-50 rounded-xl p-2 text-center border border-gray-100">
            <p className="text-[10px] text-gray-400">{avg.label}</p>
            <p className={`text-sm font-bold ${avg.color} mt-0.5`}>{avg.value}</p>
          </div>
        ))}
      </div>

      {/* ===== Peak Info ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-yellow-50 rounded-xl p-2 text-center border border-yellow-100">
          <p className="text-[10px] text-yellow-600">يوم الذروة</p>
          <p className="text-sm font-bold text-yellow-700">{data.peakDay}</p>
          <p className="text-[10px] text-yellow-500">({data.peakDayDistributions} توزيع)</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center border border-orange-100">
          <p className="text-[10px] text-orange-600">ساعة الذروة</p>
          <p className="text-sm font-bold text-orange-700">{data.peakHour}</p>
          <p className="text-[10px] text-orange-500">({data.peakHourDistributions} توزيع)</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-2 text-center border border-blue-100">
          <p className="text-[10px] text-blue-600">الموظف الأكثر نشاطاً</p>
          <p className="text-sm font-bold text-blue-700">{data.mostActiveEmployee}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-2 text-center border border-purple-100">
          <p className="text-[10px] text-purple-600">المستلم الأكثر</p>
          <p className="text-sm font-bold text-purple-700">{data.mostReceivedReceiver}</p>
        </div>
      </div>
    </div>
  );
}