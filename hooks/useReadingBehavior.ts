// hooks/useReadingBehavior.ts

import { useQuery } from "@tanstack/react-query";
import { getReadingBehavior } from "@/services/readingBehavior.service";

export const useReadingBehavior = () => {
    return useQuery({
        queryKey: ["reading-behavior"],
        queryFn: () => getReadingBehavior(),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};