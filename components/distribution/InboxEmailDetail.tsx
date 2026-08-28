/* eslint-disable @typescript-eslint/no-explicit-any */
// components/distribution/InboxEmailDetail.tsx
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldIcon,
  XIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileIcon,
  ImageIcon,
  FileArchiveIcon,
  DownloadIcon,
  EyeIcon,
  CheckCheckIcon,
  Clock,
  UsersIcon,
  MailCheckIcon,
  SendIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DistributionInboxDto } from "@/types/api/distribution.types";
import { downloadAttachment, viewAttachment } from "@/services/correspondence.service";
import toast from "react-hot-toast";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useUserInfoStore from "@/store/userInfoStore";
import { useMarkAsRead } from "@/hooks/useDistribute";

interface InboxEmailDetailProps {
  item: DistributionInboxDto;
  onClose: () => void;
  onMarkAsRead?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
  onRefresh?: () => void;
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return FileTextIcon;
  if (type.includes("word") || type.includes("document")) return FileTextIcon;
  if (type.includes("excel") || type.includes("spreadsheet")) return FileSpreadsheetIcon;
  if (type.includes("image")) return ImageIcon;
  if (type.includes("zip") || type.includes("archive")) return FileArchiveIcon;
  return FileIcon;
}

function getFileGradient(type: string) {
  if (type.includes("pdf")) return { start: "#ef4444", end: "#b91c1c" };
  if (type.includes("word") || type.includes("document")) return { start: "#3b82f6", end: "#1d4ed8" };
  if (type.includes("excel") || type.includes("spreadsheet")) return { start: "#22c55e", end: "#166534" };
  if (type.includes("image")) return { start: "#a855f7", end: "#7e22ce" };
  if (type.includes("zip") || type.includes("archive")) return { start: "#f59e0b", end: "#b45309" };
  return { start: "#6b7280", end: "#4b5563" };
}

export function InboxEmailDetail({
  item,
  onClose,
  onMarkAsRead,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
  onRefresh,
}: InboxEmailDetailProps) {
  const router = useRouter();
  const { role, isHeadOfDepartment, roles } = useUserInfoStore();
  const [downloading, setDownloading] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Modal states - زر واحد مع مودال للملاحظات (اختياري)
  const [markAsReadModalOpen, setMarkAsReadModalOpen] = useState(false);
  const [markAsReadNotes, setMarkAsReadNotes] = useState("");

  // ✅ استخدام الـ Hook الجديد فقط
  const markAsReadMutation = useMarkAsRead(() => {
    setMarkAsReadModalOpen(false);
    setMarkAsReadNotes("");
    if (onRefresh) onRefresh();
    if (onMarkAsRead) onMarkAsRead();
  });

  const isHeadOfDept = role === "HeadOfDepartment" ||
    isHeadOfDepartment === true ||
    roles?.includes("HeadOfDepartment") ||
    false;

  const hasCorrespondenceId = item.correspondenceId !== undefined &&
    item.correspondenceId !== null &&
    item.correspondenceId > 0;

  const showDistributeButton = isHeadOfDept && hasCorrespondenceId;

  // ✅ شرط واحد لعرض زر القراءة - يظهر فقط إذا كانت الرسالة غير مقروءة
  const showMarkAsReadButton = hasCorrespondenceId && !item.isRead;

  const handleView = async (attachmentId: number, fileName: string, mimeType: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPreviewLoading(true);
    setPreviewUrl(null);
    setPreviewType(mimeType || "");
    setPreviewName(fileName || "ملف");

    try {
      const blob = await viewAttachment(attachmentId, controller.signal);

      if (!blob || blob.size === 0) {
        throw new Error("الملف فارغ أو تالف");
      }

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      toast.success("تم تحميل الملف للمعاينة");
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("View error:", error);
        toast.error(error.message || "فشل في تحميل الملف للمعاينة");
        closePreview();
      }
    } finally {
      setPreviewLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    setDownloading(attachmentId);

    try {
      const blob = await downloadAttachment(attachmentId);

      if (!blob || blob.size === 0) {
        throw new Error("الملف فارغ أو تالف");
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `attachment_${attachmentId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      toast.success("تم تحميل المرفق بنجاح");
    } catch (error: any) {
      console.error("Download error:", error);

      if (error.message?.includes("Network") ||
        error.message?.includes("CORS") ||
        error.message?.includes("Failed to fetch")) {
        toast.error("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى");
      } else if (error.message?.includes("404")) {
        toast.error("الملف غير موجود");
      } else if (error.message?.includes("403")) {
        toast.error("ليس لديك صلاحية لتحميل هذا الملف");
      } else {
        toast.error(error.message || "فشل تحميل المرفق");
      }
    } finally {
      setDownloading(null);
    }
  };

  const closePreview = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewLoading(false);
    setPreviewType("");
    setPreviewName("");
  };

  // ===== Handlers =====
  const handleDistribute = () => {
    if (item.correspondenceId) {
      router.push(`/distribution-page?id=${item.correspondenceId}`);
    } else {
      toast.error("لا يوجد مراسلة مرتبطة بهذا البريد للتوزيع");
    }
  };

  // ✅ دالة موحدة للقراءة - تستقبل ملاحظات اختيارية
  const handleMarkAsRead = (notes?: string) => {
    if (!item.correspondenceId) {
      toast.error("لا يوجد مراسلة مرتبطة بهذا البريد");
      return;
    }
    markAsReadMutation.mutate({
      correspondenceId: item.correspondenceId,
      notes: notes || undefined,
    });
  };

  // ✅ فتح المودال لإضافة ملاحظات (اختياري)
  const handleOpenNotesModal = () => {
    setMarkAsReadNotes("");
    setMarkAsReadModalOpen(true);
  };

  // ✅ تأكيد القراءة مع الملاحظات من المودال
  const handleConfirmReadWithNotes = () => {
    handleMarkAsRead(markAsReadNotes || undefined);
  };

  const getTypeBadge = (mainType: string | number) => {
    if (typeof mainType === 'number') {
      switch (mainType) {
        case 1: return <Badge variant="incoming">وارد</Badge>;
        case 2: return <Badge variant="outgoing">صادر</Badge>;
        case 3: return <Badge variant="internal">داخلي</Badge>;
        default: return null;
      }
    }
    switch (mainType) {
      case "Incoming": return <Badge variant="incoming">وارد</Badge>;
      case "Outgoing": return <Badge variant="outgoing">صادر</Badge>;
      case "Internal": return <Badge variant="internal">داخلي</Badge>;
      default: return null;
    }
  };

  const getStatusBadge = () => {
    if (item.isRead) {
      return (
        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
          <CheckCheckIcon className="h-3 w-3" />
          مقروءة
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
        <Clock className="h-3 w-3" />
        غير مقروءة
      </Badge>
    );
  };

  const formatDateShort = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Top Action Bar */}
      <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onClose} className="md:hidden">
                <XIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>إغلاق</TooltipContent>
          </Tooltip>

          {/* ✅ زر قراءة واحد فقط - مع ملاحظات (اختياري) - يظهر فقط إذا كانت الرسالة غير مقروءة */}
          {showMarkAsReadButton && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleOpenNotesModal}
                    disabled={markAsReadMutation.isPending}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {markAsReadMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <MailCheckIcon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تحديد كمقروء مع ملاحظات</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* ✅ زر التوزيع - أيقونة طائرة بجانب زر القراءة */}
          {showDistributeButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDistribute}
                  variant="ghost"
                  size="icon-sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>توزيع</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2">
          {totalCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {currentIndex !== undefined ? currentIndex + 1 : "?"} / {totalCount}
            </p>
          )}
          <div className="flex items-center">
            <Button variant="ghost" size="icon-sm" onClick={onPrevious} disabled={!hasPrevious}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onNext} disabled={!hasNext}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="hidden md:flex">
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ===== Mark as Read Modal ===== */}
      {markAsReadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
            <h2 className="text-lg font-bold mb-2">تحديد البريد كمقروء</h2>
            <p className="text-sm text-gray-500 mb-4">
              الرجاء إدخال ملاحظات <span className="text-gray-400">(اختياري)</span>:
            </p>
            <textarea
              value={markAsReadNotes}
              onChange={(e) => setMarkAsReadNotes(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-blue-400"
              placeholder="أدخل ملاحظاتك هنا (اختياري)..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setMarkAsReadModalOpen(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReadWithNotes}
                disabled={markAsReadMutation.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {markAsReadMutation.isPending ? "جاري..." : "تأكيد القراءة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sender Info */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {item.distributorName?.charAt(0) || "م"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {item.distributorName || "مرسل غير محدد"}
                </h2>
                {getTypeBadge(item.mainType)}
                {item.isProfessional && (
                  <Badge variant="outline" className="border-amber-200 text-amber-600">
                    مهني
                  </Badge>
                )}
                {getStatusBadge()}
              </div>
              <p className="text-xs text-muted-foreground">
                رقم المراسلة: {item.correspondenceNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">{item.correspondenceTitle}</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Additional Info */}
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
          </div>

          {/* Dates */}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {item.issuedDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">📅 تاريخ الإصدار:</span>
                <span>{formatDateShort(item.issuedDate)}</span>
              </div>
            )}
            {item.mainType === "Incoming" && item.receivedDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">📥 تاريخ الاستلام:</span>
                <span>{formatDateShort(item.receivedDate)}</span>
              </div>
            )}
            {item.distributedDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">📤 تاريخ التوزيع:</span>
                <span>{formatDateShort(item.distributedDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="border-b border-border p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: item.correspondenceContent || "<p class='text-muted-foreground'>لا يوجد محتوى</p>" }} />
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="border-b border-border p-4">
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-foreground">📝 ملاحظات:</span>
              <p className="text-sm text-muted-foreground">{item.notes}</p>
            </div>
          </div>
        )}

        {/* Attachments */}
        {item.attachments && item.attachments.length > 0 && (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-emerald-500" />
              <h3 className="font-semibold text-foreground">المرفقات</h3>
              <Badge variant="secondary">{item.attachments.filter(a => a !== null).length}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.attachments.map((att) => {
                if (!att) return null;

                const Icon = getFileIcon(att.mimeType || "");
                const gradient = getFileGradient(att.mimeType || "");
                const displayName = att.fileName || `ملف_${att.id}`;

                return (
                  <div
                    key={att.id}
                    className="group flex w-full max-w-[260px] items-center justify-between rounded-lg border border-border bg-muted/30 p-2 transition-all hover:shadow-md"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                        style={{ background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})` }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground" title={displayName}>
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {att.fileSize ? Math.round(att.fileSize / 1024) : 0} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleView(att.id, displayName, att.mimeType || "")}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>معاينة</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDownload(att.id, displayName)}
                            disabled={downloading === att.id}
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>تحميل</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl || previewLoading} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-h-[85vh] max-w-[95vw] overflow-auto rounded-lg bg-white p-0 shadow-xl sm:max-w-4xl [&_[data-slot=dialog-close]]:hidden" hideCloseButton={true}>
          <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white p-2">
            <DialogTitle className="truncate text-sm font-medium text-foreground sm:text-base">
              {previewName.length > 40 ? previewName.slice(0, 40) + "..." : previewName}
            </DialogTitle>
            <Button variant="ghost" size="icon-sm" onClick={closePreview} className="h-8 w-8">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex min-h-[300px] items-center justify-center bg-white p-2 sm:p-4">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-center text-sm text-muted-foreground">جاري تحميل الملف...</p>
              </div>
            ) : previewUrl ? (
              previewType.startsWith("image/") ? (
                <img src={previewUrl} alt={previewName} className="max-h-[70vh] w-auto rounded-lg object-contain" />
              ) : previewType === "application/pdf" ? (
                <iframe src={previewUrl} className="h-[60vh] w-full rounded-lg sm:h-[70vh]" title={previewName} />
              ) : (
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <FileTextIcon className="h-16 w-16 text-muted-foreground" />
                  <p>لا يمكن معاينة هذا النوع من الملفات</p>
                  <Button onClick={() => window.open(previewUrl!, "_blank")} variant="outline">
                    فتح في نافذة جديدة
                  </Button>
                </div>
              )
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}