// components/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import MailCompose from "@/components/overlays/MailCompose";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faInbox,
    faPaperPlane,
    faFile,
    faStar,
    faClock,
    faTriangleExclamation,
    faFolder,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import useMailComposeStore from "@/store/mailComposeStore";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { isMailComposeShown, tiggerMailCompose } = useMailComposeStore();
    const [isMobile, setIsMobile] = useState(false);

    // كشف حجم الشاشة
    useEffect(() => {
        const checkScreenSize = () => {
            const small = window.innerWidth < 1024;
            setIsMobile(small);
            if (!small) {
                if (onClose) onClose();
            }
        };
        
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, [onClose]);

    // منع التمرير خلف القائمة على الموبايل
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, isMobile]);

    const sidebarContent = (
        <aside
            className={`
                bg-gray-50 flex flex-col justify-between
                transition-transform duration-300 ease-in-out
                p-3
                ${isMobile 
                    ? "fixed top-16 right-0 z-40 shadow-xl w-60" 
                    : "relative w-60"
                }
                ${isMobile && !isOpen ? "translate-x-full" : "translate-x-0"}
            `}
            style={{
                height: 'calc(100dvh - 64px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
            }}
            dir="rtl"
        >
            {/* TOP SECTION */}
            <div className="space-y-3">
                {/* Compose Button */}
                <button 
                    className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition text-sm"
                    onClick={tiggerMailCompose}
                >
                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                    <span>انشاء بريد</span>
                </button>

                {/* Main Navigation */}
                <nav className="space-y-1">
                    <SidebarItem icon={faHouse} label="لوحة التحكم" active />
                    <SidebarItem icon={faInbox} label="الوارد" count={128} />
                    <SidebarItem icon={faPaperPlane} label="المرسل" />
                    <SidebarItem icon={faFile} label="المسودات" count={7} />
                    <SidebarItem icon={faStar} label="المميزة" />
                    <SidebarItem icon={faClock} label="المؤجلة" />
                    <SidebarItem icon={faTriangleExclamation} label="المهم" />
                </nav>

                {/* Divider */}
                <div className="border-t"></div>

                {/* Folders */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>المجلدات</span>
                        <FontAwesomeIcon icon={faPlus} className="cursor-pointer h-3 w-3" />
                    </div>
                    <nav className="space-y-1">
                        <SidebarItem icon={faFolder} label="الإعلانات" count={12} />
                        <SidebarItem icon={faFolder} label="الدورات" count={24} />
                        <SidebarItem icon={faFolder} label="المشاريع" count={8} />
                        <SidebarItem icon={faFolder} label="إداري" count={5} />
                    </nav>
                </div>
            </div>

            {/* BOTTOM: Storage */}
            <div className="bg-gray-100 p-2 rounded-lg mt-3">
                <p className="text-xs text-gray-500 mb-1">التخزين</p>
                <div className="w-full bg-gray-300 h-1.5 rounded-full">
                    <div className="bg-blue-600 h-1.5 rounded-full w-[24%]"></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">2.4GB من 10GB</p>
            </div>

            {/* MailCompose: overlay */}
            {isMailComposeShown ? <MailCompose /> : null}
        </aside>
    );

    return (
        <>
            {/* الطبقة الخلفية الداكنة (Overlay) - فقط على الموبايل */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => {
                        if (onClose) onClose();  
                    }}
                />
            )}
            {/* الـ Sidebar نفسه */}
            {sidebarContent}
        </>
    );
}

/* 🔹 Reusable Sidebar Item */
function SidebarItem({
    icon,
    label,
    count,
    active,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    count?: number;
    active?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition
                ${active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}
            `}
        >
            <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
                <span className="text-sm">{label}</span>
            </div>
            {count !== undefined && (
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </div>
    );
}