"use client";

import { Mail } from "@/types/api/Mail/Mail";
import formatDate from "@/utils/formatDate";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPen,
    faTrash,
    faPaperclip,
    faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
    mail: Mail;
    index: number;
    onClick: (mail: Mail) => void;
    onEdit: (mail: Mail) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
    editable?: boolean;
};

export default function MailCard({
    mail,
    index,
    onClick,
    onEdit,
    onDelete,
    isDeleting,
    editable = true,
}: Props) {
    const senderName = mail.senderEntity?.trim() || "غير معروف";
    const senderInitial = senderName.charAt(0).toUpperCase();

    const hasAttachments = mail.attachments && mail.attachments.length > 0;

    const mainTypeLabel =
        mail.mainType === "Incoming"
            ? "وارد"
            : mail.mainType === "Outgoing"
                ? "صادر"
                : "داخلي";

    const mainTypeColor =
        mail.mainType === "Incoming"
            ? "text-emerald-600 bg-emerald-50"
            : mail.mainType === "Outgoing"
                ? "text-blue-600 bg-blue-50"
                : "text-purple-600 bg-purple-50";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.015 }}
            onClick={() => onClick(mail)}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
            {/* ===== الصورة الرمزية ===== */}
            <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {senderInitial}
                </div>
            </div>

            {/* ===== معلومات البريد ===== */}
            <div className="flex-1 min-w-0">
                {/* الصف الأول: الجهة + العنوان + المرفقات */}
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-800 text-sm truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                        {senderName}
                    </span>
                    <span className="text-gray-300 text-xs hidden xs:inline">|</span>
                    <span className="text-gray-700 text-sm truncate flex-1">
                        {mail.title}
                    </span>
                    {hasAttachments && (
                        <FontAwesomeIcon
                            icon={faPaperclip}
                            className="text-gray-400 text-[10px] flex-shrink-0"
                        />
                    )}
                </div>

                {/* الصف الثاني: الرقم + البادجات + التاريخ */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {/* الرقم */}
                    <span className="text-xs text-gray-400 font-medium">
                        #{mail.number}
                    </span>

                    {/* البادجات - تختفي في الموبايل الصغير */}
                    <div className="hidden sm:flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${mainTypeColor}`}>
                            {mainTypeLabel}
                        </span>
                        {mail.isProfessional && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-600">
                                مهني
                            </span>
                        )}
                    </div>

                    {/* التاريخ - يختفي في الموبايل */}
                    <span className="hidden md:inline text-xs text-gray-400">
                        {formatDate(mail.createdAt)}
                    </span>
                </div>
            </div>

            {/* ===== الأزرار - تظهر دائماً في الموبايل ===== */}
            {editable && (
                <div className={`flex items-center gap-0.5 flex-shrink-0 ${
                    'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'
                }`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(mail);
                        }}
                        className="w-8 h-8 rounded-lg text-yellow-600 hover:bg-yellow-50 transition flex items-center justify-center"
                        title="تعديل"
                    >
                        <FontAwesomeIcon icon={faPen} className="text-xs sm:text-[11px]" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(String(mail.id));
                        }}
                        disabled={isDeleting}
                        className="w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 transition flex items-center justify-center disabled:opacity-50"
                        title="حذف"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-[11px]" />
                    </button>
                </div>
            )}

            {/* ===== سهم للإشارة ===== */}
            <div className="flex-shrink-0 text-gray-300 group-hover:text-blue-400 transition">
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </div>
        </motion.div>
    );
}
