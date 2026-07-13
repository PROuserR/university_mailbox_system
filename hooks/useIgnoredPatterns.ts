// hooks/useIgnoredPatterns.ts

import { useQuery } from "@tanstack/react-query";
import { getIgnoredPatterns } from "@/services/ignoredPatterns.service";

export const useIgnoredPatterns = () => {
    return useQuery({
        queryKey: ["ignored-patterns"],
        queryFn: () => getIgnoredPatterns(),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};