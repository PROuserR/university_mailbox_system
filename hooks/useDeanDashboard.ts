// hooks/useDeanDashboard.ts

import { useQuery } from "@tanstack/react-query";
import {
    getDeanDashboard,
    getDistributionData,
    getTimeSeriesData,
    getReadingPerformance,
} from "@/services/deanDashboard.service";

// ==============================
// Dean Dashboard
// ==============================

export const useDeanDashboard = () => {
    return useQuery({
        queryKey: ["dean-dashboard"],
        queryFn: () => getDeanDashboard(),
        staleTime: 5 * 60 * 1000, // 5 دقائق
        retry: 2,
    });
};

// ==============================
// Distribution Data
// ==============================

export const useDistributionData = (by: string = "mainType") => {
    return useQuery({
        queryKey: ["distribution-data", by],
        queryFn: () => getDistributionData(by),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};

// ==============================
// Time Series Data
// ==============================

export const useTimeSeriesData = (
    fromDate?: string,
    toDate?: string,
    groupBy: string = "day"
) => {
    return useQuery({
        queryKey: ["time-series", fromDate, toDate, groupBy],
        queryFn: () => getTimeSeriesData(fromDate, toDate, groupBy),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};

// ==============================
// Reading Performance
// ==============================

export const useReadingPerformance = (fromDate?: string, toDate?: string) => {
    return useQuery({
        queryKey: ["reading-performance", fromDate, toDate],
        queryFn: () => getReadingPerformance(fromDate, toDate),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};