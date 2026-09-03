// components/layout/SidebarItem.tsx

"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
    icon: IconDefinition;
    label: string;
    onClick: () => void;
    active?: boolean;
    count?: number;
    className?: string;
    isCollapsed?: boolean;
}

export default function SidebarItem({
    icon,
    label,
    onClick,
    active = false,
    count,
    className = "",
    isCollapsed = false,
}: SidebarItemProps) {
    return (
        <motion.button
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={cn(
                `
                    flex items-center gap-4
                    w-full px-4 py-2.5
                    rounded-xl
                    transition-all duration-200
                    text-right text-sm
                    relative
                    group
                `,
                // ✅ الحالة العادية
                !active && "text-gray-700 hover:text-blue-600 hover:bg-blue-50",
                // ✅ الحالة النشطة (شريط أزرق من اليمين)
                active && "bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-500",
                isCollapsed && "justify-center px-0",
                className
            )}
        >
            <FontAwesomeIcon
                icon={icon}
                className={cn(
                    "w-5 h-5 transition-colors duration-200 shrink-0",
                    // ✅ الحالة العادية
                    !active && "text-gray-400 group-hover:text-blue-500",
                    // ✅ الحالة النشطة
                    active && "text-blue-600"
                )}
            />

            {!isCollapsed && (
                <span className="flex-1 text-right truncate">{label}</span>
            )}

            {!isCollapsed && count !== undefined && count > 0 && (
                <span
                    className={cn(
                        "text-xs px-2 py-0.5 rounded-full transition-colors duration-200 shrink-0",
                        // ✅ الحالة العادية
                        !active && "bg-gray-100 text-gray-500",
                        // ✅ الحالة النشطة
                        active && "bg-blue-100 text-blue-600"
                    )}
                >
                    {count}
                </span>
            )}

            {isCollapsed && label && (
                <div className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {label}
                    {count !== undefined && count > 0 && ` (${count})`}
                </div>
            )}
        </motion.button>
    );
}