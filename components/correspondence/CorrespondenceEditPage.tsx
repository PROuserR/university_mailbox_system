/* eslint-disable react-hooks/set-state-in-effect */
// components/correspondence/CorrespondenceEditPage.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSave,
    faTrash,
    faPaperclip,
    faFile,
    faFileImage,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faUpload,
    faSpinner,
    faXmark,
    faLink,
    faSearch,
    faUndo,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// =========================
// استيراد من الملفات المفصولة
// =========================
import { useDocumentTypes, useSenderEntities } from "@/hooks/useCorrespondence";
import { useUpdateCorrespondence } from "@/hooks/useCorrespondence";
import { CorrespondenceMainType, CorrespondenceParentSelectorDto, CorrespondenceResponse } from "@/types/api/correspondence.types";
import { Attachment } from "@/types/api/Attachment";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ParentSelectorModal } from "@/components/ui/ParentSelectorModal";
import { FormTextarea  } from "@/components/forms/FormTextarea";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormInput } from "@/components/forms/FormInput";
import { useUserRole } from "@/hooks/useUserRole";
import { utcToLocalDate, localDateToUTC } from "@/utils/dateUtil";
import { cn } from "@/lib/utils";

// =========================
// TYPES
// =========================

interface ValidationErrors {
    number?: string;
    title?: string;
    content?: string;
    senderReference?: string;
    notes?: string;
    issuedDate?: string;
    receivedDate?: string;
    sentDate?: string;
    parentCorrespondenceId?: string;
    documentTypeId?: string;
    senderEntityId?: string;
}

interface AttachmentWithStatus extends Attachment {
    isMarkedForDeletion?: boolean;
    isNew?: boolean;
}

type Props = {
    correspondence: CorrespondenceResponse;
    onBack: () => void;
    onSuccess?: () => void;
};

// =========================
// COMPONENT
// =========================

const getMainTypeFromString = (type: string | number | undefined): CorrespondenceMainType => {
    if (type === undefined || type === null) {
        return CorrespondenceMainType.Incoming;
    }

    if (typeof type === 'number') {
        return type >= 1 && type <= 3 ? type : CorrespondenceMainType.Incoming;
    }

    const mapping: Record<string, CorrespondenceMainType> = {
        'Incoming': CorrespondenceMainType.Incoming,
        'Outgoing': CorrespondenceMainType.Outgoing,
        'Internal': CorrespondenceMainType.Internal,
        'incoming': CorrespondenceMainType.Incoming,
        'outgoing': CorrespondenceMainType.Outgoing,
        'internal': CorrespondenceMainType.Internal,
        '1': CorrespondenceMainType.Incoming,
        '2': CorrespondenceMainType.Outgoing,
        '3': CorrespondenceMainType.Internal,
    };

    return mapping[type] ?? CorrespondenceMainType.Incoming;
};

export default function CorrespondenceEditPage({
    correspondence,
    onBack,
    onSuccess,
}: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDean } = useUserRole();

    // =========================
    // Auth Guard
    // =========================

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['EditCorrespondence'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    // =========================
    // التحقق من صلاحية التعديل
    // =========================

    const status = correspondence.status as string;
    const isArchived = status === 'Archived';
    const isDraft = status === 'Draft';

    const canEmployeeEdit = isDraft;
    const canDeanEdit = !isArchived;
    const showRevokeButton = isDean && !isArchived;

    // =========================
    // جلب البيانات
    // =========================

    const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } = useDocumentTypes();
    const { data: senderEntities = [], isLoading: isLoadingSenderEntities } = useSenderEntities();

    // =========================
    // STATE
    // =========================

    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [number, setNumber] = useState<number | "">("");
    const [mainType, setMainType] = useState<CorrespondenceMainType>(CorrespondenceMainType.Incoming);
    const [isProfessional, setIsProfessional] = useState<boolean>(false);
    const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
    const [senderEntityId, setSenderEntityId] = useState<number | null>(null);
    const [senderReference, setSenderReference] = useState<string>("");
    const [issuedDate, setIssuedDate] = useState<string>("");
    const [receivedDate, setReceivedDate] = useState<string>("");
    const [sentDate, setSentDate] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [parentCorrespondenceId, setParentCorrespondenceId] = useState<number | null>(null);
    const [parentCorrespondenceDisplay, setParentCorrespondenceDisplay] = useState<string>("");
    const [revokeDistributionsAndRevertToDraft, setRevokeDistributionsAndRevertToDraft] = useState<boolean>(false);

    // المرفقات
    const [attachments, setAttachments] = useState<AttachmentWithStatus[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);
    const [isNewPrimaryActive, setIsNewPrimaryActive] = useState<boolean>(false);

    // Validation
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Parent Selector Modal
    const [parentModalOpen, setParentModalOpen] = useState<boolean>(false);

    // =========================
    // HOOKS
    // =========================

    const updateMutation = useUpdateCorrespondence(() => {
        queryClient.invalidateQueries({ queryKey: ["correspondences"] });
        queryClient.invalidateQueries({ queryKey: ["correspondence", correspondence.id] });

        toast.success("تم تحديث المراسلة بنجاح");
        if (onSuccess) onSuccess();
        router.push(`/correspondences?id=${correspondence.id}`);
    });

    // =========================
    // تهيئة البيانات من المراسلة (بدون تحذيرات)
    // =========================
// =========================
// تهيئة البيانات من المراسلة
// =========================
useEffect(() => {
    if (!correspondence) return;

    setTitle(correspondence.title ?? "");
    setContent(correspondence.content ?? "");
    
    const numberValue = correspondence.number;
    setNumber(numberValue !== undefined && numberValue !== null ? Number(numberValue) : "");
    
    const mainTypeValue = getMainTypeFromString(correspondence.mainType);
    setMainType(mainTypeValue);
    setIsProfessional(correspondence.isProfessional ?? false);
    setDocumentTypeId(correspondence.documentTypeId);
    setSenderEntityId(correspondence.senderEntityId);
    setSenderReference(correspondence.senderReference ?? "");
    
    setIssuedDate(utcToLocalDate(correspondence.issuedDate));
    setReceivedDate(utcToLocalDate(correspondence.receivedDate));
    setSentDate(utcToLocalDate(correspondence.sentDate));
    
    setNotes(correspondence.notes ?? "");
    setParentCorrespondenceId(correspondence.parentCorrespondenceId ?? null);
    if (correspondence.parentCorrespondenceId) {
        setParentCorrespondenceDisplay(`#${correspondence.parentCorrespondenceId}`);
    }
    setAttachments(correspondence.attachments?.map(att => ({ ...att, isMarkedForDeletion: false })) ?? []);
}, [correspondence]);

    // =========================
    // دوال المرفقات
    // =========================

    // ✅ حذف مؤقت لمرفق موجود
    const markAttachmentForDeletion = useCallback((attachmentId: number): void => {
        setAttachments(prev => 
            prev.map(att => 
                att.id === attachmentId 
                    ? { ...att, isMarkedForDeletion: true } 
                    : att
            )
        );
        setDeletedAttachmentIds(prev => prev.filter(id => id !== attachmentId));
    }, []);

    // ✅ استرجاع مرفق من الحذف المؤقت
    const undoDeleteAttachment = useCallback((attachmentId: number): void => {
        setAttachments(prev => 
            prev.map(att => 
                att.id === attachmentId 
                    ? { ...att, isMarkedForDeletion: false } 
                    : att
            )
        );
    }, []);

    // ✅ إضافة ملفات جديدة
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;
        if (!files) return;
        setNewFiles((prev) => [...prev, ...Array.from(files)]);
    }, []);

    // ✅ إضافة ملف أساسي جديد
    const handlePrimaryFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        const existingPrimary = attachments.find(att => att.isPrimary && !att.isMarkedForDeletion);
        if (existingPrimary) {
            setAttachments(prev => 
                prev.map(att => 
                    att.id === existingPrimary.id 
                        ? { ...att, isMarkedForDeletion: true } 
                        : att
                )
            );
        }

        setPrimaryFile(file);
        setIsNewPrimaryActive(true);
    }, [attachments]);

    // ✅ استرجاع الملف الأساسي القديم وإلغاء الملف الجديد
    const undoPrimaryReplacement = useCallback((): void => {
        setAttachments(prev => 
            prev.map(att => 
                att.isPrimary && att.isMarkedForDeletion 
                    ? { ...att, isMarkedForDeletion: false } 
                    : att
            )
        );
        setPrimaryFile(null);
        setIsNewPrimaryActive(false);
    }, []);

    // ✅ إزالة ملف أساسي جديد
    const removeNewPrimaryFile = useCallback((): void => {
        const oldPrimary = attachments.find(att => att.isPrimary && att.isMarkedForDeletion);
        if (oldPrimary) {
            setAttachments(prev => 
                prev.map(att => 
                    att.id === oldPrimary.id 
                        ? { ...att, isMarkedForDeletion: false } 
                        : att
                )
            );
        }
        setPrimaryFile(null);
        setIsNewPrimaryActive(false);
    }, [attachments]);

    // ✅ حذف ملف جديد تم إضافته
    const removeNewFile = useCallback((fileName: string): void => {
        setNewFiles((prev) => prev.filter((file) => file.name !== fileName));
    }, []);

    
useEffect(() => {
    if (!primaryFile && isNewPrimaryActive) {
        setIsNewPrimaryActive(false);
    }
}, [primaryFile, isNewPrimaryActive]);

useEffect(() => {
    const hasOldPrimaryRestored = attachments.some(att => att.isPrimary && !att.isMarkedForDeletion);
    const hasNewPrimary = primaryFile !== null && isNewPrimaryActive;
    
    if (hasOldPrimaryRestored && hasNewPrimary) {
        setPrimaryFile(null);
        setIsNewPrimaryActive(false);
    }
}, [attachments, primaryFile, isNewPrimaryActive]);

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes("image")) return faFileImage;
        if (mimeType.includes("pdf")) return faFilePdf;
        if (mimeType.includes("word") || mimeType.includes("document")) return faFileWord;
        if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return faFileExcel;
        return faFile;
    };

    // =========================
    // Parent Selector Handlers
    // =========================

    const handleParentSelect = (item: CorrespondenceParentSelectorDto): void => {
        setParentCorrespondenceId(item.id);
        setParentCorrespondenceDisplay(`#${item.number} - ${item.title}`);
        setErrors((prev) => ({ ...prev, parentCorrespondenceId: undefined }));
    };

    const clearParent = (): void => {
        setParentCorrespondenceId(null);
        setParentCorrespondenceDisplay("");
    };

    // =========================
    // Validation Functions
    // =========================

    const validateField = (field: keyof ValidationErrors, value: unknown): string | undefined => {
        switch (field) {
            case 'number': {
                if (value === "" || value === null || value === undefined) {
                    return "رقم المراسلة مطلوب";
                }
                const num = Number(value);
                if (isNaN(num) || num <= 0) {
                    return "رقم المراسلة يجب أن يكون أكبر من صفر";
                }
                return undefined;
            }

            case 'title': {
                const titleValue = value as string;
                if (!titleValue?.trim()) {
                    return "العنوان مطلوب";
                }
                if (titleValue.length > 500) {
                    return "العنوان لا يمكن أن يتجاوز 500 حرف";
                }
                return undefined;
            }

            case 'content': {
                const contentValue = value as string;
                if (contentValue && contentValue.length > 4000) {
                    return "المحتوى لا يمكن أن يتجاوز 4000 حرف";
                }
                return undefined;
            }

            case 'senderReference': {
                const refValue = value as string;
                if (refValue && refValue.length > 255) {
                    return "مرجع المرسل لا يمكن أن يتجاوز 255 حرف";
                }
                return undefined;
            }

            case 'notes': {
                const notesValue = value as string;
                if (notesValue && notesValue.length > 500) {
                    return "الملاحظات لا يمكن أن تتجاوز 500 حرف";
                }
                return undefined;
            }

            case 'issuedDate':
            case 'receivedDate':
            case 'sentDate':
                return undefined;

            case 'parentCorrespondenceId': {
                if (value !== null && value !== undefined) {
                    const num = Number(value);
                    if (isNaN(num) || num <= 0) {
                        return "معرف المراسلة الأصلية غير صالح";
                    }
                }
                return undefined;
            }

            case 'documentTypeId': {
                if (value === null || value === undefined) {
                    return "نوع المستند مطلوب";
                }
                const num = Number(value);
                if (isNaN(num) || num <= 0) {
                    return "نوع المستند غير صالح";
                }
                return undefined;
            }

            case 'senderEntityId': {
                if (value === null || value === undefined) {
                    return "الجهة المرسلة مطلوبة";
                }
                const num = Number(value);
                if (isNaN(num) || num <= 0) {
                    return "الجهة المرسلة غير صالحة";
                }
                return undefined;
            }

            default:
                return undefined;
        }
    };

    const validateAll = (): boolean => {
        const newErrors: ValidationErrors = {};

        const fieldsToValidate: Array<{ field: keyof ValidationErrors; value: unknown }> = [
            { field: 'number', value: number },
            { field: 'title', value: title },
            { field: 'content', value: content },
            { field: 'senderReference', value: senderReference },
            { field: 'notes', value: notes },
            { field: 'parentCorrespondenceId', value: parentCorrespondenceId },
            { field: 'documentTypeId', value: documentTypeId },
            { field: 'senderEntityId', value: senderEntityId },
        ];

        fieldsToValidate.forEach(({ field, value }) => {
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);
        const allTouched: Record<string, boolean> = {};
        fieldsToValidate.forEach(({ field }) => {
            allTouched[field] = true;
        });
        setTouched(allTouched);

        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field: keyof ValidationErrors): void => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = getFieldValue(field);
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const getFieldValue = (field: keyof ValidationErrors): unknown => {
        switch (field) {
            case 'number': return number;
            case 'title': return title;
            case 'content': return content;
            case 'senderReference': return senderReference;
            case 'notes': return notes;
            case 'issuedDate': return issuedDate;
            case 'receivedDate': return receivedDate;
            case 'sentDate': return sentDate;
            case 'parentCorrespondenceId': return parentCorrespondenceId;
            case 'documentTypeId': return documentTypeId;
            case 'senderEntityId': return senderEntityId;
            default: return undefined;
        }
    };

    const handleFieldChange = (field: keyof ValidationErrors, value: unknown): void => {
        switch (field) {
            case 'number':
                setNumber(value as number | "");
                break;
            case 'title':
                setTitle(value as string);
                break;
            case 'content':
                setContent(value as string);
                break;
            case 'senderReference':
                setSenderReference(value as string);
                break;
            case 'notes':
                setNotes(value as string);
                break;
            case 'issuedDate':
                setIssuedDate(value as string);
                break;
            case 'receivedDate':
                setReceivedDate(value as string);
                break;
            case 'sentDate':
                setSentDate(value as string);
                break;
            case 'parentCorrespondenceId':
                setParentCorrespondenceId(value as number | null);
                break;
            case 'documentTypeId':
                setDocumentTypeId(value as number | null);
                break;
            case 'senderEntityId':
                setSenderEntityId(value as number | null);
                break;
            default:
                break;
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }

        if (touched[field]) {
            const error = validateField(field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    // =========================
    // حفظ التغييرات
    // =========================

    const handleSave = async (): Promise<void> => {
        if (!validateAll()) {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.getElementById(`field-${firstErrorField}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
            return;
        }

        const formData = new FormData();

        if (number !== "") {
            formData.append("Number", String(number));
        }
        if (mainType !== undefined) {
            formData.append("MainType", String(mainType));
        }
        formData.append("IsProfessional", String(isProfessional));
        if (title) {
            formData.append("Title", title);
        }
        if (senderEntityId) {
            formData.append("SenderEntityId", String(senderEntityId));
        }
        if (documentTypeId) {
            formData.append("DocumentTypeId", String(documentTypeId));
        }
        if (issuedDate) {
            formData.append("IssuedDate", localDateToUTC(issuedDate));
        }
        
        if (receivedDate) {
            formData.append("ReceivedDate", localDateToUTC(receivedDate));
        }
        if (sentDate) {
            formData.append("SentDate", localDateToUTC(sentDate));
        }

        if (content) {
            formData.append("Content", content);
        }
        if (senderReference) {
            formData.append("SenderReference", senderReference);
        }
        if (notes) {
            formData.append("Notes", notes);
        }
        if (parentCorrespondenceId) {
            formData.append("ParentCorrespondenceId", String(parentCorrespondenceId));
        }
        if (revokeDistributionsAndRevertToDraft) {
            formData.append("RevokeDistributionsAndRevertToDraft", String(revokeDistributionsAndRevertToDraft));
        }

        // ✅ الملفات الجديدة
        if (primaryFile && isNewPrimaryActive) {
            formData.append("PrimaryFile", primaryFile);
        }

        newFiles.forEach((file) => {
            formData.append("AdditionalFiles", file);
        });

        // ✅ الملفات المحددة للحذف
        const markedForDeletion = attachments.filter(att => att.isMarkedForDeletion);
        markedForDeletion.forEach((att) => {
            formData.append("AttachmentIdsToDelete", String(att.id));
        });

        if (deletedAttachmentIds.length > 0) {
            deletedAttachmentIds.forEach((id) => {
                formData.append("AttachmentIdsToDelete", String(id));
            });
        }

        updateMutation.mutate({
            id: correspondence.id,
            payload: formData,
        });
    };

    // =========================
    // حالات التحميل
    // =========================

    if (isAuthLoading || isLoadingDocumentTypes || isLoadingSenderEntities) {
        return (
            <div className="flex h-96 items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600">جاري التحميل...</span>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-red-500 text-lg">ليس لديك صلاحية لتعديل هذه المراسلة</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    if (!isDean && !isDraft) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-red-500 text-lg">لا يمكن تعديل هذه المراسلة لأنها ليست في حالة مسودة</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    رجوع
                </button>
            </div>
        );
    }

    if (isArchived) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-red-500 text-lg">لا يمكن تعديل المراسلات المؤرشفة</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    رجوع
                </button>
            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (
        <motion.div
            key="edit-correspondence"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto bg-gradient-to-br from-yellow-50 via-white to-blue-50"
            dir="rtl"
        >
            <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto">
                {/* HEADER - فقط زر الرجوع */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm text-sm"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        <span>رجوع</span>
                    </button>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/60 border border-red-100">
    <span className="font-bold text-red-600 text-sm">إلغاء التوزيعات والعودة إلى مسودة</span>
    <button
        type="button"
        onClick={() => setRevokeDistributionsAndRevertToDraft((prev) => !prev)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
            revokeDistributionsAndRevertToDraft
                ? "bg-gradient-to-r from-red-400 to-red-500 shadow-lg shadow-red-200"
                : "bg-blue-100"
        }`}
    >
        <motion.div
            animate={{ x: revokeDistributionsAndRevertToDraft ? 0 : -24 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
        />
    </button>
</div>
                </div>

                {/* MAIN FORM - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* LEFT PANEL - METADATA (2 columns) */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-blue-100/30 flex flex-col gap-4">
                        {/* ... باقي الكود ... */}
                        <h2 className="font-bold text-blue-900 flex items-center gap-2 text-base">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs">📋</span>
                            </div>
                            بيانات المراسلة
                        </h2>

                        {/* 1. نوع المراسلة */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                نوع المراسلة
                                <span className="text-red-500 mr-1">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { value: CorrespondenceMainType.Incoming, label: "وارد" },
                                    { value: CorrespondenceMainType.Outgoing, label: "صادر" },
                                    { value: CorrespondenceMainType.Internal, label: "داخلي" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setMainType(option.value);
                                        }}
                                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                                            mainType === option.value
                                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                                                : "bg-blue-50/60 text-blue-600 hover:bg-blue-100/60 border border-blue-100"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. رقم المراسلة + مهني في نفس السطر */}
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <FormInput
                                    id="number"
                                    label="رقم المراسلة"
                                    type="number"
                                    value={number}
                                    onChange={(val: number | "") => handleFieldChange('number', val)}
                                    onBlur={() => handleBlur('number')}
                                    placeholder="أدخل الرقم..."
                                    error={errors.number}
                                    touched={touched.number}
                                    required
                                    min={1}
                                    step={1}
                                />
                            </div>
                            <div className="flex-shrink-0 pb-1">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-yellow-100">
                                    <span className="font-bold text-yellow-900 text-xs">مهني</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsProfessional((prev) => !prev)}
                                        className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
                                            isProfessional 
                                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md shadow-yellow-200" 
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <motion.div
                                            animate={{ x: isProfessional ? 0 : -22 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. الجهة المرسلة */}
                        <FormSelect
                            id="senderEntityId"
                            label="الجهة المرسلة"
                            value={senderEntityId}
                            onChange={(val: number | null) => handleFieldChange('senderEntityId', val)}
                            onBlur={() => handleBlur('senderEntityId')}
                            options={senderEntities}
                            placeholder="اختر الجهة..."
                            error={errors.senderEntityId}
                            touched={touched.senderEntityId}
                            required
                        />

                        {/* 4. نوع المستند */}
                        <FormSelect
                            id="documentTypeId"
                            label="نوع المستند"
                            value={documentTypeId}
                            onChange={(val: number | null) => handleFieldChange('documentTypeId', val)}
                            onBlur={() => handleBlur('documentTypeId')}
                            options={documentTypes}
                            placeholder="اختر النوع..."
                            error={errors.documentTypeId}
                            touched={touched.documentTypeId}
                            required
                        />

                        {/* 5. المراسلة الأصلية (Parent) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                <FontAwesomeIcon icon={faLink} className="text-blue-400" />
                                المراسلة الأصلية (اختياري)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={parentCorrespondenceDisplay}
                                    readOnly
                                    placeholder="اختر مراسلة أصلية..."
                                    className="flex-1 p-2.5 rounded-xl border-2 border-blue-100 bg-gray-50 text-blue-900 text-sm outline-none font-semibold text-right cursor-pointer"
                                    onClick={() => setParentModalOpen(true)}
                                />
                                <button
                                    type="button"
                                    onClick={clearParent}
                                    className={`p-2.5 rounded-xl border-2 transition-all ${
                                        parentCorrespondenceId
                                            ? "border-red-200 text-red-500 hover:bg-red-50"
                                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                                    }`}
                                    disabled={!parentCorrespondenceId}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setParentModalOpen(true)}
                                    className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition border-2 border-blue-500"
                                >
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>
                            {touched.parentCorrespondenceId && errors.parentCorrespondenceId && (
                                <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="text-[10px]" />
                                    {errors.parentCorrespondenceId}
                                </p>
                            )}
                        </div>

                        {/* 6. مرجع المرسل (اختياري) */}
                        <FormInput
                            id="senderReference"
                            label="مرجع المرسل (اختياري)"
                            type="text"
                            value={senderReference}
                            onChange={(val: string) => handleFieldChange('senderReference', val)}
                            onBlur={() => handleBlur('senderReference')}
                            placeholder="مرجع المرسل..."
                            error={errors.senderReference}
                            touched={touched.senderReference}
                            maxLength={255}
                        />

                       

                        {/* 8. التواريخ */}
                        <div className="grid grid-cols-1 gap-1.5">
                            <FormInput
                                id="issuedDate"
                                label="تاريخ الإصدار"
                                type="date"
                                value={issuedDate}
                                onChange={(val: string) => handleFieldChange('issuedDate', val)}
                                onBlur={() => handleBlur('issuedDate')}
                                error={errors.issuedDate}
                                touched={touched.issuedDate}
                                required
                            />

                            {mainType === CorrespondenceMainType.Incoming && (
                                <FormInput
                                    id="receivedDate"
                                    label="تاريخ الاستلام"
                                    type="date"
                                    value={receivedDate}
                                    onChange={(val: string) => handleFieldChange('receivedDate', val)}
                                    onBlur={() => handleBlur('receivedDate')}
                                    error={errors.receivedDate}
                                    touched={touched.receivedDate}
                                    required
                                />
                            )}

                            {mainType === CorrespondenceMainType.Outgoing && (
                                <FormInput
                                    id="sentDate"
                                    label="تاريخ الإرسال"
                                    type="date"
                                    value={sentDate}
                                    onChange={(val: string) => handleFieldChange('sentDate', val)}
                                    onBlur={() => handleBlur('sentDate')}
                                    error={errors.sentDate}
                                    touched={touched.sentDate}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL - CONTENT & ATTACHMENTS (3 columns) */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        {/* TITLE */}
                        <FormInput
                            id="title"
                            label="العنوان"
                            type="text"
                            value={title}
                            onChange={(val: string) => handleFieldChange('title', val)}
                            onBlur={() => handleBlur('title')}
                            placeholder="عنوان المراسلة..."
                            error={errors.title}
                            touched={touched.title}
                            required
                            maxLength={500}
                            className="text-xl font-bold"
                        />

                        {/* CONTENT */}
                        <FormTextarea
                            id="content"
                            label="المحتوى (اختياري)"
                            value={content}
                            onChange={(val: string) => handleFieldChange('content', val)}
                            onBlur={() => handleBlur('content')}
                            placeholder="محتوى المراسلة..."
                            error={errors.content}
                            touched={touched.content}
                            maxLength={4000}
                            rows={5}
                            className="min-h-[150px]"
                        />

                        {/* NOTES */}
                        <FormTextarea
                            id="notes"
                            label="ملاحظات إضافية (اختياري)"
                            value={notes}
                            onChange={(val: string) => handleFieldChange('notes', val)}
                            onBlur={() => handleBlur('notes')}
                            placeholder="أضف ملاحظات إضافية..."
                            error={errors.notes}
                            touched={touched.notes}
                            maxLength={500}
                            rows={2}
                        />

                        {/* ATTACHMENTS */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-blue-100/30 flex flex-col gap-3 flex-1">
                            {/* Header - ثابت */}
                            <div className="flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faPaperclip} className="text-white text-xs" />
                                    </div>
                                    <h2 className="text-sm font-bold text-blue-900">المرفقات</h2>
                                    <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {attachments.filter(att => !att.isMarkedForDeletion).length + newFiles.length + (primaryFile && isNewPrimaryActive ? 1 : 0)}
                                    </span>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg text-xs">
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>أساسي</span>
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) => handlePrimaryFileUpload(e)}
                                        />
                                    </label>
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg text-xs">
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>إضافي</span>
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={(e) => handleFileUpload(e)}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* ===== منطقة المرفقات ===== */}
                            <div className="flex-1">
                                {/* ✅ الملف الأساسي الجديد */}
                                {primaryFile && isNewPrimaryActive && (
                                    <div className="flex items-center justify-between p-2 rounded-xl border-2 border-blue-300 bg-blue-50/80 mb-2 w-full">
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <div className="w-7 h-7 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon icon={getFileIcon(primaryFile.type)} className="text-blue-600 text-xs" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-blue-900 truncate text-xs">
                                                    {primaryFile.name}{" "}
                                                    <span className="text-[10px] text-blue-500">(أساسي - جديد)</span>
                                                </p>
                                                <p className="text-[10px] text-blue-500">
                                                    {(primaryFile.size / 1024).toFixed(1)} كيلوبايت
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {attachments.some(att => att.isPrimary && att.isMarkedForDeletion) && (
                                                <button
                                                    type="button"
                                                    onClick={undoPrimaryReplacement}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                                    title="استرجاع الملف الأساسي القديم"
                                                >
                                                    <FontAwesomeIcon icon={faUndo} className="text-xs" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={removeNewPrimaryFile}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ✅ الملفات الإضافية الجديدة */}
                                {newFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newFiles.map((file, index) => (
                                            <motion.div
                                                key={`${file.name}-${index}`}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-yellow-200 bg-yellow-50/60 hover:bg-yellow-100/60 transition-all"
                                            >
                                                <div className="w-6 h-6 bg-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon
                                                        icon={getFileIcon(file.type)}
                                                        className="text-yellow-600 text-[10px]"
                                                    />
                                                </div>
                                                <div className="overflow-hidden max-w-[120px]">
                                                    <p className="font-semibold text-yellow-900 truncate text-[11px]">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[9px] text-yellow-600">
                                                        {(file.size / 1024).toFixed(1)} كيلوبايت
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(file.name)}
                                                    className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* ✅ الملف الأساسي القديم */}
                                {attachments.filter(att => att.isPrimary && !att.isMarkedForDeletion).map((attachment) => (
                                    <motion.div
                                        key={attachment.id}
                                        className="flex items-center justify-between p-2 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100/60 transition-all mb-2 w-full"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <div className="w-6 h-6 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon
                                                    icon={getFileIcon(attachment.mimeType ?? "")}
                                                    className="text-blue-600 text-[10px]"
                                                />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-blue-900 truncate text-[11px]">
                                                    {attachment.fileName}
                                                    <span className="text-[9px] text-blue-500 mr-1">(أساسي)</span>
                                                </p>
                                                <p className="text-[9px] text-gray-500">
                                                    {(attachment.fileSize / 1024).toFixed(1)} كيلوبايت
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => markAttachmentForDeletion(attachment.id)}
                                            className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                            title="حذف"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                        </button>
                                    </motion.div>
                                ))}

                                {/* ✅ الملفات الإضافية القديمة */}
                                {attachments.filter(att => !att.isPrimary && !att.isMarkedForDeletion).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {attachments.filter(att => !att.isPrimary && !att.isMarkedForDeletion).map((attachment) => (
                                            <motion.div
                                                key={attachment.id}
                                                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100/60 transition-all"
                                            >
                                                <div className="w-6 h-6 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon
                                                        icon={getFileIcon(attachment.mimeType ?? "")}
                                                        className="text-blue-600 text-[10px]"
                                                    />
                                                </div>
                                                <div className="overflow-hidden max-w-[120px]">
                                                    <p className="font-semibold text-blue-900 truncate text-[11px]">
                                                        {attachment.fileName}
                                                    </p>
                                                    <p className="text-[9px] text-gray-500">
                                                        {(attachment.fileSize / 1024).toFixed(1)} كيلوبايت
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => markAttachmentForDeletion(attachment.id)}
                                                    className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                                    title="حذف"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* ✅ الملف الأساسي المحذوف (يأخذ row كاملاً) */}
                                {attachments.filter(att => att.isMarkedForDeletion && att.isPrimary).map((attachment) => (
                                    <motion.div
                                        key={attachment.id}
                                        className="flex items-center justify-between p-2 rounded-xl border border-red-300 bg-red-50/80 line-through text-gray-400 transition-all mb-2 w-full"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <div className="w-6 h-6 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon
                                                    icon={getFileIcon(attachment.mimeType ?? "")}
                                                    className="text-red-400 text-[10px]"
                                                />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold truncate text-[11px] text-gray-400">
                                                    {attachment.fileName}
                                                    <span className="text-[9px] text-red-400 mr-1">(أساسي - سيتم الحذف)</span>
                                                </p>
                                                <p className="text-[9px] text-gray-400">
                                                    {(attachment.fileSize / 1024).toFixed(1)} كيلوبايت
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => undoDeleteAttachment(attachment.id)}
                                            className="p-1 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors flex-shrink-0"
                                            title="استرجاع"
                                        >
                                            <FontAwesomeIcon icon={faUndo} className="text-[10px]" />
                                        </button>
                                    </motion.div>
                                ))}

                                {/* ✅ الملفات الإضافية المحذوفة (بجانب بعضها) */}
                                {attachments.filter(att => att.isMarkedForDeletion && !att.isPrimary).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {attachments.filter(att => att.isMarkedForDeletion && !att.isPrimary).map((attachment) => (
                                            <motion.div
                                                key={attachment.id}
                                                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-red-300 bg-red-50/80 line-through text-gray-400 transition-all"
                                            >
                                                <div className="w-6 h-6 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon
                                                        icon={getFileIcon(attachment.mimeType ?? "")}
                                                        className="text-red-400 text-[10px]"
                                                    />
                                                </div>
                                                <div className="overflow-hidden max-w-[120px]">
                                                    <p className="font-semibold truncate text-[11px] text-gray-400">
                                                        {attachment.fileName}
                                                        <span className="text-[9px] text-red-400 mr-1">(سيتم الحذف)</span>
                                                    </p>
                                                    <p className="text-[9px] text-gray-400">
                                                        {(attachment.fileSize / 1024).toFixed(1)} كيلوبايت
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => undoDeleteAttachment(attachment.id)}
                                                    className="p-1 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors flex-shrink-0"
                                                    title="استرجاع"
                                                >
                                                    <FontAwesomeIcon icon={faUndo} className="text-[10px]" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ===== أزرار الإجراءات ===== */}
                            <div className="flex gap-3 pt-3 border-t border-blue-100 flex-shrink-0 mt-auto">
                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 font-bold shadow-lg shadow-blue-200 text-sm ${
                                        updateMutation.isPending
                                            ? "opacity-70 cursor-not-allowed"
                                            : "active:scale-95 hover:shadow-xl"
                                    }`}
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faSave} />
                                            <span>حفظ التغييرات</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold text-sm"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                    <span>إلغاء</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent Selector Modal */}
            <ParentSelectorModal
                isOpen={parentModalOpen}
                onClose={() => setParentModalOpen(false)}
                onSelect={handleParentSelect}
                selectedId={parentCorrespondenceId}
            />
        </motion.div>
    );
}