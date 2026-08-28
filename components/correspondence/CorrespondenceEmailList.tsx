// components/correspondence/CorrespondenceEmailList.tsx

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CorrespondenceResponse } from "@/types/api/correspondence.types";
import { forwardRef, useState } from "react";
import { ChevronDown, ChevronUp, Reply, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCorrespondenceWithReplies } from "@/hooks/useCorrespondence";
import { getStatusLabel, getStatusColor } from "@/types/api/correspondence.types";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface CorrespondenceEmailListProps {
    items: CorrespondenceResponse[];
    selectedId: number | null;
    onSelectItem: (id: number) => void;
    isLoading?: boolean;
}

// ============================================================
// ===== Helper: Format date as local DD/MM/YYYY =====
// ============================================================

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

// ============================================================
// ===== Sub-component for rendering a single item with replies =====
// ============================================================

interface CorrespondenceItemWithRepliesProps {
    item: CorrespondenceResponse;
    selectedId: number | null;
    onSelectItem: (id: number) => void;
    depth?: number;
    isChild?: boolean;
}

function CorrespondenceItemWithReplies({
    item,
    selectedId,
    onSelectItem,
    depth = 0,
    isChild = false,
}: CorrespondenceItemWithRepliesProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: repliesData, isLoading: repliesLoading } = useCorrespondenceWithReplies(
        isExpanded ? item.id : null
    );

    const hasReplies = repliesData?.replies && repliesData.replies.length > 0;
    const repliesCount = repliesData?.replies?.length || 0;
    const isSelected = selectedId === item.id;

    const statusLabel = getStatusLabel(item.status || 'Draft');
    const statusColor = getStatusColor(item.status || 'Draft');

    const isFromIncomingEmail = item.isFromIncomingEmail || false;

    const getTypeBadge = (mainType: string | number) => {
        let label = '';
        let variant: 'incoming' | 'outgoing' | 'internal' | 'default' = 'default';

        if (typeof mainType === 'number') {
            switch (mainType) {
                case 1:
                    label = 'وارد';
                    variant = 'incoming';
                    break;
                case 2:
                    label = 'صادر';
                    variant = 'outgoing';
                    break;
                case 3:
                    label = 'داخلي';
                    variant = 'internal';
                    break;
                default:
                    return null;
            }
        } else {
            switch (mainType) {
                case "Incoming":
                    label = 'وارد';
                    variant = 'incoming';
                    break;
                case "Outgoing":
                    label = 'صادر';
                    variant = 'outgoing';
                    break;
                case "Internal":
                    label = 'داخلي';
                    variant = 'internal';
                    break;
                default:
                    return null;
            }
        }

        return (
            <Badge variant={variant} className="text-[8px] px-1.5 py-0.5">
                {label}
            </Badge>
        );
    };

    const toggleReplies = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div style={{ paddingRight: depth * 20 }}>
            <div
                onClick={() => onSelectItem(item.id)}
                className={cn(
                    "w-full border-b border-border p-4 text-right transition-all cursor-pointer hover:bg-muted/50",
                    isSelected && "bg-muted/70 border-r-4 border-r-primary",
                    depth > 0 && "bg-muted/20"
                )}
            >
                <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {item.senderEntity?.charAt(0) || "ج"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {depth > 0 && (
                                    <Reply className="h-3 w-3 text-muted-foreground" />
                                )}
                                <span className="text-sm font-semibold text-foreground">
                                    {item.senderEntity || "جهة غير محددة"}
                                </span>
                                {getTypeBadge(item.mainType)}
                                {item.isProfessional && (
                                    <Badge variant="professional" className="text-[8px] px-1.5 py-0.5">
                                        مهني
                                    </Badge>
                                )}
                                {depth > 0 && (
                                    <Badge variant="outline" className="text-[8px] px-1.5 py-0.5">رد</Badge>
                                )}
                                {isFromIncomingEmail && (
                                    <Badge variant="incoming" className="text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-700">
                                        📧 بريد وارد
                                    </Badge>
                                )}
                                <Badge className={cn("text-[8px] px-1.5 py-0.5", statusColor)}>
                                    {statusLabel}
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatDateDisplay(item.issuedDate)}
                            </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
                            {item.title}
                        </p>

                        {/* ✅ معلومات إضافية مع عدد المرفقات بجانبها */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.createdBy && (
                                <span>👤 {item.createdBy}</span>
                            )}
                            {item.totalReceivers > 0 && (
                                <span>📨 {item.totalReceivers} مستقبل</span>
                            )}
                            {item.readCount > 0 && (
                                <span>👁️ {item.readCount} مقروء</span>
                            )}
                            {item.attachments && item.attachments.length > 0 && (
                                <span>📎 {item.attachments.length}</span>
                            )}
                        </div>

                        {(item.repliesCount > 0 || hasReplies) && (
                            <div className="mt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleReplies}
                                    className="h-6 px-2 text-xs text-blue-500 hover:text-blue-700"
                                    disabled={repliesLoading}
                                    type="button"
                                >
                                    {repliesLoading ? (
                                        <>
                                            <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                                            جاري التحميل...
                                        </>
                                    ) : isExpanded ? (
                                        <>
                                            <ChevronUp className="h-3 w-3 ml-1" />
                                            إخفاء الردود ({repliesCount || item.repliesCount || 0})
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                            عرض الردود ({repliesCount || item.repliesCount || 0})
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-r-2 border-blue-100">
                    {repliesLoading ? (
                        <div className="flex items-center justify-center py-4 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            <span className="text-sm">جاري تحميل الردود...</span>
                        </div>
                    ) : hasReplies ? (
                        repliesData.replies!.map((reply) => (
                            <CorrespondenceItemWithReplies
                                key={reply.id}
                                item={reply}
                                selectedId={selectedId}
                                onSelectItem={onSelectItem}
                                depth={depth + 1}
                                isChild={true}
                            />
                        ))
                    ) : (
                        <div className="py-2 pr-8 text-sm text-muted-foreground">
                            لا توجد ردود
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================================
// ===== Main Component =====
// ============================================================

export const CorrespondenceEmailList = forwardRef<HTMLDivElement, CorrespondenceEmailListProps>(
    ({ items, selectedId, onSelectItem, isLoading = false }, ref) => {
        if (isLoading) {
            return (
                <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm">جاري تحميل المراسلات...</p>
                    </div>
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-lg">📭</p>
                        <p>لا توجد مراسلات</p>
                    </div>
                </div>
            );
        }

        return (
            <div ref={ref} className="flex flex-col">
                {items.map((item) => (
                    <CorrespondenceItemWithReplies
                        key={item.id}
                        item={item}
                        selectedId={selectedId}
                        onSelectItem={onSelectItem}
                        depth={0}
                    />
                ))}
            </div>
        );
    }
);

CorrespondenceEmailList.displayName = "CorrespondenceEmailList";