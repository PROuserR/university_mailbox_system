/* eslint-disable @typescript-eslint/no-explicit-any */
// services/deanDashboard.service.ts

import { apiWrapper } from "@/utils/apiClient";
import {
    DeanDashboardFullDto,
    DistributionPointDto,
    TimeSeriesPointDto,
    ReadingPerformanceStatDto,
} from "@/types/api/deanDashboard.types";

const BASE_URL = "/v2/Charts";

// ==============================
// Dean Dashboard
// ==============================

export const getDeanDashboard = async (): Promise<DeanDashboardFullDto> => {
    const res = await apiWrapper.get<{
        data: DeanDashboardFullDto;
    }>(`${BASE_URL}/dean/dashboard`);

    if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load dean dashboard");
    }

    return res.data.data;
};

// ==============================
// Distribution Data
// ==============================

export const getDistributionData = async (
    by: string = "mainType"
): Promise<DistributionPointDto[]> => {
    const res = await apiWrapper.get<{
        data: DistributionPointDto[];
    }>(`${BASE_URL}/distribution`, { by });

    if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load distribution data");
    }

    return res.data.data;
};

// ==============================
// Time Series Data
// ==============================

export const getTimeSeriesData = async (
    fromDate?: string,
    toDate?: string,
    groupBy: string = "day"
): Promise<TimeSeriesPointDto[]> => {
    const params: any = { groupBy };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const res = await apiWrapper.get<{
        data: TimeSeriesPointDto[];
    }>(`${BASE_URL}/time-series`, params);

    if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load time series data");
    }

    return res.data.data;
};

// ==============================
// Reading Performance
// ==============================

export const getReadingPerformance = async (
    fromDate?: string,
    toDate?: string
): Promise<ReadingPerformanceStatDto[]> => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const res = await apiWrapper.get<{
        data: ReadingPerformanceStatDto[];
    }>(`${BASE_URL}/reading-performance`, params);

    if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load reading performance");
    }

    return res.data.data;
};