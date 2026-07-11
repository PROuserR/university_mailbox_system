// components/correspondence/CorrespondenceEmailList.tsx

"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CorrespondenceResponse, getMainTypeString } from "@/types/api/correspondence.types";
import { forwardRef } from "react";

interface CorrespondenceEmailListProps {
  items: CorrespondenceResponse[];
  selectedId: number | null;
  onSelectItem: (id: number) => void;
  isLoading?: boolean;
}

export const CorrespondenceEmailList = forwardRef<HTMLDivElement, CorrespondenceEmailListProps>(
  ({ items, selectedId, onSelectItem, isLoading = false }, ref) => {
    const formatDate = (dateString?: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "اليوم";
      if (diffDays === 1) return "أمس";
      if (diffDays < 7) return `منذ ${diffDays} أيام`;
      return format(date, "dd/MM/yyyy");
    };

    const getTypeBadge = (mainType: number) => {
      const typeString = getMainTypeString(mainType);
      switch (typeString) {
        case "Incoming":
          return <Badge variant="incoming">وارد</Badge>;
        case "Outgoing":
          return <Badge variant="outgoing">صادر</Badge>;
        case "Internal":
          return <Badge variant="internal">داخلي</Badge>;
        default:
          return null;
      }
    };

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
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div key={item.id}>
              <button
                onClick={() => onSelectItem(item.id)}
                className={cn(
                  "w-full border-b border-border p-4 text-right transition-all hover:bg-muted/50",
                  isSelected && "bg-muted/70 border-r-4 border-r-primary"
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {item.senderEntity || "جهة غير محددة"}
                        </span>
                        {getTypeBadge(item.mainType)}
                        {item.isProfessional && (
                          <Badge variant="professional">مهني</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.issuedDate)}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
                      {item.title}
                    </p>
                    
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        📎 {item.attachments.length} مرفق
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    );
  }
);

CorrespondenceEmailList.displayName = "CorrespondenceEmailList";