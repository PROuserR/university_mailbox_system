// components/distribution-full/DistributionPeaksCards.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCalendarDay,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

interface PeakTimeItemDto {
  label: string;
  count: number;
  percentage: number;
}

interface PeakTimeSummaryDto {
  total: number;
  peakTime: string;
  peakCount: number;
}

interface DistributionPeaksCardsProps {
  peakHours: PeakTimeItemDto[];
  peakHoursSummary: PeakTimeSummaryDto;
  peakDays: PeakTimeItemDto[];
  peakDaysSummary: PeakTimeSummaryDto;
}

export function DistributionPeaksCards({
  peakHours,
  peakHoursSummary,
  peakDays,
  peakDaysSummary,
}: DistributionPeaksCardsProps) {
  const getTopItems = (items: PeakTimeItemDto[], count: number = 5) => {
    return items.slice(0, count);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ===== Peak Hours ===== */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">ساعات الذروة</h3>
        </div>

        <div className="space-y-2">
          {getTopItems(peakHours).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 w-12">{item.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-700 w-12 text-left">{item.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-slate-500">
          <span>الإجمالي: {peakHoursSummary.total}</span>
          <span>
            الذروة: <span className="font-medium text-slate-700">{peakHoursSummary.peakTime}</span>
            <span className="mr-1 text-blue-600">({peakHoursSummary.peakCount})</span>
          </span>
        </div>
      </div>

      {/* ===== Peak Days ===== */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarDay} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">أيام الذروة</h3>
        </div>

        <div className="space-y-2">
          {getTopItems(peakDays).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 w-16">{item.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-700 w-12 text-left">{item.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-slate-500">
          <span>الإجمالي: {peakDaysSummary.total}</span>
          <span>
            الذروة: <span className="font-medium text-slate-700">{peakDaysSummary.peakTime}</span>
            <span className="mr-1 text-purple-600">({peakDaysSummary.peakCount})</span>
          </span>
        </div>
      </div>
    </div>
  );
}