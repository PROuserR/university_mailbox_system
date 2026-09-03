/* eslint-disable @typescript-eslint/no-explicit-any */
// components/outgoing-email/OutgoingEmailDetail.tsx

"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
    XIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    EyeIcon,
    MoreVerticalIcon,
    FileTextIcon,
    FileIcon,
    ImageIcon,
    FileArchiveIcon,
    FileSpreadsheetIcon,
    ShieldIcon,
    SendIcon,
    RefreshCwIcon,
    Trash2Icon,
    MailIcon,
    EditIcon,
    RotateCcwIcon,
    WifiIcon,
    Loader2,
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
import { OutgoingEmailHistoryDto, EmailStatus } from "@/types/api/outgoing-email";
import {
    useResendEmail,
    useDeleteEmailHistory,
    useUpdateFailedEmail,
    useTestEmailConnection,
} from "@/hooks/useOutgoingEmail";
import { downloadAttachment, viewAttachment } from "@/services/correspondence.service";
import axios from "axios";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api";

const statusColors: Record<EmailStatus, string> = {
    [EmailStatus.Pending]: "bg-yellow-100 text-yellow-700",
    [EmailStatus.Sent]: "bg-green-100 text-green-700",
    [EmailStatus.Failed]: "bg-red-100 text-red-700",
    [EmailStatus.RetryPending]: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<EmailStatus, string> = {
    [EmailStatus.Pending]: "قيد الانتظار",
    [EmailStatus.Sent]: "مرسل",
    [EmailStatus.Failed]: "فاشل",
    [EmailStatus.RetryPending]: "بانتظار إعادة المحاولة",
};

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

const getStatusEnum = (status: any): EmailStatus => {
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
};

interface OutgoingEmailDetailProps {
    item: OutgoingEmailHistoryDto;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
    onRefresh?: () => void;
    onProcessFailed?: () => void;
    isProcessing?: boolean;
}

export function OutgoingEmailDetail({
    item,
    onClose,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    currentIndex,
    totalCount,
    onRefresh,
    onProcessFailed,
    isProcessing = false,
}: OutgoingEmailDetailProps) {
    const router = useRouter();
    const [downloading, setDownloading] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>("");
    const [previewName, setPreviewName] = useState<string>("");
    const abortControllerRef = useRef<AbortController | null>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resendModalOpen, setResendModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resendData, setResendData] = useState({ newToEmail: "" });
    const [editData, setEditData] = useState({
        newToEmail: "",
        newCcEmail: "",
        newBccEmail: "",
        newSubject: "",
        newCustomBody: "",
        includeAllAttachments: true,
        attachmentIds: [] as number[],
    });

    const statusEnum = getStatusEnum(item.status);

    const isFailed = statusEnum === EmailStatus.Failed;
    const isSent = statusEnum === EmailStatus.Sent;
    const isPending = statusEnum === EmailStatus.Pending || statusEnum === EmailStatus.RetryPending;

    const statusColor = statusColors[statusEnum] || "bg-gray-100 text-gray-700";
    const statusLabel = statusLabels[statusEnum] || item.status;

    // ===== Hooks =====
    const resendMutation = useResendEmail(() => {
        setResendModalOpen(false);
        if (onRefresh) onRefresh();
    });

    const updateMutation = useUpdateFailedEmail(() => {
        setEditModalOpen(false);
        if (onRefresh) onRefresh();
    });

    const deleteMutation = useDeleteEmailHistory(() => {
        setDeleteConfirmOpen(false);
        if (onRefresh) onRefresh();
        onClose();
    });

    const testConnectionMutation = useTestEmailConnection();

    // ===== Test Connection =====
    const handleTestConnection = async () => {
        try {
            await testConnectionMutation.mutateAsync();
        } catch (error) {
        }
    };

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

    // ===== Resend =====
    const handleResend = async () => {
        try {
            // ✅ استخدام mutateAsync للانتظار حتى الرد
            await resendMutation.mutateAsync({
                id: item.id,
                data: {
                    emailHistoryId: item.id,
                    newToEmail: resendData.newToEmail || undefined,
                },
            });
            // التوست يظهر من الـ Hook تلقائياً
            setResendModalOpen(false);
        } catch (error) {
        }
    };

    // ===== Update Failed =====
    const handleUpdateFailed = async () => {
        try {
            // ✅ استخدام mutateAsync للانتظار حتى الرد
            await updateMutation.mutateAsync({
                emailHistoryId: item.id,
                newToEmail: editData.newToEmail || undefined,
                newCcEmail: editData.newCcEmail || undefined,
                newBccEmail: editData.newBccEmail || undefined,
                newSubject: editData.newSubject || undefined,
                newCustomBody: editData.newCustomBody || undefined,
                includeAllAttachments: editData.includeAllAttachments,
                attachmentIds: editData.attachmentIds.length > 0 ? editData.attachmentIds : undefined,
            });
            setEditModalOpen(false);
        } catch (error) {
        }
    };

    // ===== Delete =====
    const handleDelete = () => {
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(item.id);
        } catch (error) {
        }
    };

    // ===== View Correspondence =====
    const handleViewCorrespondence = () => {
        if (item.correspondenceId) {
            router.push(`/correspondences?id=${item.correspondenceId}`);
        }
    };

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

                    {/* ===== Dropdown Menu ===== */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl text-right" sideOffset={5}>
                            {/* اختبار الاتصال */}
                            <DropdownMenuItem
                                onClick={handleTestConnection}
                                disabled={testConnectionMutation.isPending}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors justify-end"
                            >
                                <span>اختبار اتصال البريد</span>
                                <WifiIcon className="h-4 w-4 text-blue-500" />
                            </DropdownMenuItem>

                            {/* معالجة البريد الفاشل */}
                            <DropdownMenuItem
                                onClick={onProcessFailed}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-orange-50 transition-colors justify-end"
                            >
                                <span>معالجة البريد الفاشل</span>
                                <RotateCcwIcon className="h-4 w-4 text-orange-500" />
                            </DropdownMenuItem>

                            {/* إعادة إرسال - فقط للفاشل */}
                            {isFailed && (
                                <DropdownMenuItem
                                    onClick={() => setResendModalOpen(true)}
                                    disabled={resendMutation.isPending}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors justify-end"
                                >
                                    <span>إعادة إرسال</span>
                                    <RefreshCwIcon className="h-4 w-4 text-blue-500" />
                                </DropdownMenuItem>
                            )}

                            {/* تعديل وإعادة إرسال - فقط للفاشل */}
                            {isFailed && (
                                <DropdownMenuItem
                                    onClick={() => setEditModalOpen(true)}
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-yellow-50 transition-colors justify-end"
                                >
                                    <span>تعديل وإعادة إرسال</span>
                                    <EditIcon className="h-4 w-4 text-yellow-500" />
                                </DropdownMenuItem>
                            )}

                            {/* عرض المراسلة */}
                            {item.correspondenceId && (
                                <DropdownMenuItem
                                    onClick={handleViewCorrespondence}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-purple-50 transition-colors justify-end"
                                >
                                    <span>عرض المراسلة</span>
                                    <SendIcon className="h-4 w-4 text-purple-500" />
                                </DropdownMenuItem>
                            )}

                            {/* حذف */}
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
                                <MailIcon className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    إلى: {item.to}
                                </h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>مراسلة #{item.correspondenceId}</span>
                                {item.cc && <span>• Cc: {item.cc}</span>}
                                {item.bcc && <span>• Bcc: {item.bcc}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <p>{formatDateDisplay(item.sentAt)}</p>
                        {item.sentBy && (
                            <p className="text-xs">بواسطة: {item.sentBy}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ========== Subject ========== */}
            <div className="shrink-0 border-b border-border px-4 py-3 bg-card">
                <h1 className="text-lg font-bold text-foreground">{item.subject}</h1>
            </div>

            {/* ========== Status Info ========== */}
            {isFailed && item.errorMessage && (
                <div className="shrink-0 border-b border-border p-3 bg-red-50/30">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">سبب الفشل:</span>
                        <span className="text-red-600">{item.errorMessage}</span>
                        {item.retryCount > 0 && (
                            <span className="text-muted-foreground">• عدد المحاولات: {item.retryCount}</span>
                        )}
                    </div>
                </div>
            )}

            {isSent && item.messageId && (
                <div className="shrink-0 border-b border-border p-3 bg-green-50/30">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">Message ID:</span>
                        <span className="text-muted-foreground">{item.messageId}</span>
                    </div>
                </div>
            )}

            {isPending && (
                <div className="shrink-0 border-b border-border p-3 bg-yellow-50/30">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">الحالة:</span>
                        <span className="text-yellow-600">في انتظار الإرسال</span>
                        {item.retryCount > 0 && (
                            <span className="text-muted-foreground">• عدد المحاولات: {item.retryCount}</span>
                        )}
                    </div>
                </div>
            )}

            {/* ========== Body ========== */}
            <div className="flex-1 overflow-y-auto hide-scrollbar bg-card">
                {item.body && (
                    <div className="p-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: item.body || "<p class='text-muted-foreground'>لا يوجد محتوى</p>",
                                }}
                            />
                        </div>
                    </div>
                )}

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
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
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

            {/* ===== Resend Modal ===== */}
            {resendModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-2">إعادة إرسال البريد</h2>
                        <p className="text-sm text-gray-500 mb-4">يمكنك تغيير البريد الإلكتروني للمستلم (اختياري):</p>

                        <input
                            type="email"
                            value={resendData.newToEmail}
                            onChange={(e) => setResendData({ newToEmail: e.target.value })}
                            placeholder="البريد الإلكتروني الجديد (اختياري)"
                            className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400"
                            disabled={resendMutation.isPending}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            اترك الحقل فارغاً لإعادة الإرسال إلى نفس المستلم
                        </p>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setResendModalOpen(false)}
                                disabled={resendMutation.isPending}
                                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleResend}
                                disabled={resendMutation.isPending}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {resendMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    "تأكيد الإرسال"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Edit & Resend Modal ===== */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">تعديل وإعادة إرسال البريد</h2>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">البريد الإلكتروني للمستلم</label>
                                <input
                                    type="email"
                                    value={editData.newToEmail}
                                    onChange={(e) => setEditData({ ...editData, newToEmail: e.target.value })}
                                    placeholder="example@domain.com"
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    disabled={updateMutation.isPending}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Cc</label>
                                    <input
                                        type="email"
                                        value={editData.newCcEmail}
                                        onChange={(e) => setEditData({ ...editData, newCcEmail: e.target.value })}
                                        placeholder="cc@domain.com"
                                        className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                                        disabled={updateMutation.isPending}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Bcc</label>
                                    <input
                                        type="email"
                                        value={editData.newBccEmail}
                                        onChange={(e) => setEditData({ ...editData, newBccEmail: e.target.value })}
                                        placeholder="bcc@domain.com"
                                        className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                                        disabled={updateMutation.isPending}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">الموضوع</label>
                                <input
                                    type="text"
                                    value={editData.newSubject}
                                    onChange={(e) => setEditData({ ...editData, newSubject: e.target.value })}
                                    placeholder="الموضوع"
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm"
                                    disabled={updateMutation.isPending}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">نص مخصص</label>
                                <textarea
                                    value={editData.newCustomBody}
                                    onChange={(e) => setEditData({ ...editData, newCustomBody: e.target.value })}
                                    rows={3}
                                    className="w-full mt-1 border rounded-xl p-2.5 text-sm resize-none focus:outline-none focus:border-blue-400"
                                    placeholder="أضف نصاً مخصصاً..."
                                    disabled={updateMutation.isPending}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={editData.includeAllAttachments}
                                        onChange={(e) => setEditData({ ...editData, includeAllAttachments: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300"
                                        disabled={updateMutation.isPending}
                                    />
                                    تضمين جميع المرفقات
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                disabled={updateMutation.isPending}
                                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleUpdateFailed}
                                disabled={updateMutation.isPending}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        جاري المعالجة...
                                    </>
                                ) : (
                                    "تأكيد الإرسال"
                                )}
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
                message="هل أنت متأكد من حذف هذا السجل؟ هذا الإجراء لا يمكن التراجع عنه."
                confirmText="تأكيد الحذف"
                variant="danger"
                icon={Trash2Icon}
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