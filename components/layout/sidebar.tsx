"use client";

import MailCompose from "@/components/overlays/mailCompose";
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

export default function Sidebar() {
    const { isMailComposeShown, tiggerMailCompose } = useMailComposeStore()


    return (
        <aside
            className="w-64 h-[calc(100vh-64px)] bg-gray-50 p-4 flex flex-col justify-between "
            dir="rtl"
        >
            {/* TOP SECTION */}
            <div>
                {/* Compose Button */}
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-blue-700 transition" onClick={tiggerMailCompose}>
                    <FontAwesomeIcon icon={faPlus} />
                    انشاء بريد
                </button>

                {/* Main Navigation */}
                <nav className="space-y-2">
                    <SidebarItem icon={faHouse} label="لوحة التحكم" active />
                    <SidebarItem icon={faInbox} label="الوارد" count={128} />
                    <SidebarItem icon={faPaperPlane} label="المرسل" />
                    <SidebarItem icon={faFile} label="المسودات" count={7} />
                    <SidebarItem icon={faStar} label="المميزة" />
                    <SidebarItem icon={faClock} label="المؤجلة" />
                    <SidebarItem icon={faTriangleExclamation} label="المهم" />
                </nav>

                {/* Divider */}
                <div className="my-6 border-t"></div>

                {/* Folders */}
                <div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>المجلدات</span>
                        <FontAwesomeIcon icon={faPlus} className="cursor-pointer" />
                    </div>

                    <div className="space-y-2">
                        <SidebarItem icon={faFolder} label="الإعلانات" count={12} />
                        <SidebarItem icon={faFolder} label="الدورات" count={24} />
                        <SidebarItem icon={faFolder} label="المشاريع" count={8} />
                        <SidebarItem icon={faFolder} label="إداري" count={5} />
                    </div>
                </div>
            </div>

            {/* BOTTOM: Storage */}
            <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">التخزين</p>
                <div className="w-full bg-gray-300 h-2 rounded-full">
                    <div className="bg-blue-600 h-2 rounded-full w-[24%]"></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">2.4GB من 10GB</p>
            </div>

            {/* MailCompose: overlay */}
            {isMailComposeShown ?
                <MailCompose />
                : null}

        </aside>
    );
}

/* 🔹 Reusable Sidebar Item */
function SidebarItem({
    icon,
    label,
    count,
    active,
}: {
    icon: any;
    label: string;
    count?: number;
    active?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition
        ${active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}
      `}
        >
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={icon} />
                <span className="text-sm">{label}</span>
            </div>

            {count !== undefined && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </div>
    );
}