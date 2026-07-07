/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/mail/create/page.tsx

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
    faInfoCircle,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { apiWrapper, ApiResult } from "@/utils/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import { CorrespondenceMainType } from "@/types/api/correspondence.types";
import { DocumentType } from "@/types/api/DocumentTypesResponse";
import { SenderEntity } from "@/types/api/SenderEntity";

// ==============================
// TYPES
// ==============================

type CreateMailResponse = {
    data: any;
    message?: string;
};

// ==============================
// COMPONENT
// ==============================

export default function CreateCorrespondencePage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // =========================
    // STATE
    // =========================

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [number, setNumber] = useState("");
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

    const [attachments, setAttachments] = useState<File[]>([]);
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);
    const [senderEntities, setSenderEntities] = useState<SenderEntity[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // =========================
    // جلب البيانات
    // =========================

    const getSenderEntities = async () => {
        const req = await apiWrapper.get<ApiResult<SenderEntity[]>>(
            "/SenderEntities/active"
        );
        if (req.data?.isSuccess) {
            setSenderEntities(req.data.data);
            if (req.data.data.length > 0) {
                setSenderEntityId(req.data.data[0].id);
            }
        }
    };

    const getDocumentTypes = async () => {
        const req = await apiWrapper.get<ApiResult<DocumentType[]>>(
            "/DocumentTypes/active"
        );
        if (req.data?.isSuccess) {
            setDocumentTypes(req.data.data);
            if (req.data.data.length > 0) {
                setDocumentTypeId(req.data.data[0].id);
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            await Promise.all([getSenderEntities(), getDocumentTypes()]);
            setLoadingData(false);
        };
        loadData();

        // تعيين التواريخ الافتراضية
        const today = new Date().toISOString().split("T")[0];
        setIssuedDate(today);
        setReceivedDate(today);
        setSentDate(today);
    }, []);

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
    // إرسال المراسلة
    // =========================

    const handleSend = async () => {
        if (!title.trim()) {
            toast.error("العنوان مطلوب");
            return;
        }

        if (!senderEntityId) {
            toast.error("الجهة المرسلة مطلوبة");
            return;
        }

        if (!documentTypeId) {
            toast.error("نوع المستند مطلوب");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("جاري إرسال المراسلة...");

        try {
            const formData = new FormData();

            // الحقول المطلوبة
            formData.append("Number", number);
            formData.append("MainType", String(mainType));
            formData.append("IsProfessional", String(isProfessional));
            formData.append("Title", title);
            formData.append("SenderEntityId", String(senderEntityId));
            formData.append("DocumentTypeId", String(documentTypeId));

            // الحقول الاختيارية
            if (content) formData.append("Content", content);
            if (senderReference) formData.append("SenderReference", senderReference);
            if (notes) formData.append("Notes", notes);
            if (issuedDate) formData.append("IssuedDate", issuedDate);
            if (receivedDate) formData.append("ReceivedDate", receivedDate);
            if (sentDate) formData.append("SentDate", sentDate);

            // الملفات
            if (primaryFile) {
                formData.append("PrimaryFile", primaryFile);
            }

            attachments.forEach((file) => {
                formData.append("AdditionalFiles", file);
            });

            const res = await apiWrapper.post<ApiResult<CreateMailResponse>>(
                "/Correspondences",
                formData
            );

            if (res.data?.isSuccess) {
                queryClient.invalidateQueries({ queryKey: ["mails"] });
                queryClient.invalidateQueries({ queryKey: ["mailsCount"] });

                toast.success("تم إرسال المراسلة بنجاح!", { id: loadingToast });
                router.push("/");
            } else {
                throw new Error(res.data?.message || "فشل إرسال المراسلة");
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || error.message || "فشل إرسال المراسلة.";
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // RENDER
    // =========================

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري التحميل...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto bg-gradient-to-br from-yellow-50 via-white to-blue-50"
            dir="rtl"
        >
            <div className="p-6 flex flex-col gap-6">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm text-sm"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        <span>رجوع</span>
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 font-bold shadow-lg shadow-blue-200 text-sm ${
                            loading
                                ? "opacity-70 cursor-not-allowed"
                                : "active:scale-95 hover:shadow-xl"
                        }`}
                    >
                        {loading ? (
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
                                        {attachments.length + (primaryFile ? 1 : 0)}
                                    </span>
                                </div>
                                <div className="flex gap-1.5">
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

                            {/* Primary File Preview */}
                            {primaryFile && (
                                <div className="flex items-center justify-between p-2 rounded-xl border-2 border-blue-300 bg-blue-50/80">
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
                    </div>
                </div>
            </div>
        </motion.div>
    );
}