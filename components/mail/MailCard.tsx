"use client";

import { Mail } from "@/types/api/Mail";

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
            whileHover={{
                scale: 1.01,
                y: -2,
            }}
            whileTap={{
                scale: 0.99,
            }}
            className="group flex flex-row-reverse items-center justify-center p-4 bg-gray-200 hover:bg-gray-300 rounded-xl cursor-pointer shadow-sm"
            onClick={() =>
                onClick(mail)
            }
        >
            <div className="flex flex-row-reverse gap-16">
                <p className="font-bold">
                    {mail.title}
                </p>

                <span className="text-gray-500">
                    {getEmailContentPreview(
                        mail.content
                    )}
                </span>
            </div>

            <div className="flex mr-auto items-center text-sm gap-2">
                <span>
                    {formatDate(
                        mail.issuedDate
                    )}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();

                        onEdit(mail);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-300 rounded-full"
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-500 hover:text-red-600 hover:bg-red-300 rounded-full"
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