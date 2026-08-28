/* eslint-disable @typescript-eslint/no-explicit-any */
// components/incoming-email/IncomingEmailDetail.tsx

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
    XIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    EyeIcon,
    CheckIcon,
    XIcon as XIcon2,
    SkipForwardIcon,
    Undo2Icon,
    MoreVerticalIcon,
    FileTextIcon,
    FileIcon,
    ImageIcon,
    FileArchiveIcon,
    FileSpreadsheetIcon,
    RefreshCwIcon,
    SendIcon,
    ShieldIcon,
    Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IncomingEmailDto, IncomingEmailStatus } from "@/types/api/incoming-email";
import { 
    useApproveEmail, 
    useRejectEmail, 
    useSkipEmail, 
    useReopenEmail,
    useDeleteIncomingEmail,
} from "@/hooks/useIncomingEmail";
import { useDocumentTypes, useSenderEntities } from "@/hooks/useCorrespondence";
import { downloadAttachment, viewAttachment } from "@/services/correspondence.service";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { EmailContent } from "../ui/EmailContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api";

// ============================================================
// ===== Helper: Convert status to enum =====
// ============================================================

const getStatusEnum = (status: any): IncomingEmailStatus => {
    if (typeof status === 'number') {
        return status as IncomingEmailStatus;
    }
    
    if (typeof status === 'string') {
        const statusMap: Record<string, IncomingEmailStatus> = {
            'Pending': IncomingEmailStatus.Pending,
            'Rejected': IncomingEmailStatus.Rejected,
            'Converted': IncomingEmailStatus.Converted,
            'Skipped': IncomingEmailStatus.Skipped,
            '0': IncomingEmailStatus.Pending,
            '1': IncomingEmailStatus.Rejected,
            '2': IncomingEmailStatus.Converted,
            '3': IncomingEmailStatus.Skipped,
        };
        return statusMap[status] ?? IncomingEmailStatus.Pending;
    }
    
    return IncomingEmailStatus.Pending;
};

// ============================================================
// ===== Helper: Get today's date in local format =====
// ============================================================

const getTodayLocalDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================================
// ===== Helper: Convert local date to UTC =====
// ============================================================

const localDateToUTC = (localDate: string): string => {
    if (!localDate) return "";
    
    const [year, month, day] = localDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
};

// ============================================================
// ===== Helpers =====
// ============================================================

function getFileIcon(type: string | null) {
    if (!type) return FileIcon;
    if (type.includes("pdf")) return FileTextIcon;
    if (type.includes("word") || type.includes("document")) return FileTextIcon;
    if (type.includes("excel") || type.includes("spreadsheet")) return FileSpreadsheetIcon;
    if (type.includes("image")) return ImageIcon;
    if (type.includes("zip") || type.includes("archive")) return FileArchiveIcon;
    return FileIcon;
}

function getFileGradient(type: string | null) {
    if (!type) return { start: "#6b7280", end: "#4b5563" };
    if (type.includes("pdf")) return { start: "#ef4444", end: "#b91c1c" };
    if (type.includes("word") || type.includes("document")) return { start: "#3b82f6", end: "#1d4ed8" };
    if (type.includes("excel") || type.includes("spreadsheet")) return { start: "#22c55e", end: "#166534" };
    if (type.includes("image")) return { start: "#a855f7", end: "#7e22ce" };
    if (type.includes("zip") || type.includes("archive")) return { start: "#f59e0b", end: "#b45309" };
    return { start: "#6b7280", end: "#4b5563" };
}

// ============================================================
// ===== IncomingEmailDetail Component =====
// ============================================================

interface IncomingEmailDetailProps {
    item: IncomingEmailDto;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
    onRefresh?: () => void;
    statusColors: Record<IncomingEmailStatus, string>;
    statusLabels: Record<IncomingEmailStatus, string>;
}

export function IncomingEmailDetail({
    item,
    onClose,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    currentIndex,
    totalCount,
    onRefresh,
    statusColors,
    statusLabels,
}: IncomingEmailDetailProps) {
    const router = useRouter();
    const [downloading, setDownloading] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>("");
    const [previewName, setPreviewName] = useState<string>("");
    const abortControllerRef = useRef<AbortController | null>(null);

    // ===== Document Types & Sender Entities =====
    const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } = useDocumentTypes();
    const { data: senderEntities = [], isLoading: isLoadingSenderEntities } = useSenderEntities();

    // ===== Confirm Delete Modal =====
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // ===== Approve Modal State =====
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approveData, setApproveData] = useState({
        number: "",
        documentTypeId: 0,
        senderEntityId: 0,
        senderReference: "",
        issuedDate: getTodayLocalDate(),
        receivedDate: getTodayLocalDate(),
        isProfessional: false,
        notes: "",
    });

    const [rejectReason, setRejectReason] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    const [skipNotes, setSkipNotes] = useState("");
    const [skipModalOpen, setSkipModalOpen] = useState(false);

    const [reopenNotes, setReopenNotes] = useState("");
    const [reopenModalOpen, setReopenModalOpen] = useState(false);

    // ===== Mutations =====
    const approveMutation = useApproveEmail(() => {
        setApproveModalOpen(false);
        if (onRefresh) onRefresh();
    });

    const rejectMutation = useRejectEmail(() => {
        setRejectModalOpen(false);
        if (onRefresh) onRefresh();
    });

    const skipMutation = useSkipEmail(() => {
        setSkipModalOpen(false);
        if (onRefresh) onRefresh();
    });

    const reopenMutation = useReopenEmail(() => {
        setReopenModalOpen(false);
        if (onRefresh) onRefresh();
    });

    const deleteMutation = useDeleteIncomingEmail(() => {
        setDeleteConfirmOpen(false);
        if (onRefresh) onRefresh();
        onClose();
    });

    const statusEnum = getStatusEnum(item.status);
    const statusColor = statusColors[statusEnum] || "bg-gray-100 text-gray-700";
    const statusLabel = statusLabels[statusEnum] || item.status;
    const isPending = statusEnum === IncomingEmailStatus.Pending;
    const isSkipped = statusEnum === IncomingEmailStatus.Skipped;
    const isConverted = statusEnum === IncomingEmailStatus.Converted;
    const isRejected = statusEnum === IncomingEmailStatus.Rejected;

    // ===== View / Download =====
    const handleView = async (attachment: any) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setPreviewLoading(true);
        setPreviewUrl(null);
        setPreviewType(attachment.contentType || "");
        setPreviewName(attachment.fileName);

        try {
            const blob = await viewAttachment(attachment.id, controller.signal);
            if (!blob || blob.size === 0) {
                throw new Error("الملف فارغ أو تالف");
            }
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("View error:", error);
            }
            closePreview();
        } finally {
            setPreviewLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleDownload = async (attachment: any) => {
        setDownloading(attachment.id);
        try {
            const url = `${API_BASE_URL}/Attachments/${attachment.id}/download?t=${Date.now()}`;
            const response = await axios.get(url, {
                responseType: "blob",
                withCredentials: true,
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = response.data;
            if (!(blob instanceof Blob) || blob.size === 0) {
                throw new Error("الملف فارغ أو تالف");
            }

            const urlBlob = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlBlob;
            a.download = attachment.fileName || `attachment_${attachment.id}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(urlBlob), 1000);
        } catch (error: any) {
            console.error("Download error:", error);
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

    // ===== Approve =====
    const handleApprove = () => {
        if (!approveData.number || !approveData.documentTypeId || !approveData.senderEntityId) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }
        
        const issuedDateUTC = approveData.issuedDate ? localDateToUTC(approveData.issuedDate) : undefined;
        const receivedDateUTC = approveData.receivedDate ? localDateToUTC(approveData.receivedDate) : undefined;
        
        approveMutation.mutate({
            id: item.id,
            data: {
                number: parseInt(approveData.number),
                documentTypeId: approveData.documentTypeId,
                senderEntityId: approveData.senderEntityId,
                senderReference: approveData.senderReference || undefined,
                issuedDate: issuedDateUTC ? new Date(issuedDateUTC) : undefined,
                receivedDate: receivedDateUTC ? new Date(receivedDateUTC) : undefined,
                isProfessional: approveData.isProfessional,
                notes: approveData.notes || undefined,
            },
        });
    };

    // ===== Delete =====
    const handleDelete = () => {
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(item.id);
    };

    // ===== Navigate to Correspondence =====
    const handleViewCorrespondence = () => {
        if (item.correspondenceId) {
            router.push(`/correspondences?id=${item.correspondenceId}`);
        }
    };

    // ===== Document Types Options =====
    const documentTypeOptions = useMemo(() => {
        return documentTypes.map((doc) => ({
            id: doc.id,
            displayName: doc.name,
        }));
    }, [documentTypes]);

    // ===== Sender Entities Options =====
    const senderEntityOptions = useMemo(() => {
        return senderEntities.map((entity) => ({
            id: entity.id,
            displayName: entity.name,
        }));
    }, [senderEntities]);

    return (
        <div className="flex h-full flex-col bg-card">
            {/* ========== Header ========== */}
            <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-2 bg-card">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon-sm" onClick={onClose} className="md:hidden">
                        <XIcon className="h-4 w-4" />
                    </Button>

                    <Badge className={cn("text-[10px]", statusColor)}>
                        {statusLabel}
                    </Badge>

                    {item.correspondenceNumber && (
                        <Badge variant="outline" className="text-[10px]">
                            مراسلة #{item.correspondenceNumber}
                        </Badge>
                    )}

                    {/* ===== Dropdown Menu ===== */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg rounded-xl text-right" sideOffset={5}>
                            {/* 1. جلب البريد من صندوق البريد */}
                            <DropdownMenuItem
                                onClick={onRefresh}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                            >
                                <span>جلب البريد من صندوق البريد</span>
                                <RefreshCwIcon className="h-4 w-4 text-blue-500" />
                            </DropdownMenuItem>

                            {/* 2. Approve - فقط لـ Pending */}
                            {isPending && (
                                <DropdownMenuItem
                                    onClick={() => setApproveModalOpen(true)}
                                    disabled={approveMutation.isPending}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors justify-end"
                                >
                                    <span>الموافقة وتحويل إلى مراسلة</span>
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                </DropdownMenuItem>
                            )}

                            {/* 3. Reject - فقط لـ Pending */}
                            {isPending && (
                                <DropdownMenuItem
                                    onClick={() => setRejectModalOpen(true)}
                                    disabled={rejectMutation.isPending}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-red-50 transition-colors justify-end"
                                >
                                    <span>رفض</span>
                                    <XIcon2 className="h-4 w-4 text-red-500" />
                                </DropdownMenuItem>
                            )}

                            {/* 4. Skip - فقط لـ Pending */}
                            {isPending && (
                                <DropdownMenuItem
                                    onClick={() => setSkipModalOpen(true)}
                                    disabled={skipMutation.isPending}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors justify-end"
                                >
                                    <span>تخطي</span>
                                    <SkipForwardIcon className="h-4 w-4 text-gray-500" />
                                </DropdownMenuItem>
                            )}

                            {/* 5. Reopen - لـ Skipped و Rejected */}
                            {(isSkipped || isRejected) && (
                                <DropdownMenuItem
                                    onClick={() => setReopenModalOpen(true)}
                                    disabled={reopenMutation.isPending}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors justify-end"
                                >
                                    <span>إعادة فتح</span>
                                    <Undo2Icon className="h-4 w-4 text-blue-500" />
                                </DropdownMenuItem>
                            )}

                            {/* 6. View Correspondence - فقط لـ Converted */}
                            {isConverted && item.correspondenceId && (
                                <DropdownMenuItem
                                    onClick={handleViewCorrespondence}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-purple-50 transition-colors justify-end"
                                >
                                    <span>عرض المراسلة</span>
                                    <SendIcon className="h-4 w-4 text-purple-500" />
                                </DropdownMenuItem>
                            )}

                            {/* 7. Delete - في جميع الحالات */}
                            <DropdownMenuItem
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-red-50 transition-colors text-red-500 justify-end"
                            >
                                <span>حذف</span>
                                <Trash2Icon className="h-4 w-4" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

            {/* ========== Sender Info ========== */}
            <div className="shrink-0 border-b border-border p-4 bg-card">
                <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex gap-3">
                        <Avatar className="size-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {item.fromName?.charAt(0) || item.from.charAt(0) || "م"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    {item.fromName || item.from}
                                </h2>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.from}</p>
                        </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <p>{format(new Date(item.receivedAt), "dd/MM/yyyy HH:mm", { locale: arSA })}</p>
                    </div>
                </div>

                <div className="mt-2 space-y-0.5 text-sm">
                    <p><span className="font-medium text-foreground">إلى:</span> <span className="text-muted-foreground">{item.to}</span></p>
                    {item.cc && <p><span className="font-medium text-foreground">Cc:</span> <span className="text-muted-foreground">{item.cc}</span></p>}
                    {item.bcc && <p><span className="font-medium text-foreground">Bcc:</span> <span className="text-muted-foreground">{item.bcc}</span></p>}
                </div>
            </div>

            {/* ========== Subject ========== */}
            <div className="shrink-0 border-b border-border px-4 py-3 bg-card">
                <h1 className="text-lg font-bold text-foreground">{item.subject || "(بدون موضوع)"}</h1>
            </div>

            {/* ========== Status Info ========== */}
            {isConverted && item.correspondenceNumber && (
                <div className="shrink-0 border-b border-border p-3 bg-green-50/30">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">تم التحويل إلى مراسلة:</span>
                        <button
                            onClick={handleViewCorrespondence}
                            className="text-blue-600 font-semibold hover:underline cursor-pointer"
                        >
                            #{item.correspondenceNumber}
                        </button>
                        {item.correspondenceTitle && (
                            <span className="text-muted-foreground">- {item.correspondenceTitle}</span>
                        )}
                    </div>
                </div>
            )}

            {isRejected && item.rejectionReason && (
                <div className="shrink-0 border-b border-border p-3 bg-red-50/30">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">سبب الرفض:</span>
                        <span className="text-red-600">{item.rejectionReason}</span>
                    </div>
                </div>
            )}

            {isSkipped && (
                <div className="shrink-0 border-b border-border p-3 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">تم تخطي هذا البريد</span>
                    </div>
                </div>
            )}

            {/* ========== Body ========== */}
            <div className="flex-1 overflow-y-auto hide-scrollbar bg-card">
                <div className="p-4">
                    <EmailContent 
                        html={item.bodyHtml} 
                        text={item.body}
                        attachments={item.attachments}
                    />
                </div>

                {/* ========== Attachments ========== */}
                {item.attachments && item.attachments.length > 0 && (
                    <div className="p-4 border-t border-border bg-card">
                        <div className="mb-3 flex items-center gap-2">
                            <ShieldIcon className="h-4 w-4 text-emerald-500" />
                            <h3 className="font-semibold text-foreground">المرفقات</h3>
                            <Badge variant="secondary">{item.attachments.length}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {item.attachments.map((att) => {
                                const Icon = getFileIcon(att.contentType);
                                const gradient = getFileGradient(att.contentType);
                                const isImage = att.contentType?.startsWith('image/') || false;
                                const isPdf = att.contentType === 'application/pdf';

                                return (
                                    <div
                                        key={att.id}
                                        className="group flex w-full max-w-[260px] items-center justify-between rounded-lg border border-border bg-muted/30 p-2 transition-all hover:shadow-md"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                                                style={{
                                                    background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})`,
                                                }}
                                            >
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="truncate text-sm font-medium text-foreground"
                                                    title={att.fileName}
                                                >
                                                    {att.fileName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {Math.round(att.fileSize / 1024)} KB
                                                    {att.isInline && (
                                                        <span className="mr-2 text-blue-500">(مضمنة)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                                            {isImage || isPdf ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                onClick={() => handleView(att)}
                                                                disabled={previewLoading}
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>معاينة</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                disabled
                                                                className="opacity-30"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>لا يمكن معاينة هذا النوع</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleDownload(att)}
                                                            disabled={downloading === att.id}
                                                        >
                                                            <DownloadIcon className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>تحميل</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Approve Modal with Dropdowns ===== */}
            {approveModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">الموافقة على البريد الوارد</h2>
                            <button onClick={() => setApproveModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">رقم المراسلة *</label>
                                <input
                                    type="number"
                                    value={approveData.number}
                                    onChange={(e) => setApproveData({ ...approveData, number: e.target.value })}
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="أدخل رقم المراسلة"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">نوع المستند *</label>
                                <select
                                    value={approveData.documentTypeId || ""}
                                    onChange={(e) => setApproveData({ ...approveData, documentTypeId: parseInt(e.target.value) || 0 })}
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                                    required
                                >
                                    <option value="">اختر نوع المستند...</option>
                                    {documentTypeOptions.map((doc) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.displayName}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingDocumentTypes && (
                                    <p className="text-xs text-muted-foreground mt-1">جاري تحميل أنواع المستندات...</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">جهة الإرسال *</label>
                                <select
                                    value={approveData.senderEntityId || ""}
                                    onChange={(e) => setApproveData({ ...approveData, senderEntityId: parseInt(e.target.value) || 0 })}
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                                    required
                                >
                                    <option value="">اختر جهة الإرسال...</option>
                                    {senderEntityOptions.map((entity) => (
                                        <option key={entity.id} value={entity.id}>
                                            {entity.displayName}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingSenderEntities && (
                                    <p className="text-xs text-muted-foreground mt-1">جاري تحميل جهات الإرسال...</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">مرجع المرسل</label>
                                <input
                                    type="text"
                                    value={approveData.senderReference}
                                    onChange={(e) => setApproveData({ ...approveData, senderReference: e.target.value })}
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="مرجع المرسل (اختياري)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">تاريخ الإصدار</label>
                                    <input
                                        type="date"
                                        value={approveData.issuedDate}
                                        onChange={(e) => setApproveData({ ...approveData, issuedDate: e.target.value })}
                                        className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">تاريخ الاستلام</label>
                                    <input
                                        type="date"
                                        value={approveData.receivedDate}
                                        onChange={(e) => setApproveData({ ...approveData, receivedDate: e.target.value })}
                                        className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={approveData.isProfessional}
                                        onChange={(e) => setApproveData({ ...approveData, isProfessional: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    مراسلة مهنية
                                </label>
                            </div>

                            <div>
                                <label className="text-sm font-medium">ملاحظات</label>
                                <textarea
                                    value={approveData.notes}
                                    onChange={(e) => setApproveData({ ...approveData, notes: e.target.value })}
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm resize-none h-20 focus:outline-none focus:border-blue-400"
                                    placeholder="ملاحظات (اختياري)"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setApproveModalOpen(false)}
                                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={approveMutation.isPending || !approveData.number || !approveData.documentTypeId || !approveData.senderEntityId}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {approveMutation.isPending ? "جاري المعالجة..." : "تأكيد الموافقة"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Reject Modal ===== */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-2">رفض البريد</h2>
                        <p className="text-sm text-gray-500 mb-4">الرجاء إدخال سبب الرفض (اختياري):</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-blue-400"
                            placeholder="سبب الرفض..."
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setRejectModalOpen(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                إلغاء
                            </button>
                            <button
                                onClick={() => rejectMutation.mutate({ id: item.id, reason: rejectReason || undefined })}
                                disabled={rejectMutation.isPending}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {rejectMutation.isPending ? "جاري..." : "تأكيد الرفض"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Skip Modal ===== */}
            {skipModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-2">تخطي البريد</h2>
                        <p className="text-sm text-gray-500 mb-4">الرجاء إدخال ملاحظات التخطي (اختياري):</p>
                        <textarea
                            value={skipNotes}
                            onChange={(e) => setSkipNotes(e.target.value)}
                            className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-blue-400"
                            placeholder="ملاحظات التخطي..."
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setSkipModalOpen(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                إلغاء
                            </button>
                            <button
                                onClick={() => skipMutation.mutate({ id: item.id, notes: skipNotes || undefined })}
                                disabled={skipMutation.isPending}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {skipMutation.isPending ? "جاري..." : "تأكيد التخطي"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Reopen Modal ===== */}
            {reopenModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-2">إعادة فتح البريد</h2>
                        <p className="text-sm text-gray-500 mb-4">الرجاء إدخال ملاحظات إعادة الفتح (اختياري):</p>
                        <textarea
                            value={reopenNotes}
                            onChange={(e) => setReopenNotes(e.target.value)}
                            className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-blue-400"
                            placeholder="ملاحظات إعادة الفتح..."
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setReopenModalOpen(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                إلغاء
                            </button>
                            <button
                                onClick={() => reopenMutation.mutate({ id: item.id, notes: reopenNotes || undefined })}
                                disabled={reopenMutation.isPending}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {reopenMutation.isPending ? "جاري..." : "تأكيد إعادة الفتح"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirmation Modal ===== */}
            <ConfirmationModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا البريد؟ سيتم حذف البريد وجميع مرفقاته. هذا الإجراء لا يمكن التراجع عنه."
                confirmText="تأكيد الحذف"
                variant="danger"
                icon={faTrash}
            />

            {/* ===== Preview Dialog ===== */}
            <Dialog
                open={!!previewUrl || previewLoading}
                onOpenChange={(open) => !open && closePreview()}
            >
                <DialogContent className="max-h-[85vh] max-w-[95vw] overflow-auto rounded-lg bg-white p-0 shadow-xl sm:max-w-4xl [&_[data-slot=dialog-close]]:hidden">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white p-2">
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
                                <img
                                    src={previewUrl}
                                    alt={previewName}
                                    className="max-h-[70vh] w-auto rounded-lg object-contain"
                                />
                            ) : previewType === "application/pdf" ? (
                                <iframe
                                    src={`${previewUrl}#toolbar=1`}
                                    className="h-[60vh] w-full rounded-lg sm:h-[70vh]"
                                    title={previewName}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 p-8 text-center">
                                    <FileTextIcon className="h-16 w-16 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">لا يمكن معاينة هذا النوع من الملفات</p>
                                    <Button
                                        onClick={() => window.open(previewUrl, "_blank")}
                                        variant="outline"
                                    >
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