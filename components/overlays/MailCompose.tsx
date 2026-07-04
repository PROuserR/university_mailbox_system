"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPaperPlane,
    faPaperclip,
    faXmark,
    faCalendarAlt,
    faFileAlt,
    faUser,
    faHashtag,
    faInfoCircle,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import useMailComposeStore from "@/store/mailComposeStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiWrapper } from "@/utils/apiClient";
import { SenderEntity, SenderEntityResponse } from "@/types/api/SenderEntity";
import { DocumentTypeResponse, DocumentType } from "@/types/api/DocumentTypesResponse";

interface CreateMailResponse {
    data: any;
    message?: string;
}

export default function MailComposeOverlay() {
    const [subject, setSubject] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [senderEntities, setSenderEntities] = useState<SenderEntity[]>();
    const [senderEntityId, setSenderEntityId] = useState("");
    const [documentTypeId, setDocumentTypeId] = useState("");
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [mailType, setMailType] = useState<string>("incoming");
    const [isProfessional, setIsProfessional] = useState<boolean>(true);
    const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split("T")[0]);
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
    const [sentDate, setSentDate] = useState(new Date().toISOString().split("T")[0]);

    const queryClient = useQueryClient();
    const { isMailComposeShown, triggerMailCompose } = useMailComposeStore();

    const getSenderEntities = async () => {
        const req = await apiWrapper.get<SenderEntityResponse>("/SenderEntities/active");
        if (req.data) {
            setSenderEntities(req.data.data);
            if (req.data.data.length > 0) setSenderEntityId(req.data.data[0].id.toString());
        }
    };

    const getDocumentTypes = async () => {
        const req = await apiWrapper.get<DocumentTypeResponse>("/DocumentTypes/active");
        if (req.data) {
            setDocumentTypes(req.data.data);
            if (req.data.data.length > 0) setDocumentTypeId(req.data.data[0].id.toString());
        }
    };

    useEffect(() => {
        if (isMailComposeShown) {
            getSenderEntities();
            getDocumentTypes();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isMailComposeShown]);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        setAttachments((prev) => [...prev, ...Array.from(files)]);
    };

    const removeFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if (!subject.trim()) return toast.error("الموضوع مطلوب");
        if (!content.trim()) return toast.error("الرسالة فارغة");

        setLoading(true);
        const loadingToast = toast.loading("جاري إرسال الرسالة...");
        const now = new Date();

        try {
            const newFormData = new FormData();
            newFormData.append("DocumentTypeID", documentTypeId);
            newFormData.append("Number", number);
            newFormData.append("Title", subject);
            newFormData.append("Content", content);
            newFormData.append("MainType", mailType);
            newFormData.append("IsProfessional", String(isProfessional));
            newFormData.append("issuedDate", issuedDate || now.toISOString());
            newFormData.append("senderEntityId", senderEntityId);
            attachments.forEach((file) => newFormData.append("AdditionalFiles", file));

            await apiWrapper.post<CreateMailResponse>("/Correspondences", newFormData);
            queryClient.invalidateQueries({ queryKey: ["mails"] });
            queryClient.invalidateQueries({ queryKey: ["mailsCount"] });

            toast.success("تم إرسال الرسالة بنجاح!", { id: loadingToast });
            resetForm();
            triggerMailCompose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "فشل إرسال الرسالة.";
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSubject("");
        setContent("");
        setNumber("");
        setAttachments([]);
        setMailType("incoming");
        setIsProfessional(true);
        setIssuedDate("");
    };

    return (
        <AnimatePresence>
            {isMailComposeShown && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    dir="rtl"
                    className="fixed inset-0 top-16 z-50 bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex flex-col"
                >
                    {/* Modern Header */}
                    <header className="h-20 px-8 border-b border-blue-100/50 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                                <FontAwesomeIcon icon={faPaperPlane} className="text-yellow-300 text-lg" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">إنشاء مراسلة</h1>
                            </div>
                        </div>

                        <button
                            onClick={triggerMailCompose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-red-50 text-blue-600 hover:text-red-500 transition-all duration-200 group"
                        >
                            <FontAwesomeIcon icon={faXmark} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 flex overflow-hidden gap-0">
                        {/* Left Panel - Metadata (Primary) */}
                        <aside className="w-2/3 border-r border-blue-100/30 bg-white/50 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden">
                            {/* Metadata Header */}
                            <div className="p-6 border-b border-blue-100/30 bg-white/80">
                                <h2 className="font-bold text-blue-900 flex items-center gap-3 text-base">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-white text-sm" />
                                    </div>
                                    بيانات المراسلة
                                </h2>
                            </div>

                            {/* Metadata Form - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                {/* Mail Type Selection */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">نوع البريد</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: "incoming", label: "وارد" },
                                            { value: "outgoing", label: "صادر" },
                                            { value: "internal", label: "داخلي" }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setMailType(option.value)}
                                                className={`py-3 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${mailType === option.value
                                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "bg-blue-50/60 text-blue-600 hover:bg-blue-100/60 border border-blue-100"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Professional Classification */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">التصنيف</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: true, label: "مهني" },
                                            { value: false, label: "غير مهني" }
                                        ].map((option) => (
                                            <button
                                                key={String(option.value)}
                                                onClick={() => setIsProfessional(option.value)}
                                                className={`py-3 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${isProfessional === option.value
                                                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 shadow-lg shadow-yellow-200"
                                                    : "bg-yellow-50/60 text-yellow-700 hover:bg-yellow-100/60 border border-yellow-100"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sender Entity Selection */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">الجهة المرسلة</label>
                                    <select
                                        value={senderEntityId}
                                        onChange={(e) => setSenderEntityId(e.target.value)}
                                        className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm hover:border-blue-200"
                                    >
                                        <option value="" disabled>اختر الجهة...</option>
                                        {senderEntities?.map((entity) => (
                                            <option value={entity.id} key={entity.id}>{entity.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Document Type Selection */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">نوع المستند</label>
                                    <select
                                        value={documentTypeId}
                                        onChange={(e) => setDocumentTypeId(e.target.value)}
                                        className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm hover:border-blue-200"
                                    >
                                        <option value="" disabled>اختر النوع...</option>
                                        {documentTypes?.map((type) => (
                                            <option value={type.id} key={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reference Number */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">الرقم المرجعي</label>
                                    <input
                                        type="text"
                                        value={number}
                                        onChange={(e) => setNumber(e.target.value)}
                                        placeholder="أدخل الرقم..."
                                        className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 placeholder:text-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
                                    />
                                </div>

                                {mailType === "incoming" && <>
                                    {/* Date Inputs */}
                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-2.5">
                                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الإصدار</label>
                                            <input
                                                type="date"
                                                value={issuedDate}
                                                onChange={(e) => setIssuedDate(e.target.value)}
                                                className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-2.5">
                                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الاستلام</label>
                                            <input
                                                type="date"
                                                value={receivedDate}
                                                onChange={(e) => setReceivedDate(e.target.value)}
                                                className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </>}

                                {mailType === "outgoing" && <>
                                    {/* Date Inputs */}
                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-2.5">
                                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الإصدار</label>
                                            <input
                                                type="date"
                                                value={issuedDate}
                                                onChange={(e) => setIssuedDate(e.target.value)}
                                                className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-2.5">
                                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الارسال</label>
                                            <input
                                                type="date"
                                                value={sentDate}
                                                onChange={(e) => setSentDate(e.target.value)}
                                                className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </>}

                                {mailType === "internal" && <>
                                    {/* Date Inputs */}
                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-2.5">
                                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الإصدار</label>
                                            <input
                                                type="date"
                                                value={issuedDate}
                                                onChange={(e) => setIssuedDate(e.target.value)}
                                                className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </>}
                            </div>

                            {/* Metadata Footer - Action Buttons */}
                            <div className="p-6 border-t border-blue-100/30 bg-white/80 space-y-3 shrink-0">
                                <button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:shadow-xl"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
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
                                    onClick={triggerMailCompose}
                                    className="w-full py-2 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest"
                                >
                                    إلغاء العملية
                                </button>
                            </div>
                        </aside>

                        {/* Right Panel - Content Editor (Secondary) */}
                        <div className="w-1/3 flex-1 flex flex-col bg-white/40 backdrop-blur-sm overflow-hidden">
                            {/* Subject Input - Minimal */}
                            <div className="px-10 py-8 border-b border-blue-100/30 shrink-0">
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="الموضوع..."
                                    className="w-full text-3xl font-bold text-blue-900 placeholder:text-blue-200 outline-none border-none bg-transparent"
                                />
                            </div>

                            {/* Content Textarea - Main Focus */}
                            <div className="flex-1 overflow-y-auto px-10 py-8">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="اكتب محتوى الرسالة هنا..."
                                    className="w-full h-full text-lg leading-relaxed text-blue-800 placeholder:text-blue-200/70 outline-none border-none resize-none bg-transparent font-light"
                                />
                            </div>

                            {/* Attachments Section - Minimal */}
                            <div className="px-10 py-6 bg-yellow-50/40 border-t border-yellow-100/30 shrink-0">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 py-4 px-8 bg-white border-2 border-yellow-400 text-yellow-700 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all font-semibold text-sm shadow-sm">
                                        <FontAwesomeIcon icon={faPaperclip} className="text-yellow-600" />
                                        إرفاق
                                        <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((file, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-2 bg-white border border-yellow-200 px-3 py-2 rounded-lg text-xs font-semibold text-yellow-700 shadow-sm"
                                            >
                                                <FontAwesomeIcon icon={faFileAlt} className="text-yellow-600" />
                                                <span className="max-w-[120px] truncate">{file.name}</span>
                                                <button
                                                    onClick={() => removeFile(i)}
                                                    className="ml-1 text-yellow-300 hover:text-red-500 transition-colors"
                                                >
                                                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
