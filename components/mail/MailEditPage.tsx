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

    const [senderEntityId, setSenderEntityId] =
        useState("");

    const [number, setNumber] =
        useState("");

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
        setTitle(mail.title);

        setContent(mail.content);

        setIssuedDate(
            mail.issuedDate || ""
        );

        setSenderEntityId(
            mail.senderEntityId || ""
        );

        setNumber(mail.number);

        setIsProfessional(
            mail.isProfessional
        );

        setAttachments(
            mail.attachments || []
        );
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

                formData.append(
                    "senderEntityId",
                    senderEntityId
                );

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
            className="w-full h-full overflow-y-auto bg-gray-50"
        >
            <div className="p-6 flex flex-col gap-6">
                {/* HEADER */}

                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
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
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
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

                {/* MAIN FORM */}

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col gap-8">
                    {/* TOP GRID */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* TITLE */}

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-gray-700">
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
                                className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-500"
                                placeholder="عنوان البريد"
                            />
                        </div>

                        {/* NUMBER */}

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-gray-700">
                                الرقم
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
                                className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-500"
                                placeholder="رقم البريد"
                            />
                        </div>

                        {/* DATE */}

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-gray-700">
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
                                className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* ENTITY */}

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold text-gray-700">
                                معرف جهة الإرسال
                            </label>

                            <input
                                value={
                                    senderEntityId
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSenderEntityId(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-500"
                                placeholder="معرف الجهة"
                            />
                        </div>
                    </div>

                    {/* PROFESSIONAL SWITCH */}

                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-700">
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
                            className={`relative w-16 h-9 rounded-full transition-colors ${isProfessional
                                ? "bg-blue-500"
                                : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all ${isProfessional
                                    ? "right-1"
                                    : "left-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* CONTENT */}

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-700">
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
                            className="w-full min-h-[350px] p-5 rounded-2xl border border-gray-300 outline-none resize-none focus:border-blue-500"
                            placeholder="محتوى البريد..."
                        />
                    </div>

                    {/* ATTACHMENTS */}

                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={
                                        faPaperclip
                                    }
                                    className="text-gray-500"
                                />

                                <h2 className="text-xl font-bold">
                                    المرفقات
                                </h2>

                                <span className="text-sm text-gray-500">
                                    (
                                    {
                                        totalFiles
                                    }
                                    )
                                </span>
                            </div>

                            <label className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white cursor-pointer transition-colors">
                                <FontAwesomeIcon
                                    icon={
                                        faUpload
                                    }
                                />

                                <span>
                                    تحميل الملفات
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
                                    <h3 className="font-semibold text-gray-700">
                                        الملفات الموجودة
                                    </h3>

                                    {attachments.map(
                                        (
                                            attachment
                                        ) => (
                                            <div
                                                key={
                                                    attachment.id
                                                }
                                                className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50"
                                            >
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <FontAwesomeIcon
                                                        icon={getFileIcon(
                                                            attachment.mimeType
                                                        )}
                                                        className="text-lg text-gray-600"
                                                    />

                                                    <div className="overflow-hidden">
                                                        <p className="font-medium truncate">
                                                            {
                                                                attachment.fileName
                                                            }
                                                        </p>

                                                        <p className="text-sm text-gray-500 truncate">
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
                                                    className="p-3 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faTrash
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                        {/* NEW FILES */}

                        {newFiles.length >
                            0 && (
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-semibold text-gray-700">
                                        ملفات جديدة
                                    </h3>

                                    {newFiles.map(
                                        (
                                            file,
                                            index
                                        ) => (
                                            <div
                                                key={`${file.name}-${index}`}
                                                className="flex items-center justify-between p-4 rounded-2xl border border-blue-200 bg-blue-50"
                                            >
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <FontAwesomeIcon
                                                        icon={getFileIcon(
                                                            file.type
                                                        )}
                                                        className="text-lg text-blue-600"
                                                    />

                                                    <div className="overflow-hidden">
                                                        <p className="font-medium truncate">
                                                            {
                                                                file.name
                                                            }
                                                        </p>

                                                        <p className="text-sm text-gray-500">
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
                                                    className="p-3 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faTrash
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}