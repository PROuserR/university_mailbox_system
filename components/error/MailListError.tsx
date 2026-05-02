"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";

type Props = {
    onRetry?: () => void;
    message?: string;
};

export default function MailListError({
    onRetry,
    message = "حدث خطأ أثناء تحميل البريد",
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
            {/* Icon animation */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-red-500 text-4xl mb-4"
            >
                <FontAwesomeIcon icon={faTriangleExclamation} />
            </motion.div>

            {/* Message */}
            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold text-gray-800"
            >
                {message}
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-500 mt-1"
            >
                يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت
            </motion.p>

            {/* Retry button */}
            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="mt-5 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                    <FontAwesomeIcon icon={faRotateRight} />
                    إعادة المحاولة
                </motion.button>
            )}
        </div>
    );
}