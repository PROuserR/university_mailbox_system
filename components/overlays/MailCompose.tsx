// /* eslint-disable @typescript-eslint/no-explicit-any */
// // "use client";

// // import { useEffect, useState } from "react";
// // import toast from "react-hot-toast";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import {
// //     faPaperPlane,
// //     faPaperclip,
// //     faXmark,
// //     faCalendarAlt,
// //     faFileAlt,
// //     faUser,
// //     faHashtag,
// //     faInfoCircle,
// //     faChevronDown,
// // } from "@fortawesome/free-solid-svg-icons";
// // import useMailComposeStore from "@/store/mailComposeStore";
// // import { useMutation, useQueryClient } from "@tanstack/react-query";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { apiWrapper } from "@/utils/apiClient";
// // import { SenderEntity, SenderEntityResponse } from "@/types/api/SenderEntity";
// // import { DocumentTypeResponse, DocumentType } from "@/types/api/DocumentTypesResponse";

// // interface CreateMailResponse {
// //     data: any;
// //     message?: string;
// // }

// // export default function MailComposeOverlay() {
// //     const [subject, setSubject] = useState<string>("");
// //     const [content, setContent] = useState<string>("");
// //     const [number, setNumber] = useState<string>("");
// //     const [attachments, setAttachments] = useState<File[]>([]);
// //     const [senderEntities, setSenderEntities] = useState<SenderEntity[]>();
// //     const [senderEntityId, setSenderEntityId] = useState("");
// //     const [documentTypeId, setDocumentTypeId] = useState("");
// //     const [documentTypes, setDocumentTypes] = useState<DocumentType[]>();
// //     const [loading, setLoading] = useState<boolean>(false);
// //     const [mailType, setMailType] = useState<string>("incoming");
// //     const [isProfessional, setIsProfessional] = useState<boolean>(true);
// //     const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split("T")[0]);
// //     const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
// //     const [sentDate, setSentDate] = useState(new Date().toISOString().split("T")[0]);

// //     const queryClient = useQueryClient();
// //     const { isMailComposeShown, triggerMailCompose } = useMailComposeStore();

// //     const getSenderEntities = async () => {
// //         const req = await apiWrapper.get<SenderEntityResponse>("/SenderEntities/active");
// //         if (req.data) {
// //             setSenderEntities(req.data.data);
// //             if (req.data.data.length > 0) setSenderEntityId(req.data.data[0].id.toString());
// //         }
// //     };

// //     const getDocumentTypes = async () => {
// //         const req = await apiWrapper.get<DocumentTypeResponse>("/DocumentTypes/active");
// //         if (req.data) {
// //             setDocumentTypes(req.data.data);
// //             if (req.data.data.length > 0) setDocumentTypeId(req.data.data[0].id.toString());
// //         }
// //     };

// //     useEffect(() => {
// //         if (isMailComposeShown) {
// //             getSenderEntities();
// //             getDocumentTypes();
// //             document.body.style.overflow = "hidden";
// //         } else {
// //             document.body.style.overflow = "unset";
// //         }
// //         return () => { document.body.style.overflow = "unset"; };
// //     }, [isMailComposeShown]);

// //     const handleFiles = (files: FileList | null) => {
// //         if (!files) return;
// //         setAttachments((prev) => [...prev, ...Array.from(files)]);
// //     };

// //     const removeFile = (index: number) => {
// //         setAttachments((prev) => prev.filter((_, i) => i !== index));
// //     };

// //     const handleSend = async () => {
// //         if (!subject.trim()) return toast.error("الموضوع مطلوب");
// //         if (!content.trim()) return toast.error("الرسالة فارغة");

// //         setLoading(true);
// //         const loadingToast = toast.loading("جاري إرسال الرسالة...");
// //         const now = new Date();

// //         try {
// //             const newFormData = new FormData();
// //             newFormData.append("DocumentTypeID", documentTypeId);
// //             newFormData.append("Number", number);
// //             newFormData.append("Title", subject);
// //             newFormData.append("Content", content);
// //             newFormData.append("MainType", mailType);
// //             newFormData.append("IsProfessional", String(isProfessional));
// //             newFormData.append("issuedDate", issuedDate || now.toISOString());
// //             newFormData.append("senderEntityId", senderEntityId);
// //             attachments.forEach((file) => newFormData.append("AdditionalFiles", file));

// //             await apiWrapper.post<CreateMailResponse>("/Correspondences", newFormData);
// //             queryClient.invalidateQueries({ queryKey: ["mails"] });
// //             queryClient.invalidateQueries({ queryKey: ["mailsCount"] });

// //             toast.success("تم إرسال الرسالة بنجاح!", { id: loadingToast });
// //             resetForm();
// //             triggerMailCompose();
// //         } catch (error: any) {
// //             const errorMessage = error.response?.data?.message || "فشل إرسال الرسالة.";
// //             toast.error(errorMessage, { id: loadingToast });
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const resetForm = () => {
// //         setSubject("");
// //         setContent("");
// //         setNumber("");
// //         setAttachments([]);
// //         setMailType("incoming");
// //         setIsProfessional(true);
// //         setIssuedDate("");
// //     };

// //     return (
// //         <AnimatePresence>
// //             {isMailComposeShown && (
// //                 <motion.div
// //                     initial={{ opacity: 0 }}
// //                     animate={{ opacity: 1 }}
// //                     exit={{ opacity: 0 }}
// //                     dir="rtl"
// //                     className="fixed inset-0 top-16 z-50 bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex flex-col"
// //                 >
// //                     {/* Modern Header */}
// //                     <header className="h-20 px-8 border-b border-blue-100/50 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 shadow-sm">
// //                         <div className="flex items-center gap-4">
// //                             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
// //                                 <FontAwesomeIcon icon={faPaperPlane} className="text-yellow-300 text-lg" />
// //                             </div>
// //                             <div>
// //                                 <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">إنشاء مراسلة</h1>
// //                             </div>
// //                         </div>

// //                         <button
// //                             onClick={triggerMailCompose}
// //                             className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-red-50 text-blue-600 hover:text-red-500 transition-all duration-200 group"
// //                         >
// //                             <FontAwesomeIcon icon={faXmark} className="group-hover:scale-110 transition-transform" />
// //                         </button>
// //                     </header>

// //                     {/* Main Content Area */}
// //                     <main className="flex-1 flex overflow-hidden gap-0">
// //                         {/* Left Panel - Metadata (Primary) */}
// //                         <aside className="w-2/3 border-r border-blue-100/30 bg-white/50 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden">
// //                             {/* Metadata Header */}
// //                             <div className="p-6 border-b border-blue-100/30 bg-white/80">
// //                                 <h2 className="font-bold text-blue-900 flex items-center gap-3 text-base">
// //                                     <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
// //                                         <FontAwesomeIcon icon={faInfoCircle} className="text-white text-sm" />
// //                                     </div>
// //                                     بيانات المراسلة
// //                                 </h2>
// //                             </div>

// //                             {/* Metadata Form - Scrollable */}
// //                             <div className="flex-1 overflow-y-auto p-6 space-y-5">
// //                                 {/* Mail Type Selection */}
// //                                 <div className="space-y-2.5">
// //                                     <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">نوع البريد</label>
// //                                     <div className="grid grid-cols-3 gap-2">
// //                                         {[
// //                                             { value: "incoming", label: "وارد" },
// //                                             { value: "outgoing", label: "صادر" },
// //                                             { value: "internal", label: "داخلي" }
// //                                         ].map((option) => (
// //                                             <button
// //                                                 key={option.value}
// //                                                 onClick={() => setMailType(option.value)}
// //                                                 className={`py-3 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${mailType === option.value
// //                                                     ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
// //                                                     : "bg-blue-50/60 text-blue-600 hover:bg-blue-100/60 border border-blue-100"
// //                                                     }`}
// //                                             >
// //                                                 {option.label}
// //                                             </button>
// //                                         ))}
// //                                     </div>
// //                                 </div>

// //                                 {/* Professional Classification */}
// //                                 <div className="space-y-2.5">
// //                                     <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">التصنيف</label>
// //                                     <div className="grid grid-cols-2 gap-2">
// //                                         {[
// //                                             { value: true, label: "مهني" },
// //                                             { value: false, label: "غير مهني" }
// //                                         ].map((option) => (
// //                                             <button
// //                                                 key={String(option.value)}
// //                                                 onClick={() => setIsProfessional(option.value)}
// //                                                 className={`py-3 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${isProfessional === option.value
// //                                                     ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 shadow-lg shadow-yellow-200"
// //                                                     : "bg-yellow-50/60 text-yellow-700 hover:bg-yellow-100/60 border border-yellow-100"
// //                                                     }`}
// //                                             >
// //                                                 {option.label}
// //                                             </button>
// //                                         ))}
// //                                     </div>
// //                                 </div>

// //                                 {/* Sender Entity Selection */}
// //                                 <div className="space-y-2.5">
// //                                     <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">الجهة المرسلة</label>
// //                                     <select
// //                                         value={senderEntityId}
// //                                         onChange={(e) => setSenderEntityId(e.target.value)}
// //                                         className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm hover:border-blue-200"
// //                                     >
// //                                         <option value="" disabled>اختر الجهة...</option>
// //                                         {senderEntities?.map((entity) => (
// //                                             <option value={entity.id} key={entity.id}>{entity.name}</option>
// //                                         ))}
// //                                     </select>
// //                                 </div>

// //                                 {/* Document Type Selection */}
// //                                 <div className="space-y-2.5">
// //                                     <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">نوع المستند</label>
// //                                     <select
// //                                         value={documentTypeId}
// //                                         onChange={(e) => setDocumentTypeId(e.target.value)}
// //                                         className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm hover:border-blue-200"
// //                                     >
// //                                         <option value="" disabled>اختر النوع...</option>
// //                                         {documentTypes?.map((type) => (
// //                                             <option value={type.id} key={type.id}>{type.name}</option>
// //                                         ))}
// //                                     </select>
// //                                 </div>

// //                                 {/* Reference Number */}
// //                                 <div className="space-y-2.5">
// //                                     <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">الرقم المرجعي</label>
// //                                     <input
// //                                         type="text"
// //                                         value={number}
// //                                         onChange={(e) => setNumber(e.target.value)}
// //                                         placeholder="أدخل الرقم..."
// //                                         className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 placeholder:text-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
// //                                     />
// //                                 </div>

// //                                 {mailType === "incoming" && <>
// //                                     {/* Date Inputs */}
// //                                     <div className="space-y-3 pt-2">
// //                                         <div className="space-y-2.5">
// //                                             <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الإصدار</label>
// //                                             <input
// //                                                 type="date"
// //                                                 value={issuedDate}
// //                                                 onChange={(e) => setIssuedDate(e.target.value)}
// //                                                 className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
// //                                             />
// //                                         </div>
// //                                     </div>

// //                                     <div className="space-y-3 pt-2">
// //                                         <div className="space-y-2.5">
// //                                             <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الاستلام</label>
// //                                             <input
// //                                                 type="date"
// //                                                 value={receivedDate}
// //                                                 onChange={(e) => setReceivedDate(e.target.value)}
// //                                                 className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 </>}

// //                                 {mailType === "outgoing" && <>
// //                                     {/* Date Inputs */}
// //                                     <div className="space-y-3 pt-2">
// //                                         <div className="space-y-2.5">
// //                                             <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الإصدار</label>
// //                                             <input
// //                                                 type="date"
// //                                                 value={issuedDate}
// //                                                 onChange={(e) => setIssuedDate(e.target.value)}
// //                                                 className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
// //                                             />
// //                                         </div>
// //                                     </div>

// //                                     <div className="space-y-3 pt-2">
// //                                         <div className="space-y-2.5">
// //                                             <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الارسال</label>
// //                                             <input
// //                                                 type="date"
// //                                                 value={sentDate}
// //                                                 onChange={(e) => setSentDate(e.target.value)}
// //                                                 className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 </>}

// //                                 {mailType === "internal" && <>
// //                                     {/* Date Inputs */}
// //                                     <div className="space-y-3 pt-2">
// //                                         <div className="space-y-2.5">
// //                                             <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">تاريخ الإصدار</label>
// //                                             <input
// //                                                 type="date"
// //                                                 value={issuedDate}
// //                                                 onChange={(e) => setIssuedDate(e.target.value)}
// //                                                 className="w-full bg-white border-2 border-blue-100 rounded-xl p-3.5 text-sm font-semibold text-blue-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 </>}
// //                             </div>

// //                             {/* Metadata Footer - Action Buttons */}
// //                             <div className="p-6 border-t border-blue-100/30 bg-white/80 space-y-3 shrink-0">
// //                                 <button
// //                                     onClick={handleSend}
// //                                     disabled={loading}
// //                                     className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:shadow-xl"
// //                                         }`}
// //                                 >
// //                                     {loading ? (
// //                                         <>
// //                                             <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
// //                                             <span>جاري الإرسال...</span>
// //                                         </>
// //                                     ) : (
// //                                         <>
// //                                             <FontAwesomeIcon icon={faPaperPlane} />
// //                                             <span>إرسال المراسلة</span>
// //                                         </>
// //                                     )}
// //                                 </button>
// //                                 <button
// //                                     onClick={triggerMailCompose}
// //                                     className="w-full py-2 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest"
// //                                 >
// //                                     إلغاء العملية
// //                                 </button>
// //                             </div>
// //                         </aside>

// //                         {/* Right Panel - Content Editor (Secondary) */}
// //                         <div className="w-1/3 flex-1 flex flex-col bg-white/40 backdrop-blur-sm overflow-hidden">
// //                             {/* Subject Input - Minimal */}
// //                             <div className="px-10 py-8 border-b border-blue-100/30 shrink-0">
// //                                 <input
// //                                     value={subject}
// //                                     onChange={(e) => setSubject(e.target.value)}
// //                                     placeholder="الموضوع..."
// //                                     className="w-full text-3xl font-bold text-blue-900 placeholder:text-blue-200 outline-none border-none bg-transparent"
// //                                 />
// //                             </div>

// //                             {/* Content Textarea - Main Focus */}
// //                             <div className="flex-1 overflow-y-auto px-10 py-8">
// //                                 <textarea
// //                                     value={content}
// //                                     onChange={(e) => setContent(e.target.value)}
// //                                     placeholder="اكتب محتوى الرسالة هنا..."
// //                                     className="w-full h-full text-lg leading-relaxed text-blue-800 placeholder:text-blue-200/70 outline-none border-none resize-none bg-transparent font-light"
// //                                 />
// //                             </div>

// //                             {/* Attachments Section - Minimal */}
// //                             <div className="px-10 py-6 bg-yellow-50/40 border-t border-yellow-100/30 shrink-0">
// //                                 <div className="flex items-center gap-6">
// //                                     <label className="flex items-center gap-2 py-4 px-8 bg-white border-2 border-yellow-400 text-yellow-700 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all font-semibold text-sm shadow-sm">
// //                                         <FontAwesomeIcon icon={faPaperclip} className="text-yellow-600" />
// //                                         إرفاق
// //                                         <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
// //                                     </label>
// //                                     <div className="flex flex-wrap gap-2">
// //                                         {attachments.map((file, i) => (
// //                                             <motion.div
// //                                                 key={i}
// //                                                 initial={{ opacity: 0, scale: 0.9 }}
// //                                                 animate={{ opacity: 1, scale: 1 }}
// //                                                 exit={{ opacity: 0, scale: 0.9 }}
// //                                                 className="flex items-center gap-2 bg-white border border-yellow-200 px-3 py-2 rounded-lg text-xs font-semibold text-yellow-700 shadow-sm"
// //                                             >
// //                                                 <FontAwesomeIcon icon={faFileAlt} className="text-yellow-600" />
// //                                                 <span className="max-w-[120px] truncate">{file.name}</span>
// //                                                 <button
// //                                                     onClick={() => removeFile(i)}
// //                                                     className="ml-1 text-yellow-300 hover:text-red-500 transition-colors"
// //                                                 >
// //                                                     <FontAwesomeIcon icon={faXmark} className="text-xs" />
// //                                                 </button>
// //                                             </motion.div>
// //                                         ))}
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </main>
// //                 </motion.div>
// //             )}
// //         </AnimatePresence>
// //     );
// // }
//TODO
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPaperPlane,
    faPaperclip,
    faXmark,
    faInfoCircle,
    faUpload,
    faSpinner,
    faFile,
    faFileImage,
    faFilePdf,
    faFileWord,
    faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import useMailComposeStore from "@/store/mailComposeStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiWrapper } from "@/utils/apiClient";
import { SenderEntity, SenderEntityResponse } from "@/types/api/SenderEntity";
import { DocumentType, DocumentTypeResponse } from "@/types/api/DocumentTypesResponse";
import { CorrespondenceMainType } from "@/types/api/correspondence.types";

// =========================
// TYPES
// =========================

type CreateMailResponse = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    message?: string;
};

// =========================
// COMPONENT
// =========================

export default function MailComposeOverlay() {
    const queryClient = useQueryClient();
    const { isMailComposeShown, triggerMailCompose } = useMailComposeStore();

    // =========================
    // STATE
    // =========================

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [number, setNumber] = useState("");
    const [mainType, setMainType] = useState<CorrespondenceMainType>(CorrespondenceMainType.Incoming);
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

    // =========================
    // جلب البيانات
    // =========================

    const getSenderEntities = async () => {
        const req = await apiWrapper.get<SenderEntityResponse>("/SenderEntities/active");
        if (req.data) {
            setSenderEntities(req.data.data);
            if (req.data.data.length > 0) setSenderEntityId(req.data.data[0].id);
        }
    };

    const getDocumentTypes = async () => {
        const req = await apiWrapper.get<DocumentTypeResponse>("/DocumentTypes/active");
        if (req.data) {
            setDocumentTypes(req.data.data);
            if (req.data.data.length > 0) setDocumentTypeId(req.data.data[0].id);
        }
    };

    // =========================
    // تعيين التواريخ الافتراضية
    // =========================

    const getToday = () => {
        return new Date().toISOString().split("T")[0];
    };

    useEffect(() => {
        if (isMailComposeShown) {
            getSenderEntities();
            getDocumentTypes();
            document.body.style.overflow = "hidden";

            const today = getToday();
            setIssuedDate(today);
            setReceivedDate(today);
            setSentDate(today);
        } else {
            document.body.style.overflow = "unset";
            resetForm();
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMailComposeShown]);

    useEffect(() => {
        const today = getToday();
        if (mainType === CorrespondenceMainType.Incoming) {
            setReceivedDate(today);
        } else if (mainType === CorrespondenceMainType.Outgoing) {
            setSentDate(today);
        }
        setIssuedDate(today);
    }, [mainType]);

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
        if (mimeType.includes("word") || mimeType.includes("document")) return faFileWord;
        if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return faFileExcel;
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

            formData.append("Number", number);
            formData.append("MainType", String(mainType));
            formData.append("IsProfessional", String(isProfessional));
            formData.append("Title", title);
            formData.append("SenderEntityId", String(senderEntityId));
            formData.append("DocumentTypeId", String(documentTypeId));

            if (content) formData.append("Content", content);
            if (senderReference) formData.append("SenderReference", senderReference);
            if (notes) formData.append("Notes", notes);
            if (issuedDate) formData.append("IssuedDate", issuedDate);
            if (receivedDate) formData.append("ReceivedDate", receivedDate);
            if (sentDate) formData.append("SentDate", sentDate);

            if (primaryFile) {
                formData.append("PrimaryFile", primaryFile);
            }

            attachments.forEach((file) => {
                formData.append("AdditionalFiles", file);
            });

            const res = await apiWrapper.post<CreateMailResponse>("/Correspondences", formData);

            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ["mails"] });
                queryClient.invalidateQueries({ queryKey: ["mailsCount"] });

                toast.success("تم إرسال المراسلة بنجاح!", { id: loadingToast });
                resetForm();
                triggerMailCompose();
            } else {
                throw new Error(res.error || "فشل إرسال المراسلة");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "فشل إرسال المراسلة.";
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setNumber("");
        setMainType(CorrespondenceMainType.Incoming);
        setIsProfessional(false);
        setSenderEntityId(null);
        setDocumentTypeId(null);
        setSenderReference("");
        setIssuedDate("");
        setReceivedDate("");
        setSentDate("");
        setNotes("");
        setAttachments([]);
        setPrimaryFile(null);
    };

    // =========================
    // RENDER
    // =========================

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
                    {/* HEADER */}
                    <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-blue-100/50 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 shadow-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                                <FontAwesomeIcon icon={faPaperPlane} className="text-yellow-300 text-sm sm:text-base" />
                            </div>
                            <div>
                                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    إنشاء مراسلة جديدة
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={triggerMailCompose}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-red-50 text-blue-600 hover:text-red-500 transition-all duration-200 group"
                        >
                            <FontAwesomeIcon icon={faXmark} className="group-hover:scale-110 transition-transform text-sm sm:text-base" />
                        </button>
                    </header>

                   {/* MAIN CONTENT */}
<main className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
    
    {/* ===== LEFT PANEL - METADATA ===== */}
    <aside className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-blue-100/30 bg-white/50 backdrop-blur-sm flex flex-col shrink-0 max-h-[45vh] lg:max-h-full">
        {/* Header */}
        <div className="p-3 sm:p-4 lg:p-5 border-b border-blue-100/30 bg-white/80 shrink-0">
            <h2 className="font-bold text-blue-900 flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-white text-[10px] sm:text-xs" />
                </div>
                بيانات المراسلة
            </h2>
        </div>

        {/* Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5">
            {/* 1. نوع المراسلة */}
            <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
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
                            className={`py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-200 ${
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

            {/* 2. مهني */}
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-yellow-50/60 border border-yellow-100">
                <span className="font-bold text-yellow-900 text-xs sm:text-sm">مهني</span>
                <button
                    type="button"
                    onClick={() => setIsProfessional((prev) => !prev)}
                    className={`relative w-10 sm:w-12 h-6 sm:h-7 rounded-full transition-all duration-200 ${
                        isProfessional
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-200"
                            : "bg-blue-100"
                    }`}
                >
                    <motion.div
                        layout
                        className={`absolute top-1 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white transition-all ${
                            isProfessional ? "right-1" : "left-1"
                        }`}
                    />
                </button>
            </div>

            {/* 3. رقم المراسلة */}
            <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                    رقم المراسلة
                </label>
                <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="أدخل رقم المراسلة..."
                    className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                />
            </div>

            {/* 4. الجهة المرسلة */}
            <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                    الجهة المرسلة
                </label>
                <select
                    value={senderEntityId ?? ""}
                    onChange={(e) => setSenderEntityId(Number(e.target.value) || null)}
                    className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                >
                    <option value="">اختر الجهة...</option>
                    {senderEntities.map((entity) => (
                        <option value={entity.id} key={entity.id}>
                            {entity.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 5. نوع المستند */}
            <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                    نوع المستند
                </label>
                <select
                    value={documentTypeId ?? ""}
                    onChange={(e) => setDocumentTypeId(Number(e.target.value) || null)}
                    className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                >
                    <option value="">اختر النوع...</option>
                    {documentTypes.map((type) => (
                        <option value={type.id} key={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 6. مرجع المرسل (اختياري) */}
            <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                    مرجع المرسل (اختياري)
                </label>
                <input
                    type="text"
                    value={senderReference}
                    onChange={(e) => setSenderReference(e.target.value)}
                    placeholder="مرجع المرسل..."
                    className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
                />
            </div>

            {/* 7. التواريخ */}
            <div className="space-y-1.5">
                <div>
                    <span className="text-[9px] sm:text-[10px] text-blue-400">تاريخ الإصدار</span>
                    <input
                        type="date"
                        value={issuedDate}
                        onChange={(e) => setIssuedDate(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                    />
                </div>

                {mainType === CorrespondenceMainType.Incoming && (
                    <div>
                        <span className="text-[9px] sm:text-[10px] text-blue-400">تاريخ الاستلام</span>
                        <input
                            type="date"
                            value={receivedDate}
                            onChange={(e) => setReceivedDate(e.target.value)}
                            className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                        />
                    </div>
                )}

                {mainType === CorrespondenceMainType.Outgoing && (
                    <div>
                        <span className="text-[9px] sm:text-[10px] text-blue-400">تاريخ الإرسال</span>
                        <input
                            type="date"
                            value={sentDate}
                            onChange={(e) => setSentDate(e.target.value)}
                            className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 text-xs sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* ✅ في اللاب: الأزرار هنا (مخفية في الموبايل) */}
        <div className="hidden lg:block p-3 sm:p-4 lg:p-5 border-t border-blue-100/30 bg-white/80 shrink-0">
            <button
                onClick={handleSend}
                disabled={loading}
                className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                    loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:shadow-xl"
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
            <button
                onClick={triggerMailCompose}
                className="w-full py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest mt-2"
            >
                إلغاء
            </button>
        </div>
    </aside>

    {/* ===== RIGHT PANEL - CONTENT ===== */}
    <div className="w-full lg:w-3/5 flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
        
        {/* Title */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-100/30 shrink-0">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المراسلة..."
                className="w-full text-lg sm:text-2xl font-bold text-blue-900 placeholder:text-blue-200 outline-none border-none bg-transparent text-right"
            />
        </div>

        {/* Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="محتوى المراسلة..."
                className="w-full h-full min-h-[120px] text-sm sm:text-base leading-relaxed text-blue-800 placeholder:text-blue-200/70 outline-none border-none resize-none bg-transparent font-light text-right"
            />
        </div>

        {/* Notes */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-blue-100/30 shrink-0">
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="ملاحظات إضافية (اختياري)..."
                className="w-full p-2 sm:p-2.5 rounded-xl border border-blue-100 bg-white/50 text-blue-900 text-xs sm:text-sm placeholder:text-blue-200 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold text-right"
            />
        </div>

        {/* Attachments */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-50/40 border-t border-yellow-100/30 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Primary File */}
                {primaryFile ? (
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-blue-50 border-2 border-blue-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-blue-700 shadow-sm">
                        <FontAwesomeIcon icon={getFileIcon(primaryFile.type)} className="text-blue-600 text-[9px] sm:text-[10px]" />
                        <span className="max-w-[80px] sm:max-w-[120px] truncate">{primaryFile.name}</span>
                        <span className="text-[8px] sm:text-[9px] text-blue-400">(أساسي)</span>
                        <button
                            onClick={removePrimaryFile}
                            className="text-blue-300 hover:text-red-500 transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-[9px] sm:text-[10px]" />
                        </button>
                    </div>
                ) : (
                    <label className="flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-all font-semibold text-[10px] sm:text-xs shadow-sm">
                        <FontAwesomeIcon icon={faUpload} className="text-blue-600 text-[9px] sm:text-[10px]" />
                        <span className="hidden xs:inline">ملف أساسي</span>
                        <span className="xs:hidden">أساسي</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handlePrimaryFile(e.target.files?.[0] || null)}
                        />
                    </label>
                )}

                {/* Additional Files */}
                <label className="flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2 sm:px-3 bg-yellow-50 border-2 border-yellow-400 text-yellow-700 rounded-lg cursor-pointer hover:bg-yellow-100 transition-all font-semibold text-[10px] sm:text-xs shadow-sm">
                    <FontAwesomeIcon icon={faPaperclip} className="text-yellow-600 text-[9px] sm:text-[10px]" />
                    <span className="hidden xs:inline">ملفات إضافية</span>
                    <span className="xs:hidden">إضافي</span>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleAdditionalFiles(e.target.files)}
                    />
                </label>

                {/* Attachments List */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1">
                    {attachments.map((file, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-1 sm:gap-1.5 bg-white border border-yellow-200 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-semibold text-yellow-700 shadow-sm"
                        >
                            <FontAwesomeIcon icon={getFileIcon(file.type)} className="text-yellow-600 text-[8px] sm:text-[10px]" />
                            <span className="max-w-[60px] sm:max-w-[100px] truncate">{file.name}</span>
                            <button
                                onClick={() => removeAdditionalFile(i)}
                                className="text-yellow-300 hover:text-red-500 transition-colors"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-[8px] sm:text-[10px]" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </div>

    {/* ===== BUTTONS - في الموبايل: الأسفل ===== */}
    <div className="lg:hidden p-3 sm:p-4 border-t border-blue-100/30 bg-white/80 shrink-0">
        <button
            onClick={handleSend}
            disabled={loading}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:shadow-xl"
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
        <button
            onClick={triggerMailCompose}
            className="w-full py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest mt-2"
        >
            إلغاء
        </button>
    </div>
</main>
                </motion.div>
            )}
        </AnimatePresence>
    );
}