// types/api/ignoredPatterns.types.ts

export interface IgnoredPatternsDto {
    topIgnoredUsers: TopIgnoredUserDto[];
    topIgnoredCorrespondences: TopIgnoredCorrespondenceDto[];
    summary: IgnoredSummaryDto;
    trend: IgnoredTrendDto;
    ignoredByType: IgnoredByTypeDto[];
    ignoredByDay: IgnoredByDayDto[];
    averageIgnoredPercentage: number;
    mostIgnoredDay: string;
}

export interface TopIgnoredUserDto {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    totalReceived: number;
    ignoredCount: number;
    ignoredPercentage: number;
    ignoredCorrespondences: IgnoredCorrespondencePatternDto[];
}

export interface IgnoredCorrespondencePatternDto {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    distributedDate: string;
    daysPending: number;
}

export interface TopIgnoredCorrespondenceDto {
    correspondenceId: number;
    number: string;
    title: string;
    ignoredCount: number;
    totalReceivers: number;
    ignoredPercentage: number;
    distributedDate: string;
    daysPending: number;
}

export interface IgnoredSummaryDto {
    totalIgnored: number;
    totalDistributions: number;
    uniqueUsersIgnored: number;
    uniqueCorrespondencesIgnored: number;
    overallIgnoredPercentage: number;
    daysThreshold: number;
}

export interface IgnoredTrendDto {
    data: IgnoredMonthlyTrendDto[];
    direction: string;
    averageMonthlyIgnored: number;
}

export interface IgnoredMonthlyTrendDto {
    month: string;
    totalDistributions: number;
    ignoredCount: number;
    ignoredPercentage: number;
}

export interface IgnoredByTypeDto {
    type: string;
    total: number;
    ignored: number;
    ignoredPercentage: number;
}

export interface IgnoredByDayDto {
    day: string;
    ignoredCount: number;
    percentage: number;
}