// services/readingBehavior.service.ts

import { apiWrapper } from "@/utils/apiClient";
import { ReadingBehaviorDto } from "@/types/api/readingBehavior.types";

const BASE_URL = "/v2/Charts";

export const getReadingBehavior = async (): Promise<ReadingBehaviorDto> => {
    const res = await apiWrapper.get<{
        data: ReadingBehaviorDto;
    }>(`${BASE_URL}/dean/reading-behavior`);

    if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load reading behavior");
    }

    return res.data.data;
};