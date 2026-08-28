/* eslint-disable @typescript-eslint/no-explicit-any */
// components/outgoing-email/OutgoingEmailList.tsx

"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { OutgoingEmailHistoryDto, EmailStatus } from "@/types/api/outgoing-email";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formatDateDisplay = (date?: string | null): string => {
    if (!date) return "";
    try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return "";
        return format(parsed, "dd/MM/yyyy", { locale: arSA });
    } catch {
        return "";
    }
};

// ✅ مطابق لـ OutgoingEmailDetail
const statusColors: Record<EmailStatus, string> = {
    [EmailStatus.Pending]: "bg-yellow-100 text-yellow-700",
    [EmailStatus.Sent]: "bg-green-100 text-green-700",
    [EmailStatus.Failed]: "bg-red-100 text-red-700",
    [EmailStatus.RetryPending]: "bg-orange-100 text-orange-700",
};

// ✅ مطابق لـ OutgoingEmailDetail
const statusLabels: Record<EmailStatus, string> = {
    [EmailStatus.Pending]: "قيد الانتظار",
    [EmailStatus.Sent]: "مرسل",
    [EmailStatus.Failed]: "فاشل",
    [EmailStatus.RetryPending]: "بانتظار إعادة المحاولة",
};

interface OutgoingEmailListProps {
    items: OutgoingEmailHistoryDto[];
    selectedId: number | null;
    onSelectItem: (id: number) => void;
    isLoading?: boolean;
    bottomRef?: React.RefObject<HTMLDivElement | null>;
    isFetchingNextPage?: boolean;
}

export const OutgoingEmailList = forwardRef<HTMLDivElement, OutgoingEmailListProps>(
    ({ items, selectedId, onSelectItem, isLoading = false, bottomRef, isFetchingNextPage = false }, ref) => {
        if (isLoading && items.length === 0) {
            return (
                <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm">جاري تحميل البريد الصادر...</p>
                    </div>
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Mail className="h-10 w-10" />
                        <p>لا يوجد بريد صادر</p>
                    </div>
                </div>
            );
        }

        return (
            <div ref={ref} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                    {items.map((item) => {
                        const isSelected = selectedId === item.id;
                        // ✅ استخدام نفس الدالة المستخدمة في OutgoingEmailDetail
                        const statusEnum = getStatusEnum(item.status);
                        const statusColor = statusColors[statusEnum] || "bg-gray-100 text-gray-700";
                        const statusLabel = statusLabels[statusEnum] || item.status;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelectItem(item.id)}
                                className={cn(
                                    "w-full border-b border-border p-4 text-right transition-all cursor-pointer hover:bg-muted/50",
                                    isSelected && "bg-muted/70 border-r-4 border-r-primary"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {item.to}
                                                </span>
                                                {/* ✅ استخدام Badge مطابق لـ OutgoingEmailDetail */}
                                                <Badge className={cn("text-[10px]", statusColor)}>
                                                    {statusLabel}
                                                </Badge>
                                                {item.attachments && item.attachments.length > 0 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        📎 {item.attachments.length}
                                                    </span>
                                                )}
                                                {item.retryCount > 0 && (
                                                    <span className="text-[9px] text-muted-foreground">
                                                        🔄 {item.retryCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDateDisplay(item.sentAt)}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
                                            {item.subject}
                                        </p>

                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            {item.sentBy && (
                                                <span>👤 {item.sentBy}</span>
                                            )}
                                            {item.messageId && (
                                                <span>📧 {item.messageId.substring(0, 8)}...</span>
                                            )}
                                            {item.errorMessage && (
                                                <span className="text-red-500 truncate max-w-[200px]">
                                                    ❌ {item.errorMessage}
                                                </span>
                                            )}
                                        </div>
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

OutgoingEmailList.displayName = "OutgoingEmailList";

// ============================================================
// ===== Helper function (مطابق لـ OutgoingEmailDetail) =====
// ============================================================

function getStatusEnum(status: any): EmailStatus {
    if (typeof status === 'number') {
        return status as EmailStatus;
    }
    
    if (typeof status === 'string') {
        const statusMap: Record<string, EmailStatus> = {
            'Pending': EmailStatus.Pending,
            'Sent': EmailStatus.Sent,
            'Failed': EmailStatus.Failed,
            'RetryPending': EmailStatus.RetryPending,
            '0': EmailStatus.Pending,
            '1': EmailStatus.Sent,
            '2': EmailStatus.Failed,
            '3': EmailStatus.RetryPending,
        };
        return statusMap[status] ?? EmailStatus.Pending;
    }
    
    return EmailStatus.Pending;
}