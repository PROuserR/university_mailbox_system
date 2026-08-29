// components/distribution-patterns/PatternsSummaryCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUsers,
  faCalendarDay,
  faClock,
  faChartLine,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";

interface DistributionSummaryDto {
  totalDistributions: number;
  totalCorrespondencesDistributed: number;
  totalReceivers: number;
  averageReceiversPerDistribution: number;
  firstDistributionDate: string | null;
  lastDistributionDate: string | null;
  daysActive: number;
}

interface PatternsSummaryCardsProps {
  summary: DistributionSummaryDto;
  averageDaily: number;
  averageWeekly: number;
  averageMonthly: number;
  peakDay: string;
  peakHour: string;
  mostActiveMonth: string;
  totalReadCount?: number;
  totalIgnoredCount?: number;
  overallReadPercentage?: number;
  growthRate?: number;
  averageDistributionsPerEmployee?: number;
  averageDistributionsPerReceiver?: number;
}

export function PatternsSummaryCards({
  summary,
  averageDaily,
  averageWeekly,
  averageMonthly,
  peakDay,
  peakHour,
  mostActiveMonth,
  totalReadCount,
  totalIgnoredCount,
  overallReadPercentage,
  growthRate,
  averageDistributionsPerEmployee,
  averageDistributionsPerReceiver,
}: PatternsSummaryCardsProps) {
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
      title: "إجمالي التوزيعات",
      value: summary.totalDistributions,
      icon: faEnvelope,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "إجمالي المستلمين",
      value: summary.totalReceivers,
      icon: faUsers,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "متوسط يومي",
      value: averageDaily.toFixed(1),
      icon: faCalendarDay,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: "متوسط أسبوعي",
      value: averageWeekly.toFixed(1),
      icon: faClock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "متوسط شهري",
      value: averageMonthly.toFixed(1),
      icon: faChartLine,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      title: "أكثر يوم نشاط",
      value: peakDay,
      icon: faCalendarDay,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bg} rounded-xl border border-gray-100 p-3 shadow-sm transition hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{card.title}</span>
              <FontAwesomeIcon icon={card.icon} className={`${card.color} text-sm`} />
            </div>
            <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ===== Extra Stats (إذا كانت متوفرة) ===== */}
      {(totalReadCount !== undefined || growthRate !== undefined) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {totalReadCount !== undefined && (
            <div className="bg-white rounded-xl border border-green-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">إجمالي المقروء</span>
                <FontAwesomeIcon icon={faEnvelope} className="text-green-500 text-sm" />
              </div>
              <p className="text-xl font-bold text-green-600 mt-1">{totalReadCount}</p>
            </div>
          )}
          {totalIgnoredCount !== undefined && (
            <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">إجمالي المتجاهل</span>
                <FontAwesomeIcon icon={faEnvelope} className="text-red-500 text-sm" />
              </div>
              <p className="text-xl font-bold text-red-600 mt-1">{totalIgnoredCount}</p>
            </div>
          )}
          {overallReadPercentage !== undefined && (
            <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">نسبة القراءة</span>
                <FontAwesomeIcon icon={faChartLine} className="text-blue-500 text-sm" />
              </div>
              <p className="text-xl font-bold text-blue-600 mt-1">{overallReadPercentage.toFixed(1)}%</p>
            </div>
          )}
          {growthRate !== undefined && (
            <div className="bg-white rounded-xl border border-purple-100 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">معدل النمو</span>
                <FontAwesomeIcon icon={faChartLine} className="text-purple-500 text-sm" />
              </div>
              <p className={`text-xl font-bold mt-1 ${growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}