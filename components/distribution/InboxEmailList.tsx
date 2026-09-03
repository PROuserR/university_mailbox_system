// components/distribution/InboxEmailList.tsx
"use client";

import { format } from "date-fns";
import { forwardRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DistributionInboxDto } from "@/types/api/distribution.types";
import { Loader2, Building, Paperclip, Eye, EyeOff } from "lucide-react";

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
          return <Badge variant="outline" className="text-[8px] px-1.5 py-0.5 border-blue-200 text-blue-600">وارد</Badge>;
        case "Outgoing":
          return <Badge variant="outline" className="text-[8px] px-1.5 py-0.5 border-green-200 text-green-600">صادر</Badge>;
        case "Internal":
          return <Badge variant="outline" className="text-[8px] px-1.5 py-0.5 border-purple-200 text-purple-600">داخلي</Badge>;
        default:
          return null;
      }
    };

    // ✅ استخراج الجهة المرسلة
    const getSenderDisplay = (item: DistributionInboxDto) => {
      if (item.senderEntity) {
        return item.senderEntity;
      }
      return item.distributorName || "جهة غير محددة";
    };

    if (items.length === 0) {
      return (
        <div ref={ref} className="flex h-full items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">📭</div>
            <p>لا توجد مراسلات في الوارد</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="flex flex-col">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const senderDisplay = getSenderDisplay(item);
          
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
                      {senderDisplay?.charAt(0) || "ج"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* ✅ اسم المرسل (الجهة) في الأعلى */}
                        <span className="text-sm font-semibold text-foreground">
                          {senderDisplay}
                        </span>
                        {getTypeBadge(item.mainType)}
                        {item.isProfessional && (
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0.5 border-amber-200 text-amber-600">
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
                    
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {/* ✅ الموزع/المرسل (في الأسفل) */}
                      {item.distributorName && (
                        <span className="flex items-center gap-1">
                          👤 {item.distributorName}
                        </span>
                      )}

                      {/* ✅ حالة القراءة */}
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

                      {/* ✅ المرفقات */}
                      {item.attachments && item.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {item.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
        
        {/* ===== Infinite Scroll ===== */}
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