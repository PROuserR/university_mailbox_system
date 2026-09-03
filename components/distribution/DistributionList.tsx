// ============================================================
// ===== components/distribution/DistributionList.tsx (المصحح) =====
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DistributionResponseByIdDto } from "@/types/api/distribution.types";
import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Loader2, Eye, EyeOff, Paperclip, User, Calendar, FileText } from "lucide-react"; // ✅ استخدام أيقونات Lucide

interface DistributionListProps {
  items: DistributionResponseByIdDto[];
  selectedId: number | null;
  onSelectItem: (id: number) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

// ============================================================
// ===== Helper: Format date =====
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

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    Pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    Read: { label: "مقروء", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    Ignored: { label: "متجاهل", color: "bg-gray-100 text-gray-600 border-gray-300" },
    Rejected: { label: "مرفوض", color: "bg-rose-100 text-rose-700 border-rose-300" },
    Revoked: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-300" },
    PendingApproval: { label: "بانتظار الموافقة", color: "bg-purple-100 text-purple-700 border-purple-300" },
  };
  const s = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-600 border-gray-300" };
  return (
    <Badge className={cn("text-[8px] px-1.5 py-0.5", s.color)}>
      {s.label}
    </Badge>
  );
};

const getMainTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    Incoming: "وارد",
    Outgoing: "صادر",
    Internal: "داخلي",
  };
  return labels[type] || type;
};

// ============================================================
// ===== Distribution Item =====
// ============================================================

interface DistributionItemProps {
  item: DistributionResponseByIdDto;
  selectedId: number | null;
  onSelectItem: (id: number) => void;
}

function DistributionItem({ item, selectedId, onSelectItem }: DistributionItemProps) {
  const isSelected = selectedId === item.id;

  return (
    <div
      onClick={() => onSelectItem(item.id)}
      className={cn(
        "w-full border-b border-border p-4 text-right transition-all cursor-pointer hover:bg-muted/50",
        isSelected && "bg-muted/70 border-r-4 border-r-primary"
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary">
            {item.fullName?.charAt(0) || "م"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {item.fullName || "مستخدم غير معروف"}
              </span>
              <span className="text-xs text-muted-foreground">
                #{item.correspondenceNumber || "—"}
              </span>
              {getStatusBadge(item.status)}
              {item.mainType && (
                <Badge variant="outline" className="text-[8px] px-1.5 py-0.5">
                  {getMainTypeLabel(item.mainType)}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateDisplay(item.distributedDate)}
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
            {item.correspondenceTitle || "بدون عنوان"}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {/* ✅ أيقونة المستخدم - مفرغة */}
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {item.distributorName || "غير معروف"}
            </span>
            
            {/* ✅ أيقونة مقروء/غير مقروء - مفرغة */}
            {item.isRead ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Eye className="h-3 w-3" />
                مقروء
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400">
                <EyeOff className="h-3 w-3" />
                غير مقروء
              </span>
            )}
            
            {/* ✅ أيقونة المرفقات - مفرغة */}
            {item.attachments && item.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {item.attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ===== Loading Skeleton =====
// ============================================================

const LoadingSkeleton = () => (
  <div className="p-4 border-b border-border animate-pulse">
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="flex gap-4">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// ===== Main Component =====
// ============================================================

export const DistributionList = forwardRef<HTMLDivElement, DistributionListProps>(
  (
    {
      items,
      selectedId,
      onSelectItem,
      isLoading = false,
      hasNextPage = false,
      isFetchingNextPage = false,
      fetchNextPage,
    },
    ref
  ) => {
    const observerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ===== Intersection Observer for Infinite Scroll =====
    useEffect(() => {
      if (!observerRef.current || !fetchNextPage || !hasNextPage || isFetchingNextPage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 0.1, root: containerRef.current }
      );

      observer.observe(observerRef.current);

      return () => {
        if (observerRef.current) {
          observer.unobserve(observerRef.current);
        }
      };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (isLoading && items.length === 0) {
      return (
        <div ref={ref} className="flex h-full flex-col">
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <p>لا توجد توزيعات</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="flex flex-col h-full overflow-y-auto hide-scrollbar">
        {items.map((item) => (
          <DistributionItem
            key={item.id}
            item={item}
            selectedId={selectedId}
            onSelectItem={onSelectItem}
          />
        ))}

        {/* ===== Observer for Infinite Scroll ===== */}
        {hasNextPage && (
          <div ref={observerRef} className="flex items-center justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">جاري تحميل المزيد...</span>
              </div>
            ) : (
              <div className="h-4" />
            )}
          </div>
        )}
      </div>
    );
  }
);

DistributionList.displayName = "DistributionList";