// components/ui/Pagination.tsx

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    totalCount?: number;
    className?: string;
    showPageSize?: boolean;
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 5,
    totalCount = 0,
    className,
    showPageSize = false,
    pageSizeOptions = [5, 10, 20, 30, 50],
    onPageSizeChange,
}: PaginationProps) {
    if (totalPages <= 1 && !showPageSize) return null;

    const getVisiblePages = (): (number | string)[] => {
        const delta = 1;
        const range: number[] = [];
        const rangeWithDots: (number | string)[] = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l: number | undefined;
        range.forEach((i) => {
            if (l !== undefined) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    const pages = getVisiblePages();

    const start = totalCount > 0 ? Math.min((currentPage - 1) * pageSize + 1, totalCount) : 0;
    const end = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 py-3", className)}>
            {/* معلومات العدد */}
            {totalCount > 0 && (
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    عرض <span className="font-medium text-foreground">{start}</span> -{' '}
                    <span className="font-medium text-foreground">{end}</span> من{' '}
                    <span className="font-medium text-foreground">{totalCount}</span>
                </div>
            )}

            {/* أزرار التنقل */}
            <div className="flex items-center gap-1 order-1 sm:order-2">
                {/* زر الصفحة الأولى */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-40"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>

                {/* زر الصفحة السابقة */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* أرقام الصفحات */}
                <div className="flex items-center gap-0.5 mx-1">
                    {pages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`dots-${index}`} className="px-1.5 text-sm text-muted-foreground">
                                    …
                                </span>
                            );
                        }
                        const isActive = currentPage === page;
                        return (
                            <Button
                                key={page}
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onPageChange(page as number)}
                                className={cn(
                                    "h-8 w-8 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                                        : "hover:bg-slate-100 text-slate-600"
                                )}
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                {/* زر الصفحة التالية */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* زر الصفحة الأخيرة */}
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-40"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            </div>

            {/* تغيير عدد العناصر في الصفحة */}
            {showPageSize && onPageSizeChange && (
                <div className="flex items-center gap-2 order-3">
                    <span className="text-sm text-muted-foreground">عرض</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}