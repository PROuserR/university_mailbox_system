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
    isCollapsed?: boolean;
    isModern?: boolean;
    className?: string;
}

export default function SidebarItem({
    icon,
    label,
    onClick,
    active = false,
    count,
    isCollapsed = false,
    isModern = false,
    className = "",
}: SidebarItemProps) {
    const styles = isModern ? {
        base: `text-white/70 hover:text-white hover:bg-white/10`,
        active: `bg-white/15 text-white shadow-lg shadow-white/5 border-r-2 border-indigo-400`,
        icon: `text-white/50 group-hover:text-white`,
        iconActive: `text-indigo-400`,
        count: `bg-white/10 text-white/70`,
        countActive: `bg-indigo-500/20 text-indigo-300`,
    } : {
        base: `text-gray-700 hover:text-blue-600 hover:bg-blue-50`,
        active: `bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-500`,
        icon: `text-gray-400 group-hover:text-blue-500`,
        iconActive: `text-blue-600`,
        count: `bg-gray-100 text-gray-500`,
        countActive: `bg-blue-100 text-blue-600`,
    };

    return (
        <motion.button
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={cn(
                `
                    flex items-center gap-3
                    w-full px-4 py-2.5
                    rounded-xl
                    transition-all duration-200
                    text-right text-sm
                    relative
                    group
                `,
                styles.base,
                active && styles.active,
                isCollapsed && "justify-center px-0",
                className
            )}
        >
            <FontAwesomeIcon
                icon={icon}
                className={cn(
                    "w-5 transition-colors duration-200",
                    styles.icon,
                    active && styles.iconActive
                )}
            />

            {!isCollapsed && (
                <span className="flex-1 text-right">{label}</span>
            )}

            {!isCollapsed && count !== undefined && count > 0 && (
                <span
                    className={cn(
                        "text-xs px-2 py-0.5 rounded-full transition-colors duration-200",
                        styles.count,
                        active && styles.countActive
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