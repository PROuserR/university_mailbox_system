/* eslint-disable @typescript-eslint/no-explicit-any */
// components/distribution/DistributionDetail.tsx

"use client";

import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendar,
  faUsers,
  faEye,
  faPaperclip,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DistributionResponseByIdDto } from "@/types/api/distribution.types";

interface DistributionDetailProps {
  item: DistributionResponseByIdDto;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

// ============================================================
// ===== Helpers =====
// ============================================================

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (date?: string | null): string => {
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
      {s.label}
    </span>
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

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return faFile;
  if (mimeType.includes("pdf")) return faFile;
  if (mimeType.includes("word") || mimeType.includes("document")) return faFile;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return faFile;
  if (mimeType.includes("image")) return faFile;
  if (mimeType.includes("zip") || mimeType.includes("archive")) return faFile;
  return faFile;
};

// ============================================================
// ===== Main Component =====
// ============================================================

export function DistributionDetail({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
}: DistributionDetailProps) {
  return (
    <div className="flex h-full flex-col bg-card">
      {/* ========== Header ========== */}
      <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="md:hidden">
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </Button>

          <div className="mr-2">{getStatusBadge(item.status)}</div>
        </div>

        <div className="flex items-center gap-2">
          {totalCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {currentIndex !== undefined ? currentIndex + 1 : "?"} / {totalCount}
            </p>
          )}
          <div className="flex items-center">
            <Button variant="ghost" size="icon-sm" onClick={onPrevious} disabled={!hasPrevious}>
              <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onNext} disabled={!hasNext}>
              <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="hidden md:flex">
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ========== تفاصيل المرسل والمعلومات الأساسية ========== */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {item.fullName?.charAt(0) || "م"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {item.fullName || "مستخدم غير معروف"}
                </h2>
                {item.mainType && (
                  <Badge variant="outline">{getMainTypeLabel(item.mainType)}</Badge>
                )}
                {item.isProfessional && <Badge variant="professional">مهني</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>رقم المراسلة: {item.correspondenceNumber || "—"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                  {item.distributorName || "غير معروف"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                  {formatDateShort(item.distributedDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
              <span>{item.receiverId ? "مستلم واحد" : "—"}</span>
            </div>
            {item.isRead && (
              <div className="flex items-center gap-1 text-emerald-600">
                <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                <span>مقروء</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== العنوان ========== */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">
          {item.correspondenceTitle || "بدون عنوان"}
        </h1>
      </div>

      {/* ========== منطقة التمرير ========== */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* ========== معلومات إضافية ========== */}
        <div className="border-b border-border p-4">
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {item.documentType && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">نوع الوثيقة:</span>
                <span className="text-muted-foreground">{item.documentType}</span>
              </div>
            )}
            {item.senderEntity && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">الجهة المرسلة:</span>
                <span className="text-muted-foreground">{item.senderEntity}</span>
              </div>
            )}
            {item.senderReference && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">مرجع المرسل:</span>
                <span className="text-muted-foreground">{item.senderReference}</span>
              </div>
            )}
            {item.notes && (
              <div className="flex items-center gap-2 col-span-2">
                <span className="font-medium text-foreground">📝 ملاحظات:</span>
                <span className="text-muted-foreground">{item.notes}</span>
              </div>
            )}
            {item.rejectionReason && (
              <div className="flex items-center gap-2 col-span-2 text-rose-600">
                <span className="font-medium">❌ سبب الرفض:</span>
                <span>{item.rejectionReason}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {item.issuedDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">📅 تاريخ الإصدار:</span>
                <span>{formatDate(item.issuedDate)}</span>
              </div>
            )}
            {item.readAt && (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="font-medium">👁️ قرأ في:</span>
                <span>{formatDate(item.readAt)}</span>
              </div>
            )}
            {item.approvedAt && (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="font-medium">✅ تاريخ الموافقة:</span>
                <span>{formatDate(item.approvedAt)}</span>
              </div>
            )}
            {item.rejectedAt && (
              <div className="flex items-center gap-2 text-rose-600">
                <span className="font-medium">❌ تاريخ الرفض:</span>
                <span>{formatDate(item.rejectedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========== المحتوى ========== */}
        <div className="border-b border-border p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{
                __html: item.correspondenceContent || "<p class='text-muted-foreground'>لا يوجد محتوى</p>",
              }}
            />
          </div>
        </div>

        {/* ========== المرفقات ========== */}
        {item.attachments && item.attachments.length > 0 && (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faPaperclip} className="h-4 w-4 text-emerald-500" />
              <h3 className="font-semibold text-foreground">المرفقات</h3>
              <Badge variant="secondary">{item.attachments.length}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.attachments.map((att) => {
                const Icon = getFileIcon(att.mimeType);
                const isInline = att.isInline || false;

                return (
                  <div
                    key={att.id}
                    className="group flex w-full max-w-[280px] items-center justify-between rounded-lg border border-border bg-muted/30 p-2 transition-all hover:shadow-md"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100">
                        <FontAwesomeIcon icon={Icon} className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground" title={att.fileName}>
                          {att.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{Math.round(att.fileSize / 1024)} KB</span>
                          {att.isPrimary && (
                            <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4">
                              أساسي
                            </Badge>
                          )}
                          {isInline && (
                            <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">
                              مضمن
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}