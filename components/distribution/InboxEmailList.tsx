// components/distribution/InboxEmailList.tsx
"use client";

import { format } from "date-fns";
import { forwardRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DistributionInboxDto } from "@/types/api/distribution";
import { Loader2 } from "lucide-react";

interface InboxEmailListProps {
  items: DistributionInboxDto[];
  selectedId: number | null;
  onSelectItem: (id: number) => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

export const InboxEmailList = forwardRef<HTMLDivElement, InboxEmailListProps>(
  ({ items, selectedId, onSelectItem, isLoadingMore, hasMore }, ref) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "اليوم";
      if (diffDays === 1) return "أمس";
      if (diffDays < 7) return `منذ ${diffDays} أيام`;
      return format(date, "dd/MM/yyyy");
    };

    const getTypeBadge = (mainType: string) => {
      switch (mainType) {
        case "Incoming":
          return <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">وارد</Badge>;
        case "Outgoing":
          return <Badge variant="outline" className="border-green-200 text-green-600 dark:border-green-800 dark:text-green-400">صادر</Badge>;
        case "Internal":
          return <Badge variant="outline" className="border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400">داخلي</Badge>;
        default:
          return null;
      }
    };

    if (items.length === 0) {
      return (
        <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
          لا توجد مراسلات في الوارد
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
                      {item.distributorName?.charAt(0) || "م"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {item.distributorName || "مرسل غير محدد"}
                        </span>
                        {getTypeBadge(item.mainType)}
                        {item.isProfessional && (
                          <Badge variant="outline" className="border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400">
                            مهني
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.distributedDate)}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
                      {item.correspondenceTitle}
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
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            تم تحميل جميع المراسلات
          </div>
        )}
      </div>
    );
  }
);

InboxEmailList.displayName = "InboxEmailList";