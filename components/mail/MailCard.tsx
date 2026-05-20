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
};

export default function MailCard({
    mail,
    index,
    onClick,
    onEdit,
    onDelete,
    isDeleting,
}: Props) {
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
            className={`group flex flex-row-reverse items-center justify-center p-4 rounded-2xl cursor-pointer hover:bg-blue-300 shadow-lg hover:shadow-xl ${index % 2 === 0 ? "bg-blue-200 " : "bg-blue-100" }`}
            onClick={() =>
                onClick(mail)
            }>
            <div className="flex flex-col gap-2">
                <span className="text-blue-400 gap-4">
                    <span>رقم البريد:  </span>

                    <span>{mail.number}</span>

                </span>

                <span className="font-bold text-xl">
                    {mail.title}
                </span>

                <p className="text-gray-500">
                    {getEmailContentPreview(
                        mail.content
                    )}
                </p>
            </div>

            <div className="flex mr-auto items-start text-sm gap-8 p-4">
                <span className="italic">
                    {formatDate(
                        mail.issuedDate
                    )}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();

                        onEdit(mail);
                    }}
                    className="hidden group-hover:flex transition-opacity duration-200 text-blue-500 hover:text-blue-600  rounded-full"
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
                    className="hidden group-hover:flex transition-opacity duration-200 text-yellow-400 hover:text-yellow-500  rounded-full"
                >
                    <FontAwesomeIcon
                        icon={faTrash}
                        className="text-base"
                    />
                </button>
            </div>
        </motion.div>
    );
}