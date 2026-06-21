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
    const [sentDate, setSentDate] = useState("");
    const [issuedDate, setIssuedDate] = useState("");
    const [receivedDate, setReceivedDate] = useState("");
    const [showMetadata, setShowMetadata] = useState(true);

    const queryClient = useQueryClient();
    const { isMailComposeShown, triggerMailCompose } = useMailComposeStore();

    const getSenderEntities = async () => {
        const req = await apiWrapper.get<SenderEntityResponse>("/SenderEntities");
        if (req.data) {
            setSenderEntities(req.data.data);
            if (req.data.data.length > 0) setSenderEntityId(req.data.data[0].id.toString());
        }
    };

    const getDocumentTypes = async () => {
        const req = await apiWrapper.get<DocumentTypeResponse>("/DocumentTypes");
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
            newFormData.append("Content", content); // Sending plain text
            newFormData.append("MainType", mailType);
            newFormData.append("IsProfessional", String(isProfessional));
            newFormData.append("sentDate", sentDate || now.toISOString());
            newFormData.append("issuedDate", issuedDate || now.toISOString());
            newFormData.append("receivedDate", receivedDate || now.toISOString());
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
        setSentDate("");
        setIssuedDate("");
        setReceivedDate("");
    };

    return (
        <AnimatePresence>
            {isMailComposeShown && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    dir="rtl"
                    className="fixed inset-0 top-16 z-50 bg-white flex flex-col"
                >
                    {/* Header */}
                    <header className="h-16 px-8 border-b flex items-center justify-between bg-blue-900 text-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FontAwesomeIcon icon={faPaperPlane} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight">إنشاء بريد جديد</h1>
                                <p className="text-xs text-slate-400 font-medium">نظام المراسلات الإلكترونية</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={triggerMailCompose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500 transition-all group"
                            >
                                <FontAwesomeIcon icon={faXmark} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </header>

                    {/* Main Workspace */}
                    <main className="flex-1 flex overflow-hidden">
                        {/* Editor Side */}
                        <div className="flex-1 flex flex-col bg-white overflow-hidden">
                            {/* Subject Area */}
                            <div className="px-12 py-10 border-b shrink-0">
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="أدخل عنوان الموضوع هنا..."
                                    className="w-full text-4xl font-black text-slate-800 placeholder:text-slate-200 outline-none border-none"
                                />
                            </div>

                            {/* Basic Textarea Content Area */}
                            <div className="flex-1 overflow-y-auto px-12 py-8">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="اكتب محتوى الرسالة هنا..."
                                    className="w-full h-full text-xl leading-relaxed text-slate-700 placeholder:text-slate-300 outline-none border-none resize-none bg-transparent"
                                />
                            </div>

                            {/* Attachments Section */}
                            <div className="px-12 py-6 bg-slate-50 border-t shrink-0">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all font-bold text-sm shadow-sm">
                                        <FontAwesomeIcon icon={faPaperclip} />
                                        إرفاق ملفات
                                        <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm animate-in fade-in slide-in-from-right-2">
                                                <FontAwesomeIcon icon={faFileAlt} className="text-blue-500" />
                                                <span className="max-w-[150px] truncate">{file.name}</span>
                                                <button onClick={() => removeFile(i)} className="mr-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <FontAwesomeIcon icon={faXmark} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Sidebar */}
                        <aside className="w-80 border-r bg-slate-50 flex flex-col shrink-0">
                            <div className="p-8 border-b bg-white">
                                <h3 className="font-black text-slate-800 flex items-center gap-3 text-base">
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                                    بيانات المراسلة
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                                {/* Form Sections */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            نوع البريد
                                        </label>
                                        <select
                                            value={mailType}
                                            onChange={(e) => setMailType(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        >
                                            <option value="incoming">وارد</option>
                                            <option value="outgoing">صادر</option>
                                            <option value="internal">داخلي</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            التصنيف المهني
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 bg-slate-200/50 p-1.5 rounded-2xl">
                                            <button
                                                onClick={() => setIsProfessional(true)}
                                                className={`py-2.5 text-xs font-black rounded-xl transition-all ${isProfessional ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                                                    }`}
                                            >
                                                مهني
                                            </button>
                                            <button
                                                onClick={() => setIsProfessional(false)}
                                                className={`py-2.5 text-xs font-black rounded-xl transition-all ${!isProfessional ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                                                    }`}
                                            >
                                                غير مهني
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            الرقم المرجعي
                                        </label>
                                        <input
                                            type="text"
                                            value={number}
                                            onChange={(e) => setNumber(e.target.value)}
                                            placeholder="أدخل الرقم..."
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            الجهة المرسلة
                                        </label>
                                        <select
                                            value={senderEntityId}
                                            onChange={(e) => setSenderEntityId(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        >
                                            <option value="" disabled>اختر الجهة...</option>
                                            {senderEntities?.map((entity) => (
                                                <option value={entity.id} key={entity.id}>{entity.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            نوع المستند
                                        </label>
                                        <select
                                            value={documentTypeId}
                                            onChange={(e) => setDocumentTypeId(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        >
                                            <option value="" disabled>اختر النوع...</option>
                                            {documentTypes?.map((type) => (
                                                <option value={type.id} key={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            تاريخ الإصدار
                                        </label>
                                        <input
                                            type="date"
                                            value={issuedDate}
                                            onChange={(e) => setIssuedDate(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            تاريخ الإرسال
                                        </label>
                                        <input
                                            type="date"
                                            value={sentDate}
                                            onChange={(e) => setSentDate(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            تاريخ الاستلام
                                        </label>
                                        <input
                                            type="date"
                                            value={receivedDate}
                                            onChange={(e) => setReceivedDate(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-8 border-t bg-white">
                                <button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className={`w-full py-5 rounded-[2rem] font-black text-white bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-4 ${loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:-translate-y-1"
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    )}
                                    {loading ? "جاري الإرسال..." : "إرسال المراسلة"}
                                </button>
                                <button
                                    onClick={triggerMailCompose}
                                    className="w-full mt-4 py-2 text-xs font-black text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-widest"
                                >
                                    إلغاء العملية
                                </button>
                            </div>
                        </aside>
                    </main>
                </motion.div>
            )}
        </AnimatePresence>
    );
}