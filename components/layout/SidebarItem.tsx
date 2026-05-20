import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/* 🔹 Reusable Sidebar Item */
export default function SidebarItem({
    icon,
    label,
    count,
    active,
    onClick
}: {
    icon: any;
    label: string;
    count?: number;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick} // 👈 IMPORTANT
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition font-bold
        ${active ? "bg-gradient-to-r from-yellow-400 to-yellow-100 text-yellow-900" : "text-gray-600 hover:bg-gray-100"}
      `}
        >
            <div className="flex items-center gap-4">
                <FontAwesomeIcon icon={icon} className="text-blue-600" />
                <span className="text-sm">{label}</span>
            </div>

            {count !== undefined && (
                <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                    {count}
                </span>
            )}
        </div>
    );
}