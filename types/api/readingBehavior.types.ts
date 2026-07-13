// types/api/readingBehavior.types.ts

export interface ReadingBehaviorDto {
    topReaders: TopReaderDto[];
    worstReaders: TopReaderDto[];
    averageReadTimeHours: number;
    peakReadingHours: string[];
    bestDayForReading: string;
    monthlyTrend: ReadingTrendDto;
}

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

export interface ReadingTrendDto {
    data: MonthlyReadingTrendDto[];
    overallReadPercentage: number;
    trendDirection: string; // "Up", "Down", "Stable"
}

export interface MonthlyReadingTrendDto {
    month: string;
    received: number;
    read: number;
    readPercentage: number;
}