"use client";

import useShowMailDetailsStore from "@/store/showMailDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faPaperclip,
    faCalendarDays,
    faHashtag,
} from "@fortawesome/free-solid-svg-icons";

import MailFile from "./MailFile";
import MailDistribute from "./MailDistribute";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useEffect, useState } from "react";
import formatDate from "@/utils/formatDate";
import { Mail } from "@/types/api/Mail/Mail";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type Props = {
    data: Mail;
};

export default function MailViewer({ data }: Props) {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } =
        useShowMailDetailsStore();

    const [showMailDistribute, setShowMailDistribute] = useState(false);

    const path = usePathname();

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

    if (!isMailDetailsStoreShown) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex h-full w-full flex-col overflow-hidden bg-gray-50"
            dir="rtl"
        >
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-6 py-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between mb-6">
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerMailDetailsStoreShown}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        رجوع
                    </motion.button>

                    <div className="flex items-center gap-2 text-sm bg-gray-100 px-4 py-2 rounded-xl">
                        <FontAwesomeIcon icon={faHashtag} className="text-blue-500" />
                        <span className="font-bold">{data.number}</span>
                    </div>
                </div>

                {/* TITLE */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                    {data.title}
                </h1>

                {/* SENDER BLOCK (GMAIL STYLE) */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                        {senderInitial}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                            {senderName}
                        </span>

                        <span className="text-sm text-gray-500">
                            {mainTypeLabel} •{" "}
                            {formatDate(data.issuedDate)}
                        </span>
                    </div>
                </div>

                {/* META CHIPS */}
                <div className="flex flex-wrap gap-2">
                    <Chip label={mainTypeLabel} />
                    {data.isProfessional && <Chip label="مهني" />}
                    {data.documentType && <Chip label={data.documentType} />}
                    <Chip label={`#${data.number}`} />
                    <Chip label={`مستلمين: ${data.totalReceivers}`} />
                    <Chip label={`مقروء: ${data.readCount}`} />
                </div>

                {/* ACTIONS */}
                {path != "/distribution" &&
                    <div className="mt-5 flex gap-3">
                        <button
                            onClick={() =>
                                setShowMailDistribute(!showMailDistribute)
                            }
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow"
                        >
                            حالة التوزيع
                        </button>
                    </div>
                }


                {/* DISTRIBUTE PANEL */}
                <AnimatePresence>
                    {showMailDistribute && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-4"
                        >
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                <MailDistribute correspondenceId={data.id} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">

                    {/* DATES BLOCK */}
                    <section className="bg-white rounded-2xl p-4 border border-gray-100">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <Info label="الإصدار" value={String(formatDate(data.issuedDate))} />
                            {data.receivedDate && (
                                <Info label="الاستلام" value={String(formatDate(data.receivedDate))} />
                            )}
                            {data.sentDate && (
                                <Info label="الإرسال" value={String(formatDate(data.sentDate))} />
                            )}
                        </div>
                    </section>

                    {/* ATTACHMENTS */}
                    {attachments.length > 0 && (
                        <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <FontAwesomeIcon icon={faPaperclip} className="text-blue-500" />
                                <h2 className="text-lg font-bold">المرفقات</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {attachments.map((att) => (
                                    <div
                                        key={att.id}
                                        className="p-3 rounded-xl border hover:shadow-md transition bg-gray-50"
                                    >
                                        <MailFile
                                            filePath={att.filePath}
                                            fileName={att.fileName}
                                            isImage={att.mimeType.startsWith("image/")}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CONTENT */}
                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="font-bold text-gray-800">محتوى البريد</h2>
                        </div>

                        <div className="p-6 prose max-w-none text-right">
                            <EditorContent editor={editor} />
                        </div>
                    </section>

                    {/* EXTRA INFO */}
                    {(data.notes || data.status) && (
                        <section className="bg-white rounded-2xl p-4 border border-gray-100 text-sm text-gray-600">
                            {data.notes && <p><b>ملاحظات:</b> {data.notes}</p>}
                            {data.status && <p><b>الحالة:</b> {data.status}</p>}
                        </section>
                    )}
                </div>
            </main>
        </motion.div>
    );
}

/* ---------- UI HELPERS ---------- */

function Chip({ label }: { label: string }) {
    return (
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            {label}
        </span>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarDays} className="text-blue-500" />
            <span className="font-semibold">{label}:</span>
            <span>{value}</span>
        </div>
    );
}