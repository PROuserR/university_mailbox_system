// components/mail/MailEditPage.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

// =========================
// استيراد من الملفات المفصولة
// =========================
import { useCorrespondence, useUpdateCorrespondence, useDocumentTypes, useSenderEntities } from "@/hooks/useCorrespondence";
import { CorrespondenceMainType, UpdateCorrespondencePayload } from "@/types/api/correspondence.types";
import { Attachment } from "@/types/api/attachment.types";
import { Mail } from "@/types/api/Mail/Mail";

// =========================
// TYPES
// =========================

type Props = {
    mail: Mail;
    filter: string;
    searchInput: string;
    onBack: () => void;
    onSuccess?: (updatedMail: Mail) => void;
};

// =========================
// COMPONENT
// =========================

const getMainTypeFromString = (type: string | number | undefined): CorrespondenceMainType => {
    if (type === undefined || type === null) {
        return CorrespondenceMainType.Incoming;
    }

    // إذا كان number بالفعل
    if (typeof type === 'number') {
        return type >= 1 && type <= 3 ? type : CorrespondenceMainType.Incoming;
    }

    // إذا كان string
    const mapping: Record<string, CorrespondenceMainType> = {
        'Incoming': CorrespondenceMainType.Incoming,
        'Outgoing': CorrespondenceMainType.Outgoing,
        'Internal': CorrespondenceMainType.Internal,
        // دعم الأحرف الصغيرة
        'incoming': CorrespondenceMainType.Incoming,
        'outgoing': CorrespondenceMainType.Outgoing,
        'internal': CorrespondenceMainType.Internal,
        // دعم الأرقام كنص
        '1': CorrespondenceMainType.Incoming,
        '2': CorrespondenceMainType.Outgoing,
        '3': CorrespondenceMainType.Internal,
    };

    return mapping[type] ?? CorrespondenceMainType.Incoming;
};
export default function MailEditPage({
    mail,
    filter,
    searchInput,
    onBack,
    onSuccess,
}: Props) {
    // =========================
    // جلب البيانات
    // =========================

    const { data: correspondence, isLoading: isLoadingCorrespondence } = useCorrespondence(mail.id);
    const { data: documentTypes = [] } = useDocumentTypes();
    const { data: senderEntities = [] } = useSenderEntities();

    // =========================
    // STATE
    // =========================

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [number, setNumber] = useState("");
    const [mainType, setMainType] = useState<CorrespondenceMainType>(CorrespondenceMainType.Incoming);
    const [isProfessional, setIsProfessional] = useState(false);
    const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
    const [senderEntityId, setSenderEntityId] = useState<number | null>(null);
    const [senderReference, setSenderReference] = useState("");
    const [issuedDate, setIssuedDate] = useState("");
    const [receivedDate, setReceivedDate] = useState("");
    const [sentDate, setSentDate] = useState("");
    const [notes, setNotes] = useState("");

    // المرفقات
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);

    // =========================
    // تهيئة البيانات من المراسلة
    // =========================

    useEffect(() => {
        if (correspondence) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(correspondence.title ?? "");
            setContent(correspondence.content ?? "");
            setNumber(correspondence.number ?? "");
        const mainTypeValue = getMainTypeFromString(correspondence.mainType);
        console.log("Converted mainType:", mainTypeValue);
        setMainType(mainTypeValue);
        
            setIsProfessional(correspondence.isProfessional ?? false);
            setDocumentTypeId(correspondence.documentTypeId);
            setSenderEntityId(correspondence.senderEntityId);
            setSenderReference(correspondence.senderReference ?? "");
            setIssuedDate(correspondence.issuedDate?.split("T")[0] ?? "");
            setReceivedDate(correspondence.receivedDate?.split("T")[0] ?? "");
            setSentDate(correspondence.sentDate?.split("T")[0] ?? "");
            setNotes(correspondence.notes ?? "");
            setAttachments(correspondence.attachments ?? []);
        }
    }, [correspondence]);

    // =========================
    // HOOKS
    // =========================

    const updateMutation = useUpdateCorrespondence(mail.id, () => {
        if (onSuccess) {
            const updatedMail: Mail = {
                ...mail,
                title,
                content,
                number,
                issuedDate,
                senderEntityId: senderEntityId?.toString() ?? null,
                senderEntity: senderEntities.find(e => e.id === senderEntityId)?.name ?? null,
                isProfessional,
                mainType: mainType !== undefined ? CorrespondenceMainType[mainType] : "Incoming",
                documentType: documentTypes.find(d => d.id === documentTypeId)?.name ?? "",
                documentTypeId: documentTypeId ?? 0,
                attachments: attachments ,
                notes: notes || null,
            };
            onSuccess(updatedMail);
        }
        onBack();
    });

    // =========================
    // دوال مساعدة
    // =========================

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes("image")) return faFileImage;
        if (mimeType.includes("pdf")) return faFilePdf;
        if (mimeType.includes("word") || mimeType.includes("document")) return faFileWord;
        if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return faFileExcel;
        return faFile;
    };

    const getMainTypeLabel = (type: CorrespondenceMainType) => {
        switch (type) {
            case CorrespondenceMainType.Incoming: return "وارد";
            case CorrespondenceMainType.Outgoing: return "صادر";
            case CorrespondenceMainType.Internal: return "داخلي";
            default: return "غير محدد";
        }
    };

    // =========================
    // دوال المرفقات
    // =========================

    const removeAttachment = (attachmentId: number) => {
        setDeletedAttachmentIds((prev) => [...prev, attachmentId]);
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    };

    const removeNewFile = (fileName: string) => {
        setNewFiles((prev) => prev.filter((file) => file.name !== fileName));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setNewFiles((prev) => [...prev, ...Array.from(files)]);
    };

    const handlePrimaryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPrimaryFile(file);
        }
    };

    const totalFiles = useMemo(
        () => attachments.length + newFiles.length + (primaryFile ? 1 : 0),
        [attachments, newFiles, primaryFile]
    );

    // =========================
    // حفظ التغييرات
    // =========================

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("العنوان مطلوب");
            return;
        }

        const payload: UpdateCorrespondencePayload = {
            number: number || undefined,
            mainType: mainType,
            isProfessional: isProfessional,
            documentTypeId: documentTypeId || undefined,
            senderEntityId: senderEntityId || undefined,
            title: title,
            content: content || undefined,
            senderReference: senderReference || undefined,
            issuedDate: issuedDate || undefined,
            receivedDate: receivedDate || undefined,
            sentDate: sentDate || undefined,
            notes: notes || undefined,
            deletedAttachmentIds: deletedAttachmentIds.length > 0 ? deletedAttachmentIds : undefined,
        };

        updateMutation.mutate({
            data: payload,
            files: newFiles.length > 0 ? newFiles : undefined,
            primaryFile: primaryFile || undefined,
        });
    };

    // =========================
    // حالات التحميل
    // =========================

    if (isLoadingCorrespondence) {
        return (
            <div className="flex h-96 items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600">جاري تحميل البيانات...</span>
            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (
        <motion.div
            key="edit-mail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto bg-gradient-to-br from-yellow-50 via-white to-blue-50"
            dir="rtl"
        >
            <div className="p-6 flex flex-col gap-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm text-sm"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        <span>رجوع</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 font-bold shadow-lg shadow-blue-200 text-sm ${
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
                                        onClick={() => setMainType(option.value)}
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

                        {/* 2. مهني (Professional) */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50/60 border border-yellow-100">
                            <span className="font-bold text-yellow-900 text-sm">مهني</span>
                            <button
                                type="button"
                                onClick={() => setIsProfessional((prev) => !prev)}
                                className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                                    isProfessional
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-200"
                                        : "bg-blue-100"
                                }`}
                            >
                                <motion.div
                                    layout
                                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                                        isProfessional ? "right-1" : "left-1"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* 3. رقم المراسلة */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                رقم المراسلة
                            </label>
                            <input
                                type="text"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="أدخل رقم المراسلة..."
                                className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                            />
                        </div>

                        {/* 4. الجهة المرسلة */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                الجهة المرسلة
                            </label>
                            <select
                                value={senderEntityId ?? ""}
                                onChange={(e) => setSenderEntityId(Number(e.target.value) || null)}
                                className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                            >
                                <option value="">اختر الجهة...</option>
                                {senderEntities.map((entity) => (
                                    <option key={entity.id} value={entity.id}>
                                        {entity.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. نوع المستند */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                نوع المستند
                            </label>
                            <select
                                value={documentTypeId ?? ""}
                                onChange={(e) => setDocumentTypeId(Number(e.target.value) || null)}
                                className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                            >
                                <option value="">اختر النوع...</option>
                                {documentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 6. مرجع المرسل (اختياري) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                مرجع المرسل (اختياري)
                            </label>
                            <input
                                type="text"
                                value={senderReference}
                                onChange={(e) => setSenderReference(e.target.value)}
                                placeholder="مرجع المرسل..."
                                className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                            />
                        </div>

                        {/* 7. التواريخ - تظهر دائماً */}
                        <div className="grid grid-cols-1 gap-1.5">
                            <span className="text-[10px] text-blue-400">تاريخ الإصدار</span>
                            <input
                                type="date"
                                value={issuedDate}
                                onChange={(e) => setIssuedDate(e.target.value)}
                                className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                            />
                           

                            {mainType === CorrespondenceMainType.Incoming && (
                                <>
                                 <span className="text-[10px] text-blue-400">تاريخ الاستلام</span>
                                    <input
                                        type="date"
                                        value={receivedDate}
                                        onChange={(e) => setReceivedDate(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                                    />
                                </>
                            )}

                            {mainType === CorrespondenceMainType.Outgoing && (
                                <>
                                 <span className="text-[10px] text-blue-400">تاريخ الإرسال</span>
                                    <input
                                        type="date"
                                        value={sentDate}
                                        onChange={(e) => setSentDate(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                                    />
                                   
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL - CONTENT & ATTACHMENTS (3 columns) */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        {/* TITLE */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-blue-100/30 flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                العنوان
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 rounded-xl border-2 border-blue-100 bg-white text-xl font-bold text-blue-900 placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all text-right"
                                placeholder="عنوان المراسلة..."
                            />
                        </div>

                        {/* CONTENT */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-blue-100/30 flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                المحتوى
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[150px] p-3 rounded-xl border-2 border-blue-100 bg-white text-blue-800 text-sm placeholder:text-blue-200 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-light leading-relaxed text-right"
                                placeholder="محتوى المراسلة..."
                            />
                        </div>

                        {/* NOTES - أسفل المحتوى */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-blue-100/30 flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                ملاحظات إضافية
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="أضف ملاحظات إضافية..."
                                className="w-full p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-sm placeholder:text-blue-200 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                            />
                        </div>

                        {/* ATTACHMENTS */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-blue-100/30 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faPaperclip} className="text-white text-xs" />
                                    </div>
                                    <h2 className="text-sm font-bold text-blue-900">المرفقات</h2>
                                    <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {totalFiles}
                                    </span>
                                </div>
                                <div className="flex gap-1.5">
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg text-xs">
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>أساسي</span>
                                        <input
                                            type="file"
                                            hidden
                                            onChange={handlePrimaryFileUpload}
                                        />
                                    </label>
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg text-xs">
                                        <FontAwesomeIcon icon={faUpload} />
                                        <span>إضافي</span>
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Primary File Preview */}
                            {primaryFile && (
                                <div className="flex items-center justify-between p-2 rounded-xl border-2 border-blue-300 bg-blue-50/80">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-7 h-7 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FontAwesomeIcon icon={getFileIcon(primaryFile.type)} className="text-blue-600 text-xs" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-blue-900 truncate text-xs">
                                                {primaryFile.name} <span className="text-[10px] text-blue-500">(أساسي)</span>
                                            </p>
                                            <p className="text-[10px] text-blue-500">
                                                {(primaryFile.size / 1024).toFixed(1)} كيلوبايت
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPrimaryFile(null)}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                    </button>
                                </div>
                            )}

                            {/* Existing Attachments */}
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((attachment) => (
                                        <motion.div
                                            key={attachment.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
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
                                                    {attachment.isPrimary && (
                                                        <span className="text-[9px] text-blue-500 mr-1">(أساسي)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(attachment.id)}
                                                className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* New Files */}
                            {newFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
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
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}