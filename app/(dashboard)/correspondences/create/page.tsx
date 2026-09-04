/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/Correspondence/create/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faPaperPlane,
    faPaperclip,
    faFile,
    faFileImage,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faUpload,
    faSpinner,
    faXmark,
    faTrash,
    faLink,
    faSearch,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { useCreateCorrespondence } from "@/hooks/useCorrespondence";
import { useDocumentTypes, useSenderEntities } from "@/hooks/useCorrespondence";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { CorrespondenceMainType, CorrespondenceParentSelectorDto } from "@/types/api/correspondence.types";
import { ParentSelectorModal } from "@/components/ui/ParentSelectorModal";
import { cn } from "@/lib/utils";
import { getTodaySyria, getTodayUTC, localDateToUTC, toUTCDate } from "@/utils/dateUtil";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";

// ==============================
// TYPES
// ==============================

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

export default function CreateCorrespondencePage() {
    const router = useRouter();

    // =========================
    // Auth Guard
    // =========================

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['CreateCorrespondence'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    // ✅ استخدام useAuth للتحقق من الصلاحيات
    const { hasPermission } = useAuth();

    // =========================
    // STATE
    // =========================

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [number, setNumber] = useState<number | "">("");
    const [mainType, setMainType] = useState<CorrespondenceMainType>(
        CorrespondenceMainType.Incoming
    );
    const [isProfessional, setIsProfessional] = useState(false);
    const [senderEntityId, setSenderEntityId] = useState<number | null>(null);
    const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
    const [senderReference, setSenderReference] = useState("");
    const [issuedDate, setIssuedDate] = useState("");
    const [receivedDate, setReceivedDate] = useState("");
    const [sentDate, setSentDate] = useState("");
    const [notes, setNotes] = useState("");
    const [parentCorrespondenceId, setParentCorrespondenceId] = useState<number | null>(null);
    const [parentCorrespondenceDisplay, setParentCorrespondenceDisplay] = useState<string>("");

    const [attachments, setAttachments] = useState<File[]>([]);
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);

    // Validation
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Parent Selector Modal
    const [parentModalOpen, setParentModalOpen] = useState(false);

    // =========================
    // HOOKS - جلب البيانات
    // =========================

    // ✅ استخدام useCreateCorrespondence بدون معاملات
    const createMutation = useCreateCorrespondence();

    // ✅ استخدام Hooks لجلب البيانات
    const { data: documentTypes = [], isLoading: isLoadingDocumentTypes } = useDocumentTypes();
    const { data: senderEntities = [], isLoading: isLoadingSenderEntities } = useSenderEntities();

    // =========================
    // تعيين القيم الافتراضية
    // =========================

    useEffect(() => {
        const today = getTodaySyria();
        setIssuedDate(today);
        setReceivedDate(today);
        setSentDate(today);

        if (senderEntities.length > 0 && senderEntityId === null) {
            setSenderEntityId(senderEntities[0].id);
        }
        if (documentTypes.length > 0 && documentTypeId === null) {
            setDocumentTypeId(documentTypes[0].id);
        }
    }, [senderEntities, documentTypes]);

    // =========================
    // دوال المرفقات
    // =========================

    const handleAdditionalFiles = (files: FileList | null) => {
        if (!files) return;
        setAttachments((prev) => [...prev, ...Array.from(files)]);
    };

    const handlePrimaryFile = (file: File | null) => {
        if (file) {
            setPrimaryFile(file);
        }
    };

    const removeAdditionalFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const removePrimaryFile = () => {
        setPrimaryFile(null);
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes("image")) return faFileImage;
        if (mimeType.includes("pdf")) return faFilePdf;
        if (mimeType.includes("word") || mimeType.includes("document"))
            return faFileWord;
        if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
            return faFileExcel;
        return faFile;
    };

    // =========================
    // Parent Selector Handlers
    // =========================

    const handleParentSelect = (item: CorrespondenceParentSelectorDto) => {
        setParentCorrespondenceId(item.id);
        setParentCorrespondenceDisplay(`#${item.number} - ${item.title}`);
        setErrors((prev) => ({ ...prev, parentCorrespondenceId: undefined }));
    };

    const clearParent = () => {
        setParentCorrespondenceId(null);
        setParentCorrespondenceDisplay("");
    };

    // =========================
    // Reset Form
    // =========================

    const resetForm = () => {
        setTitle("");
        setContent("");
        setNumber("");
        setSenderReference("");
        setNotes("");
        setAttachments([]);
        setPrimaryFile(null);
        setParentCorrespondenceId(null);
        setParentCorrespondenceDisplay("");
        setErrors({});
        setTouched({});
        const today = getTodaySyria();
        setIssuedDate(today);
        setReceivedDate(today);
        setSentDate(today);
        toast.success("تم إعادة تعيين النموذج");
    };

    // =========================
    // Validation Functions
    // =========================

    const validateField = (field: keyof ValidationErrors, value: any): string | undefined => {
        switch (field) {
            case 'number':
                if (value === "" || value === null || value === undefined) {
                    return "رقم المراسلة مطلوب";
                }
                if (Number(value) <= 0) {
                    return "رقم المراسلة يجب أن يكون أكبر من صفر";
                }
                return undefined;

            case 'title':
                if (!value?.trim()) {
                    return "العنوان مطلوب";
                }
                if (value.length > 500) {
                    return "العنوان لا يمكن أن يتجاوز 500 حرف";
                }
                return undefined;

            case 'content':
                if (value && value.length > 4000) {
                    return "المحتوى لا يمكن أن يتجاوز 4000 حرف";
                }
                return undefined;

            case 'senderReference':
                if (value && value.length > 255) {
                    return "مرجع المرسل لا يمكن أن يتجاوز 255 حرف";
                }
                return undefined;

            case 'notes':
                if (value && value.length > 500) {
                    return "الملاحظات لا يمكن أن تتجاوز 500 حرف";
                }
                return undefined;

            case 'issuedDate':
                if (!value) {
                    return "تاريخ الإصدار مطلوب";
                }
                const today = getTodayUTC();
                const selectedDate = toUTCDate(value);
                if (selectedDate > today) {
                    return "تاريخ الإصدار لا يمكن أن يكون في المستقبل";
                }
                return undefined;

            case 'receivedDate':
                if (mainType === CorrespondenceMainType.Incoming) {
                    if (!value) {
                        return "تاريخ الاستلام مطلوب للمراسلات الواردة";
                    }
                    const todayRec = getTodayUTC();
                    const selectedRec = toUTCDate(value);
                    if (selectedRec > todayRec) {
                        return "تاريخ الاستلام لا يمكن أن يكون في المستقبل";
                    }
                    if (issuedDate) {
                        const issued = toUTCDate(issuedDate);
                        if (selectedRec < issued) {
                            return "تاريخ الاستلام لا يمكن أن يكون قبل تاريخ الإصدار";
                        }
                    }
                }
                return undefined;

            case 'sentDate':
                if (mainType === CorrespondenceMainType.Outgoing) {
                    if (!value) {
                        return "تاريخ الإرسال مطلوب للمراسلات الصادرة";
                    }
                    const todaySent = getTodayUTC();
                    const selectedSent = toUTCDate(value);
                    if (selectedSent > todaySent) {
                        return "تاريخ الإرسال لا يمكن أن يكون في المستقبل";
                    }
                    if (issuedDate) {
                        const issued = toUTCDate(issuedDate);
                        if (selectedSent < issued) {
                            return "تاريخ الإرسال لا يمكن أن يكون قبل تاريخ الإصدار";
                        }
                    }
                }
                return undefined;

            case 'parentCorrespondenceId':
                if (value !== null && value <= 0) {
                    return "معرف المراسلة الأصلية غير صالح";
                }
                return undefined;

            case 'documentTypeId':
                if (value === null || value <= 0) {
                    return "نوع المستند مطلوب";
                }
                return undefined;

            case 'senderEntityId':
                if (value === null || value <= 0) {
                    return "الجهة المرسلة مطلوبة";
                }
                return undefined;

            default:
                return undefined;
        }
    };

    const validateAll = (): boolean => {
        const newErrors: ValidationErrors = {};

        const fieldsToValidate: Array<{ field: keyof ValidationErrors; value: any }> = [
            { field: 'number', value: number },
            { field: 'title', value: title },
            { field: 'content', value: content },
            { field: 'senderReference', value: senderReference },
            { field: 'notes', value: notes },
            { field: 'issuedDate', value: issuedDate },
            { field: 'receivedDate', value: receivedDate },
            { field: 'sentDate', value: sentDate },
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

    const handleBlur = (field: keyof ValidationErrors) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = getFieldValue(field);
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const getFieldValue = (field: keyof ValidationErrors): any => {
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

    const handleFieldChange = (field: keyof ValidationErrors, value: any) => {
        switch (field) {
            case 'number': setNumber(value); break;
            case 'title': setTitle(value); break;
            case 'content': setContent(value); break;
            case 'senderReference': setSenderReference(value); break;
            case 'notes': setNotes(value); break;
            case 'issuedDate': setIssuedDate(value); break;
            case 'receivedDate': setReceivedDate(value); break;
            case 'sentDate': setSentDate(value); break;
            case 'parentCorrespondenceId': setParentCorrespondenceId(value); break;
            case 'documentTypeId': setDocumentTypeId(value); break;
            case 'senderEntityId': setSenderEntityId(value); break;
            default: break;
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
    // إرسال المراسلة
    // =========================

    const handleSend = async () => {
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

        formData.append("Number", String(number));
        formData.append("MainType", String(mainType));
        formData.append("IsProfessional", String(isProfessional));
        formData.append("Title", title);
        formData.append("SenderEntityId", String(senderEntityId));
        formData.append("DocumentTypeId", String(documentTypeId));
        formData.append("IssuedDate", localDateToUTC(issuedDate));

        if (receivedDate) {
            formData.append("ReceivedDate", localDateToUTC(receivedDate));
        }
        if (sentDate) {
            formData.append("SentDate", localDateToUTC(sentDate));
        }

        if (content) formData.append("Content", content);
        if (senderReference) formData.append("SenderReference", senderReference);
        if (notes) formData.append("Notes", notes);
        if (parentCorrespondenceId) formData.append("ParentCorrespondenceId", String(parentCorrespondenceId));

        if (primaryFile) {
            formData.append("PrimaryFile", primaryFile);
        }

        attachments.forEach((file) => {
            formData.append("AdditionalFiles", file);
        });

        // ✅ استخدام mutate مع onSuccess مخصص
        createMutation.mutate(formData, {
            onSuccess: (data) => {
                // ✅ هنا يمكن الوصول إلى data
                if (data?.id) {
                    if (hasPermission('ViewCorrespondence')) {
                        router.push(`/correspondences?id=${data.id}`);
                    } else {
                        router.push("/");
                    }
                } else {
                    router.push("/");
                }
            },
            onError: (error: any) => {
                toast.error(error?.message || "فشل إنشاء المراسلة");
            }
        });
    };

    // =========================
    // RENDER - Loading
    // =========================

    if (isAuthLoading || isLoadingDocumentTypes || isLoadingSenderEntities) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري التحميل...</span>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-red-500 text-lg">ليس لديك صلاحية لإنشاء مراسلة</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    // =========================
    // RENDER - Main
    // =========================

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto bg-gradient-to-br from-yellow-50 via-white to-blue-50"
            dir="rtl"
        >
            <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto">
                {/* HEADER - فقط زر الرجوع */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm text-sm"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        <span>رجوع</span>
                    </button>
                </div>

                {/* MAIN FORM - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* LEFT PANEL - METADATA (2 columns) */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-blue-100/30 flex flex-col gap-4">
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
                                            setErrors((prev) => ({
                                                ...prev,
                                                receivedDate: undefined,
                                                sentDate: undefined,
                                            }));
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
                                    onChange={(val) => handleFieldChange('number', val)}
                                    onBlur={() => handleBlur('number')}
                                    placeholder="أدخل الرقم..."
                                    error={errors.number}
                                    touched={touched.number}
                                    required
                                    min={1}
                                    step={1}
                                />
                            </div>
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

                        {/* 3. الجهة المرسلة */}
                        <FormSelect
                            id="senderEntityId"
                            label="الجهة المرسلة"
                            value={senderEntityId}
                            onChange={(val) => handleFieldChange('senderEntityId', val)}
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
                            onChange={(val) => handleFieldChange('documentTypeId', val)}
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
                        
                        <FormInput
                            id="senderReference"
                            label="مرجع المرسل (اختياري)"
                            type="text"
                            value={senderReference}
                            onChange={(val) => handleFieldChange('senderReference', val)}
                            onBlur={() => handleBlur('senderReference')}
                            placeholder="مرجع المرسل..."
                            error={errors.senderReference}
                            touched={touched.senderReference}
                            maxLength={255}
                        />
                        {/* 7. التواريخ */}
                        <div className="grid grid-cols-1 gap-1.5">
                            <FormInput
                                id="issuedDate"
                                label="تاريخ الإصدار"
                                type="date"
                                value={issuedDate}
                                onChange={(val) => handleFieldChange('issuedDate', val)}
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
                                    onChange={(val) => handleFieldChange('receivedDate', val)}
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
                                    onChange={(val) => handleFieldChange('sentDate', val)}
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
                            onChange={(val) => handleFieldChange('title', val)}
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
                            onChange={(val) => handleFieldChange('content', val)}
                            onBlur={() => handleBlur('content')}
                            placeholder="محتوى المراسلة..."
                            error={errors.content}
                            touched={touched.content}
                            maxLength={4000}
                            rows={5}
                            className="min-h-[150px]"
                        />

                        {/* NOTES - تم نقلها هنا (قبل المرفقات) */}
                        <FormTextarea
                            id="notes"
                            label="ملاحظات إضافية (اختياري)"
                            value={notes}
                            onChange={(val) => handleFieldChange('notes', val)}
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
                                        {attachments.length + (primaryFile ? 1 : 0)}
                                    </span>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg text-xs">
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>أساسي</span>
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) =>
                                                handlePrimaryFile(e.target.files?.[0] || null)
                                            }
                                        />
                                    </label>
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg text-xs">
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>إضافي</span>
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={(e) => handleAdditionalFiles(e.target.files)}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* ===== منطقة المرفقات - تأخذ المساحة المتبقية ===== */}
                            <div className="flex-1">
                                {/* Primary File Preview */}
                                {primaryFile && (
                                    <div className="flex items-center justify-between p-2 rounded-xl border-2 border-blue-300 bg-blue-50/80 mb-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-7 h-7 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon icon={getFileIcon(primaryFile.type)} className="text-blue-600 text-xs" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-blue-900 truncate text-xs">
                                                    {primaryFile.name}{" "}
                                                    <span className="text-[10px] text-blue-500">(أساسي)</span>
                                                </p>
                                                <p className="text-[10px] text-blue-500">
                                                    {(primaryFile.size / 1024).toFixed(1)} كيلوبايت
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removePrimaryFile}
                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                        >
                                            <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                        </button>
                                    </div>
                                )}

                                {/* Additional Files */}
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((file, index) => (
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
                                                onClick={() => removeAdditionalFile(index)}
                                                className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* ===== أزرار الإجراءات - ثابتة في الأسفل ===== */}
                            <div className="flex gap-3 pt-3 border-t border-blue-100 flex-shrink-0 mt-auto">
                                <button
                                    onClick={handleSend}
                                    disabled={createMutation.isPending}
                                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 font-bold shadow-lg shadow-blue-200 text-sm ${
                                        createMutation.isPending
                                            ? "opacity-70 cursor-not-allowed"
                                            : "active:scale-95 hover:shadow-xl"
                                    }`}
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                            <span>جاري الإرسال...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            <span>إرسال المراسلة</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
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