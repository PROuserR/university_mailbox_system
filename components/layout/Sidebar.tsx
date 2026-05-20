"use client";

import MailCompose from "@/components/overlays/MailCompose";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInbox,
    faPaperPlane,
    faFile,
    faEnvelope,
    faFolder,
    faPlus,
    faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import useMailComposeStore from "@/store/mailComposeStore";
import useMailFilterStore from "@/store/mailFilterStore";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "@/utils/apiClient";
import { MailCounts } from "@/types/api/Mail/MailCounts";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
    const { isMailComposeShown, triggerMailCompose } = useMailComposeStore()
    const { filter, setFilter } = useMailFilterStore()

    const fetchMailsCount = async (): Promise<MailCounts> => {
        const res = await apiWrapper.get<{ data: MailCounts }>("/Correspondences/statistics/counts-by-type")

        if (!res.success || !res.data) {
            throw new Error("Failed to fetch mails")
        }
        return res.data.data
    }

    const {
        data = {
            incomingCount: 0,
            outgoingCount: 0,
            internalCount: 0,
            professionalCount: 0,
            totalCount: 0,
        },
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["mailsCount"],
        queryFn: fetchMailsCount, // ✅ FIXED
    });

    return (
        <aside
            className="w-64 h-[calc(100vh-64px)] bg-blue-100 p-4 flex flex-col justify-between z-10"
            dir="rtl"
        >
            {/* TOP SECTION */}
            <div>
                {/* Compose Button */}
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-blue-700 transition" onClick={triggerMailCompose}>
                    <FontAwesomeIcon icon={faPlus} />
                    انشاء بريد
                </button>

                {/* Main Navigation */}
                <div className="flex flex-col gap-y-2">
                    <SidebarItem icon={faEnvelope} label=" صندوق البريد" onClick={() => setFilter("")} active={filter === ""} count={data.totalCount} />
                    <SidebarItem icon={faInbox} label="الوارد" onClick={() => setFilter("Incoming")} active={filter === "Incoming"} count={data.incomingCount} />
                    <SidebarItem icon={faPaperPlane} label="الصادر" onClick={() => setFilter("Outgoing")} active={filter === "Outgoing"} count={data.outgoingCount} />
                    <SidebarItem icon={faFile} label="الداخلي" onClick={() => setFilter("Internal")} active={filter === "Internal"} count={data.internalCount} />
                    <SidebarItem icon={faBriefcase} label="المهني" onClick={() => setFilter("Professional")} active={filter === "Professional"} count={data.professionalCount} />
                </div>

                {/* Divider */}
                <div className="my-6 border-t"></div>

                {/* Folders */}
                <div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>المجلدات</span>
                        <FontAwesomeIcon icon={faPlus} className="cursor-pointer" />
                    </div>

                    <div className="space-y-2">
                        <SidebarItem icon={faFolder} label="الإعلانات" />
                        <SidebarItem icon={faFolder} label="الدورات" count={12} />
                        <SidebarItem icon={faFolder} label="المشاريع" count={3} />
                        <SidebarItem icon={faFolder} label="إداري" count={4} />
                    </div>
                </div>
            </div>

            {/* BOTTOM: Storage */}
            <div className="p-4 rounded-lg">
                <p className=" text-gray-500 mb-1">التخزين</p>
                <div className="w-full bg-gray-300 h-2 rounded-full">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-200 h-2 rounded-full w-[24%]"></div>
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

