// types/api/analytics.types.ts

// ============================================================
// ===== Ignored Users =====
// ============================================================

export interface IgnoredCorrespondenceDto {
  correspondenceId: number;
  correspondenceNumber: number;
  title: string;
  distributedAt: string;
  daysPending: number;
}

export interface IgnoredUserReportDto {
  userId: number;
  userName: string;
  fullName: string;
  unreadCount: number;
  oldestUnreadDate: string | null;
  ignoredCorrespondences: IgnoredCorrespondenceDto[];
}

export interface GetIgnoredUsersQuery {
  daysThreshold?: number;
  page?: number;
  pageSize?: number;
}

// types/api/analytics.types.ts

// ============================================================
// ===== Distribution Patterns =====
// ============================================================

export interface DistributionByTypeDto {
  type: string;
  count: number;
  percentage: number;
}

export interface DistributionByDayDto {
  day: string;
  count: number;
  percentage: number;
}

export interface DistributionByHourDto {
  hour: string;
  count: number;
  percentage: number;
}

export interface DistributionByMonthDto {
  month: string;
  count: number;
  percentage: number;
}

export interface TopDistributorDto {
  userId: number;
  fullName: string;
  email: string;
  distributionsCount: number;
  percentageOfTotal: number;
  totalReceivers: number;
  averageReceiversPerDistribution: number;
}

export interface TopSenderEntityDto {
  senderEntityId: number;
  name: string;
  count: number;
  percentage: number;
}

export interface TopDocumentTypeDto {
  documentTypeId: number;
  name: string;
  count: number;
  percentage: number;
}

export interface DistributionSummaryDto {
  totalDistributions: number;
  totalCorrespondencesDistributed: number;
  totalReceivers: number;
  averageReceiversPerDistribution: number;
  firstDistributionDate: string | null;
  lastDistributionDate: string | null;
  daysActive: number;
}

export interface DistributionPatternsDto {
  distributionByType: DistributionByTypeDto[];
  distributionByDay: DistributionByDayDto[];
  distributionByHour: DistributionByHourDto[];
  distributionByMonth: DistributionByMonthDto[];
  topDistributors: TopDistributorDto[];
  topSenderEntities: TopSenderEntityDto[];
  topDocumentTypes: TopDocumentTypeDto[];
  summary: DistributionSummaryDto;
  averageDailyDistributions: number;
  averageWeeklyDistributions: number;
  averageMonthlyDistributions: number;
  peakDistributionDay: string;
  peakDistributionHour: string;
  peakDistributionMonth: string;
  mostActiveMonth: string;
  averageDistributionsPerEmployee: number;
  averageDistributionsPerReceiver: number;
  growthRate: number;
  totalReadCount: number;
  totalIgnoredCount: number;
  overallReadPercentage: number;
}

export interface GetDistributionPatternsQuery {
  topDistributorsCount?: number;
  topSenderEntitiesCount?: number;
  topDocumentTypesCount?: number;
  months?: number;
}
// types/api/analytics.types.ts

// ============================================================
// ===== Distribution Full Report =====
// ============================================================

export interface DistributionStatusSummaryResult {
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

export interface DistributionTrendItemDto {
  date: string;
  total: number;
  pending: number;
  read: number;
  ignored: number;
  rejected: number;
  pendingApproval: number;
  revoked: number;
  readRate: number;
  ignoreRate: number;
}

export interface DistributionTrendReportDto {
  items: DistributionTrendItemDto[];
  generatedAt: string;
  totalDistributions: number;
  averageDaily: number;
  averageWeekly: number;
  averageMonthly: number;
  peakDayCount: number;
  peakDay: string;
  trendDirection: string;
}

export interface PeakTimeItemDto {
  label: string;
  count: number;
  percentage: number;
}

export interface PeakTimeSummaryDto {
  total: number;
  peakTime: string;
  peakCount: number;
}

export interface DistributionPeaksReportDto {
  peakHours: PeakTimeItemDto[];
  peakHoursSummary: PeakTimeSummaryDto;
  peakDays: PeakTimeItemDto[];
  peakDaysSummary: PeakTimeSummaryDto;
  generatedAt: string;
}

export interface DistributionOverallDto {
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

export interface DistributionSummaryAnalyticsDto {
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

export interface DistributionFullReportDto {
  statusStatistics: DistributionStatusSummaryResult;
  trend: DistributionTrendReportDto;
  peaks: DistributionPeaksReportDto;
  overall: DistributionOverallDto;
  summary: DistributionSummaryAnalyticsDto;
  generatedAt: string;
}

export interface GetDistributionFullQuery {
  fromDate?: string | null;
  toDate?: string | null;
  departmentId?: number | null;
  userId?: number | null;
  mainType?: string | null;
  isProfessional?: boolean | null;
  groupBy?: string;
}
// types/api/analytics.types.ts

// ============================================================
// ===== Ignored Patterns =====
// ============================================================

export interface IgnoredCorrespondencePatternDto {
  correspondenceId: number;
  correspondenceNumber: number;
  correspondenceTitle: string;
  distributedDate: string;
  daysPending: number;
}

export interface TopIgnoredUserDto {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  totalReceived: number;
  ignoredCount: number;
  ignoredPercentage: number;
}

export interface TopIgnoredCorrespondenceDto {
  correspondenceId: number;
  number: number;
  title: string;
  ignoredCount: number;
  totalReceivers: number;
  ignoredPercentage: number;
}

export interface IgnoredSummaryDto {
  totalIgnored: number;
  totalDistributions: number;
  uniqueUsersIgnored: number;
  uniqueCorrespondencesIgnored: number;
  overallIgnoredPercentage: number;
  daysThreshold: number;
}

export interface IgnoredMonthlyTrendDto {
  month: string;
  totalDistributions: number;
  ignoredCount: number;
  ignoredPercentage: number;
}

export interface IgnoredTrendDto {
  data: IgnoredMonthlyTrendDto[];
  direction: string;
  averageMonthlyIgnored: number;
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
// types/api/analytics.types.ts

// ============================================================
// ===== Dean Dashboard =====
// ============================================================

// ===== KPI Cards =====
export interface DeanKpiCardsDto {
  totalDistributions: number;
  totalCorrespondences: number;
  totalUsers: number;
  totalDepartments: number;
  readRate: number;
  ignoreRate: number;
  pendingApproval: number;
  rejected: number;
  revoked: number;
  activeUsers: number;
  totalAttachments: number;
  totalStorageBytes: number;
  todayDistributions: number;
  thisWeekDistributions: number;
  thisMonthDistributions: number;
}

// ===== Quick Stats =====
export interface DeanQuickStatsDto {
  todayDistributions: number;
  thisWeekDistributions: number;
  thisMonthDistributions: number;
  bestDay: string;
  bestHour: string;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

// ===== Monthly Trend =====
export interface MonthlyTrendPointDto {
  month: string;
  distributions: number;
  distributionsIncoming: number;
  distributionsOutgoing: number;
  distributionsInternal: number;
  correspondences: number;
  correspondencesIncoming: number;
  correspondencesOutgoing: number;
  correspondencesInternal: number;
}

// ===== Distribution Status Chart =====
export interface DistributionStatusChartDto {
  read: number;
  ignored: number;
  pending: number;
  rejected: number;
  revoked: number;
  pendingApproval: number;
}

// ===== Distribution By Type =====
export interface DistributionByTypeChartDto {
  type: string;
  count: number;
  percentage: number;
}

// ===== Peak Hour =====
export interface PeakHourChartDto {
  hour: string;
  count: number;
  percentage: number;
}

// ===== Peak Day =====
export interface PeakDayChartDto {
  day: string;
  count: number;
  percentage: number;
}

// ===== Charts =====
export interface DeanChartsDto {
  monthlyTrend: MonthlyTrendPointDto[];
  distributionStatus: DistributionStatusChartDto;
  byType: DistributionByTypeChartDto[];
  peakHours: PeakHourChartDto[];
  peakDays: PeakDayChartDto[];
}

// ===== Top Ignored User =====
export interface TopIgnoredUserAnalyticDto {
  userId: number;
  fullName: string;
  email: string;
  departmentName: string;
  ignoredCount: number;
  totalReceived: number;
  ignoreRatio: number;
  riskLevel: string;
}

// ===== Top Ignored Correspondence =====
export interface TopIgnoredCorrespondenceDto {
  correspondenceId: number;
  number: number;
  title: string;
  ignoredCount: number;
  totalReceivers: number;
  ignoredPercentage: number;
}

// ===== Recent Activity =====
export interface RecentActivityDto {
  action: string;
  userId: number;
  userName: string;
  entityName: string;
  createdAt: string;
}

// ===== Top Lists =====
export interface DeanTopListsDto {
  topIgnoredUsers: TopIgnoredUserAnalyticDto[];
  topIgnoredCorrespondences: TopIgnoredCorrespondenceDto[];
  recentActivities: RecentActivityDto[];
}

// ===== Reading Performance =====
export interface ReadingPerformanceAnalyticDto {
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

// ===== Full Dean Dashboard =====
export interface DeanDashboardDto {
  kpiCards: DeanKpiCardsDto; // ✅ تم التغيير من kpi إلى kpiCards
  quickStats: DeanQuickStatsDto;
  charts: DeanChartsDto;
  topLists: DeanTopListsDto;
  readingPerformance: ReadingPerformanceAnalyticDto[];
  generatedAt: string;
}


// types/api/analytics.types.ts

// ============================================================
// ===== Receiver Dashboard =====
// ============================================================

export interface ReceiverSummaryDto {
  totalPending: number;
  totalRead: number;
  totalIgnored: number;
  totalReceived: number;
  readPercentage: number;
  ignoredPercentage: number;
  pendingPercentage: number;
  averageReadTimeHours: number;
}

export interface MonthlyReadingDataDto {
  month: string;
  received: number;
  read: number;
  readPercentage: number;
}

export interface MonthlyReadingStatsDto {
  year: number;
  data: MonthlyReadingDataDto[];
}

export interface PendingCorrespondenceDto {
  id: number;
  number: number;
  title: string;
  mainType: string;
  distributedDate: string;
  daysPending: number;
}

export interface RecentReadDto {
  correspondenceId: number;
  number: number;
  title: string;
  readAt: string;
  daysSinceRead: number;
}

export interface ReadingPerformanceDto {
  averageReadTimeHours: number;
  bestMonthReadCount: number;
  bestMonthName: string;
  totalRead: number;
}

export interface ReceiverDashboardFullDto {
  summary: ReceiverSummaryDto;
  monthlyReading: MonthlyReadingStatsDto;
  pending: PendingCorrespondenceDto[];
  recentReads: RecentReadDto[];
  performance: ReadingPerformanceDto;
}

// types/api/analytics.types.ts

// ============================================================
// ===== Reading Behavior Report =====
// ============================================================

export interface TopReaderDto {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  receivedCount: number;
  readCount: number;
  readPercentage: number;
  averageReadTimeHours: number;
}

export interface MonthlyReadingDataPointDto {
  month: string;
  received: number;
  read: number;
  readPercentage: number;
}

export interface MonthlyReadingTrendDto {
  data: MonthlyReadingDataPointDto[];
  overallReadPercentage: number;
  trendDirection: string;
}

export interface ReadingBehaviorReportDto {
  topReaders: TopReaderDto[];
  worstReaders: TopReaderDto[];
  averageReadTimeHours: number;
  peakReadingHours: string[];
  bestDayForReading: string;
  monthlyTrend: MonthlyReadingTrendDto;
  generatedAt: string;
}


// types/api/analytics.types.ts

// ============================================================
// ===== Correspondence Full Report =====
// ============================================================

export interface CorrespondenceTypeItemDto {
  type: string;
  count: number;
  percentage: number;
}

export interface CorrespondenceTypeReportDto {
  items: CorrespondenceTypeItemDto[];
  total: number;
  professional: number;
  nonProfessional: number;
}

export interface CorrespondenceTrendPointDto {
  date: string;
  total: number;
  incoming: number;
  outgoing: number;
  internal: number;
  professional: number;
  nonProfessional: number;
}

export interface CorrespondenceTrendReportDto {
  items: CorrespondenceTrendPointDto[];
  total: number;
  averageDaily: number;
  averageWeekly: number;
  averageMonthly: number;
  peakDayCount: number;
  peakDay: string;
  trendDirection: string;
  professionalPercentage: number;
}

export interface CorrespondenceStatusSummaryItemDto {
  status: string;
  count: number;
  percentage: number;
}

export interface CorrespondenceStatusSummaryReportDto {
  items: CorrespondenceStatusSummaryItemDto[];
  total: number;
}

export interface TopIgnoredCorrespondenceItemDto {
  correspondenceId: number;
  number: number;
  title: string;
  type: string;
  totalDistributions: number;
  ignoredCount: number;
  ignorePercentage: number;
  riskLevel: string;
}

export interface TopIgnoredCorrespondenceReportDto {
  items: TopIgnoredCorrespondenceItemDto[];
  total: number;
  totalIgnored: number;
  averageIgnorePercentage: number;
}

export interface CorrespondenceFullReportDto {
  types: CorrespondenceTypeReportDto;
  trend: CorrespondenceTrendReportDto;
  statusSummary: CorrespondenceStatusSummaryReportDto;
  topIgnored: TopIgnoredCorrespondenceReportDto;
}

export interface GetCorrespondenceFullQuery {
  fromDate?: string | null;
  toDate?: string | null;
  mainType?: string | null;
  documentTypeId?: number | null;
  senderEntityId?: number | null;
  groupBy?: string;
  topIgnoredCount?: number;
}

// ============================================================
// ===== Distribution Status =====
// ============================================================

export interface ReceiverStatusDto {
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  status: string;
  distributedDate: string | null;
  readAt: string | null;
  revokedAt: string | null;
  notes: string | null;
  rejectionReason: string | null;
  daysPending: number;
}

export interface DistributionStatusDto {
  correspondenceId: number;
  correspondenceNumber: number;
  correspondenceTitle: string;
  totalReceivers: number;
  readCount: number;
  pendingCount: number;
  ignoredCount: number;
  revokedCount: number;
  pendingApprovalCount: number;
  rejectedCount: number;
  readPercentage: number;
  receivers: ReceiverStatusDto[];
}