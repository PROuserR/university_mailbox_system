// services/ignoredPatterns.service.ts

import { apiWrapper } from "@/utils/apiClient";
import { IgnoredPatternsDto } from "@/types/api/ignoredPatterns.types";

const BASE_URL = "/v2/Charts";

export const getIgnoredPatterns = async (): Promise<IgnoredPatternsDto> => {
    const res = await apiWrapper.get<{
        data: IgnoredPatternsDto;
    }>(`${BASE_URL}/dean/ignored-patterns`);

    if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load ignored patterns");
    }

    return res.data.data;
};