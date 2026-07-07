// components/layout/SidebarItem.tsx

import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";

interface SidebarItemProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string | null;
    count?: number;
    active?: boolean;
    onClick?: () => void;
    isCollapsed?: boolean; // ✅ إضافة prop
}

export default function SidebarItem({
    icon,
    label,
    count,
    active,
    onClick,
    isCollapsed = false, // ✅ قيمة افتراضية
}: SidebarItemProps) {
    const { isSidebarToggleShown } = useSidebarToggleStore();

    // ✅ تحديد إذا كان العنصر مطويًا (Collapsed)
    const isCollapsedMode = isCollapsed || !isSidebarToggleShown;

    if (isSidebarToggleShown) {
        return (
            <motion.div
                whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.06)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onClick}
                className={`
                    flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200
                    ${active 
                        ? "bg-blue-100 text-blue-700 font-semibold shadow-sm" 
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon 
                        icon={icon} 
                        className={`text-sm ${active ? "text-blue-600" : "text-gray-400"}`} 
                    />
                    <span className="text-sm">{label}</span>
                </div>

                {count !== undefined && (
                    <span className={`
                        text-[10px] px-2 py-0.5 rounded-full font-medium
                        ${active 
                            ? "bg-blue-200 text-blue-700" 
                            : "bg-gray-100 text-gray-500"
                        }
                    `}>
                        {count}
                    </span>
                )}
            </motion.div>
        );
    }

    // ✅ وضع مطوي (Collapsed)
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
                flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all duration-200 mx-auto
                ${active 
                    ? "bg-blue-100 text-blue-600" 
                    : "text-gray-400 hover:text-blue-500 hover:bg-blue-50/50"
                }
            `}
            title={label || ""}
        >
            <FontAwesomeIcon icon={icon} className="text-base" />
            {count !== undefined && count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold px-0.5">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </motion.div>
    );
}