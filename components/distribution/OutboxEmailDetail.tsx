// components/distribution/OutboxEmailDetail.tsx
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ReplyIcon,
  ForwardIcon,
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DistributionOutboxDto } from "@/types/api/distribution";
import { downloadAttachment } from "@/services/correspondence.service";
import toast from "react-hot-toast";
import { useState, useRef } from "react";

interface OutboxEmailDetailProps {
  item: DistributionOutboxDto;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
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

export function OutboxEmailDetail({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
}: OutboxEmailDetailProps) {
  const [downloading, setDownloading] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");
  const [isStarred, setIsStarred] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleView = async (attachmentId: number, fileName: string, mimeType: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPreviewLoading(true);
    setPreviewUrl(null);
    setPreviewType(mimeType);
    setPreviewName(fileName);

    try {
      const blob = await downloadAttachment(attachmentId, controller.signal);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name !== "AbortError") toast.error("فشل في تحميل الملف للمعاينة");
      closePreview();
    } finally {
      setPreviewLoading(false);
      abortControllerRef.current = null;
    }
  };

  const closePreview = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewLoading(false);
    setPreviewType("");
    setPreviewName("");
  };

  const handleDownload = async (attachmentId: number) => {
    setDownloading(attachmentId);
    try {
      const blob = await downloadAttachment(attachmentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachmentId.toString();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تحميل المرفق");
    } catch {
      toast.error("فشل التحميل");
    } finally {
      setDownloading(null);
    }
  };

  const getTypeBadge = (mainType: string | number) => {
  if (typeof mainType === 'number') {
    switch (mainType) {
      case 1:
        return <Badge variant="incoming">وارد</Badge>;
      case 2:
        return <Badge variant="outgoing">صادر</Badge>;
      case 3:
        return <Badge variant="internal">داخلي</Badge>;
      default:
        return null;
    }
  }
  
  switch (mainType) {
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

      {/* Receiver Info */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {item.receiverName?.charAt(0) || "م"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {item.receiverName || "مستلم غير محدد"}
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

          {/* <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => setIsStarred(!isStarred)}>
              <StarIcon className={cn("h-4 w-4", isStarred && "fill-yellow-500 text-yellow-500")} />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <ReplyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>رد</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <ForwardIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>إعادة توجيه</TooltipContent>
            </Tooltip>
          </div> */}
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
            {item.mainType === "Outgoing" && item.sentDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">📤 تاريخ الإرسال:</span>
                <span>{formatDateShort(item.sentDate)}</span>
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
        
{/* Notes - ملاحظات */}
{item.notes && (
    <div className="border-b border-border p-4">
        <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-foreground">📝 ملاحظات:</span>
            <p className="text-sm text-muted-foreground">{item.notes}</p>
        </div>
    </div>
)}
        {/* Attachments */}
        {item.attachments.length > 0 && (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-emerald-500" />
              <h3 className="font-semibold text-foreground">المرفقات</h3>
              <Badge variant="secondary">{item.attachments.length}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.attachments.map((att) => {
                const Icon = getFileIcon(att.mimeType);
                const gradient = getFileGradient(att.mimeType);
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
                        <p className="truncate text-sm font-medium text-foreground" title={att.fileName}>
                          {att.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">{Math.round(att.fileSize / 1024)} KB</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleView(att.id, att.fileName, att.mimeType)}
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
                            onClick={() => handleDownload(att.id)}
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
          <div className="flex min-h-[300px] items-center justify-center  bg-white p-2 sm:p-4">
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