"use client";

import { Mail } from "@/types/api/Mail/Mail";
import formatDate from "@/utils/formatDate";
import getEmailContentPreview from "@/utils/getEmailContentPreview";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPen,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
    mail: Mail;
    index: number;

    onClick: (
        mail: Mail
    ) => void;

    onEdit: (
        mail: Mail
    ) => void;

    onDelete: (
        id: string
    ) => void;

    isDeleting?: boolean;
    editable?: boolean
};

export default function MailCard({
    mail,
    index,
    onClick,
    onEdit,
    onDelete,
    isDeleting,
    editable
}: Props) {
    const senderName =
        mail.senderEntity?.trim() ||
        "غير معروف";

    const senderInitial =
        senderName.charAt(0).toUpperCase();

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
                delay: index * 0.03,
            }}
            className={`
                group
                flex
                flex-row-reverse
                items-center
                gap-16
                p-4
                rounded-2xl
                cursor-pointer
                shadow-lg
                transition-all
                border
                border-blue-400
                hover:shadow-xl
                hover:bg-yellow-200
                bg-blue-200
            `}
            onClick={() =>
                onClick(mail)
            }
        >
            {/* Sender Entity (Gmail style) */}
            <div className="flex gap-4 w-48 ">
                <div className="w-36 ml-auto text-end">
                    <p className="font-bold text-gray-800">
                        {senderName}
                    </p>

                    <span className="text-xs text-blue-500">
                        #{mail.number}
                    </span>
                </div>
                <div
                    className="
                        w-12
                        h-12
                        rounded-full
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-lg
                        shrink-0
                        ml-auto
                    "
                >
                    {senderInitial}
                </div>
            </div>

            {/* Mail Content */}
            <div className="flex flex-row-reverse items-center gap-8 min-w-0">
                <h3 className="font-bold text-lg truncate">
                    {mail.title}
                </h3>

                <p className="text-gray-500 truncate">
                    {getEmailContentPreview(
                        mail.content ?? ""
                    )}
                </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6 shrink-0 mr-auto">
                <span className="italic text-sm whitespace-nowrap">
                    {formatDate(
                        mail.issuedDate
                    )}
                </span>

                {editable == true &&
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(mail);
                            }}
                            className="hidden group-hover:flex text-blue-500 hover:text-blue-600 transition"
                        >
                            <FontAwesomeIcon
                                icon={faPen}
                                className="text-base"
                            />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                onDelete(
                                    String(mail.id)
                                );
                            }}
                            disabled={isDeleting}
                            className="hidden group-hover:flex text-yellow-500 hover:text-yellow-600 transition"
                        >
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="text-base"
                            />
                        </button>
                    </>}

            </div>
        </motion.div>
    );
}