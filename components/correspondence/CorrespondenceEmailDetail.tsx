/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
// src/components/correspondence/CorrespondenceEmailDetail.tsx

"use client";
import { useSendEmail } from "@/hooks/useOutgoingEmail";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    ArchiveIcon,
    FolderOpenIcon,
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
    SendIcon,
    EditIcon,
    InfoIcon,
    MoreVerticalIcon,
    Trash2Icon,
    CheckCircleIcon,
    Undo2Icon,
    XCircleIcon,
    UserIcon,
    CalendarIcon,
    UsersIcon,
    EyeIcon as EyeIcon2,
    Loader2,
    MailIcon,
    CheckIcon,
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
import {
    CorrespondenceResponse,
    CorrespondenceStatus,
    getStatusLabel,
    getStatusColor,
} from "@/types/api/correspondence.types";
import { Attachment } from "@/types/api/Attachment";
import {
    approveRevertToDistributed,
    approveRevertToDraft,
    archiveCorrespondence,
    deleteCorrespondence,
    downloadAttachment,
    rejectRevertToDistributed,
    rejectRevertToDraft,
    requestApproval,
    requestRevertToDistributed,
    requestRevertToDraft,
    restoreFromArchive,
    revertToDistributed,
    revertToDraft,
    signCorrespondence,
    viewAttachment,
} from "@/services/correspondence.service";
import { useUserRole } from "@/hooks/useUserRole";
import { PermissionGate } from "@/components/auth/PermissionGate";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { EmailContent } from "@/components/ui/EmailContent";
import toast from "react-hot-toast";
import { useState, useRef, useMemo } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import axios from "axios";

// ============================================================
// ===== API Base URL =====
// ============================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7236/api";

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
// ===== Component =====
// ============================================================

interface CorrespondenceEmailDetailProps {
    item: CorrespondenceResponse;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
    onRefresh?: () => void;
}

export function CorrespondenceEmailDetail({
    item,
    onClose,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    currentIndex,
    totalCount,
    onRefresh,
}: CorrespondenceEmailDetailProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDean, isEmployee } = useUserRole();

    const [downloading, setDownloading] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>("");
    const [previewName, setPreviewName] = useState<string>("");
    const abortControllerRef = useRef<AbortController | null>(null);

    // ============================================================
    // ===== State for Confirmation Modal =====
    // ============================================================

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalConfirmText, setModalConfirmText] = useState('');
    const [modalVariant, setModalVariant] = useState<'danger' | 'warning' | 'success'>('danger');
    const [modalAction, setModalAction] = useState<() => Promise<void>>(async () => {});

    // ============================================================
    // ===== State for Sign Options Modal =====
    // ============================================================

    const [signModalOpen, setSignModalOpen] = useState(false);
    const [signOptions, setSignOptions] = useState({
        autoIgnoreUnread: false,
        autoRejectPendingApproval: false,
        forceSign: false,
    });

    // ============================================================
    // ===== State for Reason Modal =====
    // ============================================================

    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [reasonModalTitle, setReasonModalTitle] = useState('');
    const [reasonModalMessage, setReasonModalMessage] = useState('');
    const [reasonModalConfirmText, setReasonModalConfirmText] = useState('');
    const [reasonModalVariant, setReasonModalVariant] = useState<'danger' | 'warning' | 'success'>('warning');
    const [reasonModalAction, setReasonModalAction] = useState<(reason: string) => Promise<void>>(async () => {});
    const [reasonText, setReasonText] = useState('');

    // ============================================================
    // ===== Refresh Function =====
    // ============================================================

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["correspondences"] });
        queryClient.invalidateQueries({ queryKey: ["correspondence", item.id] });
        queryClient.invalidateQueries({ queryKey: ["correspondence", item.id, "with-replies"] });
        router.refresh();
        if (onRefresh) onRefresh();
    };

    // ============================================================
    // ===== تحديد الأزرار حسب الدور والحالة =====
    // ============================================================

    const status = item.status as string;

    const showButtons = useMemo(() => {
        const isDraft = status === 'Draft';
        const isPendingApproval = status === 'PendingApproval';
        const isDistributed = status === 'Distributed';
        const isSigned = status === 'Signed';
        const isArchived = status === 'Archived';

        const employeeButtons = {
            showEdit: isDraft,
            showDistribute: isDraft || isPendingApproval || isDistributed,
            showStatusReport: true,
            showRequestApproval: isPendingApproval,
            showSign: isDistributed || isPendingApproval,
            showRevertToDraft: isDistributed,
            showArchive: isSigned,
            showRequestRevertToDistributed: isSigned,
            showRequestRevertToDraft: isSigned,
            showRestore: isArchived,
            showRevertToDistributed: false,
            showApproveRevert: false,
            showRejectRevert: false,
            showDelete: isDraft,
        };

        const deanButtons = {
            showEdit: isDraft || isPendingApproval || isDistributed || isSigned,
            showDistribute: isDraft || isPendingApproval || isDistributed,
            showStatusReport: true,
            showRequestApproval: false,
            showSign: isDistributed || isPendingApproval,
            showRevertToDraft: isDistributed || isPendingApproval || isSigned,
            showArchive: isSigned,
            showRequestRevertToDistributed: false,
            showRequestRevertToDraft: false,
            showRestore: isArchived,
            showRevertToDistributed: isSigned,
            showApproveRevert: isSigned,
            showRejectRevert: isSigned,
            showDelete: true,
        };

        return isDean ? deanButtons : employeeButtons;
    }, [status, isDean]);

    // ============================================================
    // ===== Confirmation Modal Helpers =====
    // ============================================================
const sendEmailMutation = useSendEmail(() => {
    toast.success("تم إرسال البريد بنجاح");
    refresh();
});
const [sendModalOpen, setSendModalOpen] = useState(false);
const [sendData, setSendData] = useState({
    toEmail: "",
    ccEmail: "",
    bccEmail: "",
    subject: "",
    customBody: "",
    includeAllAttachments: true,
    selectedAttachmentIds: [] as number[], // ✅ مرفقات محددة
});
const handleIncludeAllAttachmentsChange = (checked: boolean) => {
    setSendData(prev => ({
        ...prev,
        includeAllAttachments: checked,
        selectedAttachmentIds: checked ? [] : prev.selectedAttachmentIds,
    }));
};
const toggleAttachmentSelection = (attachmentId: number) => {
    if (sendData.includeAllAttachments) {
        // ✅ إذا كان "تضمين الكل" مفعلاً، نقوم بإلغائه
        setSendData(prev => ({
            ...prev,
            includeAllAttachments: false,
            selectedAttachmentIds: [attachmentId],
        }));
        return;
    }

    setSendData(prev => ({
        ...prev,
        selectedAttachmentIds: prev.selectedAttachmentIds.includes(attachmentId)
            ? prev.selectedAttachmentIds.filter(id => id !== attachmentId)
            : [...prev.selectedAttachmentIds, attachmentId],
    }));
};

const handleSendEmail = () => {
    if (!sendData.toEmail) {
        toast.error("يرجى إدخال البريد الإلكتروني للمستلم");
        return;
    }

    let attachmentIds: number[] | undefined;
    
    if (sendData.includeAllAttachments) {
        attachmentIds = item.attachments?.map(att => att.id) || [];
    } else if (sendData.selectedAttachmentIds.length > 0) {
        attachmentIds = sendData.selectedAttachmentIds;
    } else {
        attachmentIds = undefined;
    }

    sendEmailMutation.mutate({
        correspondenceId: item.id,
        toEmail: sendData.toEmail,
        ccEmail: sendData.ccEmail || undefined,
        bccEmail: sendData.bccEmail || undefined,
        subject: sendData.subject || item.title,
        customBody: sendData.customBody || undefined,
        includeAllAttachments: sendData.includeAllAttachments,
        attachmentIds: attachmentIds,
    });
    setSendModalOpen(false);
};
    // ============================================================

    const openConfirmationModal = (
        title: string,
        message: string,
        confirmText: string,
        variant: 'danger' | 'warning' | 'success',
        action: () => Promise<void>
    ) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalConfirmText(confirmText);
        setModalVariant(variant);
        setModalAction(() => action);
        setModalOpen(true);
    };

    const handleConfirm = async () => {
        try {
            await modalAction();
        } catch (error) {
            // الخطأ يتم عرضه داخل الدالة
        } finally {
            setModalOpen(false);
        }
    };

    // ============================================================
    // ===== Reason Modal Helpers =====
    // ============================================================

    const openReasonModal = (
        title: string,
        message: string,
        confirmText: string,
        variant: 'danger' | 'warning' | 'success',
        action: (reason: string) => Promise<void>
    ) => {
        setReasonModalTitle(title);
        setReasonModalMessage(message);
        setReasonModalConfirmText(confirmText);
        setReasonModalVariant(variant);
        setReasonModalAction(() => action);
        setReasonText('');
        setReasonModalOpen(true);
    };

    const handleReasonConfirm = async () => {
        try {
            await reasonModalAction(reasonText);
            setReasonModalOpen(false);
            setReasonText('');
        } catch (error) {
            // الخطأ يتم عرضه داخل الدالة
        }
    };

    // ============================================================
    // ===== Handlers =====
    // ============================================================

    const handleDistribute = () => {
        router.push(`/distribution-page?id=${item.id}`);
    };

    const handleEdit = () => {
        router.push(`/correspondences/${item.id}/edit`);
    };

    const handleDistributionStatus = () => {
        router.push(`/correspondences/${item.id}/distribution-status`);
    };

    const handleRequestApproval = async () => {
        try {
            await requestApproval(item.id);
            toast.success("تم طلب موافقة العميد بنجاح");
            refresh();
        } catch (error: any) {
            toast.error(error.message || "فشل طلب الموافقة");
        }
    };

    // ===== Sign with Options =====

    const openSignOptionsModal = () => {
        setSignOptions({
            autoIgnoreUnread: false,
            autoRejectPendingApproval: false,
            forceSign: false,
        });
        setSignModalOpen(true);
    };

    const handleSignWithOptions = async () => {
        try {
            const result = await signCorrespondence(item.id, signOptions);
            toast.success(result.message || "تم توقيع المراسلة بنجاح");
            setSignModalOpen(false);
            refresh();
        } catch (error: any) {
            toast.error(error.message || "فشل توقيع المراسلة");
        }
    };

    // ===== Archive / Restore =====

    const handleArchive = () => {
        openConfirmationModal(
            'تأكيد الأرشفة',
            'هل أنت متأكد من أرشفة هذه المراسلة؟ ستكون متاحة للاسترجاع لاحقاً.',
            'تأكيد الأرشفة',
            'warning',
            async () => {
                try {
                    await archiveCorrespondence(item.id);
                    toast.success("تم أرشفة المراسلة بنجاح");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل أرشفة المراسلة");
                    throw error;
                }
            }
        );
    };

    const handleRestore = () => {
        openConfirmationModal(
            'تأكيد الاسترجاع من الأرشيف',
            'هل أنت متأكد من استرجاع هذه المراسلة من الأرشيف؟',
            'تأكيد الاسترجاع',
            'success',
            async () => {
                try {
                    await restoreFromArchive(item.id);
                    toast.success("تم استرجاع المراسلة من الأرشيف بنجاح");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل استرجاع المراسلة");
                    throw error;
                }
            }
        );
    };

    // ===== Revert =====

    const handleRevertToDraft = () => {
        openConfirmationModal(
            'تأكيد الاسترجاع إلى مسودة',
            'هل أنت متأكد من استرجاع هذه المراسلة إلى مسودة؟ سيتم إلغاء جميع التوزيعات.',
            'تأكيد الاسترجاع',
            'warning',
            async () => {
                try {
                    await revertToDraft(item.id);
                    toast.success("تم استرجاع المراسلة إلى مسودة بنجاح");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل استرجاع المراسلة");
                    throw error;
                }
            }
        );
    };

    const handleRevertToDistributed = () => {
        openReasonModal(
            'تأكيد الاسترجاع إلى موزعة',
            'الرجاء إدخال سبب الاسترجاع (اختياري):',
            'تأكيد الاسترجاع',
            'warning',
            async (reason: string) => {
                try {
                    await revertToDistributed(item.id, reason || undefined);
                    toast.success("تم استرجاع المراسلة إلى موزعة بنجاح");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل استرجاع المراسلة");
                    throw error;
                }
            }
        );
    };

    // ===== Request Revert =====

    const handleRequestRevertToDraft = () => {
        openReasonModal(
            'طلب استرجاع إلى مسودة',
            'الرجاء إدخال سبب طلب الاسترجاع:',
            'إرسال الطلب',
            'warning',
            async (reason: string) => {
                try {
                    await requestRevertToDraft(item.id, reason || undefined);
                    toast.success("تم إرسال طلب الاسترجاع إلى العميد بنجاح");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل إرسال طلب الاسترجاع");
                    throw error;
                }
            }
        );
    };

    const handleRequestRevertToDistributed = () => {
        openReasonModal(
            'طلب استرجاع إلى موزعة',
            'الرجاء إدخال سبب طلب الاسترجاع:',
            'إرسال الطلب',
            'warning',
            async (reason: string) => {
                try {
                    await requestRevertToDistributed(item.id, reason || undefined);
                    toast.success("تم إرسال طلب الاسترجاع إلى العميد بنجاح");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل إرسال طلب الاسترجاع");
                    throw error;
                }
            }
        );
    };

    // ===== Approve / Reject Revert =====

    const handleApproveRevertToDraft = async  () => {
        openReasonModal(
            'موافقة على استرجاع إلى مسودة',
            'الرجاء إدخال سبب الموافقة (اختياري):',
            'تأكيد الموافقة',
            'success',
            async (reason: string) => {
                try {
                    await approveRevertToDraft(item.id, reason || undefined);
                    toast.success("تمت الموافقة على استرجاع المراسلة إلى مسودة");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل الموافقة على الاسترجاع");
                    throw error;
                }
            }
        );
    };

    const handleApproveRevertToDistributed = async  () => {
        openReasonModal(
            'موافقة على استرجاع إلى موزعة',
            'الرجاء إدخال سبب الموافقة (اختياري):',
            'تأكيد الموافقة',
            'success',
            async (reason: string) => {
                try {
                    await approveRevertToDistributed(item.id, reason || undefined);
                    toast.success("تمت الموافقة على استرجاع المراسلة إلى موزعة");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل الموافقة على الاسترجاع");
                    throw error;
                }
            }
        );
    };

    const handleRejectRevertToDraft = async  () => {
        openReasonModal(
            'رفض استرجاع إلى مسودة',
            'الرجاء إدخال سبب الرفض (اختياري):',
            'تأكيد الرفض',
            'danger',
            async (reason: string) => {
                try {
                    await rejectRevertToDraft(item.id, reason || undefined);
                    toast.success("تم رفض طلب الاسترجاع");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل رفض طلب الاسترجاع");
                    throw error;
                }
            }
        );
    };

    const handleRejectRevertToDistributed = async () => {
        openReasonModal(
            'رفض استرجاع إلى موزعة',
            'الرجاء إدخال سبب الرفض (اختياري):',
            'تأكيد الرفض',
            'danger',
            async (reason: string) => {
                try {
                    await rejectRevertToDistributed(item.id, reason || undefined);
                    toast.success("تم رفض طلب الاسترجاع");
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل رفض طلب الاسترجاع");
                    throw error;
                }
            }
        );
    };

    // ===== Delete =====

    const handleDelete = async  () => {
        openConfirmationModal(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذه المراسلة؟ هذا الإجراء لا يمكن التراجع عنه.',
            'تأكيد الحذف',
            'danger',
            async () => {
                try {
                    await deleteCorrespondence(item.id);
                    toast.success("تم حذف المراسلة بنجاح");
                    onClose();
                    refresh();
                } catch (error: any) {
                    toast.error(error.message || "فشل حذف المراسلة");
                    throw error;
                }
            }
        );
    };

    // ============================================================
    // ===== View / Download =====
    // ============================================================

    const handleView = async (attachment: Attachment) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setPreviewLoading(true);
        setPreviewUrl(null);
        setPreviewType(attachment.mimeType || "");
        setPreviewName(attachment.fileName);

        try {
            const blob = await viewAttachment(attachment.id, controller.signal);

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
            abortControllerRef.current = null;
        }
    };

    const timestampRef = useRef<number>(Date.now());

    const handleDownload = async (attachment: Attachment) => {
        setDownloading(attachment.id);

        timestampRef.current = Date.now();

        try {
            const url = `${API_BASE_URL}/Attachments/${attachment.id}/download?t=${timestampRef.current}`;

            const response = await axios.get(url, {
                responseType: 'blob',
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

            setTimeout(() => {
                URL.revokeObjectURL(urlBlob);
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

    // ============================================================
    // ===== Close Preview =====
    // ============================================================

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

    // ============================================================
    // ===== Helpers =====
    // ============================================================

    const getTypeBadge = (mainType: string | number) => {
        if (typeof mainType === "number") {
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

    const statusLabel = getStatusLabel(item.status || 'Draft');
    const statusColor = getStatusColor(item.status || 'Draft');

    // ✅ تحديد ما إذا كانت المراسلة من البريد الوارد
    const isFromIncomingEmail = item.isFromIncomingEmail || false;

    // ✅ تحويل المرفقات إلى الصيغة المطلوبة لـ EmailContent
    const emailAttachments = useMemo(() => {
        return item.attachments?.map((att) => ({
            id: att.id,
            fileName: att.fileName,
            fileSize: att.fileSize,
            contentType: att.mimeType || 'application/octet-stream',
            fileIdentifier: att.fileIdentifier || '',
            isInline: att.isInline || false,
            contentId: att.contentId || undefined,
            uploadedBy: att.uploadedBy,
            uploadedAt: att.uploadedAt,
            isPrimary: att.isPrimary,
        })) || [];
    }, [item.attachments]);

    return (
        <div className="flex h-full flex-col bg-card">
            {/* ========== Header ========== */}
            <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-2">
                <div className="flex items-center gap-1 flex-wrap">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon-sm" onClick={onClose} className="md:hidden">
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>إغلاق</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl text-right"
                            sideOffset={5}
                        >
                            {showButtons.showEdit && (
                                <PermissionGate permissions={['EditCorrespondence']}>
                                    <DropdownMenuItem
                                        onClick={handleEdit}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>تعديل</span>
                                        <EditIcon className="h-4 w-4 text-amber-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showDistribute && (
                                <PermissionGate permissions={['CreateDistribution']}>
                                    <DropdownMenuItem
                                        onClick={handleDistribute}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>توزيع</span>
                                        <SendIcon className="h-4 w-4 text-blue-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showStatusReport && (
                                <PermissionGate permissions={['ViewDistributionDetails']}>
                                    <DropdownMenuItem
                                        onClick={handleDistributionStatus}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>تقرير حالة التوزيع</span>
                                        <InfoIcon className="h-4 w-4 text-purple-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRequestApproval && !isDean && (
                                <PermissionGate permissions={['EditCorrespondence']}>
                                    <DropdownMenuItem
                                        onClick={handleRequestApproval}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>طلب موافقة العميد</span>
                                        <CheckCircleIcon className="h-4 w-4 text-yellow-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showSign && (
                                <PermissionGate permissions={['SignCorrespondence']}>
                                    <DropdownMenuItem
                                        onClick={openSignOptionsModal}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>توقيع المراسلة</span>
                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showArchive && (
                                <PermissionGate permissions={['ApproveArchive']}>
                                    <DropdownMenuItem
                                        onClick={handleArchive}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>أرشفة</span>
                                        <ArchiveIcon className="h-4 w-4 text-purple-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRestore && (
                                <PermissionGate permissions={['RestoreArchive']}>
                                    <DropdownMenuItem
                                        onClick={handleRestore}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>استرجاع من الأرشيف</span>
                                        <FolderOpenIcon className="h-4 w-4 text-blue-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRevertToDraft && (
                                <PermissionGate permissions={['EditCorrespondence']}>
                                    <DropdownMenuItem
                                        onClick={handleRevertToDraft}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>استرجاع إلى مسودة</span>
                                        <Undo2Icon className="h-4 w-4 text-red-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRevertToDistributed && isDean && (
                                <PermissionGate permissions={['EditCorrespondence']}>
                                    <DropdownMenuItem
                                        onClick={handleRevertToDistributed}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>استرجاع إلى موزعة</span>
                                        <Undo2Icon className="h-4 w-4 text-orange-500" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRequestRevertToDraft && !isDean && (
                                <PermissionGate permissions={['RequestRevert']}>
                                    <DropdownMenuItem
                                        onClick={handleRequestRevertToDraft}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>طلب استرجاع إلى مسودة</span>
                                        <Undo2Icon className="h-4 w-4 text-red-400" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRequestRevertToDistributed && !isDean && (
                                <PermissionGate permissions={['RequestRevert']}>
                                    <DropdownMenuItem
                                        onClick={handleRequestRevertToDistributed}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>طلب استرجاع إلى موزعة</span>
                                        <Undo2Icon className="h-4 w-4 text-orange-400" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showApproveRevert && isDean && (
                                <PermissionGate permissions={['ApproveRevert']}>
                                    <DropdownMenuItem
                                        onClick={handleApproveRevertToDraft}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>موافقة على استرجاع إلى مسودة</span>
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showApproveRevert && isDean && (
                                <PermissionGate permissions={['ApproveRevert']}>
                                    <DropdownMenuItem
                                        onClick={handleApproveRevertToDistributed}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>موافقة على استرجاع إلى موزعة</span>
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRejectRevert && isDean && (
                                <PermissionGate permissions={['ApproveRevert']}>
                                    <DropdownMenuItem
                                        onClick={handleRejectRevertToDraft}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>رفض استرجاع إلى مسودة</span>
                                        <XCircleIcon className="h-4 w-4 text-red-600" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showRejectRevert && isDean && (
                                <PermissionGate permissions={['ApproveRevert']}>
                                    <DropdownMenuItem
                                        onClick={handleRejectRevertToDistributed}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors justify-end"
                                    >
                                        <span>رفض استرجاع إلى موزعة</span>
                                        <XCircleIcon className="h-4 w-4 text-red-600" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}

                            {showButtons.showDelete && (
                                <PermissionGate permissions={['DeleteCorrespondence']}>
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-red-50 transition-colors text-red-500 justify-end"
                                    >
                                        <span>حذف</span>
                                        <Trash2Icon className="h-4 w-4" />
                                    </DropdownMenuItem>
                                </PermissionGate>
                            )}
                            {/* ============================================================ */}
{/* ===== إرسال كبريد إلكتروني - فقط للمراسلات غير المسودة ===== */}
{/* ============================================================ */}
{status !== 'Draft' && (
    <PermissionGate permissions={['ManageOutgoingEmail']}>
        <DropdownMenuItem
            onClick={() => setSendModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors justify-end"
        >
            <span>إرسال كبريد إلكتروني</span>
            <MailIcon className="h-4 w-4 text-blue-500" />
        </DropdownMenuItem>
    </PermissionGate>
)}
                        </DropdownMenuContent>

                    </DropdownMenu>

                    <div className="mr-2">
                        <Badge className={cn("text-[10px]", statusColor)}>
                            {statusLabel}
                        </Badge>
                    </div>

                    {isFromIncomingEmail && (
                        <Badge variant="incoming" className="text-[10px] bg-blue-100 text-blue-700">
                            📧 بريد وارد
                        </Badge>
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

            {/* ========== تفاصيل المرسل والمعلومات الأساسية ========== */}
            <div className="shrink-0 border-b border-border p-4">
                <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex gap-3">
                        <Avatar className="size-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {item.senderEntity?.charAt(0) || "ج"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    {item.senderEntity || "جهة غير محددة"}
                                </h2>
                                {getTypeBadge(item.mainType)}
                                {item.isProfessional && <Badge variant="professional">مهني</Badge>}
                                {isFromIncomingEmail && (
                                    <Badge variant="incoming" className="bg-blue-100 text-blue-700">📧 بريد وارد</Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>رقم: {item.number}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    {item.createdBy || "غير معروف"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {formatDateDisplay(item.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            <span>{item.totalReceivers} مستقبل</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <EyeIcon2 className="h-3 w-3" />
                            <span>{item.readCount} مقروء</span>
                        </div>
                        {item.updatedAt && (
                            <div className="flex items-center gap-1">
                                <span>آخر تحديث: {formatDateDisplay(item.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========== العنوان ========== */}
            <div className="shrink-0 border-b border-border px-4 py-3">
                <h1 className="text-lg font-bold text-foreground">{item.title}</h1>
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
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        {item.issuedDate && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">📅 تاريخ الإصدار:</span>
                                <span>{formatDateDisplay(item.issuedDate)}</span>
                            </div>
                        )}
                        {item.mainType === 1 && item.receivedDate && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">📥 تاريخ الاستلام:</span>
                                <span>{formatDateDisplay(item.receivedDate)}</span>
                            </div>
                        )}
                        {item.mainType === 2 && item.sentDate && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">📤 تاريخ الإرسال:</span>
                                <span>{formatDateDisplay(item.sentDate)}</span>
                            </div>
                        )}
                        {item.approvedAt && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">✅ تاريخ الموافقة:</span>
                                <span>{formatDateDisplay(item.approvedAt)}</span>
                            </div>
                        )}
                        {item.archivedAt && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">📦 تاريخ الأرشفة:</span>
                                <span>{formatDateDisplay(item.archivedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========== المحتوى ========== */}
                <div className="border-b border-border p-4">
                    {isFromIncomingEmail ? (
                        (item.content && item.content.trim() !== '') ? (
                            <EmailContent 
                                html={item.content || undefined}
                                text={item.content || undefined}
                                attachments={emailAttachments}
                            />
                        ) : (
                            <p className="text-muted-foreground">لا يوجد محتوى</p>
                        )
                    ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: item.content || "<p class='text-muted-foreground'>لا يوجد محتوى</p>",
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* ========== المرفقات ========== */}
                {item.attachments && item.attachments.length > 0 && (
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
                                
                                const isInline = att.isInline || false;
                                
                                return (
                                    <div
                                        key={att.id}
                                        className="group flex w-full max-w-[280px] items-center justify-between rounded-lg border border-border bg-muted/30 p-2 transition-all hover:shadow-md"
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
                                                    
                                                    {att.uploadedBy && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            · {att.uploadedBy}
                                                        </span>
                                                    )}
                                                </div>
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

            {/* ========== نافذة معاينة المرفقات ========== */}
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
                                    src={previewUrl}
                                    className="h-[60vh] w-full rounded-lg sm:h-[70vh]"
                                    title={previewName}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 p-8 text-center">
                                    <FileTextIcon className="h-16 w-16 text-muted-foreground" />
                                    <p>لا يمكن معاينة هذا النوع من الملفات</p>
                                    <Button
                                        onClick={() => window.open(previewUrl!, "_blank")}
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

            {/* ========== Confirmation Modal ========== */}
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                title={modalTitle}
                message={modalMessage}
                confirmText={modalConfirmText}
                variant={modalVariant}
            />

            {/* ========== Sign Options Modal ========== */}
            {signModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">خيارات التوقيع</h2>
                            
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={signOptions.autoIgnoreUnread}
                                        onChange={(e) => setSignOptions(prev => ({ ...prev, autoIgnoreUnread: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">تجاهل التوزيعات غير المقروءة تلقائياً</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={signOptions.autoRejectPendingApproval}
                                        onChange={(e) => setSignOptions(prev => ({ ...prev, autoRejectPendingApproval: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">رفض التوزيعات المعلقة تلقائياً</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={signOptions.forceSign}
                                        onChange={(e) => setSignOptions(prev => ({ ...prev, forceSign: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">توقيع إجباري (تجاوز التحذيرات)</span>
                                </label>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => setSignModalOpen(false)}
                                    className="flex-1 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSignWithOptions}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-semibold transition"
                                >
                                    تأكيد التوقيع
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Reason Modal ========== */}
            {reasonModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">{reasonModalTitle}</h2>
                            <p className="text-sm text-gray-500 mb-4">{reasonModalMessage}</p>
                            
                            <textarea
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400 resize-none h-24"
                                placeholder="أدخل السبب..."
                            />

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        setReasonModalOpen(false);
                                        setReasonText('');
                                    }}
                                    className="flex-1 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleReasonConfirm}
                                    className={`flex-1 py-2 rounded-xl text-white font-semibold transition ${
                                        reasonModalVariant === 'danger' 
                                            ? 'bg-red-500 hover:bg-red-600' 
                                            : reasonModalVariant === 'success'
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-yellow-500 hover:bg-yellow-600'
                                    }`}
                                >
                                    {reasonModalConfirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            

{sendModalOpen && (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">إرسال كبريد إلكتروني</h2>
                <button
                    onClick={() => setSendModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={sendEmailMutation.isPending}
                >
                    <XIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-4">
                {/* البريد الإلكتروني للمستلم */}
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        البريد الإلكتروني للمستلم <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={sendData.toEmail}
                        onChange={(e) => setSendData({ ...sendData, toEmail: e.target.value })}
                        placeholder="example@domain.com"
                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
                        disabled={sendEmailMutation.isPending}
                        required
                    />
                </div>

                {/* Cc و Bcc */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Cc</label>
                        <input
                            type="email"
                            value={sendData.ccEmail}
                            onChange={(e) => setSendData({ ...sendData, ccEmail: e.target.value })}
                            placeholder="cc@domain.com"
                            className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
                            disabled={sendEmailMutation.isPending}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Bcc</label>
                        <input
                            type="email"
                            value={sendData.bccEmail}
                            onChange={(e) => setSendData({ ...sendData, bccEmail: e.target.value })}
                            placeholder="bcc@domain.com"
                            className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
                            disabled={sendEmailMutation.isPending}
                        />
                    </div>
                </div>

                {/* الموضوع */}
                <div>
                    <label className="text-sm font-medium text-gray-700">الموضوع</label>
                    <input
                        type="text"
                        value={sendData.subject}
                        onChange={(e) => setSendData({ ...sendData, subject: e.target.value })}
                        placeholder={item.title || "الموضوع"}
                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
                        disabled={sendEmailMutation.isPending}
                    />
                </div>

                {/* نص مخصص */}
                <div>
                    <label className="text-sm font-medium text-gray-700">نص مخصص (اختياري)</label>
                    <textarea
                        value={sendData.customBody}
                        onChange={(e) => setSendData({ ...sendData, customBody: e.target.value })}
                        rows={4}
                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors resize-none disabled:opacity-50"
                        placeholder="أضف نصاً مخصصاً للبريد الإلكتروني..."
                        disabled={sendEmailMutation.isPending}
                    />
                </div>

                {/* ===== المرفقات ===== */}
                {item.attachments && item.attachments.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">
                                المرفقات ({item.attachments.length})
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendData.includeAllAttachments}
                                    onChange={(e) => handleIncludeAllAttachmentsChange(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={sendEmailMutation.isPending}
                                />
                                تضمين الكل
                            </label>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {item.attachments.map((att) => {
                                const isSelected = sendData.includeAllAttachments || 
                                    sendData.selectedAttachmentIds.includes(att.id);
                                const Icon = getFileIcon(att.mimeType);
                                
                                return (
                                    <label
                                        key={att.id}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                                            isSelected
                                                ? "border-blue-300 bg-blue-50/50"
                                                : "border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleAttachmentSelection(att.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                            disabled={sendEmailMutation.isPending || sendData.includeAllAttachments}
                                        />
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Icon className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-700 truncate">
                                                    {att.fileName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {Math.round(att.fileSize / 1024)} KB
                                                    {att.isPrimary && (
                                                        <span className="mr-2 text-blue-500">(أساسي)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <CheckIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        {sendData.includeAllAttachments && (
                            <p className="text-xs text-muted-foreground mt-2">
                                ✅ سيتم تضمين جميع المرفقات ({item.attachments.length})
                            </p>
                        )}
                        {!sendData.includeAllAttachments && sendData.selectedAttachmentIds.length === 0 && (
                            <p className="text-xs text-yellow-600 mt-2">
                                ⚠️ لم يتم اختيار أي مرفق
                            </p>
                        )}
                        {!sendData.includeAllAttachments && sendData.selectedAttachmentIds.length > 0 && (
                            <p className="text-xs text-blue-600 mt-2">
                                ✅ تم اختيار {sendData.selectedAttachmentIds.length} مرفق
                            </p>
                        )}
                    </div>
                )}

                {(!item.attachments || item.attachments.length === 0) && (
                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm text-muted-foreground">لا توجد مرفقات لإضافتها</p>
                    </div>
                )}
            </div>

            {/* الأزرار */}
            <div className="flex gap-2 mt-6 border-t border-gray-100 pt-4">
                <button
                    onClick={() => setSendModalOpen(false)}
                    disabled={sendEmailMutation.isPending}
                    className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    إلغاء
                </button>
                <button
                    onClick={handleSendEmail}
                    disabled={sendEmailMutation.isPending || !sendData.toEmail}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {sendEmailMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري الإرسال...
                        </>
                    ) : (
                        <>
                            <SendIcon className="h-4 w-4" />
                            إرسال
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
}