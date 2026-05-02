"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

export default function MailListLoader() {
    return (
        <div className="flex flex-col gap-3 p-4 w-full">


            {/* Mail items */}
            {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border hover:shadow-sm transition"
                >
                    {/* Icon pulse */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            delay: i * 0.1,
                        }}
                        className="text-gray-400"
                    >
                        <FontAwesomeIcon icon={faEnvelope} />
                    </motion.div>

                    {/* Content lines */}
                    <div className="flex-1 space-y-2">
                        <motion.div
                            className="h-4 w-1/3 bg-gray-200 rounded"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                        <motion.div
                            className="h-3 w-2/3 bg-gray-200 rounded"
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                    </div>

                    {/* Date shimmer */}
                    <motion.div
                        className="h-3 w-16 bg-gray-200 rounded"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.1 }}
                    />
                </motion.div>
            ))}
        </div>
    );
}