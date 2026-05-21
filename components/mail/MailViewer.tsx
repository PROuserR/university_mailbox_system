import useShowMailDetailsStore from "@/store/showMailDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faPaperclip,
    faBriefcase,
    faCalendarDays,
    faHashtag,
} from "@fortawesome/free-solid-svg-icons";

import MailFile from "./MailFile";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useEffect, useState } from "react";

import formatDate from "@/utils/formatDate";

import { Mail } from "@/types/api/Mail/Mail";

import MailDistribute from "./MailDistribute";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
    data: Mail;
};

export default function MailViewer({
    data,
}: Props) {
    const {
        isMailDetailsStoreShown,
        triggerMailDetailsStoreShown,
    } = useShowMailDetailsStore();

    const [
        showMailDistribute,
        setShowMailDistribute,
    ] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        editable: false,
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && data?.content) {
            editor.commands.setContent(
                data.content
            );
        }
    }, [editor, data]);

    const attachments: Attachment[] = data.attachments ?? [];

    if (isMailDetailsStoreShown)
        return (
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.35,
                }}
                className="flex h-full w-full flex-col overflow-hidden bg-transparent p-4"
            >
                {/* HEADER */}
                <header >
                    {/* TOP BAR */}
                    <div className="mb-6 flex flex-row-reverse items-center justify-between">
                        <motion.button
                            whileHover={{
                                x: 4,
                                scale: 1.03,
                            }}
                            whileTap={{
                                scale: 0.95,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                            }}
                            onClick={
                                triggerMailDetailsStoreShown
                            }
                            className="flex items-center gap-3 rounded-2xl bg-blue-100 px-4 py-2 text-blue-700 transition hover:bg-blue-200"
                        >
                            <FontAwesomeIcon
                                icon={
                                    faArrowRight
                                }
                            />

                            <span className="font-medium">
                                رجوع
                            </span>
                        </motion.button>

                        <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-600 shadow-sm">
                            <span className="font-bold text-gray-800">
                                {
                                    data?.number
                                }

                            </span>

                            <span>
                                :
                                رقم البريد

                            </span>

                            <FontAwesomeIcon
                                icon={faHashtag}
                                className="text-blue-500"
                            />
                        </div>
                    </div>

                    {/* MAIL INFO */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* ACTIONS */}
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{
                                    scale: 1.03,
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.95,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                }}
                                onClick={() =>
                                    setShowMailDistribute(
                                        !showMailDistribute
                                    )
                                }
                                className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition hover:shadow-blue-300"
                            >
                                حالة التوزيع
                            </motion.button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-gray-800">
                                    {
                                        data?.title
                                    }
                                </h1>

                                {data?.isProfessional ? (
                                    <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
                                        <FontAwesomeIcon
                                            icon={
                                                faBriefcase
                                            }
                                        />

                                        مهني
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FontAwesomeIcon
                                    icon={
                                        faCalendarDays
                                    }
                                    className="text-blue-500"
                                />

                                <span>
                                    {data?.issuedDate &&
                                        formatDate(
                                            data?.issuedDate
                                        )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* DISTRIBUTE PANEL */}
                    <AnimatePresence>
                        {showMailDistribute && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    height: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                    height:
                                        "auto",
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                }}
                                transition={{
                                    duration: 0.25,
                                }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-4">
                                    <MailDistribute
                                        correspondenceId={
                                            data?.id
                                        }
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto px-8 py-8">
                    <div className="mx-auto flex max-w-6xl flex-col gap-8">
                        {/* ATTACHMENTS */}
                        {attachments
                            ?.length > 0 && (
                                <motion.section
                                    initial={{
                                        opacity: 0,
                                        y: 15,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        delay: 0.1,
                                    }}
                                    className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-lg"
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                            <FontAwesomeIcon
                                                icon={
                                                    faPaperclip
                                                }
                                                className="text-lg"
                                            />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">
                                                المرفقات
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                {
                                                    data
                                                        ?.attachments
                                                        ?.length
                                                }{" "}
                                                ملف
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {data?.attachments?.map(
                                            (
                                                attachment
                                            ) => (
                                                <motion.div
                                                    key={
                                                        attachment?.id
                                                    }
                                                    whileHover={{
                                                        y: -4,
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 250,
                                                    }}
                                                    className="rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-blue-50/30 p-4 shadow-md transition hover:shadow-xl"
                                                >
                                                    {attachment?.mimeType.startsWith(
                                                        "image/"
                                                    ) ? (
                                                        <MailFile
                                                            key={
                                                                attachment.id
                                                            }
                                                            filePath={
                                                                attachment.filePath
                                                            }
                                                            isImage={
                                                                true
                                                            }
                                                            fileName={
                                                                undefined
                                                            }
                                                        />
                                                    ) : (
                                                        <MailFile
                                                            key={
                                                                attachment.id
                                                            }
                                                            filePath={
                                                                attachment.filePath
                                                            }
                                                            fileName={
                                                                attachment.fileName
                                                            }
                                                            isImage={
                                                                false
                                                            }
                                                        />
                                                    )}
                                                </motion.div>
                                            )
                                        )}
                                    </div>
                                </motion.section>
                            )}

                        {/* MAIL CONTENT */}
                        <motion.section
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.2,
                            }}
                            className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-xl"
                        >
                            {/* CONTENT HEADER */}
                            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white px-8 py-5">
                                <h2 className="text-xl font-bold text-gray-800">
                                    محتوى البريد
                                </h2>
                            </div>

                            {/* CONTENT BODY */}
                            <div className="prose prose-lg max-w-none p-8 text-right">
                                <EditorContent
                                    editor={
                                        editor
                                    }
                                />
                            </div>
                        </motion.section>
                    </div>
                </main>
            </motion.div>
        );
}