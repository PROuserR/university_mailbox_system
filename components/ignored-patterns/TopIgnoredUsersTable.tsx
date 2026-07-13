// components/ignored-patterns/TopIgnoredUsersTable.tsx

"use client";

import { useState } from "react";
import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { TopIgnoredUserDto } from "@/types/api/ignoredPatterns.types";

interface TopIgnoredUsersTableProps {
    data: TopIgnoredUserDto[];
}

export function TopIgnoredUsersTable({ data }: TopIgnoredUsersTableProps) {
    const [expandedUser, setExpandedUser] = useState<number | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    const toggleUser = (userId: number) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">#</th>
                        <th className="pb-2 font-medium text-gray-500">المستخدم</th>
                        <th className="pb-2 font-medium text-gray-500">مستلم</th>
                        <th className="pb-2 font-medium text-gray-500">متجاهل</th>
                        <th className="pb-2 font-medium text-gray-500">النسبة</th>
                        <th className="pb-2 font-medium text-gray-500"></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        const isExpanded = expandedUser === item.userId;
                        return (
                            <Fragment key={item.userId}>
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="py-2 text-center text-gray-400">{index + 1}</td>
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                {item.fullName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{item.fullName}</p>
                                                <p className="text-xs text-gray-400 truncate">{item.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 text-gray-600">{item.totalReceived}</td>
                                    <td className="py-2 font-semibold text-red-600">{item.ignoredCount}</td>
                                    <td className="py-2 text-gray-600">{item.ignoredPercentage.toFixed(1)}%</td>
                                    <td className="py-2">
                                        {item.ignoredCorrespondences.length > 0 && (
                                            <button
                                                onClick={() => toggleUser(item.userId)}
                                                className="p-1 rounded-lg hover:bg-gray-200 transition"
                                            >
                                                <FontAwesomeIcon
                                                    icon={isExpanded ? faChevronUp : faChevronDown}
                                                    className="text-gray-400 text-xs"
                                                />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr key={`${item.userId}-expanded`}>
                                        <td colSpan={6} className="py-2 px-4 bg-gray-50">
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-500 mb-1">
                                                    المراسلات المتجاهلة ({item.ignoredCorrespondences.length})
                                                </p>
                                                {item.ignoredCorrespondences.map((corr) => (
                                                    <div
                                                        key={corr.correspondenceId}
                                                        className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-gray-100 text-xs"
                                                    >
                                                        <span className="font-medium text-gray-700 truncate">
                                                            {corr.correspondenceTitle}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            #{corr.correspondenceNumber} · {formatDate(corr.distributedDate)}
                                                        </span>
                                                        <span className="font-medium text-red-500">
                                                            {corr.daysPending} يوم
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}