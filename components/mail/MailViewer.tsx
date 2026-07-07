
"use client";

import useShowMailDetailsStore from "@/store/showMailDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faPaperclip,
    faHashtag,
    faUser,
    faEnvelope,
    faFile,
    faDownload,
    faEye,
    faShare,
    faPen,
    faXmark,
    faCalendarDay,
    faClock,
    faTag,
    faUserTag,
    faInfoCircle,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useEffect, useState } from "react";
import formatDate from "@/utils/formatDate";
import { Mail } from "@/types/api/Mail/Mail";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";

type Props = {
    data: Mail;
    onEdit?: () => void;
    onDistribute?: () => void;
    onBack?: () => void;
    hideActions?: boolean;
};

export default function MailViewer({ data, onEdit, onDistribute,onBack ,hideActions}: Props) {
    const router = useRouter();
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } =
        useShowMailDetailsStore();

    const [selectedFile, setSelectedFile] = useState<{
        url: string;
        name: string;
        type: string;
        id: number;
    } | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        editable: false,
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && data?.content) {
            editor.commands.setContent(data.content);
        }
    }, [editor, data]);

    const attachments = data.attachments ?? [];

    const senderName = data.senderEntity?.trim() || "غير معروف";
    const senderInitial = senderName.charAt(0)?.toUpperCase() || "?";

    const mainTypeLabel =
        data.mainType === "Incoming"
            ? "وارد"
            : data.mainType === "Outgoing"
                ? "صادر"
                : "داخلي";

    const mainTypeColor =
        data.mainType === "Incoming"
            ? "text-emerald-600"
            : data.mainType === "Outgoing"
                ? "text-blue-600"
                : "text-purple-600";

    // عرض التواريخ حسب نوع البريد
    const getDateFields = () => {
        const dates = [];

        if (data.issuedDate) {
            dates.push({ label: "تاريخ الإصدار", value: data.issuedDate });
        }

        if (data.mainType === "Incoming" && data.receivedDate) {
            dates.push({ label: "تاريخ الاستلام", value: data.receivedDate });
        }

        if (data.mainType === "Outgoing" && data.sentDate) {
            dates.push({ label: "تاريخ الإرسال", value: data.sentDate });
        }

        return dates;
    };

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    const getFileEmoji = (filename: string) => {
        const ext = getFileExtension(filename);
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx'].includes(ext)) return '📊';
        if (['zip', 'rar', '7z'].includes(ext)) return '📦';
        return '📎';
    };

    // عرض الملف
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleViewFile = async (attachment: any) => {
        try {
            setIsLoadingFile(true);

            const response = await apiWrapper.get(
                `/v2/Medias/view/attachment/${attachment.id}`,
                {},
                {
                    responseType: 'blob',
                }
            );

            if (!response.success || !response.data) {
                throw new Error('فشل تحميل الملف');
            }

            const blob = response.data as Blob;
            const url = URL.createObjectURL(blob);

            setSelectedFile({
                url,
                name: attachment.fileName,
                type: attachment.mimeType || '',
                id: attachment.id,
            });
        } catch (error) {
            toast.error('فشل تحميل الملف للعرض');
        } finally {
            setIsLoadingFile(false);
        }
    };

    // تحميل الملف
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDownload = async (attachment: any) => {
        try {
            const response = await apiWrapper.get(
                `/v2/Medias/download/attachment/${attachment.id}`,
                {},
                {
                    responseType: 'blob',
                }
            );

            if (!response.success || !response.data) {
                throw new Error('فشل تحميل الملف');
            }

            const blob = response.data as Blob;
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

            toast.success('تم تحميل الملف بنجاح');
        } catch (error) {
            toast.error('فشل تحميل الملف');
        }
    };

      if (!isMailDetailsStoreShown && !onBack) return null;

    const dateFields = getDateFields();

 const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            triggerMailDetailsStoreShown();
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full w-full bg-gray-50"
            dir="rtl"
        >
            {/* ===== HEADER - ثابت ===== */}
            <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
                <div className="flex items-center justify-between px-4 md:px-8 py-3">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        رجوع
                    </button>
 {!hideActions && (
                    <div className="flex items-center gap-2">
                        
<button
    onClick={() => {
        if (onEdit) {
            onEdit();
        } else {
            router.push(`/mail/${data.id}/edit`);
        }
    }}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 transition text-sm font-medium"
>
    <FontAwesomeIcon icon={faPen} />
    تعديل
</button>

                        
<button
    onClick={() => {
        if (onDistribute) {
            onDistribute();
        } else {
            router.push(`/distribution-page?id=${data.id}`);
        }
    }}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
>
    <FontAwesomeIcon icon={faShare} />
    توزيع
</button>
                    </div> )}
                </div>

                {/* العنوان والبيانات الرئيسية */}
                <div className="px-4 md:px-8 pb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        {data.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                        {/* الجهة المرسلة */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                                {senderInitial}
                            </div>
                            <span className="text-gray-700 font-medium">{senderName}</span>
                        </div>

                        <span className="text-gray-300">|</span>

                        {/* رقم الرسالة */}
                        <div className="flex items-center gap-1 text-gray-500">
                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400 text-[10px]" />
                            <span>رقم: {data.number}</span>
                        </div>

                        <span className="text-gray-300">|</span>

                        {/* نوع البريد */}
                        <span className={`font-medium ${mainTypeColor}`}>
                            {mainTypeLabel}
                        </span>

                        <span className="text-gray-300">|</span>

                        {/* مهني / غير مهني */}
                        <span className={data.isProfessional ? "text-yellow-600" : "text-gray-400"}>
                            {data.isProfessional ? "⚡ مهني" : "غير مهني"}
                        </span>
                    </div>
                </div>
            </header>

            {/* ===== MAIN CONTENT - قابل للتمرير ===== */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
                <div className="max-w  space-y-4">

{/* ===== صندوق المعلومات ===== */}
<div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
        {/* العمود الأول */}
        <div className="space-y-4">
            {/* نوع الوثيقة */}
            <div className="flex items-center gap-2">
                <span className="text-gray-500 min-w-[90px]">نوع الوثيقة:</span>
                <span className="font-medium text-gray-800">
                    {data.documentType || "تعميم"}
                </span>
            </div>

            {/* تاريخ الإصدار */}
            <div className="flex items-center gap-2">
                <span className="text-gray-500 min-w-[90px]">📅 تاريخ الإصدار:</span>
                <span className="font-medium text-gray-800">
                    {data.issuedDate ? formatDate(data.issuedDate) : "—"}
                </span>
            </div>
        </div>

        {/* العمود الثاني */}
        <div className="space-y-4">
            {/* مرجع المرسل - يظهر فقط إذا كان له قيمة حقيقية */}
{data.senderReference && data.senderReference.trim() !== "" && (
    <div className="flex items-center gap-2">
        <span className="text-gray-500 min-w-[90px]">مرجع المرسل:</span>
        <span className="font-medium text-gray-800">
            {data.senderReference}
        </span>
    </div>
)}

            {/* تاريخ الاستلام أو الإرسال حسب نوع البريد */}
            {data.mainType === "Incoming" && data.receivedDate && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[90px]">📥 تاريخ الاستلام:</span>
                    <span className="font-medium text-gray-800">
                        {formatDate(data.receivedDate)}
                    </span>
                </div>
            )}
            {data.mainType === "Outgoing" && data.sentDate && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[90px]">📤 تاريخ الإرسال:</span>
                    <span className="font-medium text-gray-800">
                        {formatDate(data.sentDate)}
                    </span>
                </div>
            )}
            {data.mainType === "Internal" && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[90px]">📌 تاريخ داخلي:</span>
                    <span className="font-medium text-gray-800">
                        {data.issuedDate ? formatDate(data.issuedDate) : "—"}
                    </span>
                </div>
            )}
            {data.mainType !== "Incoming" && data.mainType !== "Outgoing" && data.mainType !== "Internal" && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 min-w-[90px]">📅 التاريخ:</span>
                    <span className="font-medium text-gray-800">
                        {data.issuedDate ? formatDate(data.issuedDate) : "—"}
                    </span>
                </div>
            )}
        </div>
    </div>

    {/* ===== الإحصائيات ===== */}
    <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-start gap-x-6 gap-y-1">
       {!hideActions && (
        <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">👥</span>
            <span className="text-gray-500">عدد المستلمين:</span>
            <span className="font-semibold text-gray-800">{data.totalReceivers || 0}</span>
        </div>)}
         {!hideActions && (
        <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">📖</span>
            <span className="text-gray-500">مقروء:</span>
            <span className="font-semibold text-gray-800">{data.readCount || 0}</span>
        </div>)}
        {data.status && (
            <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">📌</span>
                <span className="text-gray-500">الحالة:</span>
                <span className="font-semibold text-gray-800">{data.status}</span>
            </div>
        )}
    </div>
</div>
                    {/* ===== المحتوى ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 md:p-6 prose max-w-none text-right">
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* ===== الملاحظات (إذا وجدت) ===== */}
                    {data.notes && (
                        <div className="text-sm text-gray-600 bg-white rounded-xl border border-gray-200 p-4">
                            <span className="text-gray-500">ملاحظة:</span>
                            <span className="mr-2 text-gray-700">{data.notes}</span>
                        </div>
                    )}

                    {/* ===== المرفقات ===== */}
                    {attachments.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-lg">📎</span>
                                <span className="font-medium text-gray-700">المرفقات</span>
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                                    {attachments.length}
                                </span>
                            </div>

                            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {attachments.map((att) => {
                                    const isImage = att.mimeType?.startsWith("image/") || false;

                                    return (
                                        <div
                                            key={att.id}
                                            className="group relative border rounded-xl p-2.5 text-center transition-all hover:border-blue-300 hover:shadow-md bg-gray-50 hover:bg-white"
                                        >
                                            {/* أيقونة الملف */}
                                            <div className="text-2xl mb-1">
                                                {isImage ? '🖼️' : getFileEmoji(att.fileName)}
                                            </div>

                                            {/* اسم الملف - مقصوص دائماً */}
                                            <p className="text-xs font-medium text-gray-700 truncate">
                                                {att.fileName}
                                            </p>

                                            {/* حجم الملف */}
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {(att.fileSize / 1024).toFixed(1)} كيلوبايت
                                            </p>

                                            <div className="flex items-center justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleViewFile(att)}
                                                    disabled={isLoadingFile}
                                                    className="w-7 h-7 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
                                                    title="عرض"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(att)}
                                                    className="w-7 h-7 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center justify-center"
                                                    title="تحميل"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ===== Modal لعرض الملفات ===== */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => {
                            URL.revokeObjectURL(selectedFile.url);
                            setSelectedFile(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* رأس المودال */}
                            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                                <h3 className="font-medium text-gray-700 truncate">
                                    {selectedFile.name}
                                </h3>
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(selectedFile.url);
                                        setSelectedFile(null);
                                    }}
                                    className="w-8 h-8 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            {/* محتوى المودال */}
                            <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-100">
                                {selectedFile.type?.startsWith("image/") ? (
                                    <img
                                        src={selectedFile.url}
                                        alt={selectedFile.name}
                                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                    />
                                ) : selectedFile.type?.includes("pdf") ? (
                                    <iframe
                                        src={selectedFile.url}
                                        className="w-full h-[60vh] rounded-lg"
                                        title={selectedFile.name}
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="text-6xl mb-4">📄</div>
                                        <p className="text-gray-500 mb-4">
                                            لا يمكن عرض هذا النوع من الملفات
                                        </p>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement("a");
                                                link.href = selectedFile.url;
                                                link.download = selectedFile.name;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                        >
                                            تحميل الملف
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
