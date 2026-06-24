"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faArrowLeft,
    faSave,
    faTrash,
    faPaperclip,
    faFile,
    faFileImage,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faUpload,
} from "@fortawesome/free-solid-svg-icons";

import toast from "react-hot-toast";

import { apiWrapper } from "@/utils/apiClient";

import { Mail } from "@/types/api/Mail/Mail";

import { MailPageResponse } from "@/types/api/Mail/MailPageResponse";

type Attachment = {
    id: number;
    filePath: string;
    mimeType: string;
    fileName: string;
};

type Props = {
    mail: Mail;

    filter: string;

    searchInput: string;

    onBack: () => void;

    onSuccess?: (
        updatedMail: Mail
    ) => void;
};

export default function MailEditPage({
    mail,
    filter,
    searchInput,
    onBack,
    onSuccess,
}: Props) {
    const queryClient =
        useQueryClient();

    // =========================
    // FORM STATE
    // =========================

    const [title, setTitle] =
        useState("");

    const [content, setContent] =
        useState("");

    const [issuedDate, setIssuedDate] =
        useState("");

    const [senderEntityId, setSenderEntityId] = useState<string>("");

    const [number, setNumber] = useState("");

    const [
        isProfessional,
        setIsProfessional,
    ] = useState(false);

    // Existing server attachments
    const [
        attachments,
        setAttachments,
    ] = useState<Attachment[]>(
        []
    );

    // Newly uploaded files
    const [newFiles, setNewFiles] =
        useState<File[]>([]);

    // Deleted attachment ids
    const [
        deletedAttachmentIds,
        setDeletedAttachmentIds,
    ] = useState<number[]>([]);

    // =========================
    // INITIALIZE STATE
    // =========================

    useEffect(() => {
        setTitle(mail.title ?? "");
        setContent(mail.content ?? "");
        setIssuedDate(mail.issuedDate ?? "");
        setSenderEntityId(
            mail.senderEntityId !== undefined && mail.senderEntityId !== null
                ? String(mail.senderEntityId)
                : ""
        );
        setNumber(mail.number ?? "");
        setIsProfessional(!!mail.isProfessional);
        setAttachments(mail.attachments ?? []);
    }, [mail]);

    // =========================
    // FILE HELPERS
    // =========================

    const getFileIcon = (
        mimeType: string
    ) => {
        if (
            mimeType.includes(
                "image"
            )
        ) {
            return faFileImage;
        }

        if (
            mimeType.includes(
                "pdf"
            )
        ) {
            return faFilePdf;
        }

        if (
            mimeType.includes(
                "word"
            ) ||
            mimeType.includes(
                "document"
            )
        ) {
            return faFileWord;
        }

        if (
            mimeType.includes(
                "excel"
            ) ||
            mimeType.includes(
                "spreadsheet"
            )
        ) {
            return faFileExcel;
        }

        return faFile;
    };

    // =========================
    // REMOVE EXISTING ATTACHMENT
    // =========================

    const removeAttachment = (
        attachmentId: number
    ) => {
        setDeletedAttachmentIds(
            (prev) => [
                ...prev,
                attachmentId,
            ]
        );

        setAttachments((prev) =>
            prev.filter(
                (a) =>
                    a.id !==
                    attachmentId
            )
        );
    };

    // =========================
    // REMOVE NEW FILE
    // =========================

    const removeNewFile = (
        fileName: string
    ) => {
        setNewFiles((prev) =>
            prev.filter(
                (file) =>
                    file.name !==
                    fileName
            )
        );
    };

    // =========================
    // ADD NEW FILES
    // =========================

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files =
            e.target.files;

        if (!files) return;

        setNewFiles((prev) => [
            ...prev,
            ...Array.from(files),
        ]);
    };

    // =========================
    // UPDATE MUTATION
    // =========================

    const updateMailMutation =
        useMutation({
            mutationFn: async () => {
                const formData =
                    new FormData();

                formData.append(
                    "title",
                    title
                );

                formData.append(
                    "content",
                    content
                );

                formData.append(
                    "issuedDate",
                    issuedDate
                );

                if (senderEntityId !== "") {
                    formData.append(
                        "senderEntityId",
                        senderEntityId
                    );
                }

                formData.append(
                    "number",
                    number
                );

                formData.append(
                    "isProfessional",
                    String(
                        isProfessional
                    )
                );

                deletedAttachmentIds.forEach(
                    (id) => {
                        formData.append(
                            "deletedAttachmentIds",
                            String(id)
                        );
                    }
                );

                newFiles.forEach(
                    (file) => {
                        formData.append(
                            "files",
                            file
                        );
                    }
                );

                const res =
                    await apiWrapper.patch(
                        `Correspondences/${mail.id}`,
                        formData
                    );

                if (!res.success) {
                    toast.error(
                        "فشل تعديل البريد"
                    );

                    throw new Error(
                        "فشل تحديث البريد"
                    );
                }

                return {
                    ...mail,

                    title,

                    content,

                    issuedDate,

                    senderEntityId,

                    number,

                    isProfessional,

                    attachments,
                };
            },

            onSuccess: (
                updatedMail
            ) => {
                queryClient.setQueryData(
                    [
                        "mails",
                        filter,
                        searchInput,
                    ],
                    (oldData: any) => {
                        if (!oldData)
                            return oldData;

                        return {
                            ...oldData,

                            pages:
                                oldData.pages.map(
                                    (
                                        page: MailPageResponse
                                    ) => ({
                                        ...page,

                                        items:
                                            page.items.map(
                                                (
                                                    item: Mail
                                                ) =>
                                                    String(
                                                        item.id
                                                    ) ===
                                                        String(
                                                            updatedMail.id
                                                        )
                                                        ? updatedMail
                                                        : item
                                            ),
                                    })
                                ),
                        };
                    }
                );

                toast.success(
                    "تم تحديث البريد بنجاح"
                );

                onSuccess?.(
                    updatedMail
                );
            },
        });

    // =========================
    // SAVE
    // =========================

    const handleSave = () => {
        updateMailMutation.mutate();
    };

    // =========================
    // TOTAL FILE COUNT
    // =========================

    const totalFiles = useMemo(
        () =>
            attachments.length +
            newFiles.length,
        [attachments, newFiles]
    );

    return (
        <motion.div
            key="edit-mail"
            initial={{
                opacity: 0,
                x: 40,
            }}
            animate={{
                opacity: 1,
                x: 0,
            }}
            exit={{
                opacity: 0,
                x: -40,
            }}
            transition={{
                duration: 0.3,
            }}
            className="w-full h-full overflow-y-auto bg-gradient-to-br from-yellow-50 via-white to-blue-50"
        >
            <div className="p-8 flex flex-col gap-8">
                {/* HEADER */}

                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm"
                    >
                        <FontAwesomeIcon
                            icon={
                                faArrowLeft
                            }
                        />

                        <span>
                            رجوع
                        </span>
                    </button>

                    <button
                        onClick={
                            handleSave
                        }
                        disabled={
                            updateMailMutation.isPending
                        }
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 font-bold shadow-lg shadow-blue-200 ${updateMailMutation.isPending
                                ? "opacity-70 cursor-not-allowed"
                                : "active:scale-95 hover:shadow-xl"
                            }`}
                    >
                        <FontAwesomeIcon
                            icon={faSave}
                        />

                        <span>
                            {updateMailMutation.isPending
                                ? "جاري الحفظ..."
                                : "حفظ التغييرات"}
                        </span>
                    </button>
                </div>

                {/* MAIN FORM - Two Column Layout */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT PANEL - METADATA (PRIMARY) */}

                    <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-blue-100/30 flex flex-col gap-6">
                        <h2 className="font-bold text-blue-900 flex items-center gap-3 text-lg">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">📋</span>
                            </div>
                            بيانات المراسلة
                        </h2>

                        {/* TITLE */}

                        <div className="flex flex-col gap-2.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                العنوان
                            </label>

                            <input
                                value={title}
                                onChange={(
                                    e
                                ) =>
                                    setTitle(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full p-3.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                                placeholder="عنوان البريد"
                            />
                        </div>

                        {/* NUMBER */}

                        <div className="flex flex-col gap-2.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                الرقم المرجعي
                            </label>

                            <input
                                value={
                                    number
                                }
                                onChange={(
                                    e
                                ) =>
                                    setNumber(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full p-3.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                                placeholder="رقم البريد"
                            />
                        </div>

                        {/* DATE */}

                        <div className="flex flex-col gap-2.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                تاريخ الإصدار
                            </label>

                            <input
                                type="date"
                                value={
                                    issuedDate
                                        ? issuedDate.split(
                                            "T"
                                        )[0]
                                        : ""
                                }
                                onChange={(
                                    e
                                ) =>
                                    setIssuedDate(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full p-3.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                            />
                        </div>

                        {/* ENTITY */}

                        <div className="flex flex-col gap-2.5">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                معرف جهة الإرسال
                            </label>

                            <input
                                value={
                                    senderEntityId
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSenderEntityId(e.target.value)
                                }
                                className="w-full p-3.5 rounded-xl border-2 border-blue-100 bg-white text-blue-900 placeholder:text-blue-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
                                placeholder="معرف الجهة"
                            />
                        </div>

                        {/* PROFESSIONAL TOGGLE */}

                        <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50/60 border border-yellow-100">
                            <span className="font-bold text-yellow-900">
                                احترافي
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsProfessional(
                                        (
                                            prev
                                        ) =>
                                            !prev
                                    )
                                }
                                className={`relative w-14 h-8 rounded-full transition-all duration-200 ${isProfessional
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-200"
                                    : "bg-blue-100"
                                    }`}
                            >
                                <motion.div
                                    layout
                                    className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isProfessional
                                        ? "right-1"
                                        : "left-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL - CONTENT & ATTACHMENTS (SECONDARY) */}

                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* CONTENT */}

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-blue-100/30 flex flex-col gap-3">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                المحتوى
                            </label>

                            <textarea
                                value={content}
                                onChange={(e) =>
                                    setContent(
                                        e.target
                                            .value
                                    )
                                }
                                className="w-full min-h-[300px] p-5 rounded-xl border-2 border-blue-100 bg-white text-blue-800 placeholder:text-blue-200 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-light leading-relaxed"
                                placeholder="محتوى البريد..."
                            />
                        </div>

                        {/* ATTACHMENTS */}

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-blue-100/30 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon
                                            icon={
                                                faPaperclip
                                            }
                                            className="text-white text-sm"
                                        />
                                    </div>

                                    <h2 className="text-lg font-bold text-blue-900">
                                        المرفقات
                                    </h2>

                                    <span className="text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                                        {
                                            totalFiles
                                        }
                                    </span>
                                </div>

                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white cursor-pointer transition-all font-bold shadow-md hover:shadow-lg">
                                    <FontAwesomeIcon
                                        icon={
                                            faUpload
                                        }
                                    />

                                    <span>
                                        تحميل
                                    </span>

                                    <input
                                        type="file"
                                        multiple
                                        hidden
                                        onChange={
                                            handleFileUpload
                                        }
                                    />
                                </label>
                            </div>

                            {/* EXISTING ATTACHMENTS */}

                            {attachments.length >
                                0 && (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                                            الملفات الموجودة
                                        </h3>

                                        {attachments.map(
                                            (
                                                attachment
                                            ) => (
                                                <motion.div
                                                    key={
                                                        attachment.id
                                                    }
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-100 bg-blue-50/60 hover:bg-blue-100/60 transition-all"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FontAwesomeIcon
                                                                icon={getFileIcon(
                                                                    attachment.mimeType
                                                                )}
                                                                className="text-blue-600 text-sm"
                                                            />
                                                        </div>

                                                        <div className="overflow-hidden">
                                                            <p className="font-semibold text-blue-900 truncate text-sm">
                                                                {
                                                                    attachment.fileName
                                                                }
                                                            </p>

                                                            <p className="text-xs text-blue-500 truncate">
                                                                {
                                                                    attachment.mimeType
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeAttachment(
                                                                attachment.id
                                                            )
                                                        }
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faTrash
                                                            }
                                                        />
                                                    </button>
                                                </motion.div>
                                            )
                                        )}
                                    </div>
                                )}

                            {/* NEW FILES */}

                            {newFiles.length >
                                0 && (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-wider">
                                            ملفات جديدة
                                        </h3>

                                        {newFiles.map(
                                            (
                                                file,
                                                index
                                            ) => (
                                                <motion.div
                                                    key={`${file.name}-${index}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between p-4 rounded-xl border-2 border-yellow-200 bg-yellow-50/60 hover:bg-yellow-100/60 transition-all"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FontAwesomeIcon
                                                                icon={getFileIcon(
                                                                    file.type
                                                                )}
                                                                className="text-yellow-600 text-sm"
                                                            />
                                                        </div>

                                                        <div className="overflow-hidden">
                                                            <p className="font-semibold text-yellow-900 truncate text-sm">
                                                                {
                                                                    file.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-yellow-600">
                                                                {(
                                                                    file.size /
                                                                    1024
                                                                ).toFixed(
                                                                    1
                                                                )}{" "}
                                                                كيلوبايت
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeNewFile(
                                                                file.name
                                                            )
                                                        }
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faTrash
                                                            }
                                                        />
                                                    </button>
                                                </motion.div>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
