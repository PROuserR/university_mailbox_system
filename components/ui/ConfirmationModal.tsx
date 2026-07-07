// components/ui/ConfirmationModal.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTriangleExclamation,
    faXmark,
    faCheckCircle,
    faTrash,
    faBan,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "success";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
};

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    variant = "danger",
    icon,
}: Props) {
    const variants = {
        danger: {
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
            border: "border-red-200",
            button: "bg-red-500 hover:bg-red-600",
            icon: icon || faTrash,
        },
        warning: {
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-500",
            border: "border-yellow-200",
            button: "bg-yellow-500 hover:bg-yellow-600 text-black",
            icon: icon || faTriangleExclamation,
        },
        success: {
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            border: "border-emerald-200",
            button: "bg-emerald-500 hover:bg-emerald-600",
            icon: icon || faCheckCircle,
        },
    };

    const currentVariant = variants[variant];

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* ✅ خلفية خفيفة بدون blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/30"
                        onClick={onClose}
                    />

                    {/* ✅ مودال صغير وسريع */}
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div
                                        className={`w-10 h-10 rounded-xl ${currentVariant.iconBg} flex items-center justify-center flex-shrink-0`}
                                    >
                                        <FontAwesomeIcon
                                            icon={currentVariant.icon}
                                            className={`text-lg ${currentVariant.iconColor}`}
                                        />
                                    </div>

                                    <h2 className="text-base font-bold text-gray-800 flex-1">
                                        {title}
                                    </h2>

                                    <button
                                        onClick={onClose}
                                        className="w-7 h-7 rounded-lg hover:bg-gray-100 transition flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                                    </button>
                                </div>

                                {/* Message */}
                                <p className="text-sm text-gray-500 pr-13 mb-4">
                                    {message}
                                </p>

                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm"
                                    >
                                        {cancelText}
                                    </button>

                                    <button
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-xl text-white font-medium shadow-sm transition hover:shadow-md text-sm ${currentVariant.button}`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}