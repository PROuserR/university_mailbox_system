// components/distribution-full/DistributionStatusSummary.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faClock,
  faCheckCircle,
  faBan,
  faTimesCircle,
  faHourglassHalf,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

interface DistributionStatusSummaryResult {
  total: number;
  pending: number;
  read: number;
  ignored: number;
  rejected: number;
  pendingApproval: number;
  revoked: number;
  readPercentage: number;
  ignorePercentage: number;
  pendingPercentage: number;
  rejectedPercentage: number;
  revokedPercentage: number;
}

interface DistributionStatusSummaryProps {
  data: DistributionStatusSummaryResult;
}

export function DistributionStatusSummary({ data }: DistributionStatusSummaryProps) {
  const items = [
    {
      label: "الإجمالي",
      value: data.total,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: faEnvelope,
    },
    {
      label: "مقروء",
      value: data.read,
      percentage: data.readPercentage,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: faCheckCircle,
    },
    {
      label: "معلق",
      value: data.pending,
      percentage: data.pendingPercentage,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: faClock,
    },
    {
      label: "قيد الموافقة",
      value: data.pendingApproval,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: faHourglassHalf,
    },
    {
      label: "متجاهل",
      value: data.ignored,
      percentage: data.ignorePercentage,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: faBan,
    },
    {
      label: "مرفوض",
      value: data.rejected,
      percentage: data.rejectedPercentage,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: faTimesCircle,
    },
    {
      label: "ملغي",
      value: data.revoked,
      percentage: data.revokedPercentage,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: faRotateLeft,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={`${item.bg} rounded-xl border ${item.border} p-3 shadow-sm transition hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{item.label}</span>
            <FontAwesomeIcon icon={item.icon} className={`${item.color} text-sm`} />
          </div>
          <p className={`text-xl font-bold ${item.color} mt-1`}>{item.value}</p>
          {item.percentage !== undefined && (
            <p className="text-[10px] text-gray-400 mt-0.5">{item.percentage.toFixed(1)}%</p>
          )}
        </div>
      ))}
    </div>
  );
}