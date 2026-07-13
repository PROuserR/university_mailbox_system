// types/api/deanDashboard.types.ts

export interface DeanDashboardFullDto {
    summary: DeanSummaryCardsDto;
    monthlyTrend: MonthlyStatisticsDto;
    topIgnored: TopIgnoredReceiverDto[];
    recentActivities: RecentActivityDto[];
    readingPerformance: ReadingPerformanceStatDto[];
}

export interface DeanSummaryCardsDto {
    totalIncoming: number;
    totalOutgoing: number;
    totalInternal: number;
    totalReceivers: number;
    totalCorrespondences: number;
    pendingReadCount: number;
    readCount: number;
    ignoredCount: number;
    readPercentage: number;
    thisWeekIncoming: number;
    thisWeekOutgoing: number;
    thisWeekInternal: number;
    pendingApprovalCount: number;
    rejectedCount: number;
}

export interface MonthlyStatisticsDto {
    year: number;
    data: MonthlyDataDto[];
}

export interface MonthlyDataDto {
    month: string;
    incoming: number;
    outgoing: number;
    internal: number;
    total: number;
}

export interface OverallReadingStatusResponseDto {
    totalReceivers: number;
    readCount: number;
    pendingCount: number;
    ignoredCount: number;
    readPercentage: number;
    pendingApprovalCount: number;
    rejectedCount: number;
}

export interface TopIgnoredReceiverDto {
    userId: number;
    userName: string;
    userEmail: string;
    ignoredCount: number;
    totalReceived: number;
    ignoredPercentage: number;
}

export interface RecentActivityDto {
    action: string;
    userId: number;
    userName: string;
    entityName: string;
    createdAt: string;
}

export interface ReadingPerformanceStatDto {
    userId: number;
    userName: string;
    fullName: string;
    totalReceived: number;
    totalRead: number;
    readPercentage: number;
    averageReadTimeHours: number;
    pendingCount: number;
    ignoredCount: number;
}

export interface DistributionPointDto {
    category: string;
    count: number;
    percentage: number;
}

export interface TimeSeriesPointDto {
    period: string;
    incoming: number;
    outgoing: number;
    internal: number;
    total: number;
}