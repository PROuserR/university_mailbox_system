// components/incoming-email/IncomingEmailList.tsx

"use client";

import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { IncomingEmailDto, IncomingEmailStatus } from "@/types/api/incoming-email";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface IncomingEmailListProps {
    items: IncomingEmailDto[];
    selectedId: number | null;
    onSelectItem: (id: number) => void;
    isLoading?: boolean;
    statusColors: Record<IncomingEmailStatus, string>;
    statusLabels: Record<IncomingEmailStatus, string>;
    bottomRef?: React.RefObject<HTMLDivElement | null>;
    isFetchingNextPage?: boolean;
}

export const IncomingEmailList = forwardRef<HTMLDivElement, IncomingEmailListProps>(
    ({ 
        items, 
        selectedId, 
        onSelectItem, 
        isLoading = false, 
        statusColors, 
        statusLabels,
        bottomRef,
        isFetchingNextPage = false,
    }, ref) => {
        // ✅ استخدام Set لمنع تكرار الـ keys
        const uniqueItems = useMemo(() => {
            const seen = new Set<number>();
            const result: IncomingEmailDto[] = [];
            items.forEach((item) => {
                if (!seen.has(item.id)) {
                    seen.add(item.id);
                    result.push(item);
                }
            });
            return result;
        }, [items]);

        if (isLoading && uniqueItems.length === 0) {
            return (
                <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm">جاري تحميل البريد الوارد...</p>
                    </div>
                </div>
            );
        }

        if (uniqueItems.length === 0) {
            return (
                <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-lg">📧</p>
                        <p>لا يوجد بريد وارد</p>
                    </div>
                </div>
            );
        }

        return (
            <div ref={ref} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                    {uniqueItems.map((item) => {
                        const isSelected = selectedId === item.id;
                        const statusColor = statusColors[item.status] || "bg-gray-100 text-gray-700";
                        const statusLabel = statusLabels[item.status] || item.status;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelectItem(item.id)}
                                className={cn(
                                    "w-full border-b border-border p-4 text-right transition-all cursor-pointer hover:bg-gray-50",
                                    isSelected && "bg-gray-100 border-r-4 border-r-blue-500"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {item.fromName || item.from}
                                                </span>
                                                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full", statusColor)}>
                                                    {statusLabel}
                                                </span>
                                                {item.hasAttachments && (
                                                    <span className="text-xs text-muted-foreground">📎</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(item.receivedAt), "dd/MM/yyyy HH:mm", { locale: arSA })}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
                                            {item.subject || "(بدون موضوع)"}
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                            {item.from}
                                        </p>

                                        {item.attachments && item.attachments.length > 0 && (
                                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                📎 {item.attachments.length} مرفق
                                            </div>
                                        )}

                                        {item.correspondenceNumber && (
                                            <div className="mt-1 text-xs text-blue-500">
                                                مراسلة #{item.correspondenceNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {isFetchingNextPage && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    
                    {bottomRef && <div ref={bottomRef} className="h-1" />}
                </div>
            </div>
        );
    }
);

IncomingEmailList.displayName = "IncomingEmailList";