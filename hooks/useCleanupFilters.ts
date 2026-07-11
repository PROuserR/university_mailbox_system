// hooks/useCleanupFilters.ts

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useMailFilterStore from "@/store/mailFilterStore";
import { useSearchStore } from "@/store/searchStore";

export function useCleanupFilters() {
    const pathname = usePathname();
    const { setFilter } = useMailFilterStore();
    const { clearSearch } = useSearchStore();

    useEffect(() => {
        // ✅ تنظيف عند مغادرة الصفحة
        return () => {
            // فقط إذا كنا في صفحة معينة
            if (pathname === "/" || pathname === "/distribution") {
                setFilter("");
                clearSearch();
            }
        };
    }, [pathname, setFilter, clearSearch]);
}